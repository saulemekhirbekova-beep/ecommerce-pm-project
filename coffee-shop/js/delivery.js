// Модуль доставки
const deliveryModule = {
    cart: [],
    selectedCategory: '',
    deliveryType: 'delivery', // 'delivery' or 'pickup'
    deliveryAddress: '',
    deliveryPhone: '',
    deliveryName: '',
    appliedPromo: null,
    discount: 0, // Скидка в процентах
    
    render() {
        const mainContent = document.getElementById('mainContent');
        if (!mainContent) return;
        
        mainContent.innerHTML = `
            <div class="delivery-page">
                <div class="delivery-main-content">
                    <div class="delivery-header">
                        <h2>Жеткізу</h2>
                        <button class="cart-toggle-btn" onclick="deliveryModule.toggleCart()">
                            <span>🛒</span>
                            <span id="cartBadge" class="cart-badge" style="display: none;">0</span>
                        </button>
                    </div>
                    <div class="delivery-categories">
                        <button class="category-btn ${this.selectedCategory === '' ? 'active' : ''}" onclick="deliveryModule.filterByCategory('')">Барлығы</button>
                        <button class="category-btn ${this.selectedCategory === 'first' ? 'active' : ''}" onclick="deliveryModule.filterByCategory('first')">Бірінші тағам</button>
                        <button class="category-btn ${this.selectedCategory === 'second' ? 'active' : ''}" onclick="deliveryModule.filterByCategory('second')">Екінші тағам</button>
                        <button class="category-btn ${this.selectedCategory === 'salad' ? 'active' : ''}" onclick="deliveryModule.filterByCategory('salad')">Салат</button>
                        <button class="category-btn ${this.selectedCategory === 'dessert' ? 'active' : ''}" onclick="deliveryModule.filterByCategory('dessert')">Десерт</button>
                        <button class="category-btn ${this.selectedCategory === 'drink' ? 'active' : ''}" onclick="deliveryModule.filterByCategory('drink')">Сусындар</button>
                    </div>
                    
                    <div id="deliveryMenuGrid" class="delivery-menu-grid"></div>
                </div>
                
                <div id="deliveryCart" class="delivery-cart">
                    <div class="cart-header">
                        <h3>Себет</h3>
                        <button class="cart-close" onclick="deliveryModule.toggleCart()">×</button>
                    </div>
                    <div id="cartContent" class="cart-content">
                        <div class="cart-empty">Бос</div>
                    </div>
                    <div class="cart-tabs">
                        <button class="cart-tab ${this.deliveryType === 'delivery' ? 'active' : ''}" onclick="deliveryModule.setDeliveryType('delivery')">Жеткізу</button>
                        <button class="cart-tab ${this.deliveryType === 'pickup' ? 'active' : ''}" onclick="deliveryModule.setDeliveryType('pickup')">Алып кету</button>
                    </div>
                    <div class="cart-options">
                        <div class="cart-option" onclick="deliveryModule.showAddressForm()">
                            <span>📍</span>
                            <span>Жеткізу мекенжайын көрсету</span>
                            <span>→</span>
                        </div>
                        <div class="cart-option">
                            <span>🍴</span>
                            <span>Аспапсыз</span>
                        </div>
                        <div class="cart-option" onclick="deliveryModule.showCommentForm()">
                            <span>💬</span>
                            <span>Тапсырысқа түсініктеме</span>
                            <span>→</span>
                        </div>
                        <div class="cart-option">
                            <span>📞</span>
                            <span>Қайта шалудың қажеті жоқ</span>
                            <label class="toggle-switch">
                                <input type="checkbox" id="noCallBack">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        <div class="cart-option" onclick="deliveryModule.showPromoForm()">
                            <span>🎁</span>
                            <span>Промокод қосу</span>
                            <span>→</span>
                        </div>
                    </div>
                    <div class="cart-footer">
                        <div class="cart-delivery-info">
                            <div>Жеткізу ~1 сағат</div>
                            <div class="free-delivery">Тегін</div>
                        </div>
                        <div class="cart-total">
                            <div>Жалпы: <span id="cartTotalPrice">0 ₸</span></div>
                        </div>
                        <button class="btn-cart-order btn-cart-pay" onclick="deliveryModule.showPaymentModal()" style="background: #28a745; margin-bottom: 10px;">
                            💳 Төлеу
                        </button>
                        <button class="btn-cart-order" onclick="deliveryModule.placeOrder()">Тапсырыс беру</button>
                    </div>
                </div>
            </div>
            
            <!-- Модальные окна -->
            <div id="addressModal" class="delivery-modal">
                <div class="modal-content">
                    <h3>Жеткізу мекенжайы</h3>
                    <div class="form-group">
                        <label>Аты-жөні:</label>
                        <input type="text" id="deliveryName" placeholder="Аты-жөніңізді енгізіңіз" required>
                    </div>
                    <div class="form-group">
                        <label>Телефон:</label>
                        <input type="tel" id="deliveryPhone" placeholder="+7 (___) ___-__-__" required>
                    </div>
                    <div class="form-group">
                        <label>Мекенжай:</label>
                        <input type="text" id="deliveryAddress" placeholder="Астана қаласы, көше, үй, пәтер" required>
                        <small style="color: #666; font-size: 12px; display: block; margin-top: 5px;">* Тек Астана қаласына жеткізу қолжетімді</small>
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-primary" onclick="deliveryModule.saveAddress()">Сақтау</button>
                        <button class="btn btn-secondary" onclick="deliveryModule.closeModal('addressModal')">Болдырмау</button>
                    </div>
                </div>
            </div>
            
            <div id="commentModal" class="delivery-modal">
                <div class="modal-content">
                    <h3>Тапсырысқа түсініктеме</h3>
                    <textarea id="orderComment" rows="4" placeholder="Қосымша ақпарат..."></textarea>
                    <div class="modal-actions">
                        <button class="btn btn-primary" onclick="deliveryModule.saveComment()">Сақтау</button>
                        <button class="btn btn-secondary" onclick="deliveryModule.closeModal('commentModal')">Болдырмау</button>
                    </div>
                </div>
            </div>
            
            <div id="promoModal" class="delivery-modal">
                <div class="modal-content">
                    <h3>Промокод</h3>
                    <input type="text" id="promoCode" placeholder="Промокод енгізіңіз">
                    <div class="modal-actions">
                        <button class="btn btn-primary" onclick="deliveryModule.applyPromo()">Қолдану</button>
                        <button class="btn btn-secondary" onclick="deliveryModule.closeModal('promoModal')">Болдырмау</button>
                    </div>
                </div>
            </div>
        `;
        
        this.renderMenu();
        this.updateCartDisplay();
        
        // Обновляем информацию о доставке при загрузке
        setTimeout(() => {
            this.updateDeliveryInfo();
            this.updatePromoDisplay();
        }, 100);
    },
    
    filterByCategory(category) {
        this.selectedCategory = category;
        this.renderMenu();
    },
    
    renderMenu() {
        const menuGrid = document.getElementById('deliveryMenuGrid');
        if (!menuGrid) return;
        
        let menuItems = storage.read('menu');
        
        if (this.selectedCategory) {
            menuItems = menuItems.filter(item => item.category === this.selectedCategory);
        }
        
        if (menuItems.length === 0) {
            menuGrid.innerHTML = '<p style="text-align: center; padding: 40px;">Тағамдар табылмады</p>';
            return;
        }
        
        const categoryNames = {
            first: 'Бірінші тағам',
            second: 'Екінші тағам',
            salad: 'Салат',
            dessert: 'Десерт',
            drink: 'Сусындар'
        };
        
        // Генерируем случайный вес для каждого блюда (для реалистичности)
        const getRandomWeight = () => {
            const weights = [160, 200, 250, 280, 300, 320, 350];
            return weights[Math.floor(Math.random() * weights.length)];
        };
        
        menuGrid.innerHTML = menuItems.map(item => {
            const imageUrl = item.image && item.image.trim() !== '' 
                ? item.image 
                : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';
            const weight = getRandomWeight();
            const cartItem = this.cart.find(c => c.id === item.id);
            const quantity = cartItem ? cartItem.quantity : 0;
            
            return `
                <div class="delivery-menu-card">
                    <img src="${imageUrl}" alt="${item.name}" 
                         onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';"
                         class="menu-card-image">
                    <div class="menu-card-info">
                        <h4 class="menu-card-name">${item.name}</h4>
                        <div class="menu-card-weight">${weight} г</div>
                        <div class="menu-card-price">${item.price.toLocaleString()} ₸</div>
                        ${quantity > 0 ? `
                            <div class="menu-card-quantity-controls">
                                <button class="qty-btn" onclick="deliveryModule.decreaseQuantity(${item.id})">-</button>
                                <span class="qty-value">${quantity}</span>
                                <button class="qty-btn" onclick="deliveryModule.increaseQuantity(${item.id})">+</button>
                            </div>
                        ` : `
                            <button class="menu-card-add-btn" onclick="deliveryModule.addToCart(${item.id})">
                                Себетке қосу
                            </button>
                        `}
                    </div>
                </div>
            `;
        }).join('');
    },
    
    addToCart(menuId) {
        const menu = storage.read('menu', menuId);
        if (!menu || !menu.available) return;
        
        const existingItem = this.cart.find(item => item.id === menuId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.cart.push({
                id: menuId,
                name: menu.name,
                price: menu.price,
                image: menu.image,
                quantity: 1
            });
        }
        
        this.renderMenu();
        this.updateCartDisplay();
    },
    
    increaseQuantity(menuId) {
        const item = this.cart.find(c => c.id === menuId);
        if (item) {
            item.quantity++;
            this.renderMenu();
            this.updateCartDisplay();
        }
    },
    
    decreaseQuantity(menuId) {
        const item = this.cart.find(c => c.id === menuId);
        if (item) {
            item.quantity--;
            if (item.quantity <= 0) {
                this.cart = this.cart.filter(c => c.id !== menuId);
            }
            this.renderMenu();
            this.updateCartDisplay();
        }
    },
    
    updateCartDisplay() {
        const cartContent = document.getElementById('cartContent');
        const cartTotalPrice = document.getElementById('cartTotalPrice');
        const cartBadge = document.getElementById('cartBadge');
        
        if (!cartContent) return;
        
        // Обновляем бейдж корзины
        if (cartBadge) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            if (totalItems > 0) {
                cartBadge.textContent = totalItems;
                cartBadge.style.display = 'block';
            } else {
                cartBadge.style.display = 'none';
            }
        }
        
        if (this.cart.length === 0) {
            cartContent.innerHTML = '<div class="cart-empty">Бос</div>';
            if (cartTotalPrice) cartTotalPrice.textContent = '0 ₸';
            // Очищаем промокод при пустой корзине
            this.appliedPromo = null;
            this.discount = 0;
            this.updatePromoDisplay();
            return;
        }
        
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discountAmount = this.discount > 0 ? Math.round(subtotal * this.discount / 100) : 0;
        const total = subtotal - discountAmount;
        
        // Обновляем отображение итоговой суммы
        if (cartTotalPrice) {
            if (this.discount > 0) {
                cartTotalPrice.innerHTML = `
                    <div style="font-size: 14px; color: #666; text-decoration: line-through;">${subtotal.toLocaleString()} ₸</div>
                    <div style="color: #28a745; font-weight: bold; font-size: 18px;">${total.toLocaleString()} ₸</div>
                    <div style="font-size: 12px; color: #28a745;">-${discountAmount.toLocaleString()} ₸ (${this.discount}%)</div>
                `;
            } else {
                cartTotalPrice.textContent = `${total.toLocaleString()} ₸`;
            }
        }
        
        cartContent.innerHTML = this.cart.map(item => `
            <div class="cart-item">
                <img src="${item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'}" 
                     alt="${item.name}" class="cart-item-image">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${item.price.toLocaleString()} ₸</div>
                    <div class="cart-item-controls">
                        <button class="qty-btn-small" onclick="deliveryModule.decreaseQuantity(${item.id})">-</button>
                        <span class="qty-value-small">${item.quantity}</span>
                        <button class="qty-btn-small" onclick="deliveryModule.increaseQuantity(${item.id})">+</button>
                    </div>
                </div>
            </div>
        `).join('');
    },
    
    setDeliveryType(type) {
        this.deliveryType = type;
        this.render();
        // Если переключили на доставку и адрес уже есть, показываем его
        if (type === 'delivery') {
            setTimeout(() => this.updateDeliveryInfo(), 100);
        }
    },
    
    toggleCart() {
        const cart = document.getElementById('deliveryCart');
        if (cart) {
            cart.classList.toggle('cart-open');
        }
    },
    
    showAddressForm() {
        const modal = document.getElementById('addressModal');
        if (!modal) return;
        
        modal.classList.add('active');
        
        // Восстанавливаем сохраненные значения
        const nameInput = document.getElementById('deliveryName');
        const phoneInput = document.getElementById('deliveryPhone');
        const addressInput = document.getElementById('deliveryAddress');
        
        if (nameInput) {
            nameInput.value = this.deliveryName || '';
        }
        
        if (phoneInput) {
            phoneInput.value = this.deliveryPhone || '';
            
            // Инициализируем обработчик форматирования (если еще не инициализирован)
            if (!phoneInput.hasAttribute('data-formatted')) {
                phoneInput.setAttribute('data-formatted', 'true');
                
                // Маска для телефона - дәл 11 цифр
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
                        if (value.startsWith('7')) {
                            let formatted = '+7 (';
                            if (value.length > 1) {
                                formatted += value.substring(1, Math.min(4, value.length));
                                if (value.length > 4) {
                                    formatted += ') ' + value.substring(4, Math.min(7, value.length));
                                    if (value.length > 7) {
                                        formatted += '-' + value.substring(7, Math.min(9, value.length));
                                        if (value.length > 9) {
                                            formatted += '-' + value.substring(9, 11);
                                        }
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
        }
        if (addressInput) {
            addressInput.value = this.deliveryAddress || '';
        }
    },
    
    showCommentForm() {
        document.getElementById('commentModal').classList.add('active');
    },
    
    showPromoForm() {
        document.getElementById('promoModal').classList.add('active');
    },
    
    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    },
    
    saveAddress() {
        const nameInput = document.getElementById('deliveryName');
        const phoneInput = document.getElementById('deliveryPhone');
        const addressInput = document.getElementById('deliveryAddress');
        
        if (!nameInput || !phoneInput || !addressInput) {
            if (auth && auth.showNotification) {
                auth.showNotification('Форма элементтері табылмады!', 'error');
            } else {
                alert('Форма элементтері табылмады!');
            }
            return;
        }
        
        let name = nameInput.value.trim();
        let phone = phoneInput.value.replace(/\D/g, ''); // Тек цифрларды алу
        let address = addressInput.value.trim();
        
        // Имя валидациясы
        if (!name || name.length < 2) {
            if (auth && auth.showNotification) {
                auth.showNotification('Аты-жөніңізді енгізіңіз (кемінде 2 символ)!', 'error');
            } else {
                alert('Аты-жөніңізді енгізіңіз (кемінде 2 символ)!');
            }
            return;
        }
        
        // Телефон валидациясы
        if (!phone || phone.length === 0) {
            if (auth && auth.showNotification) {
                auth.showNotification('Телефон нөмірін енгізіңіз!', 'error');
            } else {
                alert('Телефон нөмірін енгізіңіз!');
            }
            return;
        }
        
        // Егер 8-ден басталса, оны 7-ге ауыстыру
        if (phone.startsWith('8')) {
            phone = '7' + phone.substring(1);
        }
        // Егер 7-ден басталмаса және 10 цифр болса, 7-ді қосу
        if (!phone.startsWith('7') && phone.length === 10) {
            phone = '7' + phone;
        }
        
        // Валидация: дәл 11 цифр болуы керек
        if (phone.length !== 11 || !phone.startsWith('7')) {
            if (auth && auth.showNotification) {
                auth.showNotification('Телефон нөмірі дәл 11 цифрдан тұруы керек (мысалы: 87079853551)!', 'error');
            } else {
                alert('Телефон нөмірі дәл 11 цифрдан тұруы керек (мысалы: 87079853551)!');
            }
            return;
        }
        
        // Адрес валидациясы - тек Астана
        if (!address) {
            if (auth && auth.showNotification) {
                auth.showNotification('Мекенжайды енгізіңіз!', 'error');
            } else {
                alert('Мекенжайды енгізіңіз!');
            }
            return;
        }
        
        // Проверяем, что адрес содержит "Астана" (разные варианты написания)
        const addressLower = address.toLowerCase();
        const astanaVariants = ['астана', 'astana', 'нур-султан', 'nur-sultan'];
        const isAstana = astanaVariants.some(variant => addressLower.includes(variant));
        
        if (!isAstana) {
            if (auth && auth.showNotification) {
                auth.showNotification('Кешіріңіз, жеткізу тек Астана қаласына қолжетімді!', 'error');
            } else {
                alert('Кешіріңіз, жеткізу тек Астана қаласына қолжетімді!');
            }
            return;
        }
        
        // Сохраняем данные
        this.deliveryName = storage && storage.sanitizeInput ? storage.sanitizeInput(name) : name;
        this.deliveryPhone = '+7 (' + phone.substring(1, 4) + ') ' + phone.substring(4, 7) + '-' + phone.substring(7, 9) + '-' + phone.substring(9, 11);
        this.deliveryAddress = address;
        
        if (auth && auth.showNotification) {
            auth.showNotification('Деректер сақталды!', 'success');
        }
        this.closeModal('addressModal');
        
        // Обновляем отображение адреса в корзине
        this.updateDeliveryInfo();
    },
    
    updateDeliveryInfo() {
        // Обновляем отображение адреса и телефона в корзине
        const cartOptions = document.querySelector('.cart-options');
        if (cartOptions && this.deliveryType === 'delivery') {
            // Ищем существующие элементы с данными
            let nameInfo = cartOptions.querySelector('.delivery-name-info');
            let phoneInfo = cartOptions.querySelector('.delivery-phone-info');
            let addressInfo = cartOptions.querySelector('.delivery-address-info');
            
            if (this.deliveryName || this.deliveryPhone || this.deliveryAddress) {
                // Создаем или обновляем отображение имени
                if (!nameInfo && this.deliveryName) {
                    nameInfo = document.createElement('div');
                    nameInfo.className = 'cart-option delivery-name-info';
                    nameInfo.style.cssText = 'background: #e8f5e9; padding: 10px; margin-top: 5px; border-radius: 5px;';
                    const firstOption = cartOptions.querySelector('.cart-option');
                    if (firstOption) {
                        firstOption.after(nameInfo);
                    }
                }
                if (nameInfo && this.deliveryName) {
                    nameInfo.innerHTML = `<span>👤</span><span style="font-size: 12px; margin-left: 8px;"><strong>${this.deliveryName}</strong></span>`;
                }
                
                // Создаем или обновляем отображение телефона
                if (!phoneInfo && this.deliveryPhone) {
                    phoneInfo = document.createElement('div');
                    phoneInfo.className = 'cart-option delivery-phone-info';
                    phoneInfo.style.cssText = 'background: #e8f5e9; padding: 10px; margin-top: 5px; border-radius: 5px;';
                    const targetElement = nameInfo || cartOptions.querySelector('.cart-option');
                    if (targetElement) {
                        targetElement.after(phoneInfo);
                    }
                }
                if (phoneInfo && this.deliveryPhone) {
                    phoneInfo.innerHTML = `<span>📱</span><span style="font-size: 12px; margin-left: 8px;">${this.deliveryPhone}</span>`;
                }
                
                // Создаем или обновляем отображение адреса
                if (!addressInfo && this.deliveryAddress) {
                    addressInfo = document.createElement('div');
                    addressInfo.className = 'cart-option delivery-address-info';
                    addressInfo.style.cssText = 'background: #e8f5e9; padding: 10px; margin-top: 5px; border-radius: 5px;';
                    const targetElement = phoneInfo || nameInfo || cartOptions.querySelector('.cart-option');
                    if (targetElement) {
                        targetElement.after(addressInfo);
                    }
                }
                if (addressInfo && this.deliveryAddress) {
                    addressInfo.innerHTML = `<span>📍</span><span style="font-size: 12px; margin-left: 8px;">${this.deliveryAddress}</span>`;
                }
            } else {
                // Удаляем отображение, если данные не указаны
                if (nameInfo) nameInfo.remove();
                if (phoneInfo) phoneInfo.remove();
                if (addressInfo) addressInfo.remove();
            }
        }
    },
    
    saveComment() {
        const comment = document.getElementById('orderComment').value;
        if (comment) {
            auth.showNotification('Түсініктеме сақталды!', 'success');
        }
        this.closeModal('commentModal');
    },
    
    applyPromo() {
        const promoInput = document.getElementById('promoCode');
        if (!promoInput) return;
        
        const promoCode = promoInput.value.trim();
        
        if (!promoCode) {
            if (auth && auth.showNotification) {
                auth.showNotification('Промокод енгізіңіз!', 'error');
            } else {
                alert('Промокод енгізіңіз!');
            }
            return;
        }
        
        // Только промокод "123" работает
        if (promoCode !== '123') {
            if (auth && auth.showNotification) {
                auth.showNotification('Промокод табылмады! Тек "123" промокоды жұмыс істейді.', 'error');
            } else {
                alert('Промокод табылмады! Тек "123" промокоды жұмыс істейді.');
            }
            promoInput.value = '';
            return;
        }
        
        // Проверяем промокод в базе данных
        const promoCodes = storage.read('promoCodes') || [];
        const promo = promoCodes.find(p => p.code === '123' && p.active);
        
        if (!promo) {
            // Если промокод не найден в базе, создаем его с 20% скидкой
            this.appliedPromo = { code: '123', discount: 20, description: 'Арнайы жеңілдік 20%' };
            this.discount = 20;
        } else {
            // Применяем промокод из базы
            this.appliedPromo = promo;
            this.discount = promo.discount;
        }
        
        // Обновляем отображение
        this.updateCartDisplay();
        this.updatePromoDisplay();
        
        if (auth && auth.showNotification) {
            auth.showNotification(`Промокод "123" қолданылды! Сізге ${this.discount}% жеңілдік берілді!`, 'success');
        } else {
            alert(`Промокод "123" қолданылды! Сізге ${this.discount}% жеңілдік берілді!`);
        }
        
        // Очищаем поле промокода
        promoInput.value = '';
        this.closeModal('promoModal');
    },
    
    removePromo() {
        this.appliedPromo = null;
        this.discount = 0;
        this.updateCartDisplay();
        this.updatePromoDisplay();
        
        if (auth && auth.showNotification) {
            auth.showNotification('Промокод алынып тасталды', 'info');
        }
    },
    
    updatePromoDisplay() {
        const promoOption = document.querySelector('.cart-option[onclick*="showPromoForm"]');
        if (!promoOption) return;
        
        // Удаляем старое отображение промокода
        const existingPromoInfo = promoOption.parentElement.querySelector('.applied-promo-info');
        if (existingPromoInfo) {
            existingPromoInfo.remove();
        }
        
        // Если промокод применен, показываем информацию
        if (this.appliedPromo) {
            const promoInfo = document.createElement('div');
            promoInfo.className = 'applied-promo-info';
            promoInfo.style.cssText = 'background: #e8f5e9; padding: 10px; margin-top: 5px; border-radius: 5px; border-left: 4px solid #28a745;';
            promoInfo.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-weight: bold; color: #28a745;">🎁 ${this.appliedPromo.code}</div>
                        <div style="font-size: 12px; color: #666;">${this.appliedPromo.description || ''}</div>
                        <div style="font-size: 12px; color: #28a745; margin-top: 5px;">Жеңілдік: ${this.discount}%</div>
                    </div>
                    <button onclick="deliveryModule.removePromo()" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 12px;">✕</button>
                </div>
            `;
            promoOption.after(promoInfo);
        }
    },
    
    placeOrder() {
        if (this.cart.length === 0) {
            auth.showNotification('Себет бос!', 'error');
            return;
        }
        
        // Для доставки проверяем телефон и адрес
        if (this.deliveryType === 'delivery') {
            if (!this.deliveryPhone || !this.deliveryAddress) {
                auth.showNotification('Жеткізу үшін телефон және мекенжайды көрсетіңіз!', 'error');
                this.showAddressForm();
                return;
            }
            
            // Дополнительная проверка адреса
            const addressLower = this.deliveryAddress.toLowerCase();
            const astanaVariants = ['астана', 'astana', 'нур-султан', 'nur-sultan'];
            const isAstana = astanaVariants.some(variant => addressLower.includes(variant));
            
            if (!isAstana) {
                auth.showNotification('Кешіріңіз, жеткізу тек Астана қаласына қолжетімді!', 'error');
                this.showAddressForm();
                return;
            }
        }
        
        // Показываем модальное окно оплаты
        this.showPaymentModal();
    },
    
    showPaymentModal() {
        if (this.cart.length === 0) {
            if (auth && auth.showNotification) {
                auth.showNotification('Себет бос!', 'error');
            } else {
                alert('Себет бос!');
            }
            return;
        }
        
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discountAmount = this.discount > 0 ? Math.round(subtotal * this.discount / 100) : 0;
        const total = subtotal - discountAmount;
        
        // Для доставки проверяем наличие адреса и телефона
        if (this.deliveryType === 'delivery' && (!this.deliveryPhone || !this.deliveryAddress)) {
            if (auth && auth.showNotification) {
                auth.showNotification('Жеткізу үшін алдымен телефон және мекенжайды көрсетіңіз!', 'error');
            }
            this.showAddressForm();
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'deliveryPaymentModal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h2>💳 Төлем</h2>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div style="margin-bottom: 20px;">
                    <h3 style="margin-bottom: 15px; color: #333;">Тапсырыс ақпараты</h3>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px; max-height: 300px; overflow-y: auto;">
                        ${this.cart.map(item => `
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #e0e0e0;">
                                <div>
                                    <div style="font-weight: 500;">${item.name}</div>
                                    <div style="font-size: 12px; color: #666;">${item.price.toLocaleString()} ₸ × ${item.quantity}</div>
                                </div>
                                <div style="font-weight: 600; color: #28a745;">
                                    ${(item.price * item.quantity).toLocaleString()} ₸
                                </div>
                            </div>
                        `).join('')}
                        ${discountAmount > 0 ? `
                            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e0e0e0;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                    <span>Аралық сома:</span>
                                    <span>${subtotal.toLocaleString()} ₸</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; color: #28a745; font-weight: 600;">
                                    <span>🎁 Промокод жеңілдігі (${this.discount}%):</span>
                                    <span>-${discountAmount.toLocaleString()} ₸</span>
                                </div>
                            </div>
                        ` : ''}
                        <div style="border-top: 2px solid #28a745; margin-top: 15px; padding-top: 15px; display: flex; justify-content: space-between; font-weight: bold; font-size: 20px;">
                            <span>Жалпы сома:</span>
                            <span style="color: #28a745;">${total.toLocaleString()} ₸</span>
                        </div>
                    </div>
                </div>
                ${this.deliveryType === 'delivery' ? `
                    <div style="margin: 15px 0; padding: 12px; background: #e8f5e9; border-radius: 5px; border-left: 4px solid #28a745;">
                        <p style="margin: 5px 0;"><strong>👤 Аты-жөні:</strong> ${this.deliveryName || '-'}</p>
                        <p style="margin: 5px 0;"><strong>📱 Телефон:</strong> ${this.deliveryPhone || '-'}</p>
                        <p style="margin: 5px 0;"><strong>📍 Мекенжай:</strong> ${this.deliveryAddress || '-'}</p>
                    </div>
                ` : `
                    <div style="margin: 15px 0; padding: 12px; background: #e3f2fd; border-radius: 5px; border-left: 4px solid #2196f3;">
                        <p style="margin: 5px 0;"><strong>📦 Түрі:</strong> Алып кету</p>
                        <p style="margin: 5px 0; font-size: 12px; color: #666;">Тапсырысты рестораннан алып кете аласыз</p>
                    </div>
                `}
                <div class="form-group">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Төлем түрін таңдаңыз:</label>
                    <select id="deliveryPaymentType" required style="width: 100%; padding: 12px; border-radius: 8px; border: 2px solid #ddd; font-size: 16px; background: white;">
                        <option value="">Таңдаңыз...</option>
                        <option value="cash">💵 Қолма-қол ақша</option>
                        <option value="card">💳 Банк картасы</option>
                        <option value="qr">📱 QR код</option>
                    </select>
                </div>
                <div class="form-actions" style="margin-top: 20px;">
                    <button class="btn btn-success" onclick="deliveryModule.processPayment()" style="width: 100%; padding: 14px; font-size: 18px; font-weight: bold; border-radius: 8px; margin-bottom: 10px;">
                        ✅ Төлеу және тапсырыс беру
                    </button>
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()" style="width: 100%; padding: 10px; border-radius: 8px;">Болдырмау</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },
    
    processPayment() {
        const paymentTypeInput = document.getElementById('deliveryPaymentType');
        if (!paymentTypeInput) {
            if (auth && auth.showNotification) {
                auth.showNotification('Төлем түрін таңдаңыз!', 'error');
            } else {
                alert('Төлем түрін таңдаңыз!');
            }
            return;
        }
        
        const paymentType = paymentTypeInput.value;
        if (!paymentType) {
            if (auth && auth.showNotification) {
                auth.showNotification('Төлем түрін таңдаңыз!', 'error');
            } else {
                alert('Төлем түрін таңдаңыз!');
            }
            return;
        }
        
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discountAmount = this.discount > 0 ? Math.round(subtotal * this.discount / 100) : 0;
        const total = subtotal - discountAmount;
        
        if (total <= 0) {
            if (auth && auth.showNotification) {
                auth.showNotification('Себет бос!', 'error');
            } else {
                alert('Себет бос!');
            }
            return;
        }
        
        // Для доставки проверяем данные еще раз
        if (this.deliveryType === 'delivery') {
            if (!this.deliveryName || !this.deliveryPhone || !this.deliveryAddress) {
                if (auth && auth.showNotification) {
                    auth.showNotification('Жеткізу үшін аты-жөні, телефон және мекенжайды көрсетіңіз!', 'error');
                }
                const modal = document.getElementById('deliveryPaymentModal');
                if (modal) modal.remove();
                this.showAddressForm();
                return;
            }
            
            // Проверяем, что адрес в Астане
            const addressLower = this.deliveryAddress.toLowerCase();
            const astanaVariants = ['астана', 'astana', 'нур-султан', 'nur-sultan'];
            const isAstana = astanaVariants.some(variant => addressLower.includes(variant));
            
            if (!isAstana) {
                if (auth && auth.showNotification) {
                    auth.showNotification('Кешіріңіз, жеткізу тек Астана қаласына қолжетімді!', 'error');
                }
                const modal = document.getElementById('deliveryPaymentModal');
                if (modal) modal.remove();
                this.showAddressForm();
                return;
            }
        }
        
        try {
            // Создаем заказ доставки
            const newOrder = {
                items: this.cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                })),
                subtotal: subtotal,
                discount: discountAmount,
                discountPercent: this.discount,
                promoCode: this.appliedPromo ? this.appliedPromo.code : null,
                total: total,
                deliveryType: this.deliveryType,
                customerName: this.deliveryName || '',
                phone: this.deliveryPhone || '',
                address: this.deliveryAddress || '',
                status: this.deliveryType === 'pickup' ? 'ready' : 'pending',
                paid: true,
                paymentType: paymentType,
                createdAt: new Date().toISOString()
            };
            
            if (!storage || !storage.create) {
                throw new Error('Storage модулі жүктелмеген!');
            }
            
            const order = storage.create('deliveryOrders', newOrder);
            
            // Создаем запись об оплате
            if (typeof paymentsModule !== 'undefined' && paymentsModule.processDeliveryPayment) {
                paymentsModule.processDeliveryPayment(order.id, paymentType, total);
            } else {
                // Альтернативный способ - создаем платеж напрямую
                if (storage && storage.create) {
                    storage.create('payments', {
                        orderId: order.id,
                        amount: total,
                        type: paymentType,
                        date: new Date().toISOString(),
                        deliveryOrder: true
                    });
                }
            }
            
            // Закрываем модальное окно
            const modal = document.getElementById('deliveryPaymentModal');
            if (modal) {
                modal.remove();
            }
            
            // Очищаем корзину
            this.cart = [];
            this.appliedPromo = null;
            this.discount = 0;
            if (this.deliveryType === 'pickup') {
                // Для самовывоза не очищаем данные
            } else {
                this.deliveryName = '';
                this.deliveryPhone = '';
                this.deliveryAddress = '';
            }
            
            this.renderMenu();
            this.updateCartDisplay();
            this.updateDeliveryInfo();
            
            // Показываем успешное сообщение
            if (auth && auth.showNotification) {
                auth.showNotification(`✅ Тапсырыс сәтті төленді! Сома: ${total.toLocaleString()} ₸`, 'success');
            } else {
                alert(`✅ Тапсырыс сәтті төленді! Сома: ${total.toLocaleString()} ₸`);
            }
            
            // Закрываем корзину
            this.toggleCart();
            
        } catch (error) {
            console.error('Төлем кезінде қате:', error);
            if (auth && auth.showNotification) {
                auth.showNotification('Төлем кезінде қате орын алды. Қайталап көріңіз.', 'error');
            } else {
                alert('Төлем кезінде қате орын алды. Қайталап көріңіз.');
            }
        }
    }
};

