
const express = require("express");
const router = express.Router();
// const path = require("path");
const pgClient = require("pg").Client;
const pgConfig = require("../private/pgConfig");
// const es = require("elasticsearch");
const INDEX = "test";
const es = require("es7");

const redisClient = require("redis").createClient();
const redis = require("../redis");

router.get("/redis/getViewCount", async (req, res) => {
    const receive = {
        webtoonId: req.query.webtoonId
    }
    const result = {
        success: false,
        viewCount: null
    }

    const redisResult = await redis.getViewCount(receive.webtoonId);
    result.success = redisResult.success;
    result.viewCount = redisResult.viewCount;
    res.send(result);
});

router.get("/redis/getAvgStar", async (req, res) => {
    const receive = {
        webtoonId: req.query.webtoonId
    }
    // const result = {
    //     success: false,
    //     star: null
    // }

    const redisResult = await redis.getAvgStar(receive.webtoonId);

    res.send(redisResult);
});

router.put("/redis/addViewCount", async (req, res) => {
    const receive = {
        webtoonId: req.body.webtoonId
    }
    const result = {
        success: false,
        viewCount: null
    }

    const redisResult = await redis.addViewCount(receive.webtoonId);
    result.success = redisResult.success;
    result.viewCount = redisResult.viewCount;
    res.send(result);
});

router.put("/redis/addStar", async (req, res) => {
    const receive = {
        webtoonId: req.body.webtoonId,
        star: req.body.star,
        voter: req.body.voter,
    }
    // const result = {
    //     success: false,
    //     addone: null
    // }

    const result = await redis.addStar(receive.webtoonId, receive.star, receive.voter);
    res.send(result);
});

router.delete("/redis/initViewCount", async (req, res) => {
    const receive = {
        webtoonId: req.body.webtoonId
    }
    const result = {
        success: false,
        data: null
    }

    try {
        await redisClient.connect();
        result.data = await redisClient.zRem("viewcount", receive.webtoonId);
        await redisClient.disconnect();
        result.success = true;
    }
    catch(err) {
        console.log("err :", err);
    }

    res.send(result);
});

router.delete("/redis/initStar", async (req, res) => {
    const receive = {
        webtoonId: req.body.webtoonId
    }
    const result = {
        success: false,
        data: null
    }

    const starKey = receive.webtoonId + "star";
    const voterKey = receive.webtoonId + "voteId";

    try {
        await redisClient.connect();
        await redisClient.del(starKey, receive.webtoonId);
        await redisClient.del(voterKey, receive.webtoonId);
        await redisClient.disconnect();
        result.success = true;
    }
    catch(err) {
        console.log("err :", err);
    }

    res.send(result);
});

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
                pg.end();
                console.log("finally of pg.query");
            });
            console.log("after pg.query");
        }).catch(err => {
            console.log("CONNECT ERROR:", err);
            reject(err);
            pg.end();
        }).finally(() => {
            console.log("finally of pg.connect")
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

    console.log("pgRequest in postAsync:get");
    pgRequest(sql, null)
    .then(res => {
        console.log("pgRequest then start");
        result.success = res.success;
    }).catch(err => {
        console.log(err);
    }).finally(() => {
        console.log("pgRequest finally start");
        res.send(result);
        console.log("after res.send()");
    });
    console.log("end of postAsync:get");
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

router.get("/redis/setGetTest", async (req, res) => {
    const receive = {
        key: req.query.key
    }
    const result = { 
        success: false,
        data: null
    }

    try {
        await redisClient.connect();
        result.data = await redisClient.sMembers(receive.key);
        await redisClient.disconnect();
        result.success = true;
    }
    catch(err) {
        console.log("setSetTest error :", err);
        await redisClient.disconnect();
    }

    res.send(result);
})

router.post("/redis/setSetTest", async (req,res) => {
    const receive = {
        key: req.body.key,
        data: req.body.data
    }
    const result = { 
        success: false,
        data: null
    }

    try {
        await redisClient.connect();
        result.data = await redisClient.sAdd(receive.key, receive.data);
        await redisClient.disconnect();
        result.success = true;
    }
    catch(err) {
        console.log("setSetTest error :", err);
        await redisClientedis.disconnect();
    }

    res.send(result);
})

module.exports = router;