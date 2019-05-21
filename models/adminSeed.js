


var seed = function(User) {

    User.find(function(err, user) {
        var md5 = require ('md5')

        if (user.length) return;

        var adminUser = new User({
            uname: 'admin',
            pass: md5('admin'),

        }).save();
        


    });
};

module.exports = {
    seed: seed
}