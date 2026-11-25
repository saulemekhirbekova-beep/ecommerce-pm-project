const { CATEGORIES } = require("./prompt");

const RULES = [
  { category: "Food", words: ["тағам", "тамам", "дәм", "дам", "кофе", "стейк", "салат", "торт", "сорпа", "еда", "едa", "вкус", "холодн", "суық", "суып", "тұз"] },
  { category: "Service", words: ["қызмет", "кызмет", "даяшы", "официант", "персонал", "күттік", "куттик", "сервис", "обслужив", "баяу", "дөрекі", "груб"] },
  { category: "Delivery", words: ["жеткіз", "жеткиз", "достав", "курьер", "куриер"] },
  { category: "Price", words: ["баға", "бага", "қымбат", "кымбат", "есеп", "счет", "счёт", "ақша", "акша", "цена", "деньг"] },
  { category: "Cleanliness", words: ["таза", "кір", "кир", "гряз", "еден", "үстел кір"] },
  { category: "Booking", words: ["брон", "бронь"] }
];

function has(text, words) {
  return words.some((word) => text.includes(word));
}

function baseline(text) {
  const norm = String(text || "").toLowerCase().replaceAll("ё", "е");
  const negative = has(norm, ["суық", "суып", "дөрекі", "груб", "кір", "гряз", "кешік", "кешик", "төгіл", "тогил", "бұзыл", "бузыл", "қате", "лишн", "қайтарма", "отмен", "бас тарт", "іш ауыр", "дәмсіз", "вкусн емес", "қымбат және", "суық", "холодн", "долг", "минут", "не подтверд", "бос емес"]);
  const positive = has(norm, ["дәмді", "рахмет", "жақсы", "жақсы", "керемет", "ұсын", "спасибо", "понрави", "мейірім", "вежлив", "ыстық", "горяч", "таза", "оңай", "быстро", "тез"]);
  let sentiment = "Neutral";
  if (negative && positive) sentiment = "Mixed";
  else if (negative) sentiment = "Negative";
  else if (positive) sentiment = "Positive";
  const category = RULES.filter((rule) => has(norm, rule.words)).map((rule) => rule.category);
  if (category.length === 0) category.push("Other");
  let priority = "Low";
  if (sentiment === "Negative") priority = "High";
  else if (sentiment === "Mixed") priority = "Medium";
  return {
    sentiment,
    category: category.filter((item) => CATEGORIES.includes(item)),
    priority
  };
}

module.exports = { baseline };
