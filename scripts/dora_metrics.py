"""DORA төрт метрикасы репозиторийдің git тарихынан.

.git жоқ болса, метрика 0 немесе «өлшенбейді» деп шығады.
Ойдан шығарылған коммит, тег және инцидент қосылмайды.

Өлшеу ережесі (.git бар кезде):
- Орналастыру жиілігі: соңғы 28 күндегі commit саны / 4 апта.
  Бөлек deploy тегі жоқ болғандықтан бұл — commit жиілігінің проксиі.
- Lead time: көрші commit-тер арасындағы сағаттың медианасы.
  PR ашылған уақыт журналда болмаса, бұл толық lead time емес.
- Change fail rate: хабарламасында revert/hotfix бар commit үлесі.
- MTTR: сәтсіздік пен қалпына келтіру оқиғасы бөлек жазылмағандықтан өлшенбейді.
"""

from __future__ import annotations

import statistics
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def git_lines(args: list[str]) -> list[str]:
    output = subprocess.check_output(
        ["git", "-C", str(ROOT), *args],
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    return [line for line in output.splitlines() if line.strip()]


def parse_iso(value: str) -> datetime:
    text = value.replace("Z", "+00:00")
    stamp = datetime.fromisoformat(text)
    if stamp.tzinfo is None:
        stamp = stamp.replace(tzinfo=timezone.utc)
    return stamp


def main() -> None:
    if not (ROOT / ".git").exists():
        print("deployment_frequency_per_week=0")
        print("lead_time_for_changes=өлшенбейді")
        print("change_fail_rate=өлшенбейді")
        print("mttr=өлшенбейді")
        print("деңгей=тіркелмейді")
        print("себебі: жоба түбінде .git каталогы жоқ, тег және релиз жазбасы жоқ")
        return

    rows = git_lines(["log", "--pretty=format:%cI%x09%s"])
    stamps: list[datetime] = []
    failed = 0
    for row in rows:
        when, _, subject = row.partition("\t")
        stamps.append(parse_iso(when))
        lowered = subject.lower()
        if "revert" in lowered or "hotfix" in lowered or "rollback" in lowered:
            failed += 1
    if not stamps:
        print("deployment_frequency_per_week=0")
        print("lead_time_for_changes=өлшенбейді")
        print("change_fail_rate=өлшенбейді")
        print("mttr=өлшенбейді")
        print("себебі: commit жоқ")
        return

    newest = max(stamps)
    window = [stamp for stamp in stamps if (newest - stamp).days <= 28]
    frequency = len(window) / 4
    gaps = []
    ordered = sorted(stamps)
    for earlier, later in zip(ordered, ordered[1:]):
        gaps.append((later - earlier).total_seconds() / 3600)
    lead = statistics.median(gaps) if gaps else 0.0
    fail_rate = failed / len(rows)
    print(f"commits={len(rows)}")
    print(f"deployment_frequency_per_week={frequency:.2f}")
    print(f"lead_time_hours_median={lead:.2f}")
    print(f"change_fail_rate={fail_rate:.2%}")
    print("mttr=өлшенбейді")
    print("ескерту: deploy тегі және инцидент журналы жоқ; алғашқы екі сан — commit проксиі")
    if frequency >= 1 and lead <= 24 and fail_rate <= 0.15:
        level = "жоғары"
    elif frequency >= 0.25 and lead <= 168:
        level = "орта"
    else:
        level = "төмен"
    print(f"деңгей={level}")


if __name__ == "__main__":
    main()
