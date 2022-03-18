const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    api: "string",
    time: "Date",
    ip: "string",
    input: {},
    output: {}
});

const userDocument = mongoose.model("user", userSchema);

const mongoLog = (apiValue, ipValue, inputData, outputData) => {
    try {
        mongoose.connect("mongodb://192.168.160.4", { useNewUrlParser: true })
        .then(() => {
            const user = new userDocument({
                api: apiValue,
                time: Date(),
                ip: ipValue,
                input: inputData,
                output: outputData
            })
            user.save((err, res) => {
                if (err) {
                    console.log("data insert error");
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