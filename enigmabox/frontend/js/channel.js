const socket = io();

function channel(name){
    return postal.channel(name);
}
const $b2f = channel("b2f"),
      $f2b = channel("f2b");

function on_b2f_exchange(e){
    const topic = e.topic;
    const data = e.data;
    $b2f.publish(topic, data);
}
socket.on("exchange", on_b2f_exchange);

$f2b.subscribe("*", function(data, env){
    const topic = env.topic;
    console.log(data, env);
    socket.emit("exchange", {topic, data});
});

export default channel;
