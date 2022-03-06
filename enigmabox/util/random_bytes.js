const crypto = require("crypto");
module.exports = function(length){
    return new Promise((resolve, reject)=>{
        crypto.randomFill(Buffer.alloc(length), (err, buf)=>{
            if(err) return reject(err);
            resolve(buf);
        })
    });
}
