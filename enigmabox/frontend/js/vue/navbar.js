import channel from "../channel.js";





Vue.component("navigation-bar", {

template: `

<nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
        <a class="navbar-brand" href="#">EnigmaBox</a>
        <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarMenu"
            aria-controls="navbarMenu"
            aria-expanded="false"
            aria-label="Toggle navigation"
        >
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarMenu">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
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
        </div>
        <button
            class="btn btn-danger"
            type="button"
            v-on:click="$emit('emergency')"
        >
            EMERGENCY
        </button>
    </div>
</nav>
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
