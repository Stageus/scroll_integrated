
const express = require("express");
const router = express.Router();
// const path = require("path");

const pg = require("../pgRequest");
const requestIp = require("request-ip");
const mongoLog = require("../logging");
const es = require("es7");

const INDEX = "webtoon";

// 웹툰 정보 불러오기
router.get("", (req, res) => {
    receive = {
        week: req.query.week,
        title: req.query.week,
        genre: req.query.genre,
        platform: req.query.platform

    }
    result = {
        success: false,
        id: null,
        title: null,
        detail: null,
        genre: null,
        week: null,
        platform: null,
        thumbnail: null,
        link: null,
        author: null,
        totalVote: null
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

        res.send(result);
    });
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

        res.send(result);
    });
})

module.exports = router;