
const mongoose = require("mongoose");

const logSchema = mongoose.Schema({
    date: {type: Date, default: Date},
    api: {type: String, required: true},
    ip: {type: String, required: true},
    request: {type: Object, required: true},
    response: {type: Object, required: true}
});

const logDocument = mongoose.model("log", logSchema);

module.exports = logDocument;