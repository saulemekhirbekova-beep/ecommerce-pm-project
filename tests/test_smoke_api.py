"""DressCo себет ережесі және витрина smoke-тесті.

Витринада HTTP API жоқ (ADR-0002). Сондықтан себет пен өтініш
жергілікті функциямен тексеріледі, витрина файлдан оқылады.
Желі шақырылмайды. PAN сақталмайды.
"""

from __future__ import annotations

import re
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "anon-ecommerce-website-master" / "index.html"

PAN_NAME = re.compile(r"\b(pan|cvv|cardnumber)\b", re.I)


class Cart:
    def __init__(self) -> None:
        self.lines: list[tuple[str, int, int]] = []

    def add(self, sku: str, price_kzt: int, qty: int = 1) -> None:
        if price_kzt <= 0 or qty <= 0 or not sku:
            raise ValueError("line")
        self.lines.append((sku, price_kzt, qty))

    def total(self) -> int:
        return sum(price * qty for _, price, qty in self.lines)

    def empty(self) -> bool:
        return not self.lines


def mask_phone(phone: str) -> str:
    digits = re.sub(r"\D", "", phone)
    if len(digits) != 11 or not digits.startswith("7"):
        raise ValueError("phone")
    return f"+7 {digits[1:4]} *** ** {digits[-2:]}"


def apply_promo(total: int, code: str) -> int:
    """R2 шегі: промокод жарғыда жоқ, баға өзгермейді (SC-02)."""
    del code
    return total


def submit_order(cart: Cart, phone: str, consent: bool, fields: dict) -> tuple[int, str]:
    if cart.empty():
        return 400, "empty"
    if not consent:
        return 400, "consent"
    mask_phone(phone)
    if any(PAN_NAME.search(str(key)) for key in fields):
        return 400, "pan"
    return 201, "accepted"


def test_empty_cart() -> None:
    assert Cart().empty()
    assert Cart().total() == 0


def test_add_and_total() -> None:
    cart = Cart()
    cart.add("dress", 18_000, 2)
    cart.add("belt", 7_000, 1)
    assert cart.total() == 43_000
    assert not cart.empty()


def test_reject_non_positive() -> None:
    cart = Cart()
    with pytest.raises(ValueError):
        cart.add("dress", 0, 1)
    with pytest.raises(ValueError):
        cart.add("dress", 18_000, 0)


def test_phone_mask() -> None:
    assert mask_phone("+7 700 000 00 01") == "+7 700 *** ** 01"


def test_phone_rejects_short() -> None:
    with pytest.raises(ValueError):
        mask_phone("123")


def test_order_requires_consent() -> None:
    cart = Cart()
    cart.add("dress", 18_000)
    status, reason = submit_order(cart, "+77000000001", False, {})
    assert (status, reason) == (400, "consent")


def test_order_rejects_empty_cart() -> None:
    status, reason = submit_order(Cart(), "+77000000001", True, {})
    assert (status, reason) == (400, "empty")


def test_order_rejects_pan() -> None:
    cart = Cart()
    cart.add("dress", 18_000)
    status, reason = submit_order(cart, "+77000000001", True, {"pan": "4111"})
    assert (status, reason) == (400, "pan")


def test_order_created() -> None:
    cart = Cart()
    cart.add("dress", 18_000)
    status, reason = submit_order(cart, "+7 700 000 00 01", True, {"sku": "dress"})
    assert (status, reason) == (201, "accepted")


def test_promo_does_not_change_total() -> None:
    assert apply_promo(18_000, "DRESS10") == 18_000


def test_storefront_has_catalog_and_no_pan() -> None:
    text = HTML.read_text(encoding="utf-8")
    assert len(re.findall(r'class="showcase-title"', text)) >= 1
    assert len(re.findall(r'class="price">\$', text)) == 42
    assert not PAN_NAME.search(text)
