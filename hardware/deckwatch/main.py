from machine import Pin
from time import sleep_ms, ticks_ms, ticks_diff
import json

from logic import message

button = Pin(27, Pin.IN, Pin.PULL_UP)
indicator = Pin(25, Pin.OUT, value=0)
last_read = button.value()
stable_read = last_read
changed_at = ticks_ms()
last_sent = ticks_ms()
sequence = 0

while True:
    now = ticks_ms()
    current = button.value()
    if current != last_read:
        changed_at = now
        last_read = current
    if ticks_diff(now, changed_at) >= 50:
        stable_read = current
    wet = stable_read == 0
    indicator.value(int(wet))
    if ticks_diff(now, last_sent) >= 1000:
        sequence += 1
        print(json.dumps(message(sequence, now, wet)))
        last_sent = now
    sleep_ms(20)
