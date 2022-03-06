const open = require("open");
const app = require("./app");
const args = require("./args");

async function init(){
    const initapp_result = await app();

    if(!args("debug")){
        open(`${initapp_result.url}/init.html#${initapp_result.password}`);
    }
}

init();
