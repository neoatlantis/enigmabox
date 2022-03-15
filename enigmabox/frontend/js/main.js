import channel from "./channel.js";

import declare_emergency from "./emergency-mode.js";
import "./vue/navbar.js";
import "./vue/tasks-list.js";

/*const $f2b = channel("f2b");

setTimeout(()=>{
    $f2b.publish("hi", "test");
}, 1000);*/


const app = new Vue({
    el: "#app",

    data: {
        emergency: false,

        current_view: "tasks",
    },

    methods: {
        on_navbar_changed: function(e){ this.current_view = e; },
        on_emergency: function(){
            declare_emergency();
            this.emergency = true;
        }
    }

});
