const aiAssistant = {
    busy: false,

    isStaff() {
        return typeof auth !== "undefined" && auth.hasPermission && auth.hasPermission("manager");
    },

    escape(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;");
    },

    analyzed(reviews) {
        return reviews.filter((review) => review.ai && review.ai.ok && review.ai.result);
    },

    panel(reviews) {
        if (!this.isStaff()) return "";
        const rows = this.analyzed(reviews);
        const count = (name) => rows.filter((review) => review.ai.result.sentiment === name).length;
        const categories = ["Food", "Service", "Delivery", "Price", "Cleanliness", "Booking", "Other"];
        const categoryStats = categories.map((name) => {
            const total = rows.filter((review) => review.ai.result.category.includes(name)).length;
            return `<div class="ai-chip">${name}: ${total}</div>`;
        }).join("");
        const high = rows.filter((review) => review.ai.result.priority === "High");
        return `
            <section class="ai-panel">
                <div class="ai-panel-head">
                    <h3>AI Analytics</h3>
                    <p>Жергілікті модель. Жауап клиентке өзі жіберілмейді. Менеджер көшіріп, өзі тексереді. Мысал пікірлер нақты клиент деректері емес.</p>
                </div>
                <div class="ai-actions">
                    <button class="btn btn-success" onclick="aiAssistant.analyzeAll()">Барлық пікірлерді талдау</button>
                    <button class="btn btn-secondary" onclick="aiAssistant.checkHealth()">Модель күйі</button>
                </div>
                <div id="aiStatus" class="ai-status"></div>
                <div class="ai-stats">
                    <div class="ai-stat"><b>${count("Positive")}</b><span>Позитивті</span></div>
                    <div class="ai-stat"><b>${count("Negative")}</b><span>Негативті</span></div>
                    <div class="ai-stat"><b>${count("Neutral")}</b><span>Бейтарап</span></div>
                    <div class="ai-stat"><b>${count("Mixed")}</b><span>Аралас</span></div>
                </div>
                <div class="ai-chips">${categoryStats}</div>
                <div class="ai-high">
                    <h4>Маңыздылығы жоғары</h4>
                    ${high.length === 0 ? "<p>Әлі жоқ. Талдаудан кейін осында шығады.</p>" : high.map((review) => `<p>${this.escape(review.reviewerName || review.name)}: ${this.escape(review.ai.result.summary)}</p>`).join("")}
                </div>
                <div class="ai-table-wrap">
                    <table class="ai-table">
                        <thead>
                            <tr>
                                <th>Пікір</th><th>Sentiment</th><th>Category</th><th>Priority</th><th>Summary</th><th>Сенім</th><th>Жауап</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows.length === 0 ? `<tr><td colspan="7">Талдау әлі жоқ.</td></tr>` : rows.map((review) => `
                                <tr>
                                    <td>${this.escape(review.reviewerName || review.name)}</td>
                                    <td>${review.ai.result.sentiment}</td>
                                    <td>${review.ai.result.category.join(", ")}</td>
                                    <td>${review.ai.result.priority}</td>
                                    <td>${this.escape(review.ai.result.summary)}</td>
                                    <td>${review.ai.result.confidence}</td>
                                    <td><button class="btn btn-secondary" onclick="aiAssistant.copyReply(${review.id})">Көшіру</button></td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            </section>
        `;
    },

    guestCard(review) {
        if (!review.ai) return "";
        if (!review.ai.ok) {
            return `<div class="ai-card"><p>Пікір сақталды. Автоматты оқу сәтсіз аяқталды, менеджер мәтінді өзі қарайды.</p></div>`;
        }
        const names = { Positive: "жағымды", Negative: "жағымсыз", Neutral: "бейтарап", Mixed: "аралас" };
        const result = review.ai.result;
        return `
            <div class="ai-card">
                <p>Автоматты оқу: ${names[result.sentiment] || result.sentiment}. ${this.escape(result.summary)}</p>
                <p>Бұл ресми жауап емес. Менеджер тексеріп, өзі жазады.</p>
            </div>
        `;
    },

    sampleMark(review) {
        const samples = [
            "Біздің отбасылық мереке үшін үстел брондадық",
            "Корпоративтік кеш өткіздік",
            "Бірнеше жыл бойы бұл ресторанға келеміз"
        ];
        const text = review.reviewText || review.text || "";
        if (review.isSample || samples.some((item) => text.startsWith(item))) {
            return `<div class="ai-sample">Мысал пікір. Нақты клиент деректері емес.</div>`;
        }
        return "";
    },

    card(review) {
        if (!this.isStaff()) return this.guestCard(review);
        const text = review.reviewText || review.text || "";
        const result = review.ai && review.ai.ok ? review.ai.result : null;
        const failed = review.ai && !review.ai.ok ? review.ai.error : "";
        return `
            ${this.sampleMark(review)}
            <div class="ai-card">
                <button class="btn btn-success" onclick="aiAssistant.analyzeOne(${review.id})">AI арқылы талдау</button>
                ${failed ? `<p class="ai-error">${this.escape(failed)}</p>` : ""}
                ${result ? `
                    <p><b>${result.sentiment}</b> · ${result.category.join(", ")} · ${result.priority} · ${result.confidence}</p>
                    <p>${this.escape(result.summary)}</p>
                    <p>${this.escape(result.suggested_reply)}</p>
                    <button class="btn btn-secondary" onclick="aiAssistant.copyReply(${review.id})">Ұсынылған жауапты көшіру</button>
                ` : ""}
            </div>
        `;
    },

    setStatus(message, isError) {
        const box = document.getElementById("aiStatus");
        if (!box) return;
        box.textContent = message;
        box.className = isError ? "ai-status ai-error" : "ai-status";
    },

    async checkHealth() {
        const response = await fetch("/api/ai/health");
        const body = await response.json();
        if (!body.ok) {
            this.setStatus(body.error || "Модель қолжетімсіз", true);
            return;
        }
        this.setStatus(`Модель дайын: ${body.provider}, ${body.model || ""}`);
    },

    async analyzeOne(id, fromBatch) {
        if (this.busy && !fromBatch) return;
        const review = (storage.read("reviews") || []).find((item) => item.id === id);
        if (!review) return;
        const ownLock = !fromBatch;
        if (ownLock) this.busy = true;
        this.setStatus("Талдау жүріп жатыр. Бұл нақты модель, бірнеше секунд кетуі мүмкін.");
        try {
            const response = await fetch("/api/ai/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: review.reviewText || review.text || "" })
            });
            const body = await response.json();
            storage.update("reviews", id, {
                ai: body.ok
                    ? { ok: true, result: body.result, provider: body.provider, model: body.model, ms: body.ms, at: new Date().toISOString() }
                    : { ok: false, error: body.error || "Талдау сәтсіз", provider: body.provider, at: new Date().toISOString() }
            });
            this.setStatus(body.ok ? "Талдау сақталды. Жауап клиентке жіберілген жоқ." : (body.error || "Талдау сәтсіз"), !body.ok);
        } catch (error) {
            this.setStatus("Серверге қосылу мүмкін болмады. Жалған нәтиже көрсетілмейді.", true);
        } finally {
            if (ownLock) this.busy = false;
            reviewsModule.render();
        }
    },

    async analyzeAll() {
        if (this.busy) return;
        this.busy = true;
        try {
            const reviews = storage.read("reviews") || [];
            for (const review of reviews) {
                await this.analyzeOne(review.id, true);
            }
        } finally {
            this.busy = false;
            reviewsModule.render();
        }
    },

    async copyReply(id) {
        const review = (storage.read("reviews") || []).find((item) => item.id === id);
        const reply = review && review.ai && review.ai.result ? review.ai.result.suggested_reply : "";
        if (!reply) return;
        await navigator.clipboard.writeText(reply);
        this.setStatus("Жауап көшірілді. Клиентке жібермес бұрын мәтінді тексеріңіз.");
    }
};
