
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
    } else if (req === "화" || req === "카카오" || req === "코미디") {
        return 2;
    } else if (req === "수" || req === "레진" || req === "로맨스") {
        return 3;
    } else if (req === "목" || req === "투믹스" || req === "판타지") {
        return 4;
    } else if (req === "금" || req === "탑툰" || req === "일상") {
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
    const success = {
        platform: false,
        genre: false,
        cycle: false
    }
    const webtoonArr = {
        platform: [],
        genre: [],
        cycle: [],
        result: []
    }

    const filterToon = () => {
        return new Promise((resolve, reject) => {
            resolve();
        })
    }
    let sql = `SELECT w.webtoonid
    FROM toon.webtoon AS w
    JOIN toon.toongenre AS t
    ON w.webtoonid = t.webtoonid
    JOIN toon.cycle AS c
    ON w.webtoonid = c.webtoonid WHERE`
    if (Array.isArray(receive.platform)) {
        let sql = "SELECT webtoonid FROM toon.webtoon WHERE";
        for (let i = 0; i < receive.platform.length; i++) {
            receive.platform[i] = changeReq(receive.platform[i]);
            sql += " platformid=$" + (i + 1) + " OR";
        }
        sql += " 1=1;"
        let values = receive.platform;
        console.log(values);

        pg(sql, values)
        .then(post => {
            if (post.success) {
                success.platform = true;
                // console.log(post.data);
                webtoonArr.platform = post.data;
            } else {
                result.message = "플랫폼 오류"; // DB 에러
                console.log("\npostgresql err get member info failed\n");
                console.log(err);
            }
        }).catch(err => {
            console.log("\npostgresql err get member info failed");
            console.log(err);
            result.message = "플랫폼 오류"; // DB 에러
        })

        console.log(sql);
    }

    if (Array.isArray(receive.genre)) {
        let sql2 = "SELECT webtoonid FROM toon.toongenre WHERE";
        for (let i = 0; i < receive.genre.length; i++) {
            receive.genre[i] = changeReq(receive.genre[i]);
            sql2 += " genreid=$" + (i + 1) + " OR";
        }
        sql2 += " 1=1;"
        let values2 = receive.genre;
        console.log(values2);

        pg(sql2, values2)
        .then(post => {
            if (post.success) {
                success.genre = true;
                // console.log(post.data);
                webtoonArr.genre = post.data;
            } else {
                result.message = "장르 오류"; // DB 에러
                console.log("\npostgresql err get member info failed\n");
                console.log(err);
            }
        }).catch(err => {
            console.log("\npostgresql err get member info failed");
            console.log(err);
            result.message = "장르 오류"; // DB 에러
        })

        console.log(sql2);
    }

    if (Array.isArray(receive.weekday)) {
        let sql3 = "SELECT webtoonid FROM toon.cycle WHERE";
        for (let i = 0; i < receive.weekday.length; i++) {
            receive.weekday[i] = changeReq(receive.weekday[i]);
            sql3 += " cycle=$" + (i + 1) + " OR";
        }
        sql3 += " 1=1;"
        let values3 = receive.weekday;
        console.log(values3);

        pg(sql3, values3)
        .then(post => {
            if (post.success) {
                success.cycle = true;
                // console.log(post.data);
                webtoonArr.cycle = post.data;
            } else {
                result.message = "요일 오류"; // DB 에러
                console.log("\npostgresql err get member info failed\n");
                console.log(err);
            }
        }).catch(err => {
            console.log("\npostgresql err get member info failed");
            console.log(err);
            result.message = "요일 오류"; // DB 에러
        })

        console.log(sql3);
    }

    //배열 교집합 비동기처리 해야함, 테이블 조인 확정
    // result.success = success.platform && success.genre && success.cycle;
    // webtoonArr.result = webtoonArr.platform.filter(value => webtoonArr.genre(value));
    // webtoonArr.result = webtoonArr.result.filter(value => webtoonArr.cycle(value));
    // console.log(webtoonArr.result);//확인

    const auth = false;
    let jwtData = null;
    try {
        jwtData = jwt.verify(receive.token, jwtKey);
        auth = true;
    } catch(err) {
        result.message += ", 회원정보 없음"; // 토큰 인증 실패
    }

    result.success = true;//로그로 변경
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