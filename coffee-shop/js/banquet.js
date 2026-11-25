// Банкет залдары модулі
const banquetModule = {
    selectedHall: null,
    
    render() {
        const mainContent = document.getElementById('mainContent');
        if (!mainContent) return;
        
        const halls = [
            {
                id: 1,
                name: 'VIP Зал',
                category: 'VIP',
                capacity: 50,
                price: 80000,
                location: 'Астана, Достық 13',
                equipment: ['Проектор', 'Микрофон', 'Музыкалық жүйе', 'Wi-Fi'],
                description: 'VIP зал - біздің ресторанның ең жайлы және элиталық залы. Кішігірім мерекелер мен бизнес-кездесулерге арналған.',
                image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&h=600&fit=crop',
                stats: { bookings: 24, capacity: 50, rating: 4.8, price: 80000 }
            },
            {
                id: 2,
                name: 'Банкет залы',
                category: 'Банкет',
                capacity: 100,
                price: 120000,
                location: 'Астана, Достық 13',
                equipment: ['Сцена', 'Дыбыс жүйесі', 'Дыбыс қосылымы', 'Проектор'],
                description: 'Үлкен банкет залы - отбасылық мерекелер мен корпоративтік оқиғаларға арналған.',
                image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&h=600&fit=crop',
                stats: { bookings: 18, capacity: 100, rating: 4.9, price: 120000 }
            },
            {
                id: 3,
                name: 'Үйлену залы',
                category: 'Үйлену',
                capacity: 150,
                price: 150000,
                location: 'Астана, Достық 13',
                equipment: ['Той үстелдері', 'Декорация', 'Фото зона', 'Сцена'],
                description: 'Үйлену залы - тойлар мен салтанатты шараларға арналған ерекше дизайн.',
                image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&h=600&fit=crop',
                stats: { bookings: 32, capacity: 150, rating: 5.0, price: 150000 }
            },
            {
                id: 4,
                name: 'Корпоративтік зал',
                category: 'Корпоратив',
                capacity: 80,
                price: 100000,
                location: 'Астана, Достық 13',
                equipment: ['Бизнес-презентация', 'Кофе-брейк', 'Проектор', 'Wi-Fi'],
                description: 'Корпоративтік зал - іскерлік кездесулер мен компаниялық іс-шараларға арналған.',
                image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=600&fit=crop',
                stats: { bookings: 15, capacity: 80, rating: 4.7, price: 100000 }
            },
            {
                id: 5,
                name: 'Той залы',
                category: 'Той',
                capacity: 120,
                price: 130000,
                location: 'Астана, Достық 13',
                equipment: ['Той үстелдері', 'Декорация', 'Музыка', 'Фото зона'],
                description: 'Той залы - үлкен отбасылық мерекелер мен тойларға арналған.',
                image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&h=600&fit=crop',
                stats: { bookings: 28, capacity: 120, rating: 4.8, price: 130000 }
            }
        ];
        
        this.selectedHall = halls[0]; // Әдепкі бойынша бірінші залды таңдаймыз
        
        mainContent.innerHTML = `
            <div class="banquet-page">
                <div class="banquet-header">
                    <div class="banquet-logo">Ресторан</div>
                    <div class="banquet-header-actions">
                        <button class="btn-header btn-header-grey">Барлық есептер</button>
                        <button class="btn-header btn-header-green" onclick="banquetModule.showBookingForm()">Жаңа брондау</button>
                        <div class="banquet-user-icon">👤</div>
                    </div>
                </div>
                
                <div class="banquet-main-hall">
                    <div class="banquet-main-hall-bg" style="background-image: url('${this.selectedHall.image}')">
                        <div class="banquet-main-hall-overlay"></div>
                    </div>
                    <div class="banquet-main-hall-card">
                        <div class="banquet-main-hall-logo">
                            <div class="banquet-logo-icon">🏛️</div>
                        </div>
                        <div class="banquet-main-hall-info">
                            <h2 class="banquet-main-hall-name">${this.selectedHall.name}</h2>
                            <p class="banquet-main-hall-category">${this.selectedHall.category} Залары</p>
                            <p class="banquet-main-hall-location">📍 ${this.selectedHall.location}</p>
                            <p class="banquet-main-hall-description">${this.selectedHall.description}</p>
                        </div>
                    </div>
                    <div class="banquet-main-hall-stats">
                        <h3 class="banquet-stats-title">АКТИВНЫЕ БРОНИРОВАНИЯ</h3>
                        <div class="banquet-stats-grid">
                            <div class="banquet-stat-item">
                                <div class="banquet-stat-value">${this.selectedHall.stats.bookings}</div>
                                <div class="banquet-stat-label">Брондаулар</div>
                            </div>
                            <div class="banquet-stat-item">
                                <div class="banquet-stat-value">${this.selectedHall.stats.capacity}</div>
                                <div class="banquet-stat-label">Сыйымдылық</div>
                            </div>
                            <div class="banquet-stat-item">
                                <div class="banquet-stat-value">${this.selectedHall.stats.rating}</div>
                                <div class="banquet-stat-label">Рейтинг</div>
                            </div>
                            <div class="banquet-stat-item">
                                <div class="banquet-stat-value">${this.selectedHall.stats.price.toLocaleString()} ₸</div>
                                <div class="banquet-stat-label">Бағасы</div>
                            </div>
                            <div class="banquet-stat-item">
                                <div class="banquet-stat-value">${Math.floor(this.selectedHall.stats.bookings / this.selectedHall.stats.capacity * 100)}%</div>
                                <div class="banquet-stat-label">Толтырылған</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="banquet-halls-list">
                    ${halls.map((hall, index) => `
                        <div class="banquet-hall-item ${index === 0 ? 'active' : ''}" onclick="banquetModule.selectHall(${hall.id})">
                            <div class="banquet-hall-thumbnail">
                                <img src="${hall.image}" alt="${hall.name}" 
                                     onerror="this.src='https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=200&h=200&fit=crop'">
                            </div>
                            <div class="banquet-hall-details">
                                <div class="banquet-hall-date">${new Date().toLocaleDateString('kk-KZ', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}</div>
                                <div class="banquet-hall-name">${hall.name}</div>
                                <div class="banquet-hall-category">${hall.category}</div>
                                <div class="banquet-hall-location">📍 ${hall.location}</div>
                                <div class="banquet-hall-schedule">
                                    <div class="banquet-schedule-time">10:00 - 23:00</div>
                                    <div class="banquet-schedule-days">
                                        <span class="banquet-day">ДҮЙ</span>
                                        <span class="banquet-day">СЕЙ</span>
                                        <span class="banquet-day">СӘР</span>
                                        <span class="banquet-day">БЕЙ</span>
                                        <span class="banquet-day">ЖҰМ</span>
                                        <span class="banquet-day">СЕН</span>
                                        <span class="banquet-day">ЖЕК</span>
                                    </div>
                                </div>
                                ${index === 1 ? `
                                    <div class="banquet-hall-summary">
                                        <div class="banquet-summary-item">${hall.price.toLocaleString()} ₸ Күндік бюджет</div>
                                        <div class="banquet-summary-item">${hall.stats.bookings} Брондаулар</div>
                                        <div class="banquet-summary-item">${hall.stats.capacity} Сыйымдылық</div>
                                        <div class="banquet-summary-item">${hall.stats.rating} Рейтинг</div>
                                        <div class="banquet-summary-item">${hall.stats.price.toLocaleString()} ₸ Траты</div>
                                    </div>
                                ` : ''}
                            </div>
                            <div class="banquet-hall-shares">
                                <div class="banquet-shares-title">МАКС БРОНИРОВАНИЙ В ДЕНЬ</div>
                                <div class="banquet-shares-price">${hall.price.toLocaleString()} ₸/күн</div>
                                <div class="banquet-shares-platforms">
                                    <div class="banquet-share-platform">
                                        <div class="banquet-share-circle active">${Math.floor(hall.stats.bookings * 0.4)}</div>
                                        <div class="banquet-share-label">${hall.stats.bookings}</div>
                                    </div>
                                    <div class="banquet-share-platform">
                                        <div class="banquet-share-circle active">${Math.floor(hall.stats.bookings * 0.3)}</div>
                                        <div class="banquet-share-label">${hall.stats.bookings}</div>
                                    </div>
                                    <div class="banquet-share-platform">
                                        <div class="banquet-share-circle">0</div>
                                        <div class="banquet-share-label">0</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        this.halls = halls;
    },
    
    selectHall(hallId) {
        const hall = this.halls.find(h => h.id === hallId);
        if (!hall) return;
        
        this.selectedHall = hall;
        this.render();
    },

    showBookingForm(hallName = null) {
        const hall = hallName ? this.halls.find(h => h.name === hallName) : this.selectedHall;
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Банкет залын брондау: ${hall ? hall.name : 'Зал'}</h2>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <form onsubmit="banquetModule.submitBooking(event, ${hall ? hall.id : 'null'})">
                    <div class="form-group">
                        <label>Зал:</label>
                        <select id="banquetHall" required>
                            ${this.halls.map(h => `
                                <option value="${h.id}" ${hall && h.id === hall.id ? 'selected' : ''}>${h.name}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Аты-жөні:</label>
                        <input type="text" id="banquetName" required>
                    </div>
                    <div class="form-group">
                        <label>Телефон:</label>
                        <input type="tel" id="banquetPhone" placeholder="+7 (___) ___-__-__" required>
                    </div>
                    <div class="form-group">
                        <label>Күні:</label>
                        <input type="date" id="banquetDate" required>
                    </div>
                    <div class="form-group">
                        <label>Уақыт:</label>
                        <input type="time" id="banquetTime" required>
                    </div>
                    <div class="form-group">
                        <label>Адам саны:</label>
                        <input type="number" id="banquetGuests" min="1" max="${hall ? hall.capacity : 200}" required>
                    </div>
                    <div class="form-group">
                        <label>Ескертпе:</label>
                        <textarea id="banquetNotes" rows="3" placeholder="Қосымша ақпарат..."></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-success">Брондау</button>
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Болдырмау</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Телефон үшін маска - дәл 11 цифр
        const phoneInput = document.getElementById('banquetPhone');
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

    submitBooking(e, hallId) {
        e.preventDefault();
        const hall = this.halls.find(h => h.id === hallId) || this.halls[0];
        const name = storage && storage.sanitizeInput ? storage.sanitizeInput(document.getElementById('banquetName').value) : document.getElementById('banquetName').value;
        let phone = document.getElementById('banquetPhone').value.replace(/\D/g, ''); // Тек цифрларды алу
        const date = document.getElementById('banquetDate').value;
        const time = document.getElementById('banquetTime').value;
        const guests = parseInt(document.getElementById('banquetGuests').value);
        const notes = document.getElementById('banquetNotes') ? (storage && storage.sanitizeInput ? storage.sanitizeInput(document.getElementById('banquetNotes').value) : document.getElementById('banquetNotes').value) : '';

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

        const booking = {
            hallId: hallId || hall.id,
            hallName: hall.name,
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
            storage.create('banquetBookings', booking);
        }

        if (auth && auth.showNotification) {
            auth.showNotification('Банкет залы брондалды! Біз сізбен жақын арада байланысамыз.', 'success');
        }
        document.querySelector('.modal').remove();
    }
};

