const mongoose = require("mongoose")

mongoose.connect("mongodb://172.30.0.4", { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('We are connected!');
});