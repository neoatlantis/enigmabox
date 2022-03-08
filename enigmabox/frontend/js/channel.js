const socket = io();

function channel(name){
    return postal.channel(name);
}
const $fg = channel("fg"),
      $bg = channel("bg");

function on_fg_exchange(e){
    const topic = e.topic;
    const data = e.data;
    $fg.publish(topic, data);
}
socket.on("exchange", on_fg_exchange);

$bg.subscribe("*", function(data, env){
    const topic = env.topic;
    console.log(data, env);
    socket.emit("exchange", {topic, data});
});

export default channel;
