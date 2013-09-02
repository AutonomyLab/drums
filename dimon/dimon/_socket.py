# -*- coding: utf-8 -*-

"""
Socket monitoring daemon
"""

from _common import *

import pcapy
from impacket import ImpacktDecoder, ImpacktPacket
from pprint import pprint

"""
The [base] SocektMonitor will maintain a filter  list (of strings). The libpcap
callback will be fired if any packet matches any of filters. There is no
internal book-keeping to determine which part of the filter caused the
callback to fire.
"""

def tasktuple_to_filterstr(task):
    """
    task = (proto, src/dst, port), e.g ("UDP", "dst", 53) or ("TCP", "", 80)
    """
    proto, direction, port = task
    proto = proto.lower()
    direction = direction.lower()
    port = int(port)
    if not proto in ["tcp", "udp"]:
        raise ValueError("[in %s] Protocol %s not supported." % (self, proto))

    if not direction in ["src", "dst", ""]:
        raise ValueError("[in %s] Direction %s not supported." % (self, direction))

    if not port > 0:
        raise ValueError("[in %s] Invalid port number %s" % (self, port))

    return "%s %s port %s" % (proto, direction, port)

def populate_data(data, port, len):
    if port in data:
        data[port] += len
    else:
        data[port] = len

class SocketMonitor(TaskBase):
    def __init__(self, result_queue, default_interval, inet, name = ""):
        TaskBase.__init__(self, result_queue, default_interval, name)

        # TODO: suid
        self.pc = pcapy.open_live(self.inet, 1514, False, 100)
        self.pc.setnonblock(False)

        datalink = self.pc.datalink()
        if pcapy.DLT_EN10MB == datalink:
            self.decoder = ImpactDecoder.EthDecoder()
        elif pcapy.DLT_LINUX_SLL == datalink:
            self.decoder = ImpactDecoder.LinuxSLLDecoder()
        else:
            raise Exception("Datalink type not supported: %s" % datalink)

        self.pc.filter = ""
        self.packets_per_callback = 0


    def update_filters(self):
        filters = ["(%s)" % (f,) for f in self.task_map.keys()]
        self.pc.filter = " or ".join(filters)
        logging.debug("Updating pcap filter to `%s`" % (self.pc.filter))
        self.pc.setfilter(self.pc.filter)


    def register_task_core(self, task):
        self.task_map[tasktuple_to_filterstr(task)] = True
        self.update_filters()

    def remove_task_core(self, task):
        try:
            del self.task_map[tasktuple_to_filterstr(task)]
        except KeyError:
            logging.warning("Error removing socket filter: %s" % (task,))

    def process_callback(self, hdr , data):
        self.packets_per_callback += 1

        #packet_ts = float(hdr.getts()[0]) + float(hdr.getts()[1]) * 1.0e-6

        # getcaplen() is equal to the length of the part of the packet that has been captured, not the total length of the packet, thus should never be used for bw calculation

        packet_len = hdr.getlen()

        # Link layer decoder
        packet = self.decoder.decode(data)
        # Get the higher layer packet (ip:datalink)
        ippacket = packet.child()
        # TCP or UDP?
        tpacket = ippacket.child()
        if isinstance(tpacket, ImpactPacket.TCP):
            populate_data(self.data['tcp'], tpacket.get_th_sport(), packet_len)
            populate_data(self.data['tcp'], tpacket.get_th_dport(), packet_len)
        elif isinstance(tpacket, ImpactPacket.UDP):
            populate_data(self.data['udp'], tpacket.get_uh_sport(), packet_len)
            populate_data(self.data['udp'], tpacket.get_uh_dport(), packet_len)

    def do(self):
        if not self.task_map:
            return

        self.data = dict()
        self.data['tcp'] = dict()
        self.data['udp'] = dict()
        self.packets_per_callback = 0
        self.pc.dispatch(0, self.process_callback)
        self.data['__ppc__'] = packets_per_callback
        if packets_per_callback > 0:
            try:
                self.result_queue.put(data)
            except Queue.Full:
                logging.error("[in %s] Output queue is full in"
                    % (self, ))
            finally:
                pass#pprint(data)




