const channel = require("./lib/channel");
const $bg = channel("bg");

$bg.subscribe("emergency", function(){
    process.exit();
});
