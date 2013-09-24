# -*- coding: utf-8 -*-

__version__ = "0.1.0"
version_info = tuple([int(num) for num in __version__.split('.')])

import os
import gevent
import zmq.green as zmq
from geventwebsocket.handler import WebSocketHandler
import paste.urlparser

import msgpack
import json

def main():
    '''Set up zmq context and greenlets for all the servers, then launch the web
    browser and run the data producer'''
    context = zmq.Context()

    # zeromq: tcp to inproc gateway
    job_zmq = gevent.spawn(zmq_server, context)

    # websocket server: copies inproc zmq messages to websocket
    ws_server = gevent.pywsgi.WSGIServer(
       ('', 8004), WebSocketApp(context),
       handler_class=WebSocketHandler)

    http_server = gevent.pywsgi.WSGIServer(
        ('', 8003),
        paste.urlparser.StaticURLParser(os.path.dirname(__file__)))

    ws_server.start()
    http_server.start()

    try:
        job_zmq.join()
    except KeyboardInterrupt:
        job_zmq.kill()
        ws_server.kill()


def zmq_server(context):
    '''Funnel messages coming from the external tcp socket to an inproc socket'''
    sock_incoming = context.socket(zmq.SUB)
    sock_incoming.setsockopt(zmq.SUBSCRIBE, "")
    sock_incoming.connect('tcp://localhost:8002')

    sock_outgoing = context.socket(zmq.PUB)
    sock_outgoing.bind('inproc://queue')

    while True:
        msg = sock_incoming.recv()
        sock_outgoing.send(json.dumps(msgpack.loads(msg)))
        gevent.sleep(0.05)


class WebSocketApp(object):
    '''Funnel messages coming from an inproc zmq socket to the websocket'''

    def __init__(self, context):
        self.context = context

    def __call__(self, environ, start_response):
        ws = environ['wsgi.websocket']
        sock = self.context.socket(zmq.SUB)
        sock.setsockopt(zmq.SUBSCRIBE, "")
        sock.connect('inproc://queue')
        while True:
            msg = sock.recv()
            ws.send(msg)

if __name__ == '__main__':
    main()
