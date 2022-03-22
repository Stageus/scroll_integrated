
const express = require("express");
const router = express.Router();
// const path = require("path");

const pg = require("../pgRequest");
const requestIp = require("request-ip");
const mongoLog = require("../logging.js");
const jwt = require("jsonwebtoken");

const jwtKey = require("../private/privateKey").jwtPrivateKey;

const emailForm = new RegExp("^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$");
const pwForm = new RegExp("^[A-Za-z0-9]{4,20}$");
const nickForm = new RegExp("^[가-힣a-zA-Z0-9]{2,10}$");

// 내 정보 가져오기
router.post("/info", (req, res) => {//post account/info로 바꾸기
    const receive = {
        token: req.body.token
    }
    const result = {
        success: false,
        data: null,
        message: "회원정보 불러오기 실패",
        email: null,
        nickname: null
    };

    // jwt인증
    try {
        result.data = jwt.verify(receive.token, jwtKey);
        result.success = true;
        result.message = "회원정보 불러오기 성공";
        result.email = result.data.email;
        result.nickname = result.data.nickname;
        console.log(result.data); // data 형태 확인하기

        mongoLog("account/get", requestIp.getClientIp(req), {}, result);


        // 결과 보내기
        res.send(result);
    }
    catch(err) {
        console.log("token expired:", err);
    }
});

// 회원가입
router.post("", (req, res) => {
    const receive = {
        email: req.body.email,
        pw: req.body.pw,
        nickname: req.body.nickname
        // 등등 회원가입 정보
    };
    const result = {
        success: false,
        message: "회원 가입에 실패하였습니다."
    };
    console.log(receive.email.length < 40 && !typeof receive.email && !typeof receive.pw && !typeof receive.nickname)
    console.log(receive.email.length < 40)
    console.log(typeof receive.email !== undefined)
    console.log(typeof receive.pw !== undefined)
    console.log(typeof receive.nickname !== undefined)


    // 회원 정보 조건 확인(예외처리)
    if (receive.email.match(emailForm) && receive.pw.match(pwForm) && receive.nickname.match(nickForm) 
    && receive.email.length < 40 && typeof receive.email !== undefined && typeof receive.pw !== undefined && typeof receive.nickname !== undefined) {
        // postgresql의 회원 정보 중복 확인. 중복 불가 컬럼 email, nickname
        const sql = "SELECT * FROM toon.member WHERE email=$1 OR nickname=$2;";
        const values = [receive.email, receive.nickname]; // 다른 중복 불가 회원 정보도 포함하기.
        pg(sql, values)
        .then(post => {
            if (post.success) {
                if (post.data.length > 0) {
                    console.log("\nalready exist info\n");
                    result.message = "중복된 이메일/별명이 존재합니다."; // 중복 회원 존재
                    res.send(result);
                }
                else {
                    // postgresql에 회원정보 저장 요청
                    const sql2 = "INSERT INTO toon.member (email, password, nickname) VALUES ($1, $2, $3);";
                    const values2 = [receive.email, receive.pw, receive.nickname];
                    pg(sql2, values2)
                    .then(post => {
                        if (post.success) {
                            console.log("success insert info to DB");
                            result.message = "회원 가입에 성공하였습니다."
                            result.success = true;
                        }
                        else {
                            console.log("\npostgresql error insert info failed\n");
                            result.message = "오류가 발생했습니다"; // 데이터 입력 실패
                        }
                    }).catch(err => {
                        console.log("\npostgresql error insert info failed\n");
                        console.log(err);
                        result.message = "오류가 발생했습니다"; // 데이터 입력 실패
                    }).finally(() => {
                        // mongoDB에 로그 저장
                        mongoLog("account/post", requestIp.getClientIp(req), receive, result);
                    
                    
                        // 결과 보내기
                        res.send(result);
                    })
                }
            }
            else {
                console.log("\npostgresql error check info failed1\n");
                result.message = "오류가 발생했습니다" // 중복 회원 존재
                mongoLog("account/post", requestIp.getClientIp(req), receive, result);

                res.send(result);
            }
        }).catch(err => {
            console.log("\npostgresql error check info failed2\n");
            console.log(err);
            result.message = "오류가 발생했습니다" // 중복 확인 실패
            mongoLog("account/post", requestIp.getClientIp(req), receive, result);

            res.send(result);
        })
    }
    else {
        result.message = "올바른 형식으로 작성해주십시오." // 데이터 양식에 맞지 않음
        mongoLog("account/post", requestIp.getClientIp(req), receive, result);

        res.send(result);
    }
});

// 로그인
router.post("/login", (req, res) => {
    const receive = {
        email: req.body.email,
        pw: req.body.pw
    };
    const result = {
        success: false,
        message: "로그인 실패",
        token: null
    }; 

    // postgresql에 같은 회원 정보 요청
    let sql = "SELECT * FROM toon.member WHERE email=$1 and password=$2;";
    const values = [receive.email, receive.pw];
    pg(sql, values)
    .then(post => {
        if (post.success) {
            // 로그인 가능 확인
            if (post.data.length > 0) {
                const jwtToken = jwt.sign(
                    {
                        "memberid": post.data[0].memberid,
                        "email": post.data[0].email,
                        "pw": post.data[0].password,
                        "nickname": post.data[0].nickname
                    },
                    jwtKey
                );
                res.cookie("token", jwtToken);
                result.token = jwtToken;
                result.success = true;
                result.message = "로그인 성공";
            }
            else {
                console.log("member info not exist");
                result.message = "이메일 또는 비밀번호를 확인해주십시오."; // 회원이 존재하지 않음
            }
        }
        else {
            result.message = "로그인 오류"; // DB 에러
            console.log("\npostgresql err get member info failed\n");
        }
    }).catch(err => {
        console.log("\npostgresql err get member info failed");
        console.log(err);
        result.message = "로그인 오류"; // DB 에러
    }).finally(() => {
        // mongoDB에 로그 저장
        mongoLog("account/login/post", requestIp.getClientIp(req), receive, result);

        // 결과 보내기
        res.send(result);
    });
});

// 회원정보 수정
router.put("", (req, res) => {
    const receive = {
        token: req.body.token,
        nickname: req.body.nickname,
        newPw: req.body.newPw,
        currentPw: req.body.currentPw
    };
    const result = {
        success: false,
        problem: 0
    };

    // jwt 인증
    const validToken = false;
    const jwtData = null;
    try {
        jwtData = jwt.verify(receive.token);
        const pw = jwtData.pw;
        if (pw != currentPw) {
            result.problem = 2; // 현재 비밀번호 틀림
        }
        else {
            validToken = true;
        }
    }
    catch(err) {
        validToken = false;
        result.problem = 1; // 인증 실패
    }

    // 토큰 유효한지 확인
    if (validToken) {
        // 회원 정보 조건 확인(예외처리)
        if (receive.newPw.match(pwForm) && receive.nickname.match(nickForm)) {
            // postgresql에 회원 정보 수정 요청
            const sql = "UPDATE toon.member SET password=$1 WHERE email=$2;";
            const values = [receive.pw, receive.email];
            pg(sql, values)
            .then(post => {
                if (post.success) {
                    result.success = true;
                    try {
                        // 변경된 정보로 토큰 변경
                        const jwtToken = jwt.sign(
                            {
                                memberID: jwtData.memberID,
                                email: jwtData.email,
                                pw: receive.newPw,
                                nickname: receive.nickname
                            },
                            jwtKey
                        );
                        res.cookie("token", jwtToken);
                    }
                    catch(err) {
                        console.log("\ntoken renewal failed");
                        console.log(err);
                        result.problem = 4; // 수정된 정보 갱신 실패
                    }
                }
                else {
                    console.log("\npostgresql err update info failed\n");
                    result.problem = 5; // DB 입력 실패
                }
            }).catch(err => {
                console.log("\npostgresql err update info failed");
                console.log(err);
                result.problem = 5; // DB 입력 실패
            }).finally(() => {
                // mongoDB에 로그 저장
                mongoLog("account/put", requestIp.getClientIp(req), receive, result);

                // 결과 보내기
                res.send(result);
    
            });
        }
        else {
            result.problem = 3; // 수정할 데이터 양식에 맞지 않음
            mongoLog("account/put", requestIp.getClientIp(req), receive, result);

            res.send(result);
        }
    }
    else {
        result.problem = 1; // 인증 실패
        mongoLog("account/put", requestIp.getClientIp(req), receive, result);

        res.send(result);
    }
});

// 회원 탈퇴
router.delete("", (req, res) => {
    const receive = {
        token: req.body.token
    }
    const result = {
        success: false,
        problem: 0
    };

    // jwt 인증
    const validToken = false;
    const jwtData = null;
    try {
        jwtData = jwt.verify(receive.token, jwtKey);
        validToken = true;
    }
    catch(err) {
        console.log("token auth err");
        result.problem = 1; // 토큰 인증 실패
    }

    // postgresql에 회원 정보 삭제 요청
    if (validToken) {
        const sql = "DELETE FROM toon.member WHERE email=$1;";
        const values = [jwtData.email];
        pg(sql, values)
        .then(post => {
            if (post.success) {
                result.success = true;
                res.clearCookie("token");
            }
            else {
                console.log("\npostgresql err delete info failed");
                result.problem = 2; // DB 변경 실패
            }
        }).catch(err => {
            console.log("\npostgresql err delete info failed");
            console.log(err);
            result.problem = 2; // DB 변경 실패
        }).finally(() => {
            // mongoDB에 로그 저장
            mongoLog("account/delete", requestIp.getClientIp(req), {}, result);

            // 결과 보내기
            res.send(result);
        });
    }
    else {
        // mongoDB에 로그 저장
        mongoLog("account/delete", requestIp.getClientIp(req), receive, result);



        // 결과 보내기
        res.send(result);
    }

});

//중복확인
router.post("/doubleCheck", (req, res) => {
    const receive = {
        type: req.body.type,
        value: req.body.value
    };
    const result = {
        success: false,
        exist: true,
        message: "중복체크 실패"
    };
    // postgresql에 같은 회원 정보 요청
    if (receive.type == "email" || receive.type == "nickname") {
        let sql = "SELECT * FROM toon.member WHERE " + receive.type + "=$1;";
        const values = [receive.value]
        pg(sql, values)
        .then(post => {
            if (post.success) {
                result.success = true;
                if (post.data.length > 0) {
                    if (receive.type == "email") {
                        result.message = "이미 존재하는 이메일입니다."
                    } else {
                        result.message = "이미 존재하는 별명입니다."
                    }
                } else {
                    result.exist = false;
                    if (receive.type == "email") {
                        result.message = "사용 가능한 이메일입니다."
                    } else {
                        result.message = "사용 가능한 별명입니다."
                    }
                }
            } else {
                result.message = "중복체크 오류"; // DB 에러
                console.log("\npostgresql err get member info failed\n");
                console.log(err);
            }
        }).catch(err => {
            console.log("\npostgresql err get member info failed");
            console.log(err);
            result.message = "중복체크 오류"; // DB 에러
        }).finally(() => {
            // mongoDB에 로그 저장
            mongoLog("account/doubleCheck", requestIp.getClientIp(req), receive, result);

            // 결과 보내기
            res.send(result);
        });
    } else {
        result.message = "올바른 데이터 형식이 아닙니다.";
        mongoLog("account/doubleCheck", requestIp.getClientIp(req), receive, result);

        res.send(result);
    }
});

module.exports = router;