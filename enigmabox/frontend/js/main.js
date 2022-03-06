import channel from "./channel.js";

const $f2b = channel("f2b");

setTimeout(()=>{
    $f2b.publish("hi", "test");
}, 1000);
