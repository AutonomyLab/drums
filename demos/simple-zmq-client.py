#!/usr/bin/env python

import sys
import zmq
import msgpack
from pprint import pprint

context = zmq.Context()
sock = context.socket(zmq.SUB)
sock.setsockopt(zmq.SUBSCRIBE, '')

# This needs discovery!
if len(sys.argv) > 1:
    for arg in sys.argv[1:]:
        sock.connect(arg)
else:
    print "Usage: ./simple-zmq-client.py zmq-endpoint1 zmq-endpoint2 ..."
    print "   e.g ./simple-zmq-client tcp://localhost:8002"
    sys.exit(1)

try:
    while True:
        message = sock.recv()
        pprint(msgpack.loads(message))
except KeyboardInterrupt:
    pass
finally:
    sock.close()
