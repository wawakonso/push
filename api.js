
const webpush = require('web-push');
const express = require('express');
const atob = require('atob');
const base64url = require('base64-url');
const fs = require('fs');
const iplocation = require('iplocation');

const app = express();
const bodyParser = require('body-parser');
//CORS middleware
const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}

const userSub = { 
    endpoint: 'https://fcm.googleapis.com/fcm/send/dsuHATl58OI:APA91bF0OmU8GNnGj9Ia4aqoQqYO0k_jmAHjcLtBTNZqzuf4ER1gxIn5S2svIxAzTpZtOYMkrAPE2zxAz6WTHDO8X7J9WMqYkUeucQKoMr83fQgLRjUG-mgYkXWzWKtNW3j50cIeQjtv',
    expirationTime: null,
    keys: 
    { 
        p256dh: 'BO_bZKFz7Gfx34U8a-00RG2tGnTGUdbE4XKjyMtF_OVx1e5txpzJb5z4FviVrcg2V36qNsb8Iu--CXotbXXtsF4=',
        auth: 'Nf6EN030xXk0-ae_BLBd7Q==' 
    }
}

const userSub2 = {
    endpoint:'https://fcm.googleapis.com/fcm/send/coc1ZdH59d0:APA91bHcP9-UFrv6H74HsCmU8L9NWZpoAUgcrbdlc2tWhFTt2Bcpybzt3ld2it9iMGJlsXomdoTFi8RtckGOadNwN7YrPs2Mmu6zj3dbRO0A7pKU4DR5Q9PEem8eYV5B8sw1CNCANQwb',
    expirationTime:null,
    keys:{
        p256dh:'BBWPj-rj6rA6H44nYCwWWdKjMLmRHvoWFQSnGjfIp4VGyhpYPbLD6zyK5E8wcEdRu2mvBwXCYKuoCSl8cDwncJo=',
        auth:'udKT4EdbnKnGG04y_bQm9A=='
    }
}

const vapidKeys = webpush.generateVAPIDKeys();
const options = {
    vapidDetails: {
        subject: 'mailto:test@localhost.com',
        publicKey: 'BPsNLT25jXPomOFbJpVxesNCwVE7p19Xnt8KOP00GhCp8RWDv9cJkTgtoLKfAUdWfg-uwF1xGcANFD9ALPZmxnU',
        privateKey: 'Yq7iA_oEdGvGPyBpx9sggZxCUfJMLEQaeThklk8yLNk'
    },
    TTL : 60*60,
    headers: {
        'Content-Type': 'application/json',
    },
    contentEncoding: 'aesgcm'
}


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(allowCrossDomain);


app.get('/information', function(req, res) {
    var _data = {
        "name" : "Konso",
        "surname": "Wawa",
        "age": 19
    };
    console.log('User-Agent: ' + req.headers['user-agent']);
    console.log(JSON.stringify(_data));
    webpush.sendNotification(userSub, JSON.stringify(_data), options);
    res.end(JSON.stringify(_data));
})

app.post('/subscribe', function(req, res) {
    var count = 0;
    var country = null;
    json_user = [];


    const locator = iplocation(req.header('x-forwarded-for') || req.connection.remoteAddress).then (
        res => { 
            return res;        
        }
    )
    
    console.log(req.header('x-forwarded-for') || req.connection.remoteAddress);
    fs.readFile(__dirname + '/data/' + 'subscription.json', 'utf8', function(err, data) {
        json_data = JSON.parse( data );
        count = Object.keys(json_data).length;
        json_data[`user${count + 1}`] = req.body;
        iplocation(req.header('x-forwarded-for') || req.connection.remoteAddress).then (
            res => { 
                json_data[`user${count + 1}`]['country'] = res['country_name'];
                fs.writeFile(__dirname + '/data/' + 'subscription.json', JSON.stringify(json_data, null, 2), 'utf-8');        
            }
        )        
    }); 
     
    res.status(200).send(req.body);
})

app.post('/sendmessage', function(req, res) {
    var countFailed = 0;   
    fs.readFile(__dirname + '/data/' + 'subscription.json', 'utf8', function(err, data) {
        json_data = JSON.parse( data );
        count = Object.keys(json_data).length;
        console.log(count)
        for (var i = 1 ; i <= count ; i++) {
            //console.log(json_data[`user${i}`]);
            webpush.sendNotification(json_data[`user${i}`].subscription, req.body.message, options)
            .catch(function (err) {
                
            });
        }
        
        res.status(200).send(req.body.message);
    }); 
      
})

var server = app.listen(8082, function() {
    var host = server.address().address
    var port = server.address().port
})