
const express = require("express");
const router = express.Router();
// const path = require("path");

const pg = require("../pgRequest");
const requestIp = require("request-ip");
const mongoLog = require("../logging");
const es = require("es7");

const jwt = require("jsonwebtoken");
const jwtKey = require("../private/privateKey").jwtPrivateKey;

const LIBRARY = "library";

// 즐겨찾기 정보 불러오기
router.get("", (req, res) => {

    const result = {
        success: false,
        problem: 0,
        webtoon: [
            // {
            //     webtoonID: null,
            //     title: null,
            //     detail: null,
            //     genre: null,
            //     weekday: null,
            //     platform: null,
            //     thumbnail: null,
            //     link: null,
            //     author: null,
            //     totalVote: null
            // }
        ]
    }

    let auth = false;
    let jwtData = null;
    try {
        jwtData = jwt.verify(res.cookies.token, jwtKey);
        auth = true;
    } catch(err) {
        console.log("토큰 만료");
        result.problem = 1; // 인증 실패
    }

    if (auth) {
        const esClient = new es.Client({
            node: "https://localhost:9200/" // 수정해야함.
        });

        esClient.search({
            index: jwtData.memberID + INDEX,
            body: {
                query: {}
            }
        }, (err, searchResult) => {
            if (err) {
                console.log("err :", err);
                result.problem = 2; // elasticsearch 데이터 불러오기 실패
            }
            else {
                result.webtoon = searchResult.hits.hits;
            }

            mongoLog("account/post", requestIp.getClientIp(req), {}, result);
            res.send(result);
        });
    }
    else {
        console.log("인증 실패");
        result.problem = 1; // 인증 실패
        res.send(result);
    }
});

// 즐겨찾기 등록
router.post("", async (req, res) => {
    const receive = {
        webtoonID: req.body.webtoonID
    }
    const result = {
        success: false,
        message: "즐겨찾기 등록 성공"
    }

    let auth = false;
    let jwtData = null;
    try {
        jwtData = jwt.verify(req.cookies.token, jwtKey);
        auth = true;
    } catch(err) {
        console.log("토큰 만료");
        result.message = "회원정보 인증 실패"; // 인증 실패
    }

    if (auth) {
    //     const esClient = new es.Client({
    //         node: "https://localhost:9200/" // 수정해야함.
    //     });

        const sql = "INSERT INTO toon.library (webtoonID, memberID) VALUES ($1, $2)";
        const values = [receive.webtoonID, jwtData.memberid];
        console.log(jwtData)

        try {
            await pg(sql, values);
        } catch(err) {
            console.log("err :", err);
            result.message = "즐겨찾기 등록 오류"; // DB 저장 실패
        }

    //     try {
    //         await esClient.index({
    //             index: jwtData.memberid + INDEX,
    //             body: {
    //                 webtoonID: receive.webtoonID
    //             }
    //         });
    //     } catch(err) {
    //         console.log("err :", err);
    //         result.message = "즐겨찾기 등록 오류"; // elasticsearch 저장 실패
    //     }
        result.success = true;
        res.send(result);
    }
    else {
        console.log("인증 실패");
        result.message = "회원정보 인증 실패"; // 인증 실패
        mongoLog("account/post", requestIp.getClientIp(req), receive, result);
        res.send(result);
    }
})

// 즐겨찾기 삭제
router.delete("", async(req, res) => {
    const receive = {
        webtoonID: req.body.webtoonID
    }
    const result = {
        message: "즐겨찾기 삭제 성공",
        success: false
    }

    let auth = false;
    let jwtData = null;
    try {
        jwtData = jwt.verify(req.cookies.token, jwtKey);
        auth = true;
    } catch(err) {
        console.log("인증 실패");
        result.message = "회원정보 인증 실패"; // 인증 실패
    }

    if (auth) {
        const sql = "DELETE FROM toon.library WHERE webtoonid=$1 and memberid=$2";
        const values = [receive.webtoonID, jwtData.memberid];

        try {
            await pg(sql, values);
        } catch(err) {
            console.log("err :", err);
            result.message = "즐겨찾기 삭제 오류"; // DB 저장 실패
        }

        // const esClient = new es.Client({
        //     node: "https://localhost:9200/" // 수정해야함.
        // });

        // esClient.deleteByQuery({
        //     index: INDEX,
        //     body:{

        //     }
        // }, err => {
        //     if (err) {
        //         console.log("err :", err);
        //         result.message = "즐겨찾기 삭제 오류"; //elasticsearch 에러
        //     }
        //     else {
        //         result.success = true;
        //     }
        //     mongoLog("account/post", requestIp.getClientIp(req), receive, result);
        //     res.send(result);
        // });

        result.success = true;
        res.send(result);
    }
    else {
        console.log("인증 실패");
        result.message = "회원정보 인증 실패";
        res.send(result);
    }
})

module.exports = router;