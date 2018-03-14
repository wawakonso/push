var http = require('http');
var crypto = require('crypto');

var curve = crypto.createECDH('prime256v1');
curve.generateKeys();


function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/')
    ;
    const rawData = Buffer.from(base64, 'base64').toString();
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

function generateVAPIDKeys() {  
    var curve = crypto.createECDH('prime256v1');  
    curve.generateKeys();
  
    return {  
      publicKey: curve.getPublicKey(),  
      privateKey: curve.getPrivateKey(),  
    };  
}

var keys = generateVAPIDKeys();
console.log(urlBase64ToUint8Array(keys.publicKey));

http.createServer(function (req, res) {
    req.setEncoding('utf8');
    res.writeHead(200, {'Content-Type': 'text/html'});    
    res.end('Hello World!');
}).listen(8080);



