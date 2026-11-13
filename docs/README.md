# DressCo — 1–11 апта артефактілері

Тұтас жоба: Алматыдағы шағын киім дүкеніне арналған интернет-дүкен. Витрина негізі — репозиторийдегі `anon-ecommerce-website-master` (статикалық HTML/CSS/JS). Басқару артефактілері осы `docs/` қалтасында, есептеулер `scripts/` қалтасында.

| Апта | Файл |
| --- | --- |
| 1 | [lab01_market_and_case.md](lab01_market_and_case.md) |
| 2 | [lab02_adr_delivery_model.md](lab02_adr_delivery_model.md) |
| 3 | [lab03_business_case_charter.md](lab03_business_case_charter.md), `scripts/financial_model.py` |
| 4 | [lab04_requirements_storymap.md](lab04_requirements_storymap.md) |
| 5 | [lab05_wbs_releases_raci.md](lab05_wbs_releases_raci.md) |
| 6 | [lab06_estimation.md](lab06_estimation.md), `scripts/monte_carlo.py` |
| 7 | [lab07_risks_security_compliance.md](lab07_risks_security_compliance.md) |
| 8 | [lab08_sow_sla_budget.md](lab08_sow_sla_budget.md) |
| 9 | [lab09_sprints_flow_metrics.md](lab09_sprints_flow_metrics.md) |
| 10 | [lab10_cicd_dora_release.md](lab10_cicd_dora_release.md), `.github/workflows/ci.yml`, `scripts/dora_metrics.py` |
| 11 | [lab11_qa_uat_operations.md](lab11_qa_uat_operations.md): сапа қақпасы, 10 UAT, кінәсіз postmortem, төлем runbook. Стенд: `docker-compose.monitoring.yml`. Тест: `tests/test_smoke_api.py`, `tests/load_test_k6.js` |

Есеп күні: 2026-11-13. Қайталау: `python scripts/financial_model.py`, `python scripts/monte_carlo.py`, `python -m pytest tests/test_smoke_api.py -q`.
