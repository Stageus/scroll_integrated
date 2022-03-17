const mongoose = require("mongoose")

const mongoLog = () => {
    try {
        mongoose.connect("mongodb://172.30.0.4", { useNewUrlParser: true });
    } catch(err) {
        console.log(err);
    }
}

module.exports = mongoLog;