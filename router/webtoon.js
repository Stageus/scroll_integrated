
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

// 요일, 플랫폼, 장르, 즐겨찾기 여부

// 웹툰 정보 불러오기
router.get("", async (req, res) => {
    const receive = {
        weekday: req.query.weekday,
        genre: req.query.genre,
        platform: req.query.platform
    };
    const result = {
        success: false,
        message: "웹툰 불러오기 성공",
        webtoon: [
            {
                id: 1,
                title: "쇼미더럭키짱!",
                detail: "고작 18살 나이로 부산을 꿇린 남자 강건마\n메마른 그의 가슴을 송두리째 불태울 존재가 나타났으니\,\n그것은 \'힙합\'(Hip - hop)!\n래퍼가 되기 위해선 서울을 통합해야 하는 법!\n사나이 강건마! 오늘도 래퍼가 되기 위해 사람을 팬다!\n참고로 두 작가 모두 랩이 뭔지 모른다!",
                genre: ["액션"],
                weekday: [1],
                platform: "naver",
                thumbnail: "https://shared-comic.pstatic.net/thumb/webtoon/783054/thumbnail/thumbnail_IMAG10_6917f3d9-c5bb-4bfd-aa04-a288f7b252af.jpg",
                link: "https://comic.naver.com/webtoon/list?titleId=783054&weekday=mon",
                author: ["박태준"]
            }
        ]
    };

    let auth = false;
    let jwtData = null;
    try {
        jwtData = jwt.verify(res.cookies.token, jwtKey);
        auth = true;
    } catch(err) {
        result.message = "회원정보 없음"; // 토큰 인증 실패
    }

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

module.exports = router;