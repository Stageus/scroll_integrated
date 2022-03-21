
const express = require("express");
const router = express.Router();
// const path = require("path");

const pg = require("../pgRequest");
const requestIp = require("request-ip");
const mongoLog = require("../logging");
const es = require("es7");
const jwt = require("jsonwebtoken");

const jwtKey = require("../private/privateKey").jwtPrivateKey;
const WEBTOON = "webtoon";
const LIBRARY = "library";

const redis = require("../redis.js");

const changeReq = (req) => {
    if (req === "") {
        
    } else if (req === "") {

    }
}

// 요일, 플랫폼, 장르, 즐겨찾기 여부

// 웹툰 정보 불러오기
router.post("", async (req, res) => {
    const receive = {
        token: req.body.token,
        weekday: req.body.weekday,
        genre: req.body.genre,
        platform: req.body.platform
    };
    const result = {
        success: false,
        message: "웹툰 불러오기 성공",
        webtoon: [
            {
                webtoonID: 1,
                title: "쇼미더럭키짱!",
                thumbnail: "https://shared-comic.pstatic.net/thumb/webtoon/783054/thumbnail/thumbnail_IMAG10_6917f3d9-c5bb-4bfd-aa04-a288f7b252af.jpg",
                link: "https://comic.naver.com/webtoon/list?titleId=783054&weekday=mon",
                author: "박태준/김성모"
            }
        ]
    };

    if (Array.isArray(receive.platform)) {
        let sql = "SELECT webtoonid FROM toon.webtoon WHERE";
        for (let i = 0; i < receive.platform.length; i++) {
            changeReq(receive.platform[i]);
            sql += " platformid=$" + i + " OR";
        }
        sql += " 1=1;"
        let values = receive.platform;
        await pg(sql, values);
        console.log(sql);
    }

    if (Array.isArray(receive.genre)) {
        let sql2 = "SELECT webtoonid FROM toon.toongenre WHERE";
        for (let i = 0; i < receive.genre.length; i++) {
            changeReq(receive.genre[i]);
            sql2 += " genreid=$" + i + " OR";
        }
        sql2 += " 1=1;"
        let values2 = receive.genre;
        await pg(sql2, values2);
        console.log(sql2);
    }

    if (Array.isArray(receive.weekday)) {
        let sql3 = "SELECT webtoonid FROM toon.cycle WHERE";
        for (let i = 0; i < receive.weekday.length; i++) {
            changeReq(receive.weekday[i]);
            sql3 += " cycle=$" + i + " OR";
        }
        sql3 += " 1=1;"
        let values3 = receive.weekday;
        await pg(sql3, values3);
        console.log(sql3);
    }

    const auth = false;
    let jwtData = null;
    try {
        jwtData = jwt.verify(receive.token, jwtKey);
        auth = true;
    } catch(err) {
        result.message += ", 회원정보 없음"; // 토큰 인증 실패
    }

    result.success = true;
    res.send(result); // 추후 삭제



    // if (auth) {
    //     const esClient = new es.Client({
    //         node: "https://localhost:9200/" // 수정해야함.
    //     });

    //     const query = {};

    //     if (receive.weekday != null) { query.weekday = receive.weekday; }
    //     if (receive.genre != null) { query.genre = receive.genre; }
    //     if (receive.platform != null) { query.platform = receive.platform; }

    //     if (receive.library) {
    //         const searchResult = await esClient.search({
    //             index: jwtData.memberID + LIBRARY,
    //             body: {
    //                 query: {
    //                 },
    //                 size: 9999
    //             }
    //         });

    //         for(let index = 0; index < searchResult.hits.hits.length; index++) {
    //             query.webtoonID = searchResult.hits.hits[index].webtoonID;
    //             const searchResult2 = await esClient.search({
    //                 index: WEBTOON,
    //                 body: {
    //                     query: query
    //                 }
    //             })
    //             result.webtoon.push(searchResult2.hits.hits[0]);
    //         }
    //     } else {
    //         const searchResult3 = await esClient.search({
    //             index: WEBTOON,
    //             body: {
    //                 query: query
    //             }
    //         })
    //         result.webtoon = searchResult3.hits.hits;
    //     }
    //     mongoLog("account/post", requestIp.getClientIp(req), receive, result);
    //     res.send(result);
    // }
    // else {
    //     result.message = "회원정보 인증 실패"; // 토큰 인증 실패
    //     mongoLog("account/post", requestIp.getClientIp(req), receive, result);
    //     res.send(result);
    // }

});

// 웹툰 검색 미리보기
router.get("/preview", (req, res) => {
    receive = {
        searchWord: req.query.searchWord
    }
    result = {
        success: false,
        thumbnail: null,
        title: null,
        author: null,
        link: null
    }

    const esClient = new es.Client({
        node: "https://localhost:9200/" // 수정해야함.
    });

    esClient.search({
        index: INDEX,
        body:{
            
        }
    }, (err, searchResult) => {
        if (err) {

        }
        else {

        }
        mongoLog("account/post", requestIp.getClientIp(req), {}, {});
        res.send(result);
    });
})

router.get("/click", (req, res) => {
    const receive = {
        webtoonid: req.body.webtoonID
    }
    const result = {
        success: false,
        message: "클릭 기록 실패"
    }

    try {
        redis.addViewCount();
        redis.addHistory();
        result.success = true;
        result.message = "클릭 기록 성공";
    } catch(err) {
        result.message = "클릭 기록 오류";
        console.log(err);
    }
    //로깅
    mongoLog("account/click", requestIp.getClientIp(req), receive, result);
    
    res.send(result);
})

module.exports = router;