const $transceiver = require("./channel")("transceiver");



const { client, xml } = require("@xmpp/client");
const events = require("events");
const msgpack = require("@ygoe/msgpack");

const RPCNS = "http://neoatlantis.org/enigmabox";
const RET_SUCCESS = xml("enigma-success", { xmlns: RPCNS }); 
const RET_BADREQUEST = xml("enigma-error", { xmlns: RPCNS }, "bad-request");

function pack(data, format){
    return Buffer.from(msgpack.serialize(data)).toString('base64');
}

function unpack(data, format){
    return msgpack.deserialize(Buffer.from(data, 'base64'));
}



var xmppclient;

function init(options){
    if(null != xmppclient) return;
    xmppclient = client(options);    
    handle_xmpp_error(xmppclient);
    xmppclient.start();

    setup_client(xmppclient);
}


function handle_xmpp_error(client){
    client.on("error", async function(e){
        console.error("XMPP client error:", e);
        console.warn("Shutting down XMPP for reconnect.");
        while(true){
            try{
                await client.stop();
                await client.start();
                break;
            } catch(e){
                await new Promise(
                    (resolve, reject)=>setTimeout(resolve, 10000));
            }
        }
    });
}



function setup_client(client){

    client.on("online", ()=>$transceiver.publish("online"));
    
    client.iqCallee.set(RPCNS, "enigma", async (ctx)=>{
        const jid_from = ctx.from.toString();

        let result = null;
        try{
            result = unpack(ctx.element.text());
        } catch(e){
            return RET_BADREQUEST;
        }

        $transceiver.publish("received", { from: jid_from, data: result });
        return RET_SUCCESS;
    });


    $transceiver.subscribe("transmit", async (data)=>{
        if(!data.to) throw Error("no-receiver");

        let result;
        try{
            result = await client.iqCaller.request(
                xml("iq", { type: "set", to: data.to },
                    xml("enigma", { xmlns: RPCNS }, pack(data.data))
                )
            );
        } catch(e){
            $transceiver.publish("result", {
                id: data.id,
                error: e.message
            });
        }

        try{
            if(result.children[0].name == "enigma-success"){
                $transceiver.publish("result", {
                    id: data.id,
                    success: true,
                });
            } else {
                $transceiver.publish("result", {
                    id: data.id,
                    error: result.children[0].text()
                });
            }
        } catch(e){
            $transceiver.publish("result", {
                id: data.id,
                error: e.message, 
            });
        }
    });


}



module.exports = { 
    init: init,
    get_jid: ()=>xmppclient.jid.toString(),
    get_bare_jid: ()=>xmppclient.jid.bare().toString(), 
};



