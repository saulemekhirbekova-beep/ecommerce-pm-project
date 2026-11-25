const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const { SENTIMENTS, CATEGORIES, PRIORITIES, SYSTEM_PROMPT } = require("./prompt");

const ROOT = path.join(__dirname, "..");
let runtime = null;

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function loadConfig() {
  const config = readJson(path.join(ROOT, "ai-config.json"));
  const localFile = path.join(ROOT, "ai-config.local.json");
  if (fs.existsSync(localFile)) Object.assign(config, readJson(localFile));
  return config;
}

function findModel(config) {
  if (config.modelPath && fs.existsSync(config.modelPath)) return config.modelPath;
  for (const item of config.modelPaths || []) {
    const full = path.resolve(ROOT, item);
    if (fs.existsSync(full)) return full;
  }
  return null;
}

function findRuntime(config) {
  const candidates = [
    config && config.runtimePath,
    path.join(ROOT, "node_modules", "node-llama-cpp"),
    path.resolve(ROOT, "..", "scripts", "node_modules", "node-llama-cpp")
  ].filter(Boolean);
  return candidates.find((item) => fs.existsSync(path.join(item, "package.json"))) || null;
}

function extractJson(raw) {
  const text = String(raw || "").trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

function validate(value) {
  if (!value || typeof value !== "object") return { ok: false, error: "JSON объект емес" };
  if (!SENTIMENTS.includes(value.sentiment)) return { ok: false, error: "sentiment жарамсыз" };
  const category = Array.isArray(value.category) ? value.category : [value.category];
  const cleanCategory = [...new Set(category.filter((item) => CATEGORIES.includes(item)))];
  if (cleanCategory.length === 0) return { ok: false, error: "category жарамсыз" };
  if (!PRIORITIES.includes(value.priority)) return { ok: false, error: "priority жарамсыз" };
  if (!String(value.summary || "").trim()) return { ok: false, error: "summary бос" };
  if (!String(value.suggested_reply || "").trim()) return { ok: false, error: "suggested_reply бос" };
  const confidence = Number(value.confidence);
  if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) return { ok: false, error: "confidence 0 мен 1 арасында емес" };
  return {
    ok: true,
    result: {
      sentiment: value.sentiment,
      category: cleanCategory,
      priority: value.priority,
      summary: String(value.summary).trim(),
      suggested_reply: String(value.suggested_reply).trim(),
      confidence: Math.round(confidence * 100) / 100
    }
  };
}

async function ensureLocal(config) {
  if (runtime) return runtime;
  const modelPath = findModel(config);
  if (!modelPath) {
    throw new Error("Жергілікті модель файлы табылмады. ai-config.json ішіндегі modelPath тексеріңіз.");
  }
  const runtimeDir = findRuntime(config);
  if (!runtimeDir) {
    throw new Error("node-llama-cpp орнатылмаған. Немесе provider мәнін ollama қылыңыз.");
  }
  const llamaCpp = await import(pathToFileURL(path.join(runtimeDir, "dist", "index.js")).href);
  const llama = await llamaCpp.getLlama({ gpu: false });
  const model = await llama.loadModel({ modelPath });
  const context = await model.createContext({ contextSize: 4096 });
  const grammar = await llama.createGrammarForJsonSchema({
    type: "object",
    properties: {
      sentiment: { enum: SENTIMENTS },
      category: { type: "array", items: { enum: CATEGORIES } },
      priority: { enum: PRIORITIES },
      summary: { type: "string" },
      suggested_reply: { type: "string" },
      confidence: { type: "number" }
    },
    required: ["sentiment", "category", "priority", "summary", "suggested_reply", "confidence"]
  });
  runtime = { llamaCpp, llama, model, context, grammar, modelPath };
  return runtime;
}

async function askOllama(config, text) {
  const response = await fetch(`${config.ollamaBaseUrl.replace(/\/$/, "")}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: config.ollamaModel,
      stream: false,
      format: "json",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text }
      ],
      options: { temperature: config.temperature ?? 0, num_predict: config.maxTokens ?? 180 }
    })
  });
  if (!response.ok) {
    throw new Error(`Ollama қатесі: HTTP ${response.status}. Сервер қосулы ма, модель жүктелген бе?`);
  }
  const body = await response.json();
  return body.message && body.message.content ? body.message.content : "";
}

async function askLocal(config, text) {
  const local = await ensureLocal(config);
  const sequence = local.context.getSequence();
  const session = new local.llamaCpp.LlamaChatSession({
    contextSequence: sequence,
    systemPrompt: SYSTEM_PROMPT
  });
  try {
    return await session.prompt(text, {
      grammar: local.grammar,
      temperature: config.temperature ?? 0,
      maxTokens: config.maxTokens ?? 180
    });
  } finally {
    session.dispose?.();
    sequence.dispose?.();
  }
}

async function analyzeText(text) {
  const config = loadConfig();
  const started = Date.now();
  const provider = config.provider === "ollama" ? "ollama" : "local";
  try {
    const raw = provider === "ollama" ? await askOllama(config, text) : await askLocal(config, text);
    const parsed = validate(extractJson(raw));
    const model = provider === "ollama" ? config.ollamaModel : path.basename(findModel(config) || "local");
    if (!parsed.ok) {
      return { ok: false, error: parsed.error, raw: String(raw).slice(0, 500), provider, model, ms: Date.now() - started };
    }
    return { ok: true, result: parsed.result, provider, model, ms: Date.now() - started };
  } catch (error) {
    return { ok: false, error: error.message || "Модель жауап бермеді", provider, ms: Date.now() - started };
  }
}

async function health() {
  const config = loadConfig();
  if (config.provider === "ollama") {
    try {
      const response = await fetch(`${config.ollamaBaseUrl.replace(/\/$/, "")}/api/tags`);
      if (!response.ok) return { ok: false, provider: "ollama", error: `Ollama HTTP ${response.status}` };
      return { ok: true, provider: "ollama", model: config.ollamaModel };
    } catch {
      return { ok: false, provider: "ollama", error: "Ollama қосылмаған. Жалған талдау көрсетілмейді." };
    }
  }
  const modelPath = findModel(config);
  if (!modelPath) return { ok: false, provider: "local", error: "Модель файлы табылмады" };
  if (!findRuntime(config)) return { ok: false, provider: "local", error: "node-llama-cpp табылмады" };
  return { ok: true, provider: "local", model: path.basename(modelPath) };
}

module.exports = { analyzeText, health, loadConfig, ROOT, SYSTEM_PROMPT };
