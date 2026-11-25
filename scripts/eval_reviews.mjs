/**
 * ЗС 12. Пікір жіктеу: кілтсөз бағдары және жергілікті Qwen промпты.
 * Токен: js-tiktoken, o200k_base (GPT-4o және одан кейінгі OpenAI мәтін модельдері).
 * Қайталау: node scripts/eval_reviews.mjs
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getEncoding } from "js-tiktoken";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const EVAL_PATH = path.join(__dirname, "data", "review_eval.json");
const PROMPT_PATH = path.join(__dirname, "review_prompt_v1.txt");
const MODEL_PATH = path.join(__dirname, "models", "qwen2.5-1.5b-instruct-q4_k_m.gguf");
const OUT_DIR = path.join(__dirname, "output");

const CLASSES = ["praise", "complaint", "question", "neutral"];
const COMPLAINT = [
  "суық", "суык", "кешік", "кешик", "дөрекі", "дореки", "кір", "кир",
  "екі рет", "еки рет", "қате", "кате", "ащы", "ашшы", "тұзсыз", "тузсыз",
  "өтпеді", "отпеди", "жұмыс істемеді", "жумыс истемеди", "төгіп", "тогип",
  "келмеймін", "келмеймин", "мүмкін емес", "мумкин емес", "кешегі", "кешеги",
  "долго", "лишн", "холодн", "не заказывали", "устали"
];
const QUESTION = ["ма?", "ма ?", "қанша", "канша", "қалай", "калай", "бар ма", "можно", "есть ли", "қайдан", "кайдан"];
const PRAISE = ["рахмет", "дәмді", "дамды", "керемет", "ұсынамын", "усынамын", "спасибо", "понравил", "вернёмся", "вернемся", "сүйікті", "суйикти", "қуанышты", "куанышты"];

const USD_KZT = 458.28;
const EUR_KZT = 501.45;
const REQUESTS = 600;
const GPT5_MINI = { in: 0.25, out: 2.0, name: "gpt-5-mini" };
const GPT4O_MINI = { in: 0.15, out: 0.6, name: "gpt-4o-mini" };
const GEX45_MONTH_EUR = 214;
const GEX45_SETUP_EUR = 209;

function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

function hasAny(text, words) {
  return words.some((word) => text.includes(word));
}

export function baselineClass(text) {
  const norm = text.toLowerCase().replaceAll("ё", "е");
  const complaint = hasAny(norm, COMPLAINT);
  const question = hasAny(norm, QUESTION) || norm.includes("?");
  const praise = hasAny(norm, PRAISE);
  if (complaint) return "complaint";
  if (question) return "question";
  if (praise) return "praise";
  return "neutral";
}

function scores(rows) {
  const labels = rows.map((row) => row.gold);
  const preds = rows.map((row) => row.pred);
  let correct = 0;
  const per = {};
  for (const name of CLASSES) {
    let tp = 0;
    let fp = 0;
    let fn = 0;
    for (let i = 0; i < rows.length; i += 1) {
      if (preds[i] === name && labels[i] === name) tp += 1;
      else if (preds[i] === name && labels[i] !== name) fp += 1;
      else if (preds[i] !== name && labels[i] === name) fn += 1;
    }
    const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
    const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
    const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
    per[name] = {
      tp, fp, fn,
      precision: round(precision),
      recall: round(recall),
      f1: round(f1)
    };
  }
  for (let i = 0; i < rows.length; i += 1) if (preds[i] === labels[i]) correct += 1;
  const macro = CLASSES.reduce((sum, name) => sum + per[name].f1, 0) / CLASSES.length;
  return {
    n: rows.length,
    correct,
    accuracy: round(correct / rows.length),
    macro_f1: round(macro),
    complaint_recall: per.complaint.recall,
    per_class: per
  };
}

function round(value) {
  return Math.round(value * 10000) / 10000;
}

function money(requests, avgIn, avgOut, tariff) {
  const usd = requests * (avgIn / 1e6 * tariff.in + avgOut / 1e6 * tariff.out);
  return {
    model: tariff.name,
    requests,
    usd: round(usd),
    kzt: round(usd * USD_KZT)
  };
}

function parseClass(raw) {
  const found = String(raw).toLowerCase().match(/praise|complaint|question|neutral/);
  return found ? found[0] : "unparsed";
}

async function runModel(items, systemPrompt) {
  const llamaCpp = await import("node-llama-cpp");
  const llama = await llamaCpp.getLlama({ gpu: false });
  const model = await llama.loadModel({ modelPath: MODEL_PATH });
  const context = await model.createContext({ contextSize: 2048 });
  const rows = [];
  for (const item of items) {
    const sequence = context.getSequence();
    const session = new llamaCpp.LlamaChatSession({
      contextSequence: sequence,
      systemPrompt
    });
    const started = Date.now();
    const raw = await session.prompt(item.text, {
      temperature: 0,
      maxTokens: 24
    });
    const ms = Date.now() - started;
    const pred = parseClass(raw);
    console.log(`${item.id} gold=${item.gold} pred=${pred} ms=${ms} raw=${JSON.stringify(String(raw).trim()).slice(0, 180)}`);
    rows.push({
      id: item.id,
      gold: item.gold,
      pred,
      raw: String(raw).trim(),
      ms
    });
    session.dispose?.();
    sequence.dispose?.();
  }
  context.dispose?.();
  model.dispose?.();
  return rows;
}

function acceptance(metric) {
  return metric.accuracy >= 0.8 && metric.complaint_recall >= 0.9;
}

async function main() {
  const items = JSON.parse(readFileSync(EVAL_PATH, "utf8"));
  const systemPrompt = readFileSync(PROMPT_PATH, "utf8").trim();
  const enc = getEncoding("o200k_base");
  const plannedOut = enc.encode('{"class":"complaint"}').length;
  const inputLengths = items.map((item) => enc.encode(`${systemPrompt}\n${item.text}`).length);
  const avgIn = inputLengths.reduce((a, b) => a + b, 0) / inputLengths.length;

  const baselineRows = items.map((item) => ({
    id: item.id,
    text: item.text,
    gold: item.gold,
    pred: baselineClass(item.text)
  }));
  const baseline = scores(baselineRows);

  let modelBlock = { ran: false, reason: "модель файлы жоқ" };
  if (existsSync(MODEL_PATH)) {
    const modelRows = await runModel(items, systemPrompt);
    const metric = scores(modelRows.filter((row) => row.pred !== "unparsed").length === modelRows.length
      ? modelRows
      : modelRows);
    const outLengths = modelRows.map((row) => enc.encode(row.raw).length);
    const avgOutObserved = outLengths.reduce((a, b) => a + b, 0) / outLengths.length;
    const latencies = modelRows.map((row) => row.ms).sort((a, b) => a - b);
    modelBlock = {
      ran: true,
      stack: "node-llama-cpp, CPU, gpu:false",
      model: "Qwen/Qwen2.5-1.5B-Instruct-GGUF qwen2.5-1.5b-instruct-q4_k_m.gguf",
      prompt: "scripts/review_prompt_v1.txt",
      temperature: 0,
      maxTokens: 24,
      metric,
      accepted: acceptance(metric),
      avg_output_tokens_o200k: round(avgOutObserved),
      latency_ms: {
        min: latencies[0],
        p50: latencies[Math.floor(latencies.length / 2)],
        max: latencies[latencies.length - 1]
      },
      rows: modelRows
    };
  }

  const avgOut = plannedOut;
  const gpuMonthKzt = round(GEX45_MONTH_EUR * EUR_KZT);
  const gpuSetupKzt = round(GEX45_SETUP_EUR * EUR_KZT);
  const gpuYear1MonthKzt = round(((GEX45_MONTH_EUR * 12 + GEX45_SETUP_EUR) * EUR_KZT) / 12);
  const perRequest = {
    gpt5_mini_usd: (avgIn / 1e6) * GPT5_MINI.in + (avgOut / 1e6) * GPT5_MINI.out,
    gpt4o_mini_usd: (avgIn / 1e6) * GPT4O_MINI.in + (avgOut / 1e6) * GPT4O_MINI.out
  };
  const cost = {
    rates: {
      date: "2026-11-25",
      usd_kzt: USD_KZT,
      eur_kzt: EUR_KZT,
      usd_source: "https://nationalbank.kz/ru/exchangerates/ezhednevnye-oficialnye-rynochnye-kursy-valyut",
      gpt5_mini_per_1m: GPT5_MINI,
      gpt4o_mini_per_1m: GPT4O_MINI,
      price_source: "https://developers.openai.com/api/docs/pricing",
      gpu: {
        name: "Hetzner GEX45",
        month_eur_ex_vat: GEX45_MONTH_EUR,
        setup_eur_ex_vat: GEX45_SETUP_EUR,
        source: "https://www.hetzner.com/dedicated-rootserver/gex45/"
      }
    },
    tokenizer: "js-tiktoken o200k_base",
    avg_input_tokens: round(avgIn),
    planned_output_tokens: avgOut,
    input_tokens_min: Math.min(...inputLengths),
    input_tokens_max: Math.max(...inputLengths),
    volume_month: REQUESTS,
    volume_note: "бір кофейня, күніне 20 пікір немесе жазбаша хабар, 30 күн",
    api: {
      base: {
        gpt5_mini: money(REQUESTS, avgIn, avgOut, GPT5_MINI),
        gpt4o_mini: money(REQUESTS, avgIn, avgOut, GPT4O_MINI)
      },
      times_10: {
        gpt5_mini: money(REQUESTS * 10, avgIn, avgOut, GPT5_MINI),
        gpt4o_mini: money(REQUESTS * 10, avgIn, avgOut, GPT4O_MINI)
      }
    },
    self_host_gex45_kzt: {
      month_ex_vat: gpuMonthKzt,
      setup_ex_vat: gpuSetupKzt,
      year1_average_month: gpuYear1MonthKzt
    },
    break_even_requests_per_month: {
      gpt5_mini_vs_gex45_month: Math.ceil(gpuMonthKzt / (perRequest.gpt5_mini_usd * USD_KZT)),
      gpt4o_mini_vs_gex45_month: Math.ceil(gpuMonthKzt / (perRequest.gpt4o_mini_usd * USD_KZT)),
      gpt5_mini_vs_gex45_year1: Math.ceil(gpuYear1MonthKzt / (perRequest.gpt5_mini_usd * USD_KZT))
    }
  };

  const report = {
    generated_at: new Date().toISOString(),
    eval_file: "scripts/data/review_eval.json",
    eval_sha256: sha256(readFileSync(EVAL_PATH)),
    prompt_sha256: sha256(systemPrompt),
    n: items.length,
    acceptance_rule: "accuracy >= 0.80 және complaint recall >= 0.90",
    baseline: {
      name: "кілтсөз, AI жоқ",
      metric: baseline,
      accepted: acceptance(baseline),
      rows: baselineRows.map(({ id, gold, pred }) => ({ id, gold, pred, match: gold === pred }))
    },
    prompt_model: modelBlock,
    cost
  };

  mkdirSync(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, "lab12_eval.json");
  writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({
    baseline: baseline,
    model: modelBlock.ran ? { metric: modelBlock.metric, accepted: modelBlock.accepted, latency_ms: modelBlock.latency_ms } : modelBlock,
    avg_input_tokens: cost.avg_input_tokens,
    planned_output_tokens: cost.planned_output_tokens,
    api_base_kzt: cost.api.base,
    api_x10_kzt: cost.api.times_10,
    gpu_kzt: cost.self_host_gex45_kzt,
    break_even: cost.break_even_requests_per_month,
    out: outPath
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
