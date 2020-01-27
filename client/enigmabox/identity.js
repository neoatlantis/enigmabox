/*
Identity Keys Pair
==================

This module exports 2 classes: IdentityPrivateKey and IdentityPublicKey.

EnigmaBox is designed to associate each user with a random generated identity
key. This enables users on its network to identify each other, even across
different hubs(server-side message exchanges). This module provides the basic
functionality for this purpose.

*/




const _ = require("lodash");
const bson = require("bson");
const nacl = require("./lib/nacl");
const symmetricEncryption = require("./symmetric-encryption");
const encrypt = symmetricEncryption.encrypt;
const decrypt = symmetricEncryption.decrypt;

function getFingerprint(buffer){
    const hex = Buffer.from(nacl.hash(buffer).slice(0,16)).toString("hex");
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

    if(!_.isBuffer(secret) && !_.isTypedArray(secret)) throw Error();

    const signingSecret = nacl.hash(secret).slice(0, nacl.sign.seedLength);
    const signingKeys = nacl.sign.keyPair.fromSeed(signingSecret);
    const fingerprint = getFingerprint(signingKeys.publicKey);

    return {
        getFingerprint:
            () => fingerprint, 
        getPublic:
            () => Buffer.from(signingKeys.publicKey).toString("base64"),
        sign: function(message){
            return new Buffer.from(
                nacl.sign(message, signingKeys.secretKey)
            ).toString("base64");
        },
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

module.exports.IdentityPrivateKey = IdentityPrivateKey;




class IdentityPublicKey{
    
    constructor(publicKeyStr){
        this.publicKey = new Uint8Array(Buffer.from(publicKeyStr, "base64"));
        if(this.publicKey.length != nacl.sign.publicKeyLength){
            throw Error("Invalid public key read.");
        }
        this.id = getFingerprint(this.publicKey);
    }

    verify(signedMessage){
        const bufMessage = Buffer.from(signedMessage, "base64");
        const output = nacl.sign.open(bufMessage, this.publicKey);
        if(!output) return null;
        return Buffer.from(output);
    }

}

module.exports.IdentityPublicKey = IdentityPublicKey;
