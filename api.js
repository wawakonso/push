
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


const sub1 = {
    endpoint:"https://fcm.googleapis.com/fcm/send/dYt5fwhiZcE:APA91bHT-9VC1fQTHT76Prym0gMM2pHIKWTJGRvn8Oc-ggtPOn5FCJAjrmMANb0oLhbCnaN7EBnK0VY8Zfoka1LgfArOuNaj8h0nadDccUvaLH42JcDMA8V_NiZWajcRDwLTDl5qcc1L",
    expirationTime:null,
        keys:
        {
            p256dh:"BEtANYXPkwic3387xTCl0GSJk33ecrQEoVfURcQ3claPLmFiLNTQaJi3yvIEwYjVOwhbfyc2olDyK6fyJup_bJM=",
            auth:"nA1FGSUqTuOlDDu6WDLfcA=="
        }
    };
    
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

    fs.readFile(__dirname + '/data/' + 'subscription.json', 'utf8', function(err, data) {
        res.writeHead(200, {'Content-Type':'application/json'})
        json_data = JSON.parse( data );
        count = Object.keys(json_data).length;
        res.end(JSON.stringify(json_data));              
    });     
    
})

app.post('/subscribe', function(req, res) {
    var count = 0;
    var country = null;
    json_user = [];
    
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

app.post('/pushmessage', function(req, res) {
    var countFailed = 0;   
    fs.readFile(__dirname + '/data/' + 'subscription.json', 'utf8', function(err, data) {
        json_data = JSON.parse( data );
        count = Object.keys(json_data).length;

        for (var i = 1 ; i <= count ; i++) {
            webpush.sendNotification(json_data[`user${i}`].subscription, JSON.stringify(req.body), options)
            .catch(function (err) {
                //
            });
        }
        
        res.status(200).send(req.body);
    });       
})

var server = app.listen(8082, function() {
    var host = server.address().address
    var port = server.address().port
})