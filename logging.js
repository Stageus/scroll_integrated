
const mongoose = require("mongoose");
const logDocument = require("./schema/logSchema.js");

const sendLog = (etc) => {
    mongoose.connect("url")
    .then(() => {
        const log = new logDocument({
            something: "something"
        });

        log.save((err, res) => {
            if (err) {
                console.log("m", err);
            }
            else {
                console.log("m");
                console.log("log res:", res);
            }
        });
    })
    .catch(err => {
        console.log("mongoose connect error:", err);
    });
};

module.exports = sendLog;