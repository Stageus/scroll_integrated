
const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const cors = require("cors");

const corsOptions = {
    origin: '*',
    credentials: true,
    methods: ['POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(express.json());

const pages = require("./router/pages");
app.use("/", pages);

const account = require("./router/account");
app.use("/account", account);

const webtoon = require("./router/webtoon");
app.use("/webtoon", webtoon);

const mylibrary = require("./router/myLibrary");
app.use("/myLibrary", mylibrary);

// const schedule = require("./schedule/schedule");
// schedule();

app.use("/thumbnail", express.static("thumbnail"));

// const crawler = require("./schedule/crawler");

app.listen(port, (req, res) => {
    console.log(port, "번에 서버 실행");
    // crawler();
});
