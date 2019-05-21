/*
var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    uname: String,
    pass: String,
});

var Users = mongoose.model('Users', userSchema);
module.exports = Users;
*/

var mongoose = require('mongoose');
var userSchema = mongoose.Schema({
    uname: String,
    pass: String,
    admin: Boolean,
    canPost: Boolean,
});

var Users = mongoose.model('Users', userSchema, 'users');

module.exports = Users;

