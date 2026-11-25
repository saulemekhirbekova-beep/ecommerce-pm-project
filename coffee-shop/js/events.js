// Оқиғалар модулі
const eventsModule = {
    render() {
        const mainContent = document.getElementById('mainContent');
        if (!mainContent) return;
        
        mainContent.innerHTML = `
            <div class="events-page">
                <div class="events-header">
                    <div class="events-header-balloons">
                        <span class="balloon balloon-1">🎈</span>
                        <span class="balloon balloon-2">🎈</span>
                        <span class="balloon balloon-3">🎈</span>
                    </div>
                    <h1 class="events-main-title">РЕДАКТИРЛЕНЕТІН ЖАЗБАЛАР ҮЛГІСІ</h1>
                </div>
                
                <div class="events-grid">
                    <!-- Туған күн -->
                    <div class="event-card event-card-pink" data-event="birthday">
                        <div class="event-card-image-wrapper">
                            <img src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&h=400&fit=crop" 
                                 alt="Туған күн мерекесі" 
                                 class="event-card-image"
                                 onerror="this.src='https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&h=400&fit=crop'">
                            <div class="event-card-image-overlay"></div>
                        </div>
                        <div class="event-card-header">
                            <h2 class="event-card-title">МЕРЕКЕЛЕР</h2>
                        </div>
                        <div class="event-card-content">
                            <p class="event-card-subtitle">Ұйымдастыру, өткізу, безендіру</p>
                            <h3 class="event-card-main-title">ТУҒАН КҮН МЕРЕКЕЛЕРІ</h3>
                            <div class="event-card-decorations">
                                <span class="sparkle sparkle-1">✨</span>
                                <span class="sparkle sparkle-2">✨</span>
                                <span class="sparkle sparkle-3">✨</span>
                                <div class="event-cake">🎂</div>
                                <div class="event-balloons">
                                    <span class="balloon-small balloon-pink">🎈</span>
                                    <span class="balloon-small balloon-gold">🎈</span>
                                </div>
                            </div>
                        </div>
                        <div class="event-card-footer">
                            <p class="event-card-brand">Мереке агенттігі "Бәріне қуаныш"</p>
                            <p class="event-card-phone">+7 (700) 123-45-67</p>
                        </div>
                        <button class="event-card-btn" onclick="eventsModule.showBookingForm('birthday')">Брондау</button>
                    </div>
                    
                    <!-- Мерекелерді безендіру -->
                    <div class="event-card event-card-cream" data-event="decoration">
                        <div class="event-card-image-wrapper">
                            <img src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&h=400&fit=crop" 
                                 alt="Праздниктерді безендіру" 
                                 class="event-card-image"
                                 onerror="this.src='https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&h=400&fit=crop'">
                            <div class="event-card-image-overlay"></div>
                        </div>
                        <div class="event-card-header">
                            <p class="event-card-slogan-top-left">Атмосфера мен көңіл-күй жасаймыз!</p>
                            <p class="event-card-slogan-top-right">Біз өз ісімізде ең үздігіміз</p>
                        </div>
                        <div class="event-card-content">
                            <h3 class="event-card-main-title">МЕРЕКЕЛЕРДІ БЕЗЕНДІРУ</h3>
                            <div class="event-card-decorations">
                                <span class="sparkle sparkle-1">✨</span>
                                <span class="sparkle sparkle-2">✨</span>
                                <div class="event-decoration-left">🎈</div>
                                <div class="event-decoration-right">🎂</div>
                            </div>
                            <ul class="event-services-list">
                                <li>Ауа шары: флористика</li>
                                <li>Фото аймақтары: музыка, диджей</li>
                                <li>Сұрау бойынша бағдарлама</li>
                            </ul>
                        </div>
                        <div class="event-card-footer">
                            <p class="event-card-instagram">@restaurant_astana</p>
                        </div>
                        <button class="event-card-btn" onclick="eventsModule.showBookingForm('decoration')">Брондау</button>
                    </div>
                    
                    <!-- Кештер -->
                    <div class="event-card event-card-cream" data-event="party">
                        <div class="event-card-image-wrapper">
                            <img src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&h=400&fit=crop" 
                                 alt="Кеш" 
                                 class="event-card-image"
                                 onerror="this.src='https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=400&fit=crop'">
                            <div class="event-card-image-overlay"></div>
                        </div>
                        <div class="event-card-header">
                            <h2 class="event-card-title">МЕРЕКЕЛЕР</h2>
                        </div>
                        <div class="event-card-content">
                            <h3 class="event-card-main-title">КЕШТЕР<br>кез келген дәмге</h3>
                            <div class="event-card-decorations">
                                <span class="sparkle sparkle-1">✨</span>
                                <span class="sparkle sparkle-2">✨</span>
                                <div class="event-disco-ball">🪩</div>
                            </div>
                            <ul class="event-services-list">
                                <li>Атмосфералық декор және жарық</li>
                                <li>DJ, фото, бағдарлама</li>
                            </ul>
                        </div>
                        <div class="event-card-footer">
                            <p class="event-card-instagram">@restaurant_astana</p>
                            <p class="event-card-phone">+7 (700) 123-45-67</p>
                        </div>
                        <button class="event-card-btn" onclick="eventsModule.showBookingForm('party')">Брондау</button>
                    </div>
                    
                    <!-- Қыздар кеші -->
                    <div class="event-card event-card-pink" data-event="bachelorette">
                        <div class="event-card-image-wrapper">
                            <img src="https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&h=400&fit=crop" 
                                 alt="Қыздар кеші" 
                                 class="event-card-image"
                                 onerror="this.src='https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&h=400&fit=crop'">
                            <div class="event-card-image-overlay"></div>
                        </div>
                        <div class="event-card-header">
                            <h2 class="event-card-title">ҚЫЗДАР КЕШІН ҰЙЫМДАСТЫРУ</h2>
                        </div>
                        <div class="event-card-content">
                            <p class="event-card-subtitle">Жабық атмосфера, жарқын эмоциялар</p>
                            <p class="event-card-description">Кештер мен мерекелер<br>"Тек өздеріңізге"</p>
                            <div class="event-card-decorations">
                                <span class="sparkle sparkle-1">✨</span>
                                <span class="sparkle sparkle-2">✨</span>
                                <div class="event-girls">
                                    <span class="girl-emoji">👩</span>
                                    <span class="girl-emoji">👩</span>
                                </div>
                            </div>
                            <ul class="event-services-list">
                                <li>Декор, музыка, жетекші: фотосессия</li>
                                <li>Жеке сценарий және безендіру</li>
                            </ul>
                        </div>
                        <div class="event-card-footer">
                            <p class="event-card-brand">Мереке агенттігі "Бәріне қуаныш"</p>
                            <p class="event-card-phone">+7 (700) 123-45-67</p>
                        </div>
                        <button class="event-card-btn" onclick="eventsModule.showBookingForm('bachelorette')">Брондау</button>
                    </div>
                    
                    <!-- Таңқаларлық кештер -->
                    <div class="event-card event-card-cream" data-event="surprise">
                        <div class="event-card-image-wrapper">
                            <img src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&h=400&fit=crop" 
                                 alt="Таңқаларлық кеш" 
                                 class="event-card-image"
                                 onerror="this.src='https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&h=400&fit=crop'">
                            <div class="event-card-image-overlay"></div>
                        </div>
                        <div class="event-card-header">
                            <h2 class="event-card-title">МЕРЕКЕЛЕР</h2>
                        </div>
                        <div class="event-card-content">
                            <h3 class="event-card-main-title">ТАҢҚАЛАРЛЫҚ КЕШТЕР</h3>
                            <p class="event-card-slogan">Армандаған мереке!</p>
                            <div class="event-card-decorations">
                                <span class="sparkle sparkle-1">✨</span>
                                <span class="sparkle sparkle-2">✨</span>
                                <div class="event-party-hats">
                                    <span class="party-hat">🎉</span>
                                    <span class="party-hat">🎉</span>
                                </div>
                            </div>
                            <p class="event-card-details">Декор, қонақтар, эмоциялар</p>
                        </div>
                        <div class="event-card-footer">
                            <p class="event-card-brand">Мереке агенттігі "Бәріне қуаныш"</p>
                        </div>
                        <button class="event-card-btn" onclick="eventsModule.showBookingForm('surprise')">Брондау</button>
                    </div>
                    
                    <!-- Үйлену тойы -->
                    <div class="event-card event-card-pink" data-event="wedding">
                        <div class="event-card-image-wrapper">
                            <img src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&h=400&fit=crop" 
                                 alt="Үйлену тойы" 
                                 class="event-card-image"
                                 onerror="this.src='https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&h=400&fit=crop'">
                            <div class="event-card-image-overlay"></div>
                        </div>
                        <div class="event-card-header">
                            <h2 class="event-card-title">ҮЙЛЕНУ ТОЙЫ</h2>
                        </div>
                        <div class="event-card-content">
                            <h3 class="event-card-main-title">АРМАНДАҒАН ҮЙЛЕНУ ТОЙЫН ҰЙЫМДАСТЫРУ</h3>
                            <p class="event-card-slogan">Біз жоспарлаймыз - Сіз дем аласыз!</p>
                            <div class="event-card-decorations">
                                <span class="sparkle sparkle-1">✨</span>
                                <span class="sparkle sparkle-2">✨</span>
                                <div class="event-wedding-icon">💍</div>
                                <div class="event-wedding-balloons">
                                    <span class="balloon-small balloon-pink">🎈</span>
                                    <span class="balloon-small balloon-pink">🎈</span>
                                </div>
                            </div>
                        </div>
                        <div class="event-card-footer">
                            <p class="event-card-brand">Мереке агенттігі "Бәріне қуаныш"</p>
                            <p class="event-card-phone">+7 (700) 123-45-67</p>
                        </div>
                        <button class="event-card-btn" onclick="eventsModule.showBookingForm('wedding')">Брондау</button>
                    </div>
                </div>
                
                <div class="events-footer">
                    <button class="btn-events-website" onclick="eventsModule.showEventForm()">Веб-сайтты ашу</button>
                </div>
            </div>
        `;
        
        // Анимацияларды іске қосамыз
        setTimeout(() => {
            this.animateCards();
        }, 100);
    },
    
    animateCards() {
        const cards = document.querySelectorAll('.event-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(30px)';
                card.style.transition = 'all 0.6s ease';
                
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 50);
            }, index * 100);
        });
    },

    showBookingForm(eventType) {
        const eventNames = {
            birthday: 'Туған күн мерекесі',
            decoration: 'Мерекелерді безендіру',
            party: 'Кеш',
            bachelorette: 'Қыздар кеші',
            surprise: 'Таңқаларлық кеш',
            wedding: 'Үйлену тойы'
        };
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Оқиғаға тапсырыс</h2>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <form onsubmit="eventsModule.submitEventRequest(event, '${eventType}')">
                    <div class="form-group">
                        <label>Оқиға түрі:</label>
                        <input type="text" id="eventType" value="${eventNames[eventType] || eventType}" readonly>
                    </div>
                    <div class="form-group">
                        <label>Аты-жөні:</label>
                        <input type="text" id="eventName" required>
                    </div>
                    <div class="form-group">
                        <label>Телефон:</label>
                        <input type="tel" id="eventPhone" placeholder="+7 (___) ___-__-__" required>
                    </div>
                    <div class="form-group">
                        <label>Күні:</label>
                        <input type="date" id="eventDate" required>
                    </div>
                    <div class="form-group">
                        <label>Уақыт:</label>
                        <input type="time" id="eventTime" required>
                    </div>
                    <div class="form-group">
                        <label>Адам саны:</label>
                        <input type="number" id="eventGuests" min="1" required>
                    </div>
                    <div class="form-group">
                        <label>Ескертпе:</label>
                        <textarea id="eventNotes" rows="3" placeholder="Қосымша ақпарат..."></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-success">Жіберу</button>
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Болдырмау</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Телефон үшін маска - дәл 11 цифр
        const phoneInput = document.getElementById('eventPhone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                
                // Егер 8-ден басталса, оны 7-ге ауыстыру
                if (value.startsWith('8')) {
                    value = '7' + value.substring(1);
                }
                
                // 11 цифрдан артық емес
                if (value.length > 11) {
                    value = value.substring(0, 11);
                }
                
                if (value.length > 0) {
                    // Егер 7-ден басталмаса, алдына 7-ді қосу (тек 10 цифр болса)
                    if (!value.startsWith('7') && value.length === 10) {
                        value = '7' + value;
                    }
                    
                    // Форматирование: +7 (XXX) XXX-XX-XX
                    if (value.startsWith('7') && value.length <= 11) {
                        let formatted = '+7 (';
                        if (value.length > 1) formatted += value.substring(1, Math.min(4, value.length));
                        if (value.length > 4) {
                            formatted += ') ' + value.substring(4, Math.min(7, value.length));
                            if (value.length > 7) {
                                formatted += '-' + value.substring(7, Math.min(9, value.length));
                                if (value.length > 9) {
                                    formatted += '-' + value.substring(9, 11);
                                }
                            }
                        }
                        e.target.value = formatted;
                    } else {
                        e.target.value = value;
                    }
                } else {
                    e.target.value = '';
                }
            });
        }
    },
    
    showEventForm() {
        this.showBookingForm('general');
    },

    submitEventRequest(e, eventType) {
        e.preventDefault();
        const name = storage && storage.sanitizeInput ? storage.sanitizeInput(document.getElementById('eventName').value) : document.getElementById('eventName').value;
        let phone = document.getElementById('eventPhone').value.replace(/\D/g, ''); // Тек цифрларды алу
        const date = document.getElementById('eventDate').value;
        const time = document.getElementById('eventTime').value;
        const guests = parseInt(document.getElementById('eventGuests').value);
        const notes = document.getElementById('eventNotes') ? (storage && storage.sanitizeInput ? storage.sanitizeInput(document.getElementById('eventNotes').value) : document.getElementById('eventNotes').value) : '';

        // Егер 8-ден басталса, оны 7-ге ауыстыру
        if (phone.startsWith('8')) {
            phone = '7' + phone.substring(1);
        }
        // Егер 7-ден басталмаса және 10 цифр болса, 7-ді қосу
        if (!phone.startsWith('7') && phone.length === 10) {
            phone = '7' + phone;
        }
        
        // Валидация: дәл 11 цифр болуы керек
        if (phone.length !== 11) {
            if (auth && auth.showNotification) {
                auth.showNotification('Телефон нөмірі дәл 11 цифрдан тұруы керек!', 'error');
            } else {
                alert('Телефон нөмірі дәл 11 цифрдан тұруы керек!');
            }
            return;
        }
        
        // Форматированное значение для сохранения: +7 (XXX) XXX-XX-XX
        phone = '+7 (' + phone.substring(1, 4) + ') ' + phone.substring(4, 7) + '-' + phone.substring(7, 9) + '-' + phone.substring(9, 11);

        const eventRequest = {
            eventType: eventType || 'general',
            customerName: name,
            phone,
            date,
            time,
            guestCount: guests,
            notes,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        if (storage && storage.create) {
            storage.create('eventBookings', eventRequest);
        }

        if (auth && auth.showNotification) {
            auth.showNotification('Тапсырыс сәтті жіберілді! Біз сізбен жақын арада байланысамыз.', 'success');
        }
        document.querySelector('.modal').remove();
    }
};

