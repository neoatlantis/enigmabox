#!/usr/bin/env python3

from bottle import *

def EnigmaBoxServer(host="127.0.0.1", port=5820):

    @delete("/identity/<uuid:re:[0-9a-f\-]{36}>/<slot:int>")
    def deleteIdentityKey(uuid, slot):
        pass

    @put("/identity/<uuid:re:[0-9a-f\-]{36}>/<slot:int>")
    def putIdentityKey(uuid, slot):
        pass


    @get("/identity/<uuid:re:[0-9a-f\-]{36}>/")
    def getIdentity(uuid):
        pass

    
    @put("/identity/<uuid:re:[0-9a-f\-]{36}>/")
    def createIdentity(uuid):
        pass

    @get("/messages/<uuid:re:[0-9a-f\-]{36}>/")
    def fetchMessages(uuid):
        pass



    run(host=host, port=port)
