
const express = require("express");
const router = express.Router();
// const path = require("path");
const pg = require("../pgRequest");

router.get("account", (req, res) => {
    const receive = {
        id: req.body.id,
        pw: req.body.pw
    };
    const result = {
        success = false
    };
});