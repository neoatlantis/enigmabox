const postal = require("postal");
const Deferred = require("deferred");
require("postal.request-response")(postal);

// We have to tell postal how to get an deferred instance
postal.configuration.promise.createDeferred = function() {
    return new Deferred();
};
// We have to tell postal how to get a "public-facing"/safe promise instance
postal.configuration.promise.getPromise = function(dfd) {
    return dfd.promise();
};


module.exports = function get_channel(name){
    return postal.channel(name);
}


/* example 
module.exports("hi").subscribe("hi", (data, env)=>{
    env.reply(null, "hi");
});
(async function(){
    console.log(await (module.exports("hi")).request({
        topic: "hi"
    }))
})();
*/
