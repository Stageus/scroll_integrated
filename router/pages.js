
const express = require("express");
const router = express.Router();
const path = require("path");

// router.get("", (req,res) => {
//     console.log("메인 페이지로");
//     res.sendFile(path.join(__dirname, "../index.html"));
// });

router.get("", (req, res) => {
    res.send("Hello World!")
});

module.exports = router;
