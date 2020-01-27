const _ = require("lodash");
const buffer = require("buffer");
const identity = require("./identity");

class EnigmaBox{
    
    constructor(options){
        const privateIdentity = new identity.IdentityPrivateKey(
            options.privateIdentity, options.password);

        this.localIdentity = privateIdentity;
    }

}


module.exports = EnigmaBox;


k = new identity.IdentityPrivateKey();

eb = new EnigmaBox({
    privateIdentity: k.toString("password"),
    password: "password",
});
console.log(eb);
