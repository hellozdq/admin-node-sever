const NodeRSA = require('node-rsa');
const key = new NodeRSA({b:512});
key.setOptions({encryptionScheme:'pkcs1'});
console.log("---------------1")

const publicKey = key.exportKey('pkcs8-public-pem');
const privateKey = key.exportKey('pkcs8-private-pem');

// 解密
const decryption = (keyValue) => {
    const decrypted = key.decrypt(keyValue, 'utf8');
    return decrypted;
}

module.exports = {
    publicKey,
    privateKey,
    decryption
}

  