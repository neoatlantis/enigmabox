import channel from "./channel.js";

import "./vue.tasks-list.js";

/*const $f2b = channel("f2b");

setTimeout(()=>{
    $f2b.publish("hi", "test");
}, 1000);*/


const app = new Vue({
    el: "#app",

    data: {
        current_view: "tasks",
    }

});
