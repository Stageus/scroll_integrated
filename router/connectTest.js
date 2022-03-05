
const express = require("express");
const router = express.Router();
// const path = require("path");
const pgClient = require("pg").Client;
const pgConfig = require("../private/pgConfig");
const es = require("elasticsearch");
const INDEX = "test";

router.get("/postgres", (req, res) => {
    const result = {
        success: false
    }
    const sql = "SELECT NOW()";

    const pg = new pgClient(pgConfig);
    pg.connect(err => {
        if (err) {
            console.log("CONNECT ERROR:", err);
            res.send(result);
        }
        else {
            pg.query(sql, (err, res2) => {
                if (err) {
                    console.log("SQL ERROR:", err);
                }
                else {
                    result.success = true;
                }
                res.send(result);
                pg.end();
            });
        }
    });
});

router.post("/elastic", (req, res) => {
    const receive = req.body.something
    const result = {
        success: false,
        error: null
    }

    const client = new es.Client({
        host: "http://elasticsearch"
    });

    client.index({
        index: INDEX,
        body: {
            "docker": receive
        }
    }, (err) => {
        if (err) {
            console.log("Elastic POST Error:", err);
            result.error = err;
        }
        else {
            result.success = true;
        }

        res.send(result);
    });
});

module.exports = router;