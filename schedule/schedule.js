const schedule = require("node-schedule");

const crawler = require("./crawler");
const uploadRedis = require("./redisUploader")

// const demonizer = () => schedule.scheduleJob("0 * * * * *", async() => {
const demonizer = () => schedule.scheduleJob("0 0 17 * * *", async() => {
    // console.log("second");
    await crawler();
    await uploadRedis();
})

module.exports = demonizer;