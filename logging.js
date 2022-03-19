const mongoose = require("mongoose")
const logDocument = require("../schema/logSchema")

const mongoLog = (apiValue, ipValue, inputData, outputData) => {
    mongoose.connect("mongodb://root:1234@192.168.160.4", { useNewUrlParser: true })
    .then(() => {
        const user = new logDocument({
            date: new Date,
            api: apiValue,
            ip: ipValue,
            request: inputData,
            response: outputData
        })
        user.save((err, res) => {
            if (err) {
                console.log("insert error:", err);
            }
        })
    })
    .catch((err) => {
        console.log(err);
    })
}

module.exports = mongoLog;