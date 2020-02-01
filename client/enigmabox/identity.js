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



function PrivateKeyKeeperFactory(secret){
    // Closure generator for given secret. Calculates secret keys and returns
    // utilization functions for that key, therefore never exposing this
    // secret elsewhere in code.

    var self = this;

    if(!_.isBuffer(secret) && !_.isTypedArray(secret)) throw Error();

    const signingSecret = nacl.hash(secret).slice(0, nacl.sign.seedLength);
    const signingKeys = nacl.sign.keyPair.fromSeed(signingSecret);

    return {
        getPublic:
            () => Buffer.from(signingKeys.publicKey).toString("base64"),
        sign: function(message, useBuffer){
            const sig = new Buffer.from(
                nacl.sign(message, signingKeys.secretKey)
            );
            if(!useBuffer) return sig.toString("base64");
            return sig;
        },
    }
}


//----------------------------------------------------------------------------


function attachSecret(to, secret){
    const keeper = PrivateKeyKeeperFactory(secret);
    to.sign = keeper.sign;
    to.publicKey = keeper.getPublic();
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
    }

    verify(signedMessage){
        const bufMessage = Buffer.from(signedMessage, "base64");
        const output = nacl.sign.open(bufMessage, this.publicKey);
        if(!output) return null;
        return Buffer.from(output);
    }

}

module.exports.IdentityPublicKey = IdentityPublicKey;
