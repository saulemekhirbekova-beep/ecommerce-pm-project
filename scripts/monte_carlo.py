"""Бэклог мерзімінің Монте-Карло болжамы.

10 000 жүгіру, random.Random(20261113). numpy массив пен matplotlib
гистограммасы пакеттер бар ортада ғана құрылады; перцентильдер
стандартты генератордан шығады, сондықтан пакетсіз де қайталанады.

Кіріс: scripts/data/throughput_weekly.csv, scripts/data/stories.csv
"""

from __future__ import annotations

import csv
import math
import random
import statistics
from pathlib import Path

DATA = Path(__file__).resolve().parent / "data"
OUT = Path(__file__).resolve().parent / "output"
SEED = 20261113
RUNS = 10_000
VELOCITY_POINTS = 8  # жорамал, өлшенген velocity емес


def read_csv(name: str) -> list[dict]:
    with (DATA / name).open(encoding="utf-8", newline="") as handle:
        return list(csv.DictReader(handle))


def percentile(values: list[int], p: float) -> float:
    ordered = sorted(values)
    rank = (len(ordered) - 1) * (p / 100)
    low = math.floor(rank)
    high = math.ceil(rank)
    if low == high:
        return float(ordered[low])
    weight = rank - low
    return ordered[low] * (1 - weight) + ordered[high] * weight


def simulate(history: list[int], remaining: int) -> list[int]:
    rng = random.Random(SEED)
    samples: list[int] = []
    for _ in range(RUNS):
        done = 0
        weeks = 0
        while done < remaining:
            done += rng.choice(history)
            weeks += 1
        samples.append(weeks)
    return samples


def summarize(samples: list[int]) -> dict[str, float]:
    return {
        "p50": round(percentile(samples, 50), 2),
        "p70": round(percentile(samples, 70), 2),
        "p85": round(percentile(samples, 85), 2),
        "p95": round(percentile(samples, 95), 2),
        "min": min(samples),
        "max": max(samples),
        "mean": round(statistics.mean(samples), 3),
    }


def save_plot(samples: list[int], path: Path) -> str:
    try:
        import matplotlib

        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
        import numpy as np
    except ImportError:
        return "график өткізілді: numpy немесе matplotlib орнатылмаған"
    values = np.asarray(samples, dtype=int)
    figure, axis = plt.subplots(figsize=(8, 4.5))
    bins = range(int(values.min()), int(values.max()) + 2)
    axis.hist(values, bins=bins, color="#1f4e79", edgecolor="white", align="left")
    axis.set_xlabel("Апта")
    axis.set_ylabel("Жүгіру саны")
    axis.set_title(f"DressCo Монте-Карло, n={RUNS}, seed={SEED}")
    figure.tight_layout()
    path.parent.mkdir(parents=True, exist_ok=True)
    figure.savefig(path, dpi=120)
    plt.close(figure)
    return str(path)


def main() -> None:
    history = [int(row["items_done"]) for row in read_csv("throughput_weekly.csv")]
    stories = read_csv("stories.csv")
    points = sum(int(row["points"]) for row in stories)
    mvp = [row for row in stories if row["id"] <= "US-15"]
    mvp_points = sum(int(row["points"]) for row in mvp)
    full = summarize(simulate(history, len(stories)))
    mvp_sum = summarize(simulate(history, len(mvp)))
    plot = save_plot(simulate(history, len(stories)), OUT / "monte_carlo.png")
    print(
        f"тарих апта={len(history)} орташа throughput={statistics.mean(history):.3f} "
        f"жүгіру={RUNS} seed={SEED}"
    )
    print(
        f"MVP {len(mvp)} тармақ, {mvp_points} story point, "
        f"детерминистік={mvp_points / VELOCITY_POINTS:.3f} апта, "
        f"P50={mvp_sum['p50']} P70={mvp_sum['p70']} P85={mvp_sum['p85']} P95={mvp_sum['p95']}"
    )
    print(
        f"толық бэклог {len(stories)} тармақ, {points} story point, "
        f"детерминистік={points / VELOCITY_POINTS:.3f} апта, "
        f"P50={full['p50']} P70={full['p70']} P85={full['p85']} P95={full['p95']} "
        f"мин={full['min']} макс={full['max']} орта={full['mean']}"
    )
    print(f"график: {plot}")


if __name__ == "__main__":
    main()
