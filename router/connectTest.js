
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

router.get("/elastic", (req, res) => {
    const result = {
        success: false
    }

    const client = new es.Client({
        node: "https://localhost:9200/"
    });

    client.search({
        index: INDEX,
        body: {
        }
    }, (err, elasticResult) => {
        if (err) {
            console.log("Elastic GET Error:", err);
        }
        else {
            result.success = true;
        }

        res.send(result);
    });
});

module.exports = router;