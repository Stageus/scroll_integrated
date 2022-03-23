const schedule = require("node-schedule");

const crawler = require("../module/crawler");
const uploadRedis = require("../module/redisUploader")

const demonizer = () => schedule.scheduleJob("0 * * * * *", async() => {
    console.log("second");
    // await crawler();
    // await uploadRedis();
})

module.exports = demonizer;