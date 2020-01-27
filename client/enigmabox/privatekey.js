const _ = require("lodash");
const bson = require("bson");
const nacl = require("./lib/nacl");
const symmetricEncryption = require("./symmetric-encryption");
const encrypt = symmetricEncryption.encrypt;
const decrypt = symmetricEncryption.decrypt;

function hexToUUID(hex){
    return [
        hex.slice(0, 8),
        hex.slice(8, 12),
        hex.slice(12, 16),
        hex.slice(16, 20),
        hex.slice(20, 32),
    ].join("-");
}


function PrivateKeyKeeperFactory(secret){
    // Closure generator for given secret. Calculates secret keys and returns
    // utilization functions for that key, therefore never exposing this
    // secret elsewhere in code.

    var self = this;

    if(undefined === secret){
        secret = nacl.randomBytes(64);
    } else {
        if(!_.isBuffer(secret) && !_.isTypedArray(secret)) throw Error();
    }

    const signingSecret = nacl.hash(secret);
    const signingKeys = nacl.sign.keyPair.fromSecretKey(signingSecret);
    const fingerprint = hexToUUID(Buffer.from(
        nacl.hash(signingKeys.publicKey).slice(0,16)).toString("hex"));

    return {
        getFingerprint:
            () => fingerprint, 
        getPublic:
            () => Buffer.from(signingKeys.publicKey).toString("base64"),
        sign: 
            (message) => new Buffer.from(
                nacl.sign(message, signingKeys.secretKey)
            ).toString("base64"),
    }
}


//----------------------------------------------------------------------------


function attachSecret(to, secret){
    const keeper = PrivateKeyKeeperFactory(secret);
    to.sign = keeper.sign;
    to.publicKey = keeper.getPublic();
    to.id = keeper.getFingerprint();
    to.toString = (password) => encrypt(password, secret);
}


class IdentityPrivateKey{

    constructor(serialized, password){
        if(_.isString(serialized)){
            attachSecret(this, decrypt(password, serialized)); 
        } else {
            attachSecret(this, nacl.randomBytes(32));
        }
    }

}
