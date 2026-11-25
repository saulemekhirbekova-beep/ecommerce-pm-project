// Пікірлер модулі
const reviewsModule = {
    currentIndex: 0,
    reviewsPerPage: 3,
    
    render() {
        const mainContent = document.getElementById('mainContent');
        const allReviews = storage.read('reviews') || [];
        
        // Егер пікірлер жоқ болса, мысалдар қосамыз
        if (allReviews.length === 0) {
            const sampleReviews = [
                {
                    reviewerName: 'Айгүл М.',
                    date: new Date(2023, 8, 15).toISOString(),
                    reviewText: 'Біздің отбасылық мереке үшін үстел брондадық. Әдемі атмосфера, дәмді тағамдар және керемет қызмет! Барлығы өте таза және жайлы. Ұсынылады!',
                    rating: 5,
                    isSample: true
                },
                {
                    reviewerName: 'Нұрлан К.',
                    date: new Date(2023, 9, 22).toISOString(),
                    reviewText: 'Корпоративтік кеш өткіздік. Персонал өте мейірімді және көмекші. Тағамдар дәмді, порциялар үлкен. Біз қуанышты болдық!',
                    rating: 5,
                    isSample: true
                },
                {
                    reviewerName: 'Марат С.',
                    date: new Date(2023, 10, 5).toISOString(),
                    reviewText: 'Бірнеше жыл бойы бұл ресторанға келеміз. Сапасы тұрақты, бағасы ақылға сыйымды. Ең сүйікті жеріміз!',
                    rating: 5,
                    isSample: true
                }
            ];
            sampleReviews.forEach(review => {
                storage.create('reviews', review);
            });
        }
        
        const reviews = storage.read('reviews') || [];
        
        mainContent.innerHTML = `
            <div class="reviews-page">
                <div class="reviews-header">
                    <h2 class="reviews-title">КЛИЕНТТЕР БІЗ ТУРАЛЫ</h2>
                    <button class="btn btn-success" onclick="reviewsModule.showReviewForm()">Пікір қалдыру</button>
                </div>
                ${typeof aiAssistant !== "undefined" ? aiAssistant.panel(reviews) : ""}
                
                <div class="reviews-carousel-container">
                    <button class="reviews-nav-btn reviews-nav-prev" onclick="reviewsModule.prevReviews()" id="prevBtn">
                        <span>←</span>
                    </button>
                    
                    <div class="reviews-carousel-wrapper">
                        <div id="reviewsCarousel" class="reviews-carousel">
                            ${this.getReviewsHTML(reviews)}
                        </div>
                    </div>
                    
                    <button class="reviews-nav-btn reviews-nav-next" onclick="reviewsModule.nextReviews()" id="nextBtn">
                        <span>→</span>
                    </button>
                </div>
                
                <div class="reviews-actions">
                    <button class="btn-reviews-all" onclick="reviewsModule.showAllReviews()">Пікірлерге өту</button>
                    <button class="btn-review-add" onclick="reviewsModule.showReviewForm()">Пікір қалдыру</button>
                </div>
                
                <div id="allReviewsSection" class="all-reviews-section" style="display: none;">
                    <h3>Барлық пікірлер</h3>
                    <div id="allReviewsList" class="all-reviews-list"></div>
                </div>
            </div>
        `;
        
        this.allReviews = reviews;
        this.updateCarousel();
    },
    
    getReviewsHTML(reviews) {
        if (reviews.length === 0) {
            return '<div class="reviews-empty">Пікірлер әлі жоқ. Бірінші болып пікір қалдырыңыз!</div>';
        }
        
        // Бір ретте 3 пікір көрсетеміз
        const startIndex = this.currentIndex;
        const endIndex = Math.min(startIndex + this.reviewsPerPage, reviews.length);
        const visibleReviews = reviews.slice(startIndex, endIndex);
        
        // Егер пікірлер 3-тен аз болса, ортаға орналастыру үшін бос карточкалар қосамыз
        const emptyCards = this.reviewsPerPage - visibleReviews.length;
        
        return visibleReviews.map((review, index) => {
            const reviewDate = new Date(review.createdAt || review.date);
            const dateStr = reviewDate.toLocaleDateString('kk-KZ', { 
                month: 'long', 
                year: 'numeric',
                day: 'numeric'
            });
            const shortText = review.reviewText || review.text || '';
            const isLong = shortText.length > 150;
            const displayText = isLong ? shortText.substring(0, 150) + '...' : shortText;
            
            return `
                <div class="review-card ${index === 0 ? 'active' : ''}" data-index="${startIndex + index}">
                    <div class="review-card-image">
                        <img src="https://i.pravatar.cc/150?img=${startIndex + index + 1}" 
                             alt="${review.reviewerName || review.name}" 
                             onerror="this.src='https://via.placeholder.com/150'">
                    </div>
                    <div class="review-card-content">
                        <div class="review-card-header">
                            <div class="review-card-name">${review.reviewerName || review.name}</div>
                            <div class="review-card-date">${dateStr}</div>
                        </div>
                        <div class="review-card-rating">
                            ${'⭐'.repeat(review.rating || 5)}
                        </div>
                        <div class="review-card-text">${displayText}</div>
                        ${typeof aiAssistant !== "undefined" ? aiAssistant.card(review) : ""}
                        ${isLong ? `<a href="#" class="review-read-more" onclick="reviewsModule.readFullReview(${review.id || startIndex + index}); return false;">толығырақ оқу</a>` : ''}
                    </div>
                </div>
            `;
        }).join('') + Array(emptyCards).fill('<div class="review-card empty"></div>').join('');
    },
    
    updateCarousel() {
        const carousel = document.getElementById('reviewsCarousel');
        if (!carousel) return;
        
        const reviews = storage.read('reviews') || [];
        carousel.innerHTML = this.getReviewsHTML(reviews);
        
        // Навигация батырмаларын жаңартамыз
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) {
            prevBtn.style.display = this.currentIndex > 0 ? 'flex' : 'none';
        }
        if (nextBtn) {
            nextBtn.style.display = this.currentIndex + this.reviewsPerPage < reviews.length ? 'flex' : 'none';
        }
    },
    
    prevReviews() {
        if (this.currentIndex > 0) {
            this.currentIndex -= this.reviewsPerPage;
            if (this.currentIndex < 0) this.currentIndex = 0;
            this.updateCarousel();
        }
    },
    
    nextReviews() {
        const reviews = storage.read('reviews') || [];
        if (this.currentIndex + this.reviewsPerPage < reviews.length) {
            this.currentIndex += this.reviewsPerPage;
            this.updateCarousel();
        }
    },
    
    readFullReview(reviewId) {
        const reviews = storage.read('reviews') || [];
        const review = reviews.find(r => (r.id || 0) === reviewId) || reviews[reviewId];
        if (!review) return;
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${review.reviewerName || review.name}</h2>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div class="review-full-content">
                    <div class="review-full-rating">${'⭐'.repeat(review.rating || 5)}</div>
                    <div class="review-full-date">${new Date(review.createdAt || review.date).toLocaleDateString('kk-KZ')}</div>
                    <p class="review-full-text">${review.reviewText || review.text || ''}</p>
                </div>
                <div class="form-actions">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Жабу</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },
    
    showAllReviews() {
        const allReviewsSection = document.getElementById('allReviewsSection');
        const allReviewsList = document.getElementById('allReviewsList');
        
        if (!allReviewsSection || !allReviewsList) return;
        
        if (allReviewsSection.style.display === 'none') {
            allReviewsSection.style.display = 'block';
            const reviews = storage.read('reviews') || [];
            
            allReviewsList.innerHTML = reviews.map(review => {
                const reviewDate = new Date(review.createdAt || review.date);
                const dateStr = reviewDate.toLocaleDateString('kk-KZ');
                
                return `
                    <div class="all-review-item">
                        <div class="all-review-header">
                            <div class="all-review-avatar">
                                <img src="https://i.pravatar.cc/80?img=${Math.random() * 70}" 
                                     alt="${review.reviewerName || review.name}"
                                     onerror="this.src='https://via.placeholder.com/80'">
                            </div>
                            <div class="all-review-info">
                                <div class="all-review-name">${review.reviewerName || review.name}</div>
                                <div class="all-review-date">${dateStr}</div>
                                <div class="all-review-rating">${'⭐'.repeat(review.rating || 5)}</div>
                            </div>
                        </div>
                        <div class="all-review-text">${review.reviewText || review.text || ''}</div>
                        ${typeof aiAssistant !== "undefined" ? aiAssistant.card(review) : ""}
                    </div>
                `;
            }).join('');
        } else {
            allReviewsSection.style.display = 'none';
        }
    },

    showReviewForm() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Пікір қалдыру</h2>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <form onsubmit="reviewsModule.submitReview(event)">
                    <div class="form-group">
                        <label>Аты-жөні:</label>
                        <input type="text" id="reviewName" required value="${auth && auth.currentUser && auth.currentUser.role === 'guest' ? 'Қонақ' : ''}">
                    </div>
                    <div class="form-group">
                        <label>Бағалау:</label>
                        <select id="reviewRating" required>
                            <option value="">Таңдаңыз...</option>
                            <option value="5">⭐⭐⭐⭐⭐ (Өте жақсы)</option>
                            <option value="4">⭐⭐⭐⭐ (Жақсы)</option>
                            <option value="3">⭐⭐⭐ (Орташа)</option>
                            <option value="2">⭐⭐ (Нашар)</option>
                            <option value="1">⭐ (Өте нашар)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Пікір:</label>
                        <textarea id="reviewText" rows="5" required placeholder="Пікіріңізді жазыңыз..."></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-success">Жіберу</button>
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Болдырмау</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
    },

    submitReview(e) {
        e.preventDefault();
        const name = storage.sanitizeInput(document.getElementById('reviewName').value);
        const rating = parseInt(document.getElementById('reviewRating').value);
        const text = storage.sanitizeInput(document.getElementById('reviewText').value);
        if (!name || !text || !rating) return;

        const review = storage.create('reviews', {
            reviewerName: name,
            rating,
            reviewText: text,
            createdAt: new Date().toISOString(),
            isSample: false
        });

        document.querySelector('.modal').remove();
        const total = (storage.read('reviews') || []).length;
        this.currentIndex = Math.floor(Math.max(0, total - 1) / this.reviewsPerPage) * this.reviewsPerPage;
        if (auth && auth.showNotification) {
            auth.showNotification('Пікір сақталды. Автоматты оқу басталды.', 'success');
        }
        if (typeof aiAssistant !== "undefined") {
            aiAssistant.analyzeOne(review.id);
        } else {
            this.render();
        }
    }
};

