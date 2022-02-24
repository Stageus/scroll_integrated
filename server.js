const express = require("express");
const app = express();
const port = 3000; // 나중에 수정
const path = require("path");

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(express.json());

app.listen(port, (req, res) => {
    console.log(port, "번에 서버 실행");
});