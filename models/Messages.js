

var mongoose = require('mongoose');
var mesSchema = mongoose.Schema({
    uname: String,
    msg: String,
    DateAndTime : { type: Date, default: Date.now },
});

var Message = mongoose.model('Messages', mesSchema);

module.exports = Message;