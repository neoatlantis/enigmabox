import channel from "./channel.js";
const $bg = channel("bg");

function declare_emergency(){
    setTimeout(function(){
        $bg.publish("emergency");
    }, 1);
    localStorage.clear();
}


export default declare_emergency;
