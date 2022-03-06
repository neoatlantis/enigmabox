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



var xmppclient, transceiver;

function init(options){
    if(null != xmppclient) return;
    xmppclient = client(options);    
    handle_xmpp_error(xmppclient);
    xmppclient.start();

    transceiver = new Transceiver();
    return transceiver
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






class Transceiver extends events.EventEmitter {

    constructor (){
        super();
        const self = this;

        this.client = xmppclient;
        this.timeout = 30000;

        this.client.iqCallee.set(RPCNS, "enigma", async (ctx)=>{
            const jid_from = ctx.from.toString();

            let result = null;
            try{
                result = unpack(ctx.element.text());
            } catch(e){
                return RET_BADREQUEST;
            }

            this.emit("data", { from: jid_from, data: result });
            return RET_SUCCESS;

        });

        this.client.on("online", ()=>{
            this.emit("online");
        });
    }


    async publish(target_jid, data){
        if(!target_jid){
            throw Error("no-receiver");
        }

        let result;
        try{
            result = await this.client.iqCaller.request(
                xml("iq", { type: "set", to: target_jid },
                    xml(
                        "enigma",
                        { xmlns: RPCNS },
                        pack(data)
                    )
                )
            );
        } catch(e){
            return { error: e.message }
        }

        try{
            if(result.children[0].name == "enigma-success"){
                return { success: true };
            } else {
                return { error: result.children[0].text() };
            }
        } catch(e){
            return { error: e.message };
        }

    }
}








module.exports = { 
    init: init,
    transceiver: ()=>transceiver,
    get_jid: ()=>xmppclient.jid.toString(),
    get_bare_jid: ()=>xmppclient.jid.bare().toString(), 
};



