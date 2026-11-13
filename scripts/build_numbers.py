"""1–10 апта артефактілерінің тексерілетін сандарын есептейді.

Кіріс: репозиторийдегі index.html, scripts/data/*.csv және осы файлдағы
жарияланған тарифтер (әр константаның дереккөзі түсіндірмеде).
Шығыс: scripts/output/numbers.json
"""

from __future__ import annotations

import csv
import json
import math
import random
import re
import statistics
from datetime import datetime, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = Path(__file__).resolve().parent / "data"
OUT = Path(__file__).resolve().parent / "output"
HTML = ROOT / "anon-ecommerce-website-master" / "index.html"
JS = ROOT / "anon-ecommerce-website-master" / "assets" / "js" / "script.js"

# ҚР Ұлттық Банкі, ресми бағам, 2026-11-13
# https://nationalbank.kz/kz/exchangerates/ezhednevnye-oficialnye-rynochnye-kursy-valyut
USD_KZT = 443.62
EUR_KZT = 492.24

# Hetzner Cloud CX23, Германия, net, ҚҚС-сыз. cloudtally.eu, тексерілген 2026-11-10.
# https://cloudtally.eu/hetzner-cloud-prices
HETZNER_CX23_EUR = 5.49
HETZNER_BACKUP_RATE = 0.20  # Hetzner backup +20%, usehcm.com CX22 карточкасы, 2026-11-13

# ps.kz G-1, whtop карточкасы, жоспар 2021-04-15 қосылған. Баға ескі болуы мүмкін.
# https://www.whtop.com/plans/ps.kz/114162
PS_KZ_G1_KZT = 40_000

# Kaspi Магазин, киім санаты, комиссия ҚҚС-пен 12,5% (ҚҚС-сыз 10,9%).
# guide.kaspi.kz тариф PDF, киім жолдары; ҚҚС көрсету тәртібі 2026-01-05.
KASPI_CLOTHES_RATE = 0.125

# hh.kz, 2025 жыл қорытындысы, жарияланым 2026-02-18. Медиана, теңге/ай.
# https://hh.kz/article/34221
HH_PM_MEDIAN = 378_683
HH_DEV_MEDIAN = 359_198

# taylor.kz, 2026 қараша, 293 вакансия, Junior медиана.
# https://taylor.kz/salaries
JUNIOR_MEDIAN = 325_000
HOURS_PER_MONTH = 168  # 21 күн * 8 сағат, жорамал

# Жорамалдар — дүкеннің өз есебі жоқ. numbers.json ішінде assumption деп белгіленеді.
ORDERS_PER_MONTH = 40
AVG_CHECK_KZT = 18_000
MIGRATE = (0.30, 0.50, 0.60)  # 1–3 жыл, өз сайтқа өткен онлайн үлес
DOMAIN_KZT_YEAR = 3_900
SUPPORT_H_MONTH = 4
DISCOUNT = 0.15  # жорамал, Ұлттық Банк базалық мөлшерлемесі емес
TEAM = 4
HOURS_PER_WEEK = 6
WEEKS = 15
FOCUS = 0.8
VELOCITY_POINTS = 8  # жорамал, өлшенген velocity емес


def read_csv(path: Path) -> list[dict]:
    with path.open(encoding="utf-8", newline="") as fh:
        return list(csv.DictReader(fh))


def percentile(values: list[float], p: float) -> float:
    ordered = sorted(values)
    if not ordered:
        return float("nan")
    rank = (len(ordered) - 1) * (p / 100)
    low = math.floor(rank)
    high = math.ceil(rank)
    if low == high:
        return float(ordered[low])
    weight = rank - low
    return ordered[low] * (1 - weight) + ordered[high] * weight


def catalog() -> dict:
    text = HTML.read_text(encoding="utf-8")
    titles = re.findall(r'class="showcase-title"[^>]*>([^<]+)', text)
    prices = [float(x) for x in re.findall(r'class="price">\$([0-9]+(?:\.[0-9]+)?)</p>', text)]
    old = [float(x) for x in re.findall(r"<del>\$([0-9]+(?:\.[0-9]+)?)</del>", text)]
    js = JS.read_text(encoding="utf-8")
    return {
        "html_bytes": HTML.stat().st_size,
        "js_bytes": JS.stat().st_size,
        "showcase_titles": len(titles),
        "current_prices_usd": len(prices),
        "price_min_usd": min(prices) if prices else None,
        "price_max_usd": max(prices) if prices else None,
        "price_median_usd": statistics.median(prices) if prices else None,
        "price_mean_usd": round(statistics.mean(prices), 2) if prices else None,
        "old_prices_usd": len(old),
        "js_has_localStorage": "localStorage" in js,
        "js_has_fetch": "fetch(" in js,
        "git_dir": (ROOT / ".git").exists(),
    }


def money(value: float) -> int:
    return int(round(value))


def tco(cat: dict) -> dict:
    hourly = JUNIOR_MEDIAN / HOURS_PER_MONTH
    build_hours = TEAM * HOURS_PER_WEEK * WEEKS
    focused_hours = build_hours * FOCUS
    build_cost = build_hours * hourly
    support_year = SUPPORT_H_MONTH * 12 * hourly
    hetzner_month = HETZNER_CX23_EUR * (1 + HETZNER_BACKUP_RATE) * EUR_KZT
    hetzner_3y = hetzner_month * 36
    pskz_3y = PS_KZ_G1_KZT * 36
    domain_3y = DOMAIN_KZT_YEAR * 3
    gmv_year = ORDERS_PER_MONTH * 12 * AVG_CHECK_KZT
    benefit_years = [gmv_year * share * KASPI_CLOTHES_RATE for share in MIGRATE]
    kaspi_full_3y = gmv_year * 3 * KASPI_CLOTHES_RATE
    y_opex = support_year + hetzner_month * 12 + DOMAIN_KZT_YEAR
    cashflows = [
        -build_cost,
        benefit_years[0] - y_opex,
        benefit_years[1] - y_opex,
        benefit_years[2] - y_opex,
    ]
    npv = sum(cf / ((1 + DISCOUNT) ** t) for t, cf in enumerate(cashflows))
    total_cost = build_cost + support_year * 3 + hetzner_3y + domain_3y
    total_benefit = sum(benefit_years)
    # сезімталдық
    cost_up = total_cost * 1.3
    benefit_half = total_benefit * 0.5
    remain = [1 - s for s in MIGRATE]
    kaspi_left = sum(gmv_year * s * KASPI_CLOTHES_RATE for s in remain)
    template_check = (cat["price_median_usd"] or 0) * USD_KZT
    orders_to_cover_hetzner = hetzner_month / (AVG_CHECK_KZT * KASPI_CLOTHES_RATE)
    orders_to_cover_pskz = PS_KZ_G1_KZT / (AVG_CHECK_KZT * KASPI_CLOTHES_RATE)
    return {
        "hourly_kzt": round(hourly, 2),
        "build_hours_nominal": build_hours,
        "build_hours_focused": focused_hours,
        "build_cost_kzt": money(build_cost),
        "support_year_kzt": money(support_year),
        "hetzner_month_kzt": round(hetzner_month, 2),
        "hetzner_3y_kzt": money(hetzner_3y),
        "pskz_3y_kzt": pskz_3y,
        "domain_3y_kzt": domain_3y,
        "gmv_year_kzt": gmv_year,
        "benefit_years_kzt": [money(x) for x in benefit_years],
        "benefit_3y_kzt": money(total_benefit),
        "cost_3y_kzt": money(total_cost),
        "net_3y_kzt": money(total_benefit - total_cost),
        "roi": round((total_benefit - total_cost) / total_cost, 4),
        "npv_kzt": money(npv),
        "cashflows_kzt": [money(x) for x in cashflows],
        "sensitivity": {
            "cost_plus_30_net_kzt": money(total_benefit - cost_up),
            "benefit_50_net_kzt": money(benefit_half - total_cost),
            "both_net_kzt": money(benefit_half - cost_up),
        },
        "kaspi_if_stay_3y_kzt": money(kaspi_full_3y),
        "kaspi_left_if_migrate_3y_kzt": money(kaspi_left),
        "own_plus_remaining_kaspi_kzt": money(total_cost + kaspi_left),
        "template_median_check_kzt": money(template_check),
        "orders_per_month_to_cover_hetzner": round(orders_to_cover_hetzner, 2),
        "orders_per_month_to_cover_pskz": round(orders_to_cover_pskz, 2),
        "unit_hosting_per_order_hetzner_kzt": round(hetzner_month / ORDERS_PER_MONTH, 2),
        "unit_hosting_per_order_pskz_kzt": round(PS_KZ_G1_KZT / ORDERS_PER_MONTH, 2),
        "contribution_per_migrated_order_kzt": money(AVG_CHECK_KZT * KASPI_CLOTHES_RATE),
    }


def monte_carlo(stories: list[dict]) -> dict:
    history = [int(row["items_done"]) for row in read_csv(DATA / "throughput_weekly.csv")]
    points = sum(int(row["points"]) for row in stories)
    remaining = len(stories)
    rng = random.Random(20261113)
    runs = 10_000
    samples = []
    for _ in range(runs):
        done = 0
        weeks = 0
        while done < remaining:
            done += rng.choice(history)
            weeks += 1
        samples.append(weeks)
    buckets: dict[int, int] = {}
    for week in samples:
        buckets[week] = buckets.get(week, 0) + 1
    poker = []
    for row in stories:
        votes = [row[k] for k in ("vote_a", "vote_b", "vote_c", "vote_d")]
        if all(votes):
            nums = [int(v) for v in votes]
            poker.append(
                {
                    "id": row["id"],
                    "votes": nums,
                    "spread": max(nums) - min(nums),
                    "median": statistics.median(nums),
                    "agreed_points": int(row["points"]),
                }
            )
    det_weeks = points / VELOCITY_POINTS
    return {
        "runs": runs,
        "seed": 20261113,
        "history": history,
        "history_mean": round(statistics.mean(history), 3),
        "remaining_items": remaining,
        "story_points": points,
        "velocity_points_per_week_assumption": VELOCITY_POINTS,
        "deterministic_weeks": round(det_weeks, 3),
        "p50": round(percentile(samples, 50), 2),
        "p70": round(percentile(samples, 70), 2),
        "p85": round(percentile(samples, 85), 2),
        "p95": round(percentile(samples, 95), 2),
        "min_weeks": min(samples),
        "max_weeks": max(samples),
        "histogram": {str(k): buckets[k] for k in sorted(buckets)},
        "poker": poker,
        "poker_mean_spread": round(statistics.mean(item["spread"] for item in poker), 2),
    }


def _parse(value: str) -> datetime | None:
    if not value:
        return None
    return datetime.fromisoformat(value)


def flow() -> dict:
    rows = read_csv(DATA / "sprint_items.csv")
    sprints = {}
    for sprint in ("1", "2"):
        items = [row for row in rows if row["sprint"] == sprint]
        done = []
        review_hours = []
        for row in items:
            start = _parse(row["start_at"])
            review = _parse(row["review_at"])
            end = _parse(row["done_at"])
            if start and end:
                done.append((end - start).total_seconds() / 3600)
            if review and end:
                review_hours.append((end - review).total_seconds() / 3600)
        sprints[sprint] = {
            "items": len(items),
            "throughput_done": len(done),
            "wip_not_done": len(items) - len(done),
            "cycle_hours_mean": round(statistics.mean(done), 2) if done else None,
            "cycle_hours_p85": round(percentile(done, 85), 2) if done else None,
            "review_hours_mean": round(statistics.mean(review_hours), 2) if review_hours else None,
        }
    # CFD: әр күннің 18:00-індегі бағандар
    start = datetime(2026, 11, 2)
    end = datetime(2026, 11, 13)
    cfd = []
    day = start
    while day <= end:
        stamp = day.replace(hour=18)
        counts = {"Backlog": 0, "Ready": 0, "InProgress": 0, "Review": 0, "Done": 0}
        for row in rows:
            ready = _parse(row["ready_at"])
            started = _parse(row["start_at"])
            review = _parse(row["review_at"])
            done_at = _parse(row["done_at"])
            if ready is None or ready > stamp:
                counts["Backlog"] += 1
            elif done_at and done_at <= stamp:
                counts["Done"] += 1
            elif review and review <= stamp:
                counts["Review"] += 1
            elif started and started <= stamp:
                counts["InProgress"] += 1
            else:
                counts["Ready"] += 1
        cfd.append({"date": day.date().isoformat(), **counts})
        day += timedelta(days=1)
    s1 = sprints["1"]["cycle_hours_mean"]
    s2 = sprints["2"]["cycle_hours_mean"]
    return {
        "sprints": sprints,
        "cycle_time_change_hours": round(s2 - s1, 2),
        "cfd": cfd,
        "wip_policy": {"sprint_1_review": 2, "sprint_2_review": 1},
    }


def scan_secrets() -> dict:
    pattern = re.compile(
        r"(AKIA[0-9A-Z]{16}|-----BEGIN (RSA |OPENSSH )?PRIVATE KEY-----|api[_-]?key\s*[:=]\s*['\"][^'\"]+)",
        re.I,
    )
    hits = []
    for path in ROOT.rglob("*"):
        if not path.is_file():
            continue
        if path.suffix.lower() not in {".html", ".js", ".css", ".md", ".py", ".json", ".yml", ".csv"}:
            continue
        if "output" in path.parts:
            continue
        try:
            text = path.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        if pattern.search(text):
            hits.append(str(path.relative_to(ROOT)))
    return {"files_with_secret_pattern": hits, "count": len(hits)}


def main() -> None:
    stories = read_csv(DATA / "stories.csv")
    cat = catalog()
    report = {
        "as_of": "2026-11-13",
        "catalog": cat,
        "tco": tco(cat),
        "monte_carlo": monte_carlo(stories),
        "flow": flow(),
        "secrets": scan_secrets(),
        "capacity_hours": {
            "team": TEAM,
            "hours_per_week": HOURS_PER_WEEK,
            "weeks": WEEKS,
            "focus": FOCUS,
            "nominal": TEAM * HOURS_PER_WEEK * WEEKS,
            "focused": int(TEAM * HOURS_PER_WEEK * WEEKS * FOCUS),
        },
        "rates": {
            "usd_kzt": USD_KZT,
            "eur_kzt": EUR_KZT,
            "hetzner_cx23_eur": HETZNER_CX23_EUR,
            "kaspi_clothes_with_vat": KASPI_CLOTHES_RATE,
            "hh_pm_median_2025": HH_PM_MEDIAN,
            "hh_dev_median_2025": HH_DEV_MEDIAN,
            "junior_median_taylor_2026_11": JUNIOR_MEDIAN,
        },
    }
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "numbers.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    mc = report["monte_carlo"]
    t = report["tco"]
    print(f"titles={cat['showcase_titles']} prices={cat['current_prices_usd']} median_usd={cat['price_median_usd']}")
    print(f"P50={mc['p50']} P70={mc['p70']} P85={mc['p85']} P95={mc['p95']} det={mc['deterministic_weeks']}")
    print(f"ROI={t['roi']} NPV={t['npv_kzt']} net={t['net_3y_kzt']} cost={t['cost_3y_kzt']}")
    print(f"flow={json.dumps(report['flow']['sprints'], ensure_ascii=False)}")
    print(f"secrets={report['secrets']['count']} git={cat['git_dir']}")
    print(f"wrote {OUT / 'numbers.json'}")


if __name__ == "__main__":
    main()
