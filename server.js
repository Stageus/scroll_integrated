
const express = require("express");
const app = express();
const port = 3000;
const path = require("path");

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(express.json());

const pages = require("./router/pages");
app.use("/", pages);

const test = require("./router/connectTest");
app.use("/test", test);

app.listen(port, (req, res) => {
    console.log(port, "번에 서버 실행");
});
