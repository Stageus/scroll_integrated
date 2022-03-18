const mongoose = require("mongoose")
const logDocument = require("../schema/logSchema")

const mongoLog = (apiValue, ipValue, inputData, outputData) => {
    try {
        mongoose.connect("mongodb://root:1234@192.168.160.4", { useNewUrlParser: true })
        .then(() => {
            const user = new logDocument({
                date: new Date,
                ip: "test",
                receive: "test"
            })
            user.save((err, res) => {
                if (err) {
                    console.log("data insert error", err);
                } else {
                    console.log("data insert success");
                }
            })
        })
        .catch((err) => {
            console.log(err);
        })
    } catch(err) {
        console.log(err);
    }
}

module.exports = mongoLog;