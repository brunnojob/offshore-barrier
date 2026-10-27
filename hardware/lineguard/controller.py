class Controller:
    def __init__(self, warmup_ms=120000):
        self.warmup_ms = warmup_ms
        self.latched = False

    def update(self, elapsed_ms, motion, reset=False):
        if elapsed_ms < self.warmup_ms:
            return "warmup"
        if motion:
            self.latched = True
        if reset and not motion:
            self.latched = False
        return "risk" if self.latched else "unverified"


def led_value(state, phase_ms):
    if state == "safe":
        return 0
    if state == "risk":
        return int((phase_ms // 125) % 2 == 0)
    return 1
