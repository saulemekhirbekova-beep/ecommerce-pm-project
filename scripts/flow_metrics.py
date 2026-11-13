"""Екі спринт журналынан ағын метрикасын есептейді."""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_numbers import flow


def main() -> None:
    result = flow()
    print(json.dumps(result["sprints"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
