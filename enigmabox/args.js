const os = require("os");


module.exports = function read_args(name){
    if('debug' == name){
        return process.argv.indexOf("debug") >= 0;
    }
    if('home' == name){
        return os.homedir();
    }
}
