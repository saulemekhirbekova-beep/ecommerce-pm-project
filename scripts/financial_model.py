"""DressCo: 3 жылдық TCO, ROI, NPV және сезімталдық.

Барлық жария тариф пен жалақы дереккөзі тұрақтылардың түсіндірмесінде.
Жорамалдар ASSUMPTIONS сөздігінде бөлек. Нәтиже stdout-қа жазылады.
"""

from __future__ import annotations

# ҚР Ұлттық Банкі, ресми нарықтық бағам, 2026-11-13.
# https://nationalbank.kz/kz/exchangerates/ezhednevnye-oficialnye-rynochnye-kursy-valyut
USD_KZT = 443.62
EUR_KZT = 492.24

# Hetzner Cloud CX23, Германия, ҚҚС-сыз net баға. cloudtally.eu, 2026-11-10.
# https://cloudtally.eu/hetzner-cloud-prices
HETZNER_CX23_EUR = 5.49
HETZNER_BACKUP_RATE = 0.20

# ps.kz G-1, whtop карточкасы (жоспар 2021-04-15). Баға ескі болуы мүмкін.
# https://www.whtop.com/plans/ps.kz/114162
PS_KZ_G1_KZT = 40_000

# Kaspi Магазин, киім, комиссия ҚҚС-пен 12,5%. guide.kaspi.kz тариф, 2026-01-05.
KASPI_CLOTHES_RATE = 0.125

# taylor.kz, 2026 қараша, Junior медиана, теңге/ай.
# https://taylor.kz/salaries
JUNIOR_MEDIAN = 325_000
HOURS_PER_MONTH = 168  # 21 күн × 8 сағат

# Shopify Basic жария тарифі, АҚШ доллары/ай. Қорғау алдында shopify.com прайсын қайта ашу керек.
SHOPIFY_BASIC_USD = 39

ORDERS_PER_MONTH = 40
AVG_CHECK_KZT = 18_000
MIGRATE = (0.30, 0.50, 0.60)
DOMAIN_KZT_YEAR = 3_900
SUPPORT_H_MONTH = 4
DISCOUNT = 0.15
TEAM = 4
HOURS_PER_WEEK = 6
WEEKS = 15


def money(value: float) -> int:
    return int(round(value))


def model() -> dict:
    hourly = JUNIOR_MEDIAN / HOURS_PER_MONTH
    build_hours = TEAM * HOURS_PER_WEEK * WEEKS
    build_cost = build_hours * hourly
    support_year = SUPPORT_H_MONTH * 12 * hourly
    hetzner_month = HETZNER_CX23_EUR * (1 + HETZNER_BACKUP_RATE) * EUR_KZT
    hetzner_3y = hetzner_month * 36
    pskz_3y = PS_KZ_G1_KZT * 36
    domain_3y = DOMAIN_KZT_YEAR * 3
    shopify_3y = SHOPIFY_BASIC_USD * USD_KZT * 36
    gmv_year = ORDERS_PER_MONTH * 12 * AVG_CHECK_KZT
    benefit_years = [gmv_year * share * KASPI_CLOTHES_RATE for share in MIGRATE]
    y_opex = support_year + hetzner_month * 12 + DOMAIN_KZT_YEAR
    cashflows = [
        -build_cost,
        benefit_years[0] - y_opex,
        benefit_years[1] - y_opex,
        benefit_years[2] - y_opex,
    ]
    npv = sum(cf / ((1 + DISCOUNT) ** t) for t, cf in enumerate(cashflows))
    total_benefit = sum(benefit_years)
    total_cost = build_cost + support_year * 3 + hetzner_3y + domain_3y
    net = total_benefit - total_cost
    # Өтелу: теріс жинақ жыл-2 соңында, жыл-3 ақша ағыны оң.
    cum_after_2 = cashflows[0] + cashflows[1] + cashflows[2]
    payback_years = 2 + (-cum_after_2) / cashflows[3]
    return {
        "hourly_kzt": round(hourly, 2),
        "build_hours": build_hours,
        "build_cost_kzt": money(build_cost),
        "support_year_kzt": money(support_year),
        "hetzner_month_kzt": round(hetzner_month, 2),
        "hetzner_3y_kzt": money(hetzner_3y),
        "pskz_3y_kzt": pskz_3y,
        "shopify_3y_kzt": money(shopify_3y),
        "domain_3y_kzt": domain_3y,
        "gmv_year_kzt": gmv_year,
        "benefit_years_kzt": [money(x) for x in benefit_years],
        "y_opex_kzt": money(y_opex),
        "cashflows_kzt": [money(x) for x in cashflows],
        "benefit_3y_kzt": money(total_benefit),
        "cost_3y_kzt": money(total_cost),
        "net_3y_kzt": money(net),
        "roi": round(net / total_cost, 4),
        "npv_kzt": money(npv),
        "payback_months": round(payback_years * 12, 1),
        "sensitivity": {
            "cost_plus_30_net_kzt": money(total_benefit - total_cost * 1.3),
            "benefit_50_net_kzt": money(total_benefit * 0.5 - total_cost),
            "both_net_kzt": money(total_benefit * 0.5 - total_cost * 1.3),
        },
        "kaspi_if_stay_3y_kzt": money(gmv_year * 3 * KASPI_CLOTHES_RATE),
        "contribution_per_order_kzt": money(AVG_CHECK_KZT * KASPI_CLOTHES_RATE),
    }


def main() -> None:
    row = model()
    print("DressCo қаржы моделі, есеп күні 2026-11-13")
    print(f"сағаттық мөлшерлеме={row['hourly_kzt']} теңге, әзірлеу сағаты={row['build_hours']}")
    print(f"TCO 3 жыл={row['cost_3y_kzt']} теңге")
    print(f"пайда 3 жыл={row['benefit_3y_kzt']} теңге, таза={row['net_3y_kzt']}")
    print(f"ROI={row['roi']:.2%}, NPV@{DISCOUNT:.0%}={row['npv_kzt']} теңге")
    print(f"өтелу={row['payback_months']} ай")
    print(
        "сезімталдық таза нәтиже: шығын+30%="
        f"{row['sensitivity']['cost_plus_30_net_kzt']}, "
        f"пайда 50%={row['sensitivity']['benefit_50_net_kzt']}, "
        f"екеуі={row['sensitivity']['both_net_kzt']}"
    )
    print(
        f"Hetzner 3 жыл={row['hetzner_3y_kzt']}, "
        f"ps.kz 3 жыл={row['pskz_3y_kzt']}, "
        f"Shopify Basic 3 жыл={row['shopify_3y_kzt']}"
    )
    print(f"ақша ағындары={row['cashflows_kzt']}")


if __name__ == "__main__":
    main()
