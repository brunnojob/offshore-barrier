import sys
import json
import select
import dht
import machine
import os
from machine import Pin
from time import ticks_ms, ticks_diff, sleep_ms
from controller import Controller, led_value
import config

pir = Pin(config.PIR_PIN, Pin.IN, Pin.PULL_DOWN)
led = Pin(config.LED_PIN, Pin.OUT)
reset_button = Pin(config.RESET_PIN, Pin.IN, Pin.PULL_UP)
sensor = dht.DHT11(Pin(config.DHT_PIN))
controller = Controller(config.WARMUP_MS)
poll = select.poll()
poll.register(sys.stdin, select.POLLIN)
started = ticks_ms()
previous_tick = started
elapsed = 0
last_sent = started
last_dht = started
last_reset = 1
last_reset_edge = started
sequence = 0
temperature = None
humidity = None
dht_ok = False
motion_edge = False
demo_state = None
demo_started = started
serial_line = ""
session = machine.unique_id().hex() + "-" + os.urandom(8).hex()


def on_motion(pin):
    global motion_edge
    motion_edge = True


pir.irq(trigger=Pin.IRQ_RISING, handler=on_motion)

while True:
    now = ticks_ms()
    elapsed += ticks_diff(now, previous_tick)
    previous_tick = now
    motion = bool(pir.value())
    reset = False
    pressed = reset_button.value()
    if pressed != last_reset and ticks_diff(now, last_reset_edge) >= 80:
        reset = pressed == 0
        last_reset = pressed
        last_reset_edge = now
    for _ in range(128):
        if not poll.poll(0):
            break
        char = sys.stdin.read(1)
        if char == "\n":
            try:
                command = json.loads(serial_line)
                if command.get("cmd") == "reset":
                    reset = True
                elif command.get("cmd") == "live":
                    demo_state = None
                elif command.get("cmd") == "demo" and command.get("zone") in ("safe", "alert", "risk"):
                    demo_state = command["zone"]
                    demo_started = now
            except (ValueError, AttributeError):
                pass
            serial_line = ""
        elif char and len(serial_line) < 256:
            serial_line += char
        elif len(serial_line) >= 256:
            serial_line = ""
    event = motion or motion_edge
    motion_edge = False
    live_state = controller.update(elapsed, event, reset)
    if demo_state and ticks_diff(now, demo_started) >= config.DEMO_DURATION_MS:
        demo_state = None
    state = "risk" if live_state == "risk" else demo_state or live_state
    led_on = led_value(state, elapsed)
    led.value(led_on if config.LED_ACTIVE_HIGH else 1 - led_on)
    if ticks_diff(now, last_dht) >= config.DHT_INTERVAL_MS:
        last_dht = now
        try:
            sensor.measure()
            temperature = sensor.temperature()
            humidity = sensor.humidity()
            dht_ok = True
        except (OSError, ValueError):
            temperature = None
            humidity = None
            dht_ok = False
    if ticks_diff(now, last_sent) >= config.TELEMETRY_MS:
        last_sent = now
        sequence += 1
        print(json.dumps({
            "schema": "lineguard/1", "device_id": machine.unique_id().hex(),
            "session": session, "seq": sequence, "uptime_ms": elapsed,
            "mode": "led_test" if demo_state else "live", "state": state,
            "live_state": live_state, "pir": motion, "latched": controller.latched,
            "temperature_c": temperature, "humidity_pct": humidity,
            "dht_ok": dht_ok, "led_on": bool(led_on),
            "warmup_remaining_ms": max(0, config.WARMUP_MS - elapsed),
            "work_authorized": False
        }))
    sleep_ms(10)
