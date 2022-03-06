/*
This is the exchange module for connecting the frontend(browser)- with
backend(nodejs)-postal.js messaging system.


*/

const $f2b = require("./lib/channel")("f2b"),
      $b2f = require("./lib/channel")("b2f");

function on_f2b_exchange(e){
    const topic = e.topic;
    const data = e.data;
    $f2b.publish(topic, data);
    console.log("topic", topic, "data", data);
}


function setup_socket(socket){
    console.log("new connection");

    // TODO authentication of this socket

    // frontend -> backend
    socket.on("exchange", on_f2b_exchange);

    // backend -> frontend
    const subscription = $b2f.subscribe("*", function(data, env){
        socket.emit("exchange", {topic: env.topic, data: data});
    });

    socket.on("disconnection", function(){
        $b2f.unsubscribe(subscription);
    });
}

module.exports = function({app, express, io}){
    io.on("connection", setup_socket);

}
