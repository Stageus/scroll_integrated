
const express = require("express");
const router = express.Router();
// const path = require("path");
const pgClient = require("pg").Client;
const pgConfig = require("../private/pgConfig");
// const es = require("elasticsearch");
const INDEX = "test";
const es = require("es7");

const pgRequest = (sql, values) => 
    new Promise((resolve, reject) => {
        console.log("pgRequest Start");

        const result = {
            "success": false
        };

        const pg = new pgClient(pgConfig);

        console.log("before pg.connect");
        pg.connect()
        .then(() => {
            console.log("connection complete");

            let values2 = null;
            if (values != null) {
                values2 = values;
            }
            else {
                values2 = [];
            }
        
            console.log("before pg.query");
            pg.query(sql, values2)
            .then(res => {
                console.log("in pg.query");
                console.log("res:", res);
                result.success = true;
                result.data = res.rows;
                resolve(result);
            }).catch(err => {
                console.log("err in pg.query");
                console.log("SQL ERROR:", err);
                reject(err);
            }).finally(() => {
                console.log("end of pg.query");
                pg.end();
            });
            console.log("after pg.query");
        }).catch(err => {
            console.log("CONNECT ERROR:", err);
            reject(err);
            pg.end();
        });
        console.log("after pg.connect");
    });

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

router.get("/postAsync", (req, res) => {
    const result = {
        success: false
    }
    const sql = "SELECT NOW();";

    // pg.connect()
    // .then(() => {
    //     console.log("connection success");
    //     result.success = pgRequest(sql, null, pg);
    //     res.send(result);
    //     result.after = true;
    //     console.log("pgRequest terminated");
    // })

    // result.after = true;

    // result.success = 
    pgRequest(sql, null)
    .then(res => {
        result.success = res.success;
    }).catch(err => {
        console.log(err);
    }).finally(() => {
        res.send(result);
    });
})

router.post("/elastic", (req, res) => {
    const receive = req.body.something;
    const result = {
        success: false,
        error: null
    }

    const client = new es.Client({
        node: "http://elasticsearch:9200"
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