
const express = require("express");
const router = express.Router();
// const path = require("path");

const pg = require("../pgRequest");
const requestIp = require("request-ip");
const mongoLog = require("./mongoLog.js");
const jwt = require("jsonwebtoken");

const jwtKey = require("../private/privateKey").jwtPrivateKey;

const emailForm = new RegExp("^[\w][\_\-\w]{2,19}@\w+.\w+$");
const pwForm = new RegExp("^[\w\!\@\#\$\%\^\&\*\-\_]{5,20}$");
const nickForm = new RegExp("^[\w가-힣]{10}$");

// 내 정보 가져오기
router.get("", (req, res) => {
    const result = {
        success: false,
        data: null
    };

    // jwt인증
    try {
        result.data = jwt.verify(req.cookies.token, jwtKey);
        result.success = true;
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
        problem: 0,
        success: false
    };

    // 회원 정보 조건 확인(예외처리)
    if (receive.email.match(emailForm) && receive.pw.match(pwForm) && receive.nickname.match(nickForm)) {
        // postgresql의 회원 정보 중복 확인. 중복 불가 컬럼 email, nickname
        const sql = "SELECT * FROM member WHERE email=$1 OR nickname=$2;";
        const values = [receive.email, receive.nickname]; // 다른 중복 불가 회원 정보도 포함하기.
        pg(sql, values)
        .then(post => {
            if (post.succss) {
                if (post.data.length > 0) {
                    console.log("\nalready exist info\n");
                    result.problem = 3; // 중복 회원 존재
                }
                else {
                    // postgresql에 회원정보 저장 요청
                    const sql2 = "INSERT INTO member (email, password, nickname) VALUES ($1, $2, $3);";
                    const values2 = [receive.email, receive.pw, receive.nickname];
                    pg(sql2, values2)
                    .then(post => {
                        if (post.success) {
                            console.log("success insert info to DB");
                            result.success = true;
                        }
                        else {
                            console.log("\npostgresql error insert info failed\n");
                            result.message = "오류가 발생했습니다";
                            result.problem = 4; // 데이터 입력 실패
                        }
                    }).catch(err => {
                        console.log("\npostgresql error insert info failed\n");
                        console.log(err);
                        result.problem = 4; // 데이터 입력 실패
                    });
                }
            }
            else {
                console.log("\npostgresql error check info failed\n");
                result.message = "에러가 발생했습니다"
                result.problem = 3; // 중복 회원 존재
            }
        }).catch(err => {
            console.log("\npostgresql error check info failed\n");
            console.log(err);
            result.problem = 2; // 중복 확인 실패
        }).finally(() => {
            // mongoDB에 로그 저장
        
        
            // 결과 보내기
            res.send(result);
        })
    }
    else {
        result.problem = 1; // 데이터 양식에 맞지 않음
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
        problem: 0
    }; 

    // postgresql에 같은 회원 정보 요청
    let sql = "SELECT * FROM member WHERE memberID=$1 and password=$2;";
    const values = [receive.id, receive.pw];
    pg(sql, values)
    .then(post => {
        if (post.success) {
            // 로그인 가능 확인
            if (post.data.length > 0) {
                const jwtToken = jwt.sign(
                    {
                        "memberID": post.data.memberID,
                        "email": post.data.email,
                        "pw": post.data.password,
                        "nickname": post.data.nickname
                    },
                    jwtKey
                );
                res.cookie("token", jwtToken);
                result.success = true;
            }
            else {
                console.log("member info not exist");
                result.problem = 2; // 회원이 존재하지 않음
            }
        }
        else {
            result.problem = 1; // DB 에러
            console.log("\npostgresql err get member info failed\n");
        }
    }).catch(err => {
        console.log("\npostgresql err get member info failed");
        console.log(err);
        result.problem = 1; // DB 에러
    }).finally(() => {
        // mongoDB에 로그 저장


        // 결과 보내기
        res.send(result);
    });
});

// 회원정보 수정
router.put("", (req, res) => {
    const receive = {
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
        jwtData = jwt.verify(req.cookies.token);
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
            const sql = "UPDATE member SET password=$1 WHERE email=$2;";
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


                // 결과 보내기
                res.send(result);
    
            });
        }
        else {
            result.problem = 3; // 수정할 데이터 양식에 맞지 않음
            res.send(result);
        }
    }
    else {
        result.problem = 1; // 인증 실패
        res.send(result);
    }
});

// 회원 탈퇴
router.delete("", (req, res) => {
    const result = {
        success: false,
        problem: 0
    };

    // jwt 인증
    const validToken = false;
    const jwtData = null;
    try {
        jwtData = jwt.verify(res.cookies.token, jwtKey);
        validToken = true;
    }
    catch(err) {
        console.log("token auth err");
        result.problem = 1; // 토큰 인증 실패
    }

    // postgresql에 회원 정보 삭제 요청
    if (validToken) {
        const sql = "DELETE FROM member WHERE email=$1;";
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


            // 결과 보내기
            res.send(result);
        });
    }
    else {
        // mongoDB에 로그 저장


        // 결과 보내기
        res.send(result);
    }

});

module.exports = router;