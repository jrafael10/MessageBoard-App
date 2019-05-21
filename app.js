var express = require('express'),
        handlebars = require('express-handlebars').create({
    defaultLayout:'main',
    helpers: {
        debug: function(){
            console.log("Current Context");
            console.log("=================");
            console.log(this);
            return null
        },
        section: function(name, options){
            if(!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    }
}),
    cookieParser = require('cookie-parser'),
    sessions = require('express-session'),
    bodyParser = require('body-parser'),
    https = require('https'),
    fs = require( 'fs');
    md5 = require ('md5'),
    mongoose = require('mongoose');
credentials = require('./credentials'),
    Users = require('./models/uCredentials.js'),
    Messages = require('./models/Messages.js');
    //Admin = require('./models/adminAccount.js'),
    //seedAccount= require('./models/adminSeed.js');
var app = express();

var connectionString = /*'mongodb://127.0.0.1:20061/a3'*/  'mongodb://127.0.0.1:27017';  //'mongodb://127.0.0.1:20061/a3';  'mongodb://127.0.0.1:27017';
/*
credentials.mongo.development.username + ':' +
credentials.mongo.development.password + '@' +
credentials.mongo.development.hosts + '/' +
credentials.mongo.development.database +
credentials.mongo.development.options;       */
mongoose.connect( process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || connectionString);






var unames = [];
var passwords = [];

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(credentials.cookieSecret));
app.use(sessions({
    resave: true,
    saveUninitialized: false,
    secret: credentials.cookieSecret,
    cookie: {maxAge: 3600000},
}));





//set up handlebars view engine

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3011);


/*
Users.remove( function (err, users) {
    if (err) return handleError(err);

});
*/



Users.find({},function(err, user){
    console.log(user);
})




//creating the admin by seeding the database
createAdmin('admin');
function createAdmin(user) {
    Users.find({uname: user}, function (err, users) {
        if(users.length !==0 ){
            console.log('account already exists')
        }
        else {
            var newUser = Users({
                uname: 'admin',
                pass: md5('admin'),
                admin: true,
                canPost: true,
            });

            newUser.save(function (err) {
                if (err) {
                    console.log('Error adding new user ' + err);
                }
            });


        }

    })
}

//http://3909.acs.uwinnipeg.ca:3011/userPost

//function returning an array of pages

function getPages(){
    return {
        userPages: [ //http://localhost:3011/about
            {
                name: 'Board',
                pageUrl:  '/messageBoard',

            },
            {
                name: 'User Post',
                pageUrl:   '/userPost',

            },
            {    name: 'settings',
                pageUrl:  '/settings',

            },

            {
                name: 'Log out',
                pageUrl:  '/logout',

            },

        ],
        adminPages: [{
            name: 'Admin Board',
            pageUrl: '/adminBoard',
        },
        { name: 'Users',
          pageUrl:  '/users',
        },
        { name: 'Create Users',
          pageUrl:  '/createUser',

        },
         {
             name: 'settings',
             pageUrl: '/settings',

            },
        { name: 'Log out',
          pageUrl:  '/logout',
         }],


    };

}

/*app.use(function(req, res, next ) {
    if(!res.locals.partials) res.locals.partials = {};
    res.locals.partials.pageData = getPages ();
    next();
})
*/
/*Middleware functions are functions that have access to the request object (req), the response object (res),
and the next middleware function in the application’s request-response cycle.
 */

//loading the middleware function that handles the partials
app.use(function(req, res, next) {
    if(!res.locals.partials) res.locals.partials ={};
    res.locals.partials.pageData = getPages();
    next();
})


//
app.get('/', function(req, res){

    signedCookie(res, 'settingsData', {sort: req.body.sort, color: req.body.color});
    signedCookie(res, 'adminSettingsData',{sort: req.body.sort, color: req.body.color});

    res.render('login');
    //console.log("user in login page: " + req.session);
});







function checkUserlogin (req, res, user, password) {


    var un, pw;

    Users.find({uname: user}, function (err, users) {
            if(users.length !==0){
                if(users[0].pass == md5(password)){
                    if(user === "admin"){
                        req.session.userName = user;
                        res.redirect(303, 'adminBoard');
                    }
                    else {
                        req.session.userName = user;
                        res.redirect(303, 'messageBoard');

                    }
                }
                else {
                    res.render('login', {message: 'Username or password was not valid. Try again'});
                }

            }
            else {
                //res.redirect(303, 'messageBoard');
                res.render('login', {message: 'Username or password was not valid. Try again'});
            }




    });

}

function displayUserData(req, res, page, filter) {
    var contextObj = {};
    Users.find(filter, function(err, users) {
        if(err) {
            console.log('error');
        }

        contextObj = {users: users};
        res.render(page, contextObj);


    })
}



function getMessageData(req, res, page, filter) {


    var contextObj = {};
    Messages.find(filter, function(err, msg) {
        if(err) {
            console.log("error finding");
        }
        Users.findOne({uname: req.session.userName}, function(err, user) {
            console.log("I'm the user: " + user);


            if (err) {
                console.log('error user');
            }

            if (req.session.userName !== 'admin') {
                contextObj = {
                    messages: msg,
                    color: req.signedCookies.settingsData.color,
                    user: user,

                }
                res.render(page, contextObj);
            } else {


                contextObj = {
                    messages: msg,
                    color: req.signedCookies.adminSettingsData.color,
                    user: user,

                }
                res.render(page, contextObj);

            }
        })
    })


}

function sortData(filter, sortBy, req, res, page){
    var contextObj = {};
    Messages.find(filter).sort(sortBy).exec(function(err, msg) {
        if(err) {
            console.log('error');
        }

    Users.findOne({uname: req.session.userName}, function(err, user) {
        if (err) {
            console.log('error user');
        }

        if (req.session.userName !== 'admin') {
            contextObj = {
                messages: msg,
                color: req.signedCookies.settingsData.color,
                user: user,
            };
            res.render(page, contextObj);
        } else {
            contextObj = {
                messages: msg,
                color: req.signedCookies.adminSettingsData.color,
                user: user,
            };
            res.render(page, contextObj);
        }

        })
    })

}

function signedCookie(res, dataName, data){


    //used to save cookie
    res.cookie(dataName, data, {signed: true, maxAge: 604800400 })
}




function deleteUser(req, res, page){
    var contextObj = {};
    console.log(req.params.id);
    Users.remove({_id: req.params.id}, function(err, msg) {
        console.log(' deleting post ' + JSON.stringify(msg));
        if(err) {
            console.log(err);
        }


    })
    req.method = 'GET';
    res.redirect(303, page);


}

app.put('/disable/:id', function(req, res){
    //console.log(JSON.stringify(req.params.id));
    //req.method = 'GET';
    Users.findOne({_id: req.params.id}, function(err, user){
        if(err) {
            console.log("Error in finding user " + err);
        }

        if(!user) {
            console.log('no user found');
        }
        else {
            // if(user.canPost){
            user.canPost = false;
            user.save(function(err){
                if(err){
                    console.log('unable to save')
                }

            })

        };

        console.log(user);
    })
    //console.log(req.params.id);
    req.method = 'GET';
    res.redirect(303, '/adminBoard');


})


app.put('/enable/:id', function(req, res){
    //console.log(JSON.stringify(req.params.id));
    //req.method = 'GET';
    Users.findOne({_id: req.params.id}, function(err, user){
        if(err) {
            console.log("Error in finding user " + err);
        }

        if(!user) {
            console.log('no user found');
        }
        else {
           // if(user.canPost){
                user.canPost = true;
                user.save(function(err){
                    if(err){
                        console.log('unable to save')
                    }

                })

            
        };

        console.log(user);
    })
    //console.log(req.params.id);
    req.method = 'GET';
   res.redirect(303, '/adminBoard');


})

//Will be used in responding to the delete request to the route
function deletePost(req, res, page){
    var contextObj = {};
    Messages.remove({_id: req.params.id}, function(err, msg) {
        console.log(' deleting post ' + JSON.stringify(msg));
        if(err) {
            console.log(err);
        }


    })
    //req.method = 'GET';
     res.redirect(303, page);


}

app.delete('/user/:id', function(req, res){
    deleteUser(req, res, '/users');
})

app.delete('/adminPost/:id', function(req, res) {
    deletePost(req, res, '/adminBoard');
})


//Retrieving  the id property from the user database and use it in the delete request to delete a user's post.
app.delete('/post/:id', function(req, res) {
    deletePost(req, res, '/userPost');

});


app.post('/addUser', function(req, res){
    Users.find({uname: req.body.newuser}, function(err, users){
        if(users.length !== 0) {
            res.render('createUser', {message: 'There is an existing username. Try again.'})
        } else {

            var newUser = Users({
                uname: req.body.newuser,
                pass: md5(req.body.userpassword),
                admin: false,
                canPost: true,


            });

            newUser.save(function (err) {
                if (err) {
                    console.log('Error adding new user ' + err);
                }
            });

           res.redirect(303, 'users');
           // res.end();

        }
    })


})



//Handles the POST request from settings form
app.post('/processSettings', function(req, res) {

    if(req.session.userName !== 'admin') {
        signedCookie(res, 'settingsData', {sort: req.body.sort, color: req.body.color});
        var contextObj = {};


        res.redirect(303, '/messageBoard');
        //displayData(req,res, {}, 'messageBoard');
    }

    else {
        signedCookie(res, 'adminSettingsData',{sort: req.body.sort, color: req.body.color});
        res.redirect(303, 'adminBoard');
    }

     console.log(req.signedCookies); 
});

function addPost(req, res, page) {
    //if the text box is not empty, message will be stored in database
    if(req.body.usermessage !== '') {
        var newMessage = Messages({
            uname: req.session.userName,
            msg: req.body.usermessage,
            DateAndTime: Date.now(),
        }) ;

        newMessage.save(function(err, messages) {
            if(err) {
                console.log("Error inserting new message and user");
            }



        }) ;
        res.redirect(303, page);

        //if text box is empty, data from the message database will be displayed
    }  else {
        displayData(req, res, {}, page);
    }


}

app.post('/processAdminMessage', function(req, res) {
    addPost(req, res, 'adminBoard');
    
})

//Handles post request from the form(textarea) and the message will be saved in the database named
//Messages.js
app.post ('/processMessage', function(req, res) {

    addPost(req, res, 'messageBoard');
    console.log(req.body);

});


app.post('/processLogin', function(req, res) {

    if (req.body.buttonVar == 'login') {
        //if(req.body.uname !== 'admin' && req.body.psw !== 'admin') {
            checkUserlogin(req, res, req.body.uname.trim(), req.body.psw.trim())
            console.log(req.session.userName);
       // }
      //  else {
        //    checkAdminlogin(req, res,req.body.uname.trim(), req.body.psw.trim())
          //  console.log(req.session.userName);
        //}
    } else {
        res.redirect(303, 'register');
    }
});


//function used to register user
function createAndcheckAccount(req, res, user, pw, pw2) {

    Users.find({uname: user}, function (err, users) {

        //check if there's an existing user
        if (users.length !== 0) {
            //if there's no user, register page will be rendered along with the message object below
            res.render('register', {message: 'There is an existing username. Try again.'})

        } else {

            //if the password matches the password repeat, the new user will be stored in the
            //database
            if (pw == pw2) {
                var newUser = Users({
                    uname: req.body.username,
                    pass: md5(req.body.psw),
                    admin: false,
                    canPost: true,


                });

                newUser.save(function (err) {
                    if (err) {
                        console.log('Error adding new user ' + err);
                    }
                });


                req.session.userName = req.body.username;
                res.redirect(303, 'board');
            } else {
                res.render('register', {message: 'Passwords did not match. Try again.'})


            }
        }
    })
};


//handling a POST request that processes the user registration
app.post('/processReg', function(req, res) {

    createAndcheckAccount(req, res, req.body.username, req.body.psw.trim(),  req.body.pswrepeat.trim() );//req.body.psw.trim(), req.body.pswrepeat.trim() );

});







app.get('/messageBoard', function(req, res) {
    //signedCookie(res, 'settingsData', {sort: req.body.sort, color: req.body.color});

    if(req.session.userName) {

        displayData(req, res, {}, 'messageBoard');
    } else {
        res.render('login',{message: 'Please login to access the message board page'});
    }



})


//Handles GET Requests
app.get('/board', function(req, res){


    if(req.session.userName) {


            res.redirect(303, 'messageBoard');
        }

       // res.redirect(303, 'messageBoard');


     else {
        res.render('login', {message: 'Please login to access the home page'});
    }

});

function displayData(req, res, filter, page) {


    console.log(req.signedCookies);
    if(req.session.userName !== 'admin') {
        console.log("your session: " + req.session.userName);
        if (req.signedCookies.settingsData.sort === 'Newest to oldest') {
            sortData(filter, '-DateAndTime', req, res, page);
            console.log(req.signedCookies.settingsData.sort);
        } else {
            getMessageData(req, res, page, filter);
        }
    }
    else {

        console.log("your session: " + req.session.userName);
        if (req.signedCookies.adminSettingsData.sort === 'Newest to oldest') {
            sortData(filter, '-DateAndTime', req, res, page);
            console.log(req.signedCookies.adminSettingsData.sort);
        } else {
            getMessageData(req, res, page, filter);
        }

    };

    Users.findOne({uname: req.session.userName}, function(err, user){
        console.log("The canPost of this user: " + user.canPost);
    })

}




//handling get request that processes the posting of message
app.get('/userPost', function(req, res){
    var user = {};
    if(req.session.userName) {
        displayData(req, res, {uname: req.session.userName}, 'userPost');

    }
    else {
        res.render('login',{message: 'Please login to access the user posts page'});
    }

});

app.get('/settings', function(req, res){
    if(req.session.userName) {
        if(req.session.userName === 'admin'){
            res.render('Settings2');
        }
        else {
            res.render('settings');
        }
    }
    else {
        res.render('login',{message: 'Please login to access the settings page'});
    }
   


});

app.get('/adminBoard', function(req, res){

    //signedCookie(res, 'adminSettingsData',{sort: req.body.sort, color: req.body.color});

    if(req.session.userName) {

        if(req.session.userName === 'admin') {
            //getMessageData(req, res, 'adminBoard', {} );
            displayData(req, res, {}, 'adminBoard');
        }
        else {
            res.render('login',{message: 'Only the administrator can access this page'});

        }

    }
    else {
        res.render('login',{message: "Please login using the administrator's account to access this page"});
    }


})

app.get('/users', function(req, res){

    if(req.session.userName) {
        if(req.session.userName === 'admin') {
            //getMessageData(req, res, 'adminBoard', {} );
            //res.render('users');
            displayUserData(req, res, 'users', {});
        }
        else {
            res.render('login',{message: 'Only the administrator can access this page'});

        }
    }
    else {
        res.render('login',{message: "Please login using the administrator's account to access this page"});
    }



})

app.get('/createUser', function(req, res){
    if(req.session.userName) {
        if(req.session.userName === 'admin') {
            //getMessageData(req, res, 'adminBoard', {} );
            res.render('createUser');
        }
        else {
            res.render('login',{message: 'Only the administrator can access this page'});

        }
    }
    else {
        res.render('login',{message: "Please login using the administrator's account to access this page"});
    }
})









app.get('/login', function(req, res){
    res.render('login');

});





app.get('/register', function(req, res){
    res.render('register');
});

app.get('/logout', function(req, res) {
    delete req.session.userName;
    res.redirect(303,'/');
})


//custom 404 page
app.use(function(req, res){
    res.status(404);
    res.render('404');
});

//custom 500 page
app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500);
    res.render('500');
});
/*
app.listen(app.get('port'), function(){
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});*/

function startServer() {
    var keyFile = __dirname + '/ssl/key.pem',
        certFile = __dirname + '/ssl/cert.pem';
    if(!fs.existsSync(keyFile) || !fs.existsSync(certFile)) {
        console.error('\n\nERROR: One or both of the SSL cert or key are missing:\n' +
            '\t' + keyFile + '\n' +
            '\t' + certFile + '\n');
        process.exit(1);
    }
    var options = {
        key: fs.readFileSync(__dirname + '/ssl/key.pem'),
        cert: fs.readFileSync(__dirname + '/ssl/cert.pem'),
    };
    server = https.createServer(options, app).listen(app.get('port'), function(){
        console.log( 'Express started on port ' + app.get('port') + ' using HTTPS' +
            '; press Ctrl-C to terminate.' );
    });
}


app.listen(app.get('port'), function(){
    //console.log( 'Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
    //console.log( 'Express started on http://www.jrcd.com:' + app.get('port') + '/ ');
    console.log( 'click this link to run the program on the browser http://localhost:' + app.get('port') );



});
//'http://3909.acs.uwinnipeg.ca:

//startServer();

process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.log('unhandledRejection', error.message);
});

//http://localhost:3011/messageBoard
  //  http://www.localhost:3011/messageBoard


