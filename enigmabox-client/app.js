const express = require("express");
const random_bytes = require("./util/random_bytes");
const args = require("./args");


const routing_modules = [
    "frontend",
];


async function initapp(){
    
    const portrandomness = await random_bytes(2);
    const entry_password = (args('debug')?
        'debug':
        (await random_bytes(32)).toString('hex'));
    const port = (args('debug')?
        60000:
        60000 + (portrandomness[0] * portrandomness[1] % 4000));
    const url = `http://localhost:${port}`;

    const app = express();
    for(let routing_module of routing_modules){
        require(`./route.${routing_module}.js`)(app, express);
    }

    app.listen(port);
    return {
        url: url,
        password: entry_password,
    }
}

module.exports = initapp;
