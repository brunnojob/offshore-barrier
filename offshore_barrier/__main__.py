import argparse
import json
import sys
from pathlib import Path

from .engine import evaluate, timestamp


def main():
    parser = argparse.ArgumentParser(description="Revisão simulada de barreiras de içamento")
    parser.add_argument("input", type=Path)
    parser.add_argument("--at", help="Instante ISO 8601 com fuso para reproduzir cenários")
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    try:
        result = evaluate(json.loads(args.input.read_text(encoding="utf-8")),
                          timestamp(args.at) if args.at else None)
        encoded = json.dumps(result, ensure_ascii=False, indent=2) + "\n"
        if args.output:
            if args.output.resolve() == args.input.resolve():
                raise ValueError("A saída não pode sobrescrever a entrada.")
            args.output.write_text(encoded, encoding="utf-8")
        else:
            print(encoded, end="")
        return 0
    except (OSError, ValueError) as exc:
        print(f"Entrada não avaliada: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
