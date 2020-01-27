Enigmabox Client Library
========================

Usage
-----

```javascript
const enigmabox = require("enigmabox")({
    privateKey: "...", // private key corresponding to cert
    password: "...", // password to private key, user supplied

    config: {
        "storage": localStorage,
        "tencent-cloud": true,
    },
});

// local id
const localId = enigmabox.id;

// send message
await engimabox.send("receiver id", "hello");

// check new messages
await enigmabox.receive();

```
