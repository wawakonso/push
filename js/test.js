var http = require('http');
var crypto = require('crypto');

var curve = crypto.createECDH('prime256v1');
curve.generateKeys();

let pubKey = 'BBnl1no3wRpXiQdAKo-sFNBr8dM6dIHlEuW1KuA5cFkgvOlhQyHf7P5IM8wpAZ9LpuYDveykxJR5PAHa4QxgCvo';
let privKey = '-9XRgCCbQpHLAKWQc1RjyO49aOS6eSBmd8861z_aaK0';

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
console.log(urlBase64ToUint8Array(pubKey));
console.log(urlBase64ToUint8Array(privKey));

http.createServer(function (req, res) {
    req.setEncoding('utf8');
    res.writeHead(200, {'Content-Type': 'text/html'});    
    res.end('Hello World!');
}).listen(8080);



