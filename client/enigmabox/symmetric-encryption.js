const _ = require("lodash");
const nacl = require("./lib/nacl");


function keyFromPassword(password){
    const bufPassword = Buffer.from(password);

    return nacl.hash(bufPassword).slice(0, nacl.secretbox.keyLength);
    // TODO scrypt
}


module.exports.encrypt = function(password, message){
    const key = keyFromPassword(password);
    const bufMessage = (
        _.isString(message) ? Buffer.from(message, "utf-8") : message);
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
    const ciphertext = nacl.secretbox(bufMessage, nonce, key);

    const output = Buffer.concat([nonce, ciphertext]);
    return output.toString("base64");
}

module.exports.decrypt = function(password, message){
    const key = keyFromPassword(password);
    const bufMessage = (
        _.isString(message) ? Buffer.from(message, "base64") : message);
    const nonce = bufMessage.slice(0, nacl.secretbox.nonceLength);
    const ciphertext = bufMessage.slice(nonce.length);
    const output = nacl.secretbox.open(ciphertext, nonce, key);
    if(output)
        return Buffer.from(output);
    else
        return null;
}
