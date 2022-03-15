const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const random_bytes = require("./util/random_bytes");
const args = require("./args");


const routing_modules = [
    "frontend",
    "postalexchange",
];

const service_modules = [
    "emergency",
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

    for(let routing_module of routing_modules){
        require(`./route.${routing_module}.js`)({app, express, io});
    }

    for(let service_module of service_modules){
        require(`./service.${service_module}.js`);
    }

    http.listen(port);
    return {
        url: url,
        password: entry_password,
    }
}

module.exports = initapp;
