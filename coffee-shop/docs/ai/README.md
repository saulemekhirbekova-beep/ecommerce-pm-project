# ЗС 12. Пікірді талдайтын AI

Кофейня қосымшасындағы пікірді жергілікті Qwen моделі оқиды. Жауап клиентке өзі жіберілмейді. Төмендегі алты құжат осы аптаның тапсырмасы.

| № | Құжат | Не ішінде |
| --- | --- | --- |
| 1 | [ai-function-card.md](ai-function-card.md) | Функция: не кіреді, не шығады, кім тексереді |
| 2 | [eval-dataset.csv](eval-dataset.csv) | 32 эталон. Күтілген жауап және модельдің нақты жауабы |
| 3 | [eval-results.md](eval-results.md) | Дәлдік, macro-F1, уақыт, кілтсөзбен салыстыру |
| 4 | [cost-calculation.md](cost-calculation.md) | 1 000, 10 000, 100 000 сұраныс, API және GPU, break-even |
| 5 | [risk-register.md](risk-register.md) | Алты тәуекел, ықтималдық, әсер, адамның рөлі |
| 6 | [ADR-002-ai-function.md](ADR-002-ai-function.md) | Неге жергілікті Qwen таңдалды |

Өлшем 2026-11-25 күні сол модельде жүгірді. Sentiment дәлдігі 0,5938. Category дәлдігі 0,4063. Priority дәлдігі 0,4688. Sentiment macro-F1 0,4479. Орташа жауап 7308 мс. Бұл сандар ойдан алынбаған, `eval-run.json` ішінде әр жолдың уақыты бар.

# Тексеру тізімі

| Талап | Орындалуы |
| --- | --- |
| Қолданыстағы қосымшаға модуль, нөлден жазылмаған | Пікір беті, жасыл-ақ стиль, навигация сақталған |
| Sentiment, category, priority, summary, reply, confidence | `ai/prompt.js`, JSON тексеру `ai/engine.js` |
| Бір пікірді және барлығын талдау, статистика, кесте, көшіру | `js/aiAssistant.js`, менеджер мен админ |
| Жергілікті модель, кілт жоқ | `provider: local`, Qwen GGUF. Ollama `provider: ollama` |
| Ollama жоқ кезде жалған нәтиже жоқ | Қате мәтіні, кілтсөз AI деп көрсетілмейді |
| Кемінде 30 эталон, нақты жүгірту | 32 жол, `eval-dataset.csv` |
| Accuracy, macro-F1, уақыт, кілтсөзбен салыстыру | `eval-results.md` |
| 1 000 / 10 000 / 100 000 және GPU break-even | `cost-calculation.md` |
| Тәуекел және адам бақылауы | `risk-register.md` |
| ADR-002 | `ADR-002-ai-function.md` |
| Мысал пікір нақты клиент деп көрсетілмейді | Карточкада «Мысал пікір» |

Іске қосу: `node server.js`, содан кейін `http://localhost:8080`. Менеджер: `manager` / `123`. Пікірлер бөлімінде «AI арқылы талдау».

Қайта өлшеу: `node ai/run-eval.js`. Модель жолы `ai-config.json` немесе `ai-config.local.json`.
