from btle import UUID, Peripheral, DefaultDelegate
import struct
import math
import boto
import json
import time
import datetime
import ssl
import paho.mqtt.client as mqtt
import threading

from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient
import sys
import logging
import time
import getopt


# Sensortag versions
AUTODETECT = "-"
SENSORTAG_V1 = "v1"
SENSORTAG_2650 = "CC2650"

class Speaker(Peripheral):
    def __init__(self,addr,version=AUTODETECT):
        Peripheral.__init__(self,addr)
        if version==AUTODETECT:
            svcs = self.discoverServices()
            print(str(svcs))

def main():
    import time
    import sys
    import argparse
    
    global host
    global tag

    parser = argparse.ArgumentParser()
    parser.add_argument('-host', action='store',help='MAC of BT device', default='68:C9:0B:06:44:09')
    arg = parser.parse_args(sys.argv[1:])
    print ("Arg Host: " + arg.host)
    tag = Speaker(arg.host)

if __name__ == "__main__":
    main()
