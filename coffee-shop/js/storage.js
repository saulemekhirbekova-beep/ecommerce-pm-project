// Система хранения данных (можно заменить на реальную БД)
class Storage {
    constructor() {
        this.init();
    }

    init() {
        // Инициализация данных при первом запуске
        const existingData = localStorage.getItem('restaurant_data');
        if (!existingData) {
            const initialData = {
                users: [
                    { id: 1, username: 'admin', password: this.hashPassword('admin123'), role: 'admin', name: 'Администратор' },
                    { id: 2, username: 'manager', password: this.hashPassword('123'), role: 'manager', name: 'Менеджер' },
                    { id: 3, username: 'chef', password: this.hashPassword('chef123'), role: 'chef', name: 'Аспаз' },
                    { id: 4, username: 'waiter', password: this.hashPassword('waiter123'), role: 'waiter', name: 'Официант' },
                    { id: 5, username: 'cashier', password: this.hashPassword('cashier123'), role: 'cashier', name: 'Кассир' }
                ],
                menu: [
                    // Бірінші тағамдар
                    { id: 1, name: 'Борщ', category: 'first', price: 1500, image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop', available: true },
                    { id: 2, name: 'Крем-суп', category: 'first', price: 1800, image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop', available: true },
                    { id: 3, name: 'Минестроне', category: 'first', price: 2000, image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop', available: true },
                    
                    // Екінші тағамдар
                    { id: 4, name: 'Стейк из говядины', category: 'second', price: 4500, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop', available: true },
                    { id: 5, name: 'Лосось на гриле', category: 'second', price: 3800, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop', available: true },
                    { id: 6, name: 'Паста Карбонара', category: 'second', price: 2800, image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop', available: true },
                    { id: 7, name: 'Равиоли с сыром', category: 'second', price: 3200, image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop', available: true },
                    { id: 8, name: 'Куриная грудка в соусе', category: 'second', price: 2500, image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop', available: true },
                    { id: 9, name: 'Ризотто с грибами', category: 'second', price: 3000, image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop', available: true },
                    
                    // Салаттар
                    { id: 10, name: 'Салат Цезарь', category: 'salad', price: 2000, image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop', available: true },
                    { id: 11, name: 'Греческий салат', category: 'salad', price: 1800, image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop', available: true },
                    { id: 12, name: 'Салат с морепродуктами', category: 'salad', price: 3500, image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop', available: true },
                    { id: 13, name: 'Капрезе', category: 'salad', price: 2200, image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop', available: true },
                    
                    // Десерттер
                    { id: 14, name: 'Тирамису', category: 'dessert', price: 1800, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop', available: true },
                    { id: 15, name: 'Чизкейк', category: 'dessert', price: 2000, image: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=400&h=300&fit=crop', available: true },
                    { id: 16, name: 'Крем-брюле', category: 'dessert', price: 1500, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop', available: true },
                    { id: 17, name: 'Шоколадный фондан', category: 'dessert', price: 2200, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop', available: true },
                    { id: 18, name: 'Торт', category: 'dessert', price: 1200, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop', available: true },
                    
                    // Сусындар
                    { id: 19, name: 'Кофе Эспрессо', category: 'drink', price: 800, image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&h=300&fit=crop', available: true },
                    { id: 20, name: 'Капучино', category: 'drink', price: 1000, image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop', available: true },
                    { id: 21, name: 'Латте', category: 'drink', price: 1200, image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop', available: true },
                    { id: 22, name: 'Свежевыжатый сок', category: 'drink', price: 1500, image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop', available: true },
                    { id: 23, name: 'Лимонад', category: 'drink', price: 900, image: 'https://images.unsplash.com/photo-1523677011783-c91d1bbe2fdc?w=400&h=300&fit=crop', available: true }
                ],
                orders: [],
                reservations: [],
                banquetBookings: [],
                customers: [],
                payments: [],
                staff: [],
                reviews: [],
                deliveryOrders: [],
                promoCodes: [
                    { code: '123', discount: 20, description: 'Арнайы жеңілдік 20%', active: true }
                ],
                warehouse: [
                    { id: 1, name: 'Говядина', quantity: 50, unit: 'кг', minQuantity: 10 },
                    { id: 2, name: 'Картофель', quantity: 100, unit: 'кг', minQuantity: 20 },
                    { id: 3, name: 'Помидоры', quantity: 5, unit: 'кг', minQuantity: 10 }
                ],
                tables: [
                    { id: 1, number: 1, capacity: 4, status: 'available' },
                    { id: 2, number: 2, capacity: 2, status: 'available' },
                    { id: 3, number: 3, capacity: 6, status: 'available' },
                    { id: 4, number: 4, capacity: 4, status: 'available' },
                    { id: 5, number: 5, capacity: 2, status: 'available' }
                ],
                logs: []
            };
            localStorage.setItem('restaurant_data', JSON.stringify(initialData));
        } else {
            // Обновляем существующие данные, добавляя фотографии к блюдам без них
            try {
                const data = JSON.parse(existingData);
                if (data.menu && Array.isArray(data.menu)) {
                    let menuUpdated = false;
                    const updatedMenu = data.menu.map(item => {
                        // Если у блюда нет фото или пустое, добавляем фото
                        if (!item.image || item.image === '') {
                            menuUpdated = true;
                            // Дефолтное фото для всех блюд
                            item.image = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';
                        }
                        return item;
                    });
                    
                    // Если меню было обновлено или в нем меньше 10 блюд, заменяем на новое
                    if (menuUpdated || data.menu.length < 10) {
                        const newMenu = [
                            { id: 1, name: 'Борщ', category: 'first', price: 1500, image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop', available: true },
                            { id: 2, name: 'Крем-суп', category: 'first', price: 1800, image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop', available: true },
                            { id: 3, name: 'Минестроне', category: 'first', price: 2000, image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop', available: true },
                            { id: 4, name: 'Стейк из говядины', category: 'second', price: 4500, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop', available: true },
                            { id: 5, name: 'Лосось на гриле', category: 'second', price: 3800, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop', available: true },
                            { id: 6, name: 'Паста Карбонара', category: 'second', price: 2800, image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop', available: true },
                            { id: 7, name: 'Равиоли с сыром', category: 'second', price: 3200, image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop', available: true },
                            { id: 8, name: 'Куриная грудка в соусе', category: 'second', price: 2500, image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop', available: true },
                            { id: 9, name: 'Ризотто с грибами', category: 'second', price: 3000, image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop', available: true },
                            { id: 10, name: 'Салат Цезарь', category: 'salad', price: 2000, image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop', available: true },
                            { id: 11, name: 'Греческий салат', category: 'salad', price: 1800, image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop', available: true },
                            { id: 12, name: 'Салат с морепродуктами', category: 'salad', price: 3500, image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop', available: true },
                            { id: 13, name: 'Капрезе', category: 'salad', price: 2200, image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop', available: true },
                            { id: 14, name: 'Тирамису', category: 'dessert', price: 1800, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop', available: true },
                            { id: 15, name: 'Чизкейк', category: 'dessert', price: 2000, image: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=400&h=300&fit=crop', available: true },
                            { id: 16, name: 'Крем-брюле', category: 'dessert', price: 1500, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop', available: true },
                            { id: 17, name: 'Шоколадный фондан', category: 'dessert', price: 2200, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop', available: true },
                            { id: 18, name: 'Торт', category: 'dessert', price: 1200, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop', available: true },
                            { id: 19, name: 'Кофе Эспрессо', category: 'drink', price: 800, image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&h=300&fit=crop', available: true },
                            { id: 20, name: 'Капучино', category: 'drink', price: 1000, image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop', available: true },
                            { id: 21, name: 'Латте', category: 'drink', price: 1200, image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop', available: true },
                            { id: 22, name: 'Свежевыжатый сок', category: 'drink', price: 1500, image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop', available: true },
                            { id: 23, name: 'Лимонад', category: 'drink', price: 900, image: 'https://images.unsplash.com/photo-1523677011783-c91d1bbe2fdc?w=400&h=300&fit=crop', available: true }
                        ];
                        data.menu = newMenu;
                        localStorage.setItem('restaurant_data', JSON.stringify(data));
                    }
                }
                
                // Обновляем промокоды - только "123" с 20% скидкой
                if (!data.promoCodes || !Array.isArray(data.promoCodes)) {
                    data.promoCodes = [];
                }
                // Проверяем, есть ли промокод "123"
                const hasPromo123 = data.promoCodes.some(p => p.code === '123');
                if (!hasPromo123) {
                    // Добавляем промокод "123" если его нет
                    data.promoCodes = [
                        { code: '123', discount: 20, description: 'Арнайы жеңілдік 20%', active: true }
                    ];
                } else {
                    // Обновляем существующий промокод "123" и удаляем остальные
                    data.promoCodes = [
                        { code: '123', discount: 20, description: 'Арнайы жеңілдік 20%', active: true }
                    ];
                }
                if (Array.isArray(data.users)) {
                    data.users.forEach((user) => {
                        if (user.username === 'manager') user.password = this.hashPassword('123');
                    });
                }
                localStorage.setItem('restaurant_data', JSON.stringify(data));
            } catch (e) {
                console.error('Ошибка при обновлении меню:', e);
            }
        }
    }

    getData() {
        return JSON.parse(localStorage.getItem('restaurant_data') || '{}');
    }

    saveData(data) {
        localStorage.setItem('restaurant_data', JSON.stringify(data));
    }

    // Безопасность: хеширование паролей (упрощенная версия)
    hashPassword(password) {
        // В реальном приложении использовать bcrypt или подобное
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString();
    }

    // Защита от SQL Injection (для будущей интеграции с БД)
    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        return input.replace(/['";\\]/g, '');
    }

    // Логирование действий
    log(action, userId, details) {
        const data = this.getData();
        data.logs.push({
            id: Date.now(),
            action,
            userId,
            details,
            timestamp: new Date().toISOString()
        });
        this.saveData(data);
    }

    // CRUD операции для различных сущностей
    create(entity, item) {
        const data = this.getData();
        if (!data[entity]) data[entity] = [];
        item.id = Date.now();
        data[entity].push(item);
        this.saveData(data);
        this.log(`CREATE_${entity.toUpperCase()}`, item.id, item);
        return item;
    }

    read(entity, id = null) {
        const data = this.getData();
        if (!data[entity]) return id ? null : [];
        if (id) {
            return data[entity].find(item => item.id === id) || null;
        }
        return data[entity];
    }

    update(entity, id, updates) {
        const data = this.getData();
        if (!data[entity]) return null;
        const index = data[entity].findIndex(item => item.id === id);
        if (index === -1) return null;
        data[entity][index] = { ...data[entity][index], ...updates };
        this.saveData(data);
        this.log(`UPDATE_${entity.toUpperCase()}`, id, updates);
        return data[entity][index];
    }

    delete(entity, id) {
        const data = this.getData();
        if (!data[entity]) return false;
        const index = data[entity].findIndex(item => item.id === id);
        if (index === -1) return false;
        data[entity].splice(index, 1);
        this.saveData(data);
        this.log(`DELETE_${entity.toUpperCase()}`, id, {});
        return true;
    }
}

const storage = new Storage();

