"""Жергілікті және GitHub Actions құбыржолы бірдей тексеруді орындайды."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "anon-ecommerce-website-master" / "index.html"
JS = ROOT / "anon-ecommerce-website-master" / "assets" / "js" / "script.js"
REQUIRED = [
    ROOT / "docs" / "README.md",
    ROOT / "scripts" / "build_numbers.py",
    ROOT / "scripts" / "data" / "stories.csv",
]


def main() -> int:
    errors: list[str] = []
    for path in REQUIRED + [HTML, JS]:
        if not path.exists():
            errors.append(f"жоқ файл: {path.relative_to(ROOT)}")
    if HTML.exists():
        text = HTML.read_text(encoding="utf-8")
        titles = len(re.findall(r'class="showcase-title"', text))
        if titles < 1:
            errors.append("index.html ішінде showcase-title жоқ")
    if JS.exists():
        js = JS.read_text(encoding="utf-8")
        if "localStorage" in js or "fetch(" in js:
            errors.append("script.js күтпеген жерден себет немесе желі шақыруын қамтиды; NFR құжатын жаңартыңыз")
    secret = re.compile(r"-----BEGIN (RSA |OPENSSH )?PRIVATE KEY-----|AKIA[0-9A-Z]{16}")
    for path in (HTML, JS):
        if path.exists() and secret.search(path.read_text(encoding="utf-8", errors="ignore")):
            errors.append(f"құпия үлгісі: {path.name}")
    if errors:
        print("CI FAIL")
        for item in errors:
            print(" -", item)
        return 1
    print("CI OK: витрина, құжаттар және құпия-үлгі тексерілді")
    return 0


if __name__ == "__main__":
    sys.exit(main())
