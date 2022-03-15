import channel from "../channel.js";





Vue.component("navigation-bar", {

template: `

<ul class="nav">
    <li
        class="nav-item"
        v-for="navkey in ordered_navs"
        v-on:click="current_view=navkey"
        v-bind:class="{'active':current_view==navkey}"
    >
        <a
            class="nav-link"
            v-bind:class="{'active':current_view==navkey}"
            href="#"
        >
            {{ navs[navkey] }}
        </a>
    </li>
</ul>


`,

data: function(){ return {

    current_view: 'tasks',
    
    navs: {
        "tasks": "Tasks",
        "pgp": "PGP",
        "config": "Configuration",
    },

    ordered_navs: ["tasks", "pgp", "config"],

}},

watch: {
    current_view: function(){
        this.$emit("changed", this.current_view);
    }

}

});
