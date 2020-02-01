const identity = require("./identity");
const _ = require("lodash");
const nacl = require("./lib/nacl");

function milliseconds2timepiece(ms){
    return Math.floor(ms / 1800000);
}




class Codebook {
    
    constructor (codebookStr){
    }

    static generate (identityPrivateKey, year, month){
        if(!identityPrivateKey instanceof identity.IdentityPrivateKey){
            throw Error("Requires a private identity for codebook generation.");
        }
        if(!_.isInteger(year) || !_.isInteger(month) || month > 12 || month < 1){
            throw Error("Year / Month must be integer");
        }

        const startPiece = milliseconds2timepiece(
            Date.UTC(year, month-1, 1, 0, 0, 0));

        const N = 1488;
        const payloadData = new Uint8Array(4 + N * nacl.box.publicKeyLength);

        var key = nacl.randomBytes(nacl.box.secretKeyLength), offset=4;
        var key0 = Buffer.from(key);

        for(var i=0; i<1488; i++){
            payloadData.set(
                nacl.box.keyPair.fromSecretKey(key).publicKey, 
                offset);
            offset += nacl.box.secretKeyLength;
            key = nacl.hash(key).slice(0, nacl.box.secretKeyLength);
        }
        
        payloadData.set(
            new Uint8Array(new Uint32Array([startPiece]).buffer), 0);

        const codebookDataHash = nacl.hash(payloadData);
        const codebookSig = identityPrivateKey.sign(codebookDataHash, true);

        return {
            codebook: Buffer.concat([
                Buffer.from("EBv1"),
                codebookSig,
                payloadData,
            ]),
            key0: key0,
        }

    }

}


x = new identity.IdentityPrivateKey();
console.log(Codebook.generate(x, 2010, 1))
