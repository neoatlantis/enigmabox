/*
This is the exchange module for connecting the frontend(browser)- with
backend(nodejs)-postal.js messaging system.


*/

const $bg = require("./lib/channel")("bg"),
      $fg = require("./lib/channel")("fg");

function on_bg_exchange(e){
    const topic = e.topic;
    const data = e.data;
    $bg.publish(topic, data);
    console.log("topic", topic, "data", data);
}


function setup_socket(socket){
    console.log("new connection");

    // TODO authentication of this socket

    // frontend -> backend
    // Everything emitted to foreground's "bg" channel are proxied using
    // socket.io. They are captured here.
    socket.on("exchange", on_bg_exchange);

    // backend -> frontend
    // We are at background, anything emitted to background's "fg" channel must
    // be proxied to actual foreground.
    const subscription = $fg.subscribe("*", function(data, env){
        socket.emit("exchange", {topic: env.topic, data: data});
    });

    socket.on("disconnection", function(){
        $fg.unsubscribe(subscription);
    });
}

module.exports = function({app, express, io}){
    io.on("connection", setup_socket);

}
