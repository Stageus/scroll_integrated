
const mongoose = require("mongoose");

const logSchema = mongoose.Schema({
    date: {type: Date, default: Date},
    ip: {type: String, required: true},
    receive: "string",
});

const logDocument = mongoose.model("log", logSchema);

module.exports = logDocument;