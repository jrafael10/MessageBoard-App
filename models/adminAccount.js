var mongoose = require('mongoose');
var adminSchema = mongoose.Schema({
    uname: String,
    pass: String,
});

var Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
