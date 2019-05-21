module.exports = {
    cookieSecret: '8gSYnnyS',

    mongo: {
        development: {
            username : 'jesserafael',
            password : 'mongo101',
            hosts : 'iad2-c4-2.mongo.objectrocket.com:52955,iad2-c4-0.mongo.objectrocket.com:52955,iad2-c4-1.mongo.objectrocket.com:52955',//'iad2-c0-0.mongo.objectrocket.com:52153,iad2-c0-1.mongo.objectrocket.com:52153,iad2-c0-2.mongo.objectrocket.com:52153',
            database : 'jesseRafaelDatabase', // '3909Lectures',
            options : '?replicaSet=3fc91d173f374600b25210aebb928141', //'?replicaSet=fc522f688b9b405cbd48e1a04daf47d2',
        },
        production: {
            username :  'jesserafael', //'chenry',
            password : 'mongo101',
            hosts : 'iad2-c4-2.mongo.objectrocket.com:52955,iad2-c4-0.mongo.objectrocket.com:52955,iad2-c4-1.mongo.objectrocket.com:52955',//'iad2-c0-0.mongo.objectrocket.com:52153,iad2-c0-1.mongo.objectrocket.com:52153,iad2-c0-2.mongo.objectrocket.com:52153',
            database : 'jesseRafaelDatabase', //'3909Lectures',
            options : '?replicaSet=3fc91d173f374600b25210aebb928141' //'?replicaSet=fc522f688b9b405cbd48e1a04daf47d2',
        },
    },

}