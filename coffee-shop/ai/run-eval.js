const fs = require("fs");
const path = require("path");
const { analyzeText, SYSTEM_PROMPT } = require("./engine");
const { baseline } = require("./baseline");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "docs", "ai");
const gold = JSON.parse(fs.readFileSync(path.join(__dirname, "eval-gold.json"), "utf8"));

function sameSet(left, right) {
  const a = [...left].sort().join("|");
  const b = [...right].sort().join("|");
  return a === b;
}

function macroF1(rows, field) {
  const labels = [...new Set(rows.map((row) => row.expected))];
  let total = 0;
  for (const label of labels) {
    let tp = 0;
    let fp = 0;
    let fn = 0;
    for (const row of rows) {
      const hit = row.predicted === label;
      const truth = row.expected === label;
      if (hit && truth) tp += 1;
      else if (hit && !truth) fp += 1;
      else if (!hit && truth) fn += 1;
    }
    const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
    const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
    total += precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
  }
  return labels.length === 0 ? 0 : total / labels.length;
}

function accuracy(rows) {
  if (rows.length === 0) return 0;
  return rows.filter((row) => row.ok).length / rows.length;
}

function round(value) {
  return Math.round(value * 10000) / 10000;
}

function csvCell(value) {
  const text = Array.isArray(value) ? value.join("|") : String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const rows = [];
  for (const item of gold) {
    const started = Date.now();
    const answer = await analyzeText(item.text);
    const base = baseline(item.text);
    const predicted = answer.ok ? answer.result : null;
    const record = {
      id: item.id,
      text: item.text,
      expected_sentiment: item.sentiment,
      expected_category: item.category,
      expected_priority: item.priority,
      predicted_sentiment: predicted ? predicted.sentiment : "",
      predicted_category: predicted ? predicted.category : [],
      predicted_priority: predicted ? predicted.priority : "",
      sentiment_ok: Boolean(predicted) && predicted.sentiment === item.sentiment,
      category_ok: Boolean(predicted) && sameSet(predicted.category, item.category),
      priority_ok: Boolean(predicted) && predicted.priority === item.priority,
      baseline_sentiment_ok: base.sentiment === item.sentiment,
      baseline_category_ok: sameSet(base.category, item.category),
      baseline_priority_ok: base.priority === item.priority,
      error: answer.ok ? "" : answer.error,
      ms: answer.ms || (Date.now() - started),
      provider: answer.provider || "",
      model: answer.model || ""
    };
    rows.push(record);
    console.log(`${item.id} sent=${record.sentiment_ok} cat=${record.category_ok} pri=${record.priority_ok} ms=${record.ms} err=${record.error}`);
  }
  const header = ["id", "original_review", "expected_sentiment", "expected_category", "expected_priority", "ai_predicted_sentiment", "ai_predicted_category", "ai_predicted_priority", "result"];
  const lines = [header.join(",")];
  for (const row of rows) {
    const correct = row.sentiment_ok && row.category_ok && row.priority_ok;
    lines.push([
      row.id,
      row.text,
      row.expected_sentiment,
      row.expected_category,
      row.expected_priority,
      row.predicted_sentiment,
      row.predicted_category,
      row.predicted_priority,
      row.error ? "Incorrect" : (correct ? "Correct" : "Incorrect")
    ].map(csvCell).join(","));
  }
  fs.writeFileSync(path.join(OUT, "eval-dataset.csv"), `${lines.join("\n")}\n`);
  const sentimentRows = rows.map((row) => ({ expected: row.expected_sentiment, predicted: row.predicted_sentiment || "Missing", ok: row.sentiment_ok }));
  const report = {
    generated_at: new Date().toISOString(),
    n: rows.length,
    provider: rows[0] && rows[0].provider,
    model: rows[0] && rows[0].model,
    prompt_chars: SYSTEM_PROMPT.length,
    ai: {
      sentiment_accuracy: round(accuracy(rows.map((row) => ({ ok: row.sentiment_ok })))),
      category_accuracy: round(accuracy(rows.map((row) => ({ ok: row.category_ok })))),
      priority_accuracy: round(accuracy(rows.map((row) => ({ ok: row.priority_ok })))),
      macro_f1_sentiment: round(macroF1(sentimentRows, "sentiment")),
      average_response_ms: round(rows.reduce((sum, row) => sum + row.ms, 0) / rows.length)
    },
    baseline: {
      sentiment_accuracy: round(accuracy(rows.map((row) => ({ ok: row.baseline_sentiment_ok })))),
      category_accuracy: round(accuracy(rows.map((row) => ({ ok: row.baseline_category_ok })))),
      priority_accuracy: round(accuracy(rows.map((row) => ({ ok: row.baseline_priority_ok }))))
    },
    rows
  };
  fs.writeFileSync(path.join(OUT, "eval-run.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ ai: report.ai, baseline: report.baseline }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
