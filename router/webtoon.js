
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
        platform: req.query.platform,
        library: req.query.library // bool
    };
    const result = {
        success: false,
        problem: 0,
        webtoon: [
            // {
            //     id: null,
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
    };

    let auth = false;
    let jwtData = null;
    try {
        jwtData = jwt.verify(res.cookies.token, jwtKey);
        auth = true;
    } catch(err) {
        receive.problem = 1; // 토큰 인증 실패
    }

    if (auth) {
        const esClient = new es.Client({
            node: "https://localhost:9200/" // 수정해야함.
        });

        const query = {};

        if (receive.weekday != null) { query.weekday = receive.weekday; }
        if (receive.genre != null) { query.genre = receive.genre; }
        if (receive.platform != null) { query.platform = receive.platform; }

        if (receive.library) {
            const searchResult = await esClient.search({
                index: jwtData.memberID + LIBRARY,
                body: {
                    query: {
                    },
                    size: 9999
                }
            });

            for(let index = 0; index < searchResult.hits.hits.length; index++) {
                query.webtoonID = searchResult.hits.hits[index].webtoonID;
                const searchResult2 = await esClient.search({
                    index: WEBTOON,
                    body: {
                        query: query
                    }
                })
                result.webtoon.push(searchResult2.hits.hits[0]);
            }
        } else {
            const searchResult3 = await esClient.search({
                index: WEBTOON,
                body: {
                    query: query
                }
            })
            result.webtoon = searchResult3.hits.hits;
        }
        mongoLog("account/post", requestIp.getClientIp(req), receive, result);
        res.send(result);
    }
    else {
        receive.problem = 1; // 토큰 인증 실패
        mongoLog("account/post", requestIp.getClientIp(req), receive, result);
        res.send(result);
    }

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