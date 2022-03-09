
const express = require("express");
const router = express.Router();
// const path = require("path");

const pg = require("../pgRequest");
const requestIp = require("request-ip");
const mongoLog = require("../logging");
const jwt = require("jsonwebtoken");

const jwtKey = require("../private/privateKey").jwtPrivateKey;

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


    // postgresql의 회원 정보 중복 확인. 중복 불가 컬럼 email, nickname
    const sql = "SELECT * FROM member WHERE email=$1 OR nickname=$2;"; // 테이블 확정 후 수정
    const values = [receive.email, receive.nickname]; // 다른 중복 불가 회원 정보도 포함하기.
    const pgResult = pg(sql, values);

    if (pgResult.success) {
        if (pgResult.data.length > 0) {
            console.log("\ninvalid info\n");
            result.message = "회원 정보가 중복되었습니다.";
        }
        else {
            // postgresql에 회원정보 저장 요청
            const sql2 = "INSERT INTO member (email, password, nickname) VALUES ($1, $2, $3);";
            const values2 = [receive.email, receive.pw, receive.nickname];
            const pgResult2 = pg(sql2, values2);

            if (pgResult2.success) {
                result.success = true;
            }
            else {
                console.log("\npostgresql error member save failed\n");
                result.message = "오류가 발생했습니다.";
            }
    
        }
    }
    else {
        console.log("\npostgresql error duple check failed\n");
        result.message = "오류가 발생했습니다.";
    }

    // mongoDB에 로그 저장


    // 결과 보내기
    res.send(result);
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
    let sql = "SELECT * FROM member WHERE memberID=$1 and password=$2";
    const values = [receive.id, receive.pw];

    console.log("before pg");
    const pgResult = pg(sql, values); // 동기인지 비동기인지 확인해야 함.
    console.log("after pg");

    // 로그인 가능 확인
    if (pgResult.success) {
        if (pgResult.data.length > 0) {
            // jwt 토큰 발급
            const jwtToken = jwt.sign(
                {
                    // pgResult.data 어떤 식으로 들어오는지 확인해야 함.
                    // 이것들 이외에 필요한 정보 추가하기
                    "id": pgResult.data.id,
                    "email": pgResult.data.email,
                    "nickname": pgResult.data.nickname
                },
                jwtKey
            );
            res.cookie("token", jwtToken);
            result.success = true;

            // mongoDB에 로그 저장
        }
        else {
            console.log("\nnot a member\n");
            result.message = "회원정보가 존재하지 않습니다.";
        }
    }
    else {
        console.log("\npostgresql error get memeber info failed\n");
        result.message = "오류가 발생했습니다.";
    }

    // 결과 보내기
    res.send(result);
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
        const jwtData = jwt.verify;
        if(jwtData.email == receive.email) {
            validToken = true;
        }
    }
    catch(err) {
        validToken = false;
    }

    if (validToken) {
        // 회원 정보 조건 확인(예외처리)
    
        // postgresql에 같은 회원 정보 수정 요청
        const sql = "UPDATE member SET password=$1 WHERE email=$2";
        const values = [receive.pw, receive.email];
        const pgResult = pg(sql, values);

        if (pgResult.success) {
            result.success = true;
        }
        else {
            console.log("postgresql error edit info failed");
            result.message = "오류가 발생했습니다.";
        }

    }
    else {
        console.log("\ntoken expired\n");
        result.message = "토큰이 만료됐습니다.";
    }

    // mongoDB에 로그 저장

    // 결과 보내기
    res.send(result);
});

// 회원 탈퇴
router.delete("", (req, res) => {
    const receive = {
    };
    const result = {
        success: false
    };

    // jwt 인증

    // postgresql에 회원 정보 삭제 요청

    // mongoDB에 로그 저장

    // 결과 보내기 res.send();
});

module.exports = router;