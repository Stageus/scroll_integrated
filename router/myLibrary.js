
const express = require("express");
const router = express.Router();
// const path = require("path");

const pg = require("../pgRequest");
const requestIp = require("request-ip");
const mongoLog = require("../logging");
const es = require("es7");

const jwt = require("jsonwebtoken");
const jwtKey = require("../private/privateKey").jwtPrivateKey;

const INDEX = "myLibrary";

// 즐겨찾기 정보 불러오기
router.get("", (req, res) => {

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

    const auth = false;
    try {
        const jwtData = jwt.verify(res.cookies.token, jwtKey);
        auth = true;
    } catch(err) {
        console.log("토큰 만료");
    }

    if (auth) {
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
    }
    else {
        console.log("인증 실패");
        res.send(result);
    }

});

// 즐겨찾기 등록
router.post("/preview", (req, res) => {
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

    const auth = false;
    try {
        const jwtData = jwt.verify(res.cookies.token, jwtKey);
        auth = true;
    } catch(err) {
        console.log("토큰 만료");
    }

    if (auth) {
        const esClient = new es.Client({
            node: "https://localhost:9200/" // 수정해야함.
        });
    
        esClient.index({
            index: INDEX,
            body:{
    
            }
        }, err => {
            if (err) {

            }
            else {

            }

            res.send(result);
        });
    }
    else {
        console.log("인증 실패");
        res.send(result);
    }
})

// 즐겨찾기 삭제
router.delete("/preview", (req, res) => {
    receive = {
        webtoonID: req.query.webtoonID
    }
    result = {
        success: false
    }

    const auth = false;
    try {
        const jwtData = jwt.verify(res.cookies.token, jwtKey);
        auth = true;
    } catch(err) {
        console.log("토큰 만료");
    }

    if (auth) {
        const esClient = new es.Client({
            node: "https://localhost:9200/" // 수정해야함.
        });
    
        esClient.deleteByQuery({
            index: INDEX,
            body:{
    
            }
        }, err => {
            if (err) {

            }
            else {

            }

            res.send(result);
        });
    }
    else {
        console.log("인증 실패");
        res.send(result);
    }
})