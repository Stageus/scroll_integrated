
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

const test = require("./router/test");
app.use("/test", test);

const account = require("./router/account");
app.use("/account", account);

const webtoon = require("./router/webtoon");
app.use("/webtoon", webtoon);

const mylibrary = require("./router/myLibrary");
app.use("/myLibrary", mylibrary);

app.listen(port, (req, res) => {
    console.log(port, "번에 서버 실행");
});
