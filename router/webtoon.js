
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
    if (req === "일") {
        return 0;
    } else if (req === "월" || req === "네이버" || req === "액션") {
        return 1;
    } else if (req === "화" || req === "레진" || req === "코미디") {
        return 2;
    } else if (req === "수" || req === "탑툰" || req === "로맨스") {
        return 3;
    } else if (req === "목" || req === "투믹스" || req === "판타지") {
        return 4;
    } else if (req === "금" || req === "카카오" || req === "일상") {
        return 5;
    } else if (req === "토" || req === "k툰" || req === "호러") {
        return 6;
    } else if (req === "열흘") {
        return 7;
    } else if (req === "기타") {
        return 8;
    } else {
        return -1;
    }
}

// 요일, 플랫폼, 장르, 즐겨찾기 여부

// 웹툰 정보 불러오기
router.post("", (req, res) => {
    const receive = {
        token: req.body.token,
        weekday: req.body.weekday,
        genre: req.body.genre,
        platform: req.body.platform
    };
    const result = {
        success: false,
        message: "웹툰 불러오기 실패",
        webtoon: [
            // {
            //     webtoonid: 1,
            //     title: "쇼미더럭키짱!",
            //     thumbnail: "https://shared-comic.pstatic.net/thumb/webtoon/783054/thumbnail/thumbnail_IMAG10_6917f3d9-c5bb-4bfd-aa04-a288f7b252af.jpg",
            //     link: "https://comic.naver.com/webtoon/list?titleId=783054&weekday=mon",
            //     author: "박태준/김성모",
            //      bookmark: false
            // }
        ]
    };
    let webtoonArr = [];
    let bookmarkArr = [];

    let sql = `SELECT w.webtoonid
    FROM toon.webtoon AS w
    JOIN toon.toongenre AS t
    ON w.webtoonid = t.webtoonid
    JOIN toon.cycle AS c
    ON w.webtoonid = c.webtoonid WHERE`
    if (Array.isArray(receive.platform) && Array.isArray(receive.genre) && Array.isArray(receive.weekday)) {
        if (receive.platform.length > 0) {
            sql += " (";
            for (let i = 0; i < receive.platform.length; i++) {
                receive.platform[i] = changeReq(receive.platform[i]);
                sql += " w.platformid=" + receive.platform[i] + " OR";
            }
            sql += " false) AND";
        }
        if (receive.genre.length > 0) {
            sql += " ("
            for (let i = 0; i < receive.genre.length; i++) {
                receive.genre[i] = changeReq(receive.genre[i]);
                sql += " t.genreid=" + receive.genre[i] + " OR";
            }
            sql += " false) AND";
        }
        if (receive.weekday.length > 0) {
            sql += " ("
            for (let i = 0; i < receive.weekday.length; i++) {
                receive.weekday[i] = changeReq(receive.weekday[i]);
                sql += " c.cycle=" + receive.weekday[i] + " OR";
            }
            sql += " false)";
        } else {
            sql += " true";
        }
        sql += ";";
        if (receive.platform.length === 0 && receive.genre.length === 0 && receive.weekday.length === 0) {
            console.log("@@@@")
            sql = "SELECT webtoonid FROM toon.webtoon;"
        }
        // console.log(sql);
        // 웹툰 필터링
        pg(sql, [])
        .then(post => {
            if (post.success) {
                // console.log(post.data);
                webtoonArr = post.data;
                //배열 중복제거
                for (let i = 0; i < webtoonArr.length; i++) {
                    webtoonArr[i] = webtoonArr[i].webtoonid;
                }
                webtoonArr = webtoonArr.filter((element, index) => webtoonArr.indexOf(element) === index);
                // console.log(webtoonArr);
                // 웹툰 불러오기
                if (webtoonArr.length > 0) {
                    let sql = `SELECT webtoonid, title, thumbnail, link, author
                    FROM toon.webtoon WHERE`;
                    for (let i = 0; i < webtoonArr.length; i++) {
                        sql += " webtoonid=$" + (i + 1) + " OR"
                    }
                    sql += " false ORDER BY viewcount DESC;";
                    let values = webtoonArr;
                    // console.log(sql);
                    pg(sql, values)
                    .then(post => {
                        if (post.success) {
                            // console.log(post.data);
                            result.webtoon = post.data;

                            // 토큰 인증
                            let jwtData = null;
                            let auth = false;
                            try {
                                jwtData = jwt.verify(receive.token, jwtKey);
                                auth = true;
                            } catch(err) {
                                // 토큰 인증 실패
                                for (let i = 0; i < result.webtoon.length; i++) {
                                    result.webtoon[i].bookmark = false;
                                }
                            }
                            // 북마크 유무
                            if (auth) {
                                let sql = `SELECT webtoonid FROM library WHERE memberid=$1`;
                                let values = [jwtData.memberid];
                                pg(sql, values)
                                .then(post => {
                                    if (post.success) {
                                        bookmarkArr = post.data;
                                        for (let i = 0; i < bookmarkArr.length; i++) {
                                            bookmarkArr[i] = bookmarkArr[i].webtoonid;
                                        }
                                        for (let i = 0; i < result.webtoon.length; i++) {
                                            result.webtoon[i].bookmark = false;
                                            if (bookmarkArr.includes(result.webtoon[i].webtoonid)) {
                                                result.webtoon[i].bookmark = true;
                                            }
                                        }
                                    } else {
                                        result.message = "웹툰 즐겨찾기 오류"; // DB 에러
                                        console.log("\npostgresql err get member info failed\n");
                                        console.log(err);
                                    }
                                }).catch(err => {
                                    console.log("\npostgresql err get member info failed");
                                    console.log(err);
                                    result.message = "웹툰 즐겨찾기 오류"; // DB 에러
                                }).finally(() => {
                                    result.success = true;
                                    result.message = "웹툰 불러오기 성공";
                                    mongoLog("webtoon/post", requestIp.getClientIp(req), receive, result);
                                    res.send(result);
                                })
                            } else {
                                result.success = true;
                                result.message = "웹툰 불러오기 성공";
                                mongoLog("webtoon/post", requestIp.getClientIp(req), receive, result);
                                res.send(result);
                            }
                        } else {
                            result.message = "웹툰 불러오기 오류"; // DB 에러
                            console.log("\npostgresql err get member info failed\n");
                            console.log(err);
                            mongoLog("webtoon/post", requestIp.getClientIp(req), receive, result);
                            res.send(result);
                        }
                    }).catch(err => {
                        console.log("\npostgresql err get member info failed");
                        console.log(err);
                        result.message = "웹툰 불러오기 오류"; // DB 에러
                        mongoLog("webtoon/post", requestIp.getClientIp(req), receive, result);
                        res.send(result);
                    })
                } else {
                    result.message = "웹툰 불러오기 성공";
                    mongoLog("webtoon/post", requestIp.getClientIp(req), receive, result);
                    res.send(result);
                }
            } else {
                result.message = "웹툰 필터링 오류"; // DB 에러
                console.log("\npostgresql err get member info failed\n");
                console.log(err);
                mongoLog("webtoon/post", requestIp.getClientIp(req), receive, result);
                res.send(result);
            }
        }).catch(err => {
            console.log("\npostgresql err get member info failed");
            console.log(err);
            result.message = "웹툰 필터링 오류"; // DB 에러
            res.send(result);
        })
    }

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

router.get("/history", (req, res) => {
    const result = {
        success: false,
        message: "기록 불러오기 실패",
        webtoon: [
            // {
            //     webtoonid: 1,
            //     title: "쇼미더럭키짱!",
            //     link: "httplink"
            // }
        ]
    }
    //gethistory 이후 그 배열로 db참조, 반환
})

router.post("/click", async(req, res) => {
    const receive = {
        webtoonid: req.body.webtoonID
    }
    const result = {
        success: false,
        message: "클릭 기록 실패"
    }

    try {
        await redis.addViewCount(receive.webtoonid);
        await redis.addHistory(receive.webtoonid);
        result.success = true;
        result.message = "클릭 기록 성공";
        //로깅
        mongoLog("account/click", requestIp.getClientIp(req), receive, result);
        
        res.send(result);
    } catch(err) {
        result.message = "클릭 기록 오류";
        console.log(err);
    }
})

module.exports = router;