
const express = require("express");
const app = express();
const port = 3000;
const path = require("path");

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(express.json());

const pages = require("./router/pages");
app.use("/", pages);

const test = require("./router/test");
app.use("/test", test);

const account = require("./router/account");
app.use("/account", account);

app.listen(port, (req, res) => {
    console.log(port, "번에 서버 실행");
});
