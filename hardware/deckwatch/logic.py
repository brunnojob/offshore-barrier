def message(sequence, uptime_ms, wet):
    return {
        "schema": "deckwatch-demo/0.1",
        "device_id": "SIM-NODE-001",
        "sequence": sequence,
        "uptime_ms": uptime_ms,
        "mode": "bench_simulation",
        "wet_simulated": bool(wet),
        "quality": "synthetic",
    }
