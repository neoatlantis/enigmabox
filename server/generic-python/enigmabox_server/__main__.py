#!/usr/bin/env python3

import argparse
from .server import EnigmaBoxServer

parser = argparse.ArgumentParser(description="""
    Generic Python3 server for EnigmaBox.
""")

parser.add_argument("-c", "--config", help="""
    Config file. Anything in this file can be overwritten by command line
    options.""")

parser.add_argument(
    "-p", "--port",
    help="Listen port.",
    type=int,
    default=5820
)

args = parser.parse_args()

server = EnigmaBoxServer(host="127.0.0.1", port=args.port) 
