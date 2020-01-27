#!/usr/bin/env python3

from bottle import *

def EnigmaBoxServer(host="127.0.0.1", port=5820):

    @route("/identity/<uuid:re:[0-9a-f\-]{36}>"



    run(host=host, port=port)
