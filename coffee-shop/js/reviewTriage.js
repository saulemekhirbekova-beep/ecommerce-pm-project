// Кілтсөз бағдары. Бұл модель емес.
// Тізім scripts/eval_reviews.mjs ішіндегі baselineClass-пен бірдей.
const reviewTriage = {
    complaint: [
        "суық", "суык", "кешік", "кешик", "дөрекі", "дореки", "кір", "кир",
        "екі рет", "еки рет", "қате", "кате", "ащы", "ашшы", "тұзсыз", "тузсыз",
        "өтпеді", "отпеди", "жұмыс істемеді", "жумыс истемеди", "төгіп", "тогип",
        "келмеймін", "келмеймин", "мүмкін емес", "мумкин емес", "кешегі", "кешеги",
        "долго", "лишн", "холодн", "не заказывали", "устали"
    ],
    question: ["ма?", "ма ?", "қанша", "канша", "қалай", "калай", "бар ма", "можно", "есть ли", "қайдан", "кайдан"],
    praise: ["рахмет", "дәмді", "дамды", "керемет", "ұсынамын", "усынамын", "спасибо", "понравил", "вернёмся", "вернемся", "сүйікті", "суйикти", "қуанышты", "куанышты"],
    names: { praise: "мақтау", complaint: "шағым", question: "сұрақ", neutral: "бейтарап" },

    hasAny(text, words) {
        return words.some((word) => text.includes(word));
    },

    classify(text) {
        const norm = String(text || "").toLowerCase().replaceAll("ё", "е");
        if (this.hasAny(norm, this.complaint)) return "complaint";
        if (this.hasAny(norm, this.question) || norm.includes("?")) return "question";
        if (this.hasAny(norm, this.praise)) return "praise";
        return "neutral";
    },

    label(text) {
        return this.names[this.classify(text)];
    },

    staffCanSee() {
        return typeof auth !== "undefined" && auth.hasPermission && auth.hasPermission("manager");
    },

    badge(text) {
        if (!this.staffCanSee()) return "";
        return `<div class="review-triage-badge">Бағдар: ${this.label(text)}. Кілтсөз, модель емес. Шешімді менеджер қабылдайды.</div>`;
    }
};
