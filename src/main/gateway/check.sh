#!/bin/sh

ps cax | grep python > /dev/null
if [ $? -eq 0 ]; then
  echo "Process is running."
else
  echo "Process is not running."
  /home/pi/bluepy/bluepy/push_iot_all.sh &
fi
