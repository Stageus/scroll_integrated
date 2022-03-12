
const express = require("express");
const router = express.Router();
// const path = require("path");

const pg = require("../pgRequest");
const requestIp = require("request-ip");
const mongoLog = require("../logging");
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

        // mongoDB에 로그 저장


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
        message: null,
        success: false
    };

    // 회원 정보 조건 확인(예외처리)
    if (receive.email.match(emailForm) && receive.pw.match(pwForm) && receive.nickname.match(nickForm)) {
        // postgresql의 회원 정보 중복 확인. 중복 불가 컬럼 email, nickname
        const sql = "SELECT * FROM member WHERE email=$1 OR nickname=$2;"; // 테이블 확정 후 수정
        const values = [receive.email, receive.nickname]; // 다른 중복 불가 회원 정보도 포함하기.
        pg(sql, values)
        .then(post => {
            if (post.succss) {
                if (post.data.length > 0) {
                    console.log("\nalready exist info\n");
                    result.message = "회원 정보가 중복되었습니다.";
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
                        }
                    }).catch(err => {
                        console.log("\npostgresql error insert info failed\n");
                        console.log(err);
                        result.message = "오류가 발생했습니다.";
                    });
                }
            }
            else {
                console.log("\npostgresql error check info failed\n");
                result.message = "에러가 발생했습니다"
            }
        }).catch(err => {
            console.log("\npostgresql error check info failed\n");
            console.log(err);
            result.message = "에러가 발생했습니다"
        }).finally(() => {
            // mongoDB에 로그 저장
        
        
            // 결과 보내기
            res.send(result);
        })
    }
    else {
        result.message = "회원 정보를 올바르게 입력해주세요";
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
        message: null
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
                        // pgResult.data 어떤 식으로 들어오는지 확인해야 함.
                        // 이것들 이외에 필요한 정보 추가하기
                        "id": post.data.id,
                        "email": post.data.email,
                        "nickname": post.data.nickname
                    },
                    jwtKey
                );
                res.cookie("token", jwtToken);
                result.success = true;
            }
            else {
                console.log("member info not exist");
                result.message = "회원정보가 존재하지 않습니다.";
            }
        }
        else {
            result.message = "오류가 발생했습니다.";
            console.log("\npostgresql err get member info failed\n");
        }
    }).catch(err => {
        console.log("\npostgresql err get member info failed");
        console.log(err);
        result.message = "오류가 발생했습니다.";
    }).finally(() => {
        // mongoDB에 로그 저장


        // 결과 보내기
        res.send(result);
    });
});

// 회원정보 수정
router.put("", (req, res) => {
    const receive = {
        email: req.body.email,
        pw: req.body.pw
    };
    const result = {
        success: false,
        message: null
    };

    // jwt 인증
    const validToken = false;
    try {
        const jwtData = jwt.verify(req.cookies.token);
        if(jwtData.email == receive.email) {
            validToken = true;
        }
    }
    catch(err) {
        validToken = false;
    }

    // 토큰 유효한지 확인
    if (validToken) {
        // 회원 정보 조건 확인(예외처리)
        if (receive.pw.match(pwForm)) {
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
                            email: post.data.email,
                            pw: post.data.pw,
                            nickname: post.data.nickname
                            },
                            jwtKey
                        );
                        res.cookie("token", jwtToken);
                    }
                    catch(err) { 
                        console.log("\ntoken renewal failed");
                        console.log(err);
                        result.message = "계정 정보 갱신에 실패했습니다.";
                    }
                }
                else {
                    console.log("\npostgresql err update info failed\n");
                    result.message = "회원 정보 수정에 실패했습니다.";
                }
            }).catch(err => {
                console.log("\npostgresql err update info failed");
                console.log(err);
                result.message = "회원 정보 수정에 실패했습니다.";
            }).finally(() => {
                // mongoDB에 로그 저장
    
            
                // 결과 보내기
                res.send(result);
    
            });
        }
        else {
            result.message = "회원 정보를 올바르게 입력하세요.";
        }
    }
    else {
        console.log("\ntoken expired\n");
        result.message = "토큰이 만료됐습니다.";
    }
});

// 회원 탈퇴
router.delete("", (req, res) => {
    const result = {
        success: false,
        message: null
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
        result.message = "토큰 인증 실패";
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
            }
        }).catch(err => {
            console.log("\npostgresql err delete info failed");
            console.log(err);
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