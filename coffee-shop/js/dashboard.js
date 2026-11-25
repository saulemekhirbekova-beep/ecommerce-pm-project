// Главная страница (Dashboard)
const dashboardModule = {
    render() {
        const mainContent = document.getElementById('mainContent');
        const role = auth.currentUser?.role;
        
        mainContent.innerHTML = `
            <div class="content-section">
                <h2>Басты бет</h2>
                <p style="font-size: 18px; margin-bottom: 30px;">Қош келдіңіз, ${auth.currentUser?.name || auth.currentUser?.username}!</p>
                
                <!-- Ресторан фото слайдер -->
                <div class="restaurant-slider" style="margin-bottom: 30px;">
                    <div class="restaurant-slider-container" id="restaurantSlider">
                        <div class="restaurant-slide active">
                            <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=600&fit=crop" alt="Ресторан интерьері">
                            <div class="restaurant-slide-overlay">
                                <h3>Элегантты интерьер</h3>
                                <p>Қонақтарға арналған жайлы атмосфера</p>
                            </div>
                        </div>
                        <div class="restaurant-slide">
                            <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=600&fit=crop" alt="Ресторан залы">
                            <div class="restaurant-slide-overlay">
                                <h3>Кең зал</h3>
                                <p>Отбасылық кештерге арналған орын</p>
                            </div>
                        </div>
                        <div class="restaurant-slide">
                            <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=600&fit=crop" alt="Тағамдар">
                            <div class="restaurant-slide-overlay">
                                <h3>Дәмізді тағамдар</h3>
                                <p>Шебер аспаздардың дайындаған тағамдары</p>
                            </div>
                        </div>
                        <div class="restaurant-slide">
                            <img src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&h=600&fit=crop" alt="Ресторан атмосферасы">
                            <div class="restaurant-slide-overlay">
                                <h3>Ерекше атмосфера</h3>
                                <p>Есте қаларлық кештер</p>
                            </div>
                        </div>
                        <button class="restaurant-slider-btn prev" onclick="dashboardModule.prevRestaurantSlide()">‹</button>
                        <button class="restaurant-slider-btn next" onclick="dashboardModule.nextRestaurantSlide()">›</button>
                        <div class="restaurant-slider-dots" id="restaurantSliderDots"></div>
                    </div>
                </div>
                
                <!-- Ресторан туралы ақпарат -->
                <div style="background: linear-gradient(135deg, #1a5f3f 0%, #2d8659 100%); color: white; padding: 25px; border-radius: 10px; margin-bottom: 30px;">
                    <h3 style="margin-bottom: 20px; font-size: 24px;">🍽️ Ресторан туралы</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                        <div>
                            <strong style="font-size: 16px;">📍 Мекенжай:</strong>
                            <p style="margin-top: 5px; font-size: 18px;">Астана, Достык 13</p>
                            <a href="https://www.google.com/maps/search/Астана+Достык+13" target="_blank" 
                               style="color: white; text-decoration: underline; font-size: 14px;">Картада көрсету</a>
                        </div>
                        <div>
                            <strong style="font-size: 16px;">📞 Байланыс:</strong>
                            <p style="margin-top: 5px; font-size: 18px;">
                                <a href="tel:+77001234567" style="color: white; text-decoration: none;">+7 (700) 123-45-67</a>
                            </p>
                            <p style="font-size: 14px; margin-top: 5px;">Демалыссыз жұмыс істейміз</p>
                        </div>
                    </div>
                </div>

                <!-- Жеңілдіктер және купондар -->
                <div style="background: #fff8e6; border: 2px solid #ffc107; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
                    <h3 style="color: #ff9800; margin-bottom: 15px;">🎁 Жеңілдіктер және купондар</h3>
                    <div class="card-grid" style="margin-top: 15px;">
                        <div class="card" style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); color: white;">
                            <div style="font-size: 32px; font-weight: 700; margin-bottom: 10px;">20%</div>
                            <div style="font-weight: 600; margin-bottom: 5px;">Бірінші тапсырыс</div>
                            <div style="font-size: 12px; opacity: 0.9;">Жаңа клиенттерге</div>
                            <div style="margin-top: 10px; font-size: 11px; opacity: 0.8;">Купон: FIRST20</div>
                        </div>
                        <div class="card" style="background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%); color: white;">
                            <div style="font-size: 32px; font-weight: 700; margin-bottom: 10px;">15%</div>
                            <div style="font-weight: 600; margin-bottom: 5px;">Достық күні</div>
                            <div style="font-size: 12px; opacity: 0.9;">Достық күніне</div>
                            <div style="margin-top: 10px; font-size: 11px; opacity: 0.8;">Купон: FRIEND15</div>
                        </div>
                        <div class="card" style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: #333;">
                            <div style="font-size: 32px; font-weight: 700; margin-bottom: 10px;">10%</div>
                            <div style="font-weight: 600; margin-bottom: 5px;">Лояльность</div>
                            <div style="font-size: 12px; opacity: 0.8;">Тұрақты клиенттерге</div>
                            <div style="margin-top: 10px; font-size: 11px; opacity: 0.7;">Автоматты қолданылады</div>
                        </div>
                    </div>
                </div>

                <!-- Геолокация картасы -->
                <div style="background: white; border: 2px solid #e9ecef; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
                    <h3 style="margin-bottom: 15px;">📍 Біздің орналасқан жеріміз</h3>
                    <div style="width: 100%; height: 300px; background: #f0f0f0; border-radius: 5px; display: flex; align-items: center; justify-content: center; margin-bottom: 15px; position: relative; overflow: hidden;">
                        <iframe 
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2504.1234567890123!2d71.43012345678901!3d51.16912345678901!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTHCsDEwJzA4LjgiTiA3McKwMjUnNDguNCJF!5e0!3m2!1skk!2skz!4v1234567890123!5m2!1skk!2skz" 
                            width="100%" 
                            height="100%" 
                            style="border:0; position: absolute; top: 0; left: 0;" 
                            allowfullscreen="" 
                            loading="lazy" 
                            referrerpolicy="no-referrer-when-downgrade">
                        </iframe>
                    </div>
                    <p style="text-align: center; color: #666;">
                        <strong>Адрес:</strong> Астана қаласы, Достык даңғылы, 13<br>
                        <strong>Жұмыс уақыты:</strong> 09:00 - 23:00 (Демалыссыз)
                    </p>
                </div>

                ${role === 'admin' || role === 'manager' ? `
                    <div style="margin-top: 30px;">
                        <h3>Жалпы статистика</h3>
                        <div class="stats-grid" style="margin-top: 20px;">
                            <div class="stat-card">
                                <div class="stat-label">Жалпы тапсырыстар</div>
                                <div class="stat-value">${this.getTotalOrders()}</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-label">Жалпы табыс</div>
                                <div class="stat-value">${this.getTotalRevenue()} ₸</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-label">Клиенттер</div>
                                <div class="stat-value">${this.getTotalCustomers()}</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-label">Мәзірдегі тағамдар</div>
                                <div class="stat-value">${this.getTotalMenuItems()}</div>
                            </div>
                        </div>
                    </div>
                ` : ''}

                ${role === 'chef' ? `
                    <div style="margin-top: 30px;">
                        <h3>Дайындалудағы тапсырыстар</h3>
                        <div id="preparingOrders" style="margin-top: 20px;"></div>
                    </div>
                ` : ''}

                ${role === 'waiter' ? `
                    <div style="margin-top: 30px;">
                        <h3>Менің тапсырыстарым</h3>
                        <div id="myOrders" style="margin-top: 20px;"></div>
                    </div>
                ` : ''}
            </div>
        `;

        if (role === 'chef') {
            this.renderPreparingOrders();
        }
        if (role === 'waiter') {
            this.renderMyOrders();
        }

        // Инициализация ресторан слайдера
        setTimeout(() => {
            this.initRestaurantSlider();
        }, 100);
    },

    getTodayRevenue() {
        const today = new Date().toDateString();
        const payments = storage.read('payments');
        return payments
            .filter(p => new Date(p.date).toDateString() === today)
            .reduce((sum, p) => sum + p.amount, 0);
    },

    getTodayOrders() {
        const today = new Date().toDateString();
        const orders = storage.read('orders');
        return orders.filter(o => new Date(o.createdAt).toDateString() === today).length;
    },

    getAvailableTables() {
        const tables = storage.read('tables');
        return tables.filter(t => t.status === 'available').length;
    },

    getPendingOrders() {
        const orders = storage.read('orders');
        return orders.filter(o => o.status === 'pending' || o.status === 'preparing').length;
    },

    getTotalOrders() {
        return storage.read('orders').length;
    },

    getTotalRevenue() {
        return storage.read('payments').reduce((sum, p) => sum + p.amount, 0);
    },

    getTotalCustomers() {
        return storage.read('customers').length;
    },

    getTotalMenuItems() {
        return storage.read('menu').length;
    },

    renderPreparingOrders() {
        const preparingOrders = document.getElementById('preparingOrders');
        const orders = storage.read('orders').filter(o => 
            o.status === 'pending' || o.status === 'preparing'
        ).slice(0, 5);

        if (orders.length === 0) {
            preparingOrders.innerHTML = '<p>Дайындалудағы тапсырыстар жоқ</p>';
            return;
        }

        preparingOrders.innerHTML = `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Үстел</th>
                            <th>Тағамдар</th>
                            <th>Статус</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.map(order => {
                            const table = storage.read('tables', order.tableId);
                            return `
                                <tr>
                                    <td>#${order.id}</td>
                                    <td>Үстел ${table?.number || order.tableId}</td>
                                    <td>${order.items.map(item => `${item.name} x${item.quantity}`).join(', ')}</td>
                                    <td>
                                        <span class="status status-${order.status}">
                                            ${order.status === 'pending' ? 'Күтуде' : 'Дайындалуда'}
                                        </span>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 15px;">
                <button class="btn btn-info" onclick="app.loadSection('kitchen')">Барлығын көру</button>
            </div>
        `;
    },

    renderMyOrders() {
        const myOrders = document.getElementById('myOrders');
        const orders = storage.read('orders')
            .filter(o => o.waiterId === auth.currentUser.id)
            .slice(0, 5);

        if (orders.length === 0) {
            myOrders.innerHTML = '<p>Сіздің тапсырыстарыңыз жоқ</p>';
            return;
        }

        myOrders.innerHTML = `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Үстел</th>
                            <th>Жалпы</th>
                            <th>Статус</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.map(order => {
                            const table = storage.read('tables', order.tableId);
                            return `
                                <tr>
                                    <td>#${order.id}</td>
                                    <td>Үстел ${table?.number || order.tableId}</td>
                                    <td>${order.total} ₸</td>
                                    <td>
                                        <span class="status status-${order.status}">
                                            ${order.status === 'pending' ? 'Қабылданды' : 
                                              order.status === 'preparing' ? 'Дайындалуда' :
                                              order.status === 'ready' ? 'Дайын' :
                                              order.status === 'delivered' ? 'Жеткізілді' : order.status}
                                        </span>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 15px;">
                <button class="btn btn-info" onclick="app.loadSection('orders')">Барлығын көру</button>
            </div>
        `;
    },

    openAdminPanel() {
        // Открываем админ панель в том же окне
        if (typeof app !== 'undefined' && app) {
            app.loadSection('admin');
        }
    },

    currentRestaurantSlide: 0,
    restaurantSlideInterval: null,

    initRestaurantSlider() {
        const slides = document.querySelectorAll('.restaurant-slide');
        if (slides.length === 0) return;

        this.createRestaurantSliderDots();
        this.showRestaurantSlide(this.currentRestaurantSlide);

        // Автоматическая смена слайдов
        if (this.restaurantSlideInterval) {
            clearInterval(this.restaurantSlideInterval);
        }
        
        this.restaurantSlideInterval = setInterval(() => {
            this.nextRestaurantSlide();
        }, 4000); // Меняется каждые 4 секунды
    },

    nextRestaurantSlide() {
        const slides = document.querySelectorAll('.restaurant-slide');
        if (slides.length === 0) return;

        this.currentRestaurantSlide = (this.currentRestaurantSlide + 1) % slides.length;
        this.showRestaurantSlide(this.currentRestaurantSlide);
    },

    prevRestaurantSlide() {
        const slides = document.querySelectorAll('.restaurant-slide');
        if (slides.length === 0) return;

        this.currentRestaurantSlide = (this.currentRestaurantSlide - 1 + slides.length) % slides.length;
        this.showRestaurantSlide(this.currentRestaurantSlide);
    },

    showRestaurantSlide(index) {
        const slides = document.querySelectorAll('.restaurant-slide');
        const dots = document.querySelectorAll('.restaurant-slider-dot');
        
        if (slides.length === 0) return;

        // Удаляем активный класс со всех слайдов
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        // Добавляем активный класс к текущему слайду
        if (slides[index]) {
            slides[index].classList.add('active');
        }
        if (dots[index]) {
            dots[index].classList.add('active');
        }

        this.currentRestaurantSlide = index;

        // Перезапускаем интервал
        if (this.restaurantSlideInterval) {
            clearInterval(this.restaurantSlideInterval);
        }
        this.restaurantSlideInterval = setInterval(() => {
            this.nextRestaurantSlide();
        }, 4000);
    },

    createRestaurantSliderDots() {
        const sliderDots = document.getElementById('restaurantSliderDots');
        if (!sliderDots) return;

        const slides = document.querySelectorAll('.restaurant-slide');
        sliderDots.innerHTML = '';

        slides.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.className = 'restaurant-slider-dot';
            if (index === 0) dot.classList.add('active');
            dot.onclick = () => this.showRestaurantSlide(index);
            sliderDots.appendChild(dot);
        });
    }
};

