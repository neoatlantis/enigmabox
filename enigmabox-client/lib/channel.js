const postal = require("postal");

module.exports = function get_channel(name){
    return postal.channel(name);
}
