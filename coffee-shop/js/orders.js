// Модуль управления заказами
const ordersModule = {
    currentCart: [],
    selectedTable: null,

    render() {
        const mainContent = document.getElementById('mainContent');
        const role = auth.currentUser?.role;
        
        mainContent.innerHTML = `
            <div class="content-section">
                <h2>Тапсырыстар басқару</h2>
                ${role === 'waiter' || role === 'admin' || role === 'manager' ? `
                    <div style="margin-bottom: 20px;">
                        <button class="btn btn-success" onclick="ordersModule.showNewOrderForm()">Жаңа тапсырыс</button>
                    </div>
                ` : ''}
                <div id="ordersList"></div>
            </div>
            ${this.currentCart.length > 0 ? this.renderCart() : ''}
        `;
        this.renderOrders();
    },

    showNewOrderForm() {
        const tables = storage.read('tables');
        const menu = storage.read('menu').filter(item => item.available);
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h2>Жаңа тапсырыс</h2>
                    <span class="close" onclick="ordersModule.closeOrderModal()">&times;</span>
                </div>
                <div class="form-group">
                    <label>Үстел:</label>
                    <select id="orderTable" onchange="ordersModule.selectTable(this.value)" required>
                        <option value="">Таңдаңыз...</option>
                        ${tables.map(table => `
                            <option value="${table.id}" ${table.status !== 'available' ? 'disabled' : ''}>
                                Үстел ${table.number} (${table.capacity} орын) - ${table.status === 'available' ? 'Бос' : table.status}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Мәзір:</label>
                    <select id="menuSelect" onchange="ordersModule.addToCart()">
                        <option value="">Тағам таңдаңыз...</option>
                        ${menu.map(item => `
                            <option value="${item.id}" data-price="${item.price}">${item.name} - ${item.price} ₸</option>
                        `).join('')}
                    </select>
                </div>
                <div id="orderCart" style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 5px;">
                    <h3>Себет:</h3>
                    <div id="cartItems"></div>
                    <div id="cartTotal" style="font-size: 20px; font-weight: 700; margin-top: 15px;"></div>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-success" onclick="ordersModule.createOrder()">Тапсырыс беру</button>
                    <button type="button" class="btn btn-secondary" onclick="ordersModule.closeOrderModal()">Болдырмау</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        this.currentCart = [];
        this.selectedTable = null;
        this.updateCartDisplay();
    },

    selectTable(tableId) {
        this.selectedTable = parseInt(tableId);
    },

    addToCart() {
        const select = document.getElementById('menuSelect');
        const selectedOption = select.options[select.selectedIndex];
        if (!selectedOption.value) return;

        const menuId = parseInt(selectedOption.value);
        const menu = storage.read('menu', menuId);
        
        const existingItem = this.currentCart.find(item => item.id === menuId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.currentCart.push({
                id: menuId,
                name: menu.name,
                price: menu.price,
                quantity: 1
            });
        }
        
        select.value = '';
        this.updateCartDisplay();
    },

    removeFromCart(menuId) {
        this.currentCart = this.currentCart.filter(item => item.id !== menuId);
        this.updateCartDisplay();
    },

    updateCartQuantity(menuId, change) {
        const item = this.currentCart.find(item => item.id === menuId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                this.removeFromCart(menuId);
            } else {
                this.updateCartDisplay();
            }
        }
    },

    updateCartDisplay() {
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        
        if (!cartItems) return;

        if (this.currentCart.length === 0) {
            cartItems.innerHTML = '<p>Себет бос</p>';
            cartTotal.textContent = '';
            return;
        }

        cartItems.innerHTML = this.currentCart.map(item => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #ddd;">
                <div>
                    <strong>${item.name}</strong> - ${item.price} ₸
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <button class="btn btn-secondary" onclick="ordersModule.updateCartQuantity(${item.id}, -1)" style="padding: 5px 10px;">-</button>
                    <span>${item.quantity}</span>
                    <button class="btn btn-secondary" onclick="ordersModule.updateCartQuantity(${item.id}, 1)" style="padding: 5px 10px;">+</button>
                    <button class="btn btn-danger" onclick="ordersModule.removeFromCart(${item.id})" style="padding: 5px 10px;">Жою</button>
                </div>
            </div>
        `).join('');

        const total = this.currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = `Жалпы: ${total} ₸`;
    },

    createOrder() {
        if (!this.selectedTable) {
            auth.showNotification('Үстелді таңдаңыз!', 'error');
            return;
        }
        if (this.currentCart.length === 0) {
            auth.showNotification('Себетке тағам қосыңыз!', 'error');
            return;
        }

        const order = {
            tableId: this.selectedTable,
            items: this.currentCart.map(item => ({
                menuId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity
            })),
            total: this.currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            status: 'pending',
            waiterId: auth.currentUser.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        storage.create('orders', order);
        
        // Обновляем статус стола
        const table = storage.read('tables', this.selectedTable);
        if (table) {
            storage.update('tables', this.selectedTable, { status: 'occupied' });
        }

        auth.showNotification('Тапсырыс сәтті қабылданды!');
        this.closeOrderModal();
        this.render();
    },

    closeOrderModal() {
        document.querySelector('.modal')?.remove();
        this.currentCart = [];
        this.selectedTable = null;
    },

    renderOrders() {
        const ordersList = document.getElementById('ordersList');
        let orders = storage.read('orders');
        
        // Фильтр по роли
        const role = auth.currentUser?.role;
        if (role === 'waiter') {
            orders = orders.filter(order => order.waiterId === auth.currentUser.id);
        }

        if (orders.length === 0) {
            ordersList.innerHTML = '<p>Тапсырыстар жоқ</p>';
            return;
        }

        const statusNames = {
            pending: 'Қабылданды',
            preparing: 'Дайындалуда',
            ready: 'Дайын',
            delivered: 'Жеткізілді',
            cancelled: 'Болдырылды'
        };

        ordersList.innerHTML = `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Үстел</th>
                            <th>Тағамдар</th>
                            <th>Жалпы</th>
                            <th>Статус</th>
                            <th>Уақыт</th>
                            <th>Әрекеттер</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.map(order => {
                            const table = storage.read('tables', order.tableId);
                            return `
                                <tr>
                                    <td>#${order.id}</td>
                                    <td>Үстел ${table?.number || order.tableId}</td>
                                    <td>
                                        ${order.items.map(item => `${item.name} x${item.quantity}`).join('<br>')}
                                    </td>
                                    <td>${order.total} ₸ ${order.paid ? '<span style="color: #28a745;">✓ Төленген</span>' : ''}</td>
                                    <td>
                                        <span class="status status-${order.status}">${statusNames[order.status] || order.status}</span>
                                    </td>
                                    <td>${new Date(order.createdAt).toLocaleString('kk-KZ')}</td>
                                    <td>
                                        ${this.getOrderActions(order)}
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    getOrderActions(order) {
        const role = auth.currentUser?.role;
        const actions = [];

        if (role === 'chef' || role === 'admin' || role === 'manager') {
            if (order.status === 'pending') {
                actions.push(`<button class="btn btn-info" onclick="ordersModule.updateStatus(${order.id}, 'preparing')">Дайындау</button>`);
            }
            if (order.status === 'preparing') {
                actions.push(`<button class="btn btn-success" onclick="ordersModule.updateStatus(${order.id}, 'ready')">Дайын</button>`);
            }
        }

        if (role === 'waiter' || role === 'admin' || role === 'manager') {
            if (order.status === 'ready') {
                actions.push(`<button class="btn btn-success" onclick="ordersModule.updateStatus(${order.id}, 'delivered')">Жеткізу</button>`);
            }
        }

        if (order.status !== 'delivered' && order.status !== 'cancelled') {
            if (role === 'waiter' || role === 'admin' || role === 'manager') {
                actions.push(`<button class="btn btn-warning" onclick="ordersModule.editOrder(${order.id})">Өзгерту</button>`);
                actions.push(`<button class="btn btn-danger" onclick="ordersModule.cancelOrder(${order.id})">Болдыру</button>`);
            }
        }

        if (order.status === 'delivered') {
            if (role === 'cashier' || role === 'admin' || role === 'manager') {
                if (!order.paid) {
                    actions.push(`<button class="btn btn-primary" onclick="ordersModule.showPaymentModal(${order.id})">Төлеу</button>`);
                }
                actions.push(`<button class="btn btn-success" onclick="ordersModule.generateReceipt(${order.id})">Чек</button>`);
            }
        }

        return actions.join(' ');
    },

    updateStatus(orderId, newStatus) {
        storage.update('orders', orderId, { 
            status: newStatus,
            updatedAt: new Date().toISOString()
        });
        auth.showNotification('Статус сәтті жаңартылды!');
        this.render();
    },

    editOrder(orderId) {
        auth.showNotification('Өзгерту функциясы дамып жатыр', 'info');
    },

    cancelOrder(orderId) {
        if (confirm('Тапсырысты болдыруға сенімдісіз бе?')) {
            const order = storage.read('orders', orderId);
            storage.update('orders', orderId, { 
                status: 'cancelled',
                updatedAt: new Date().toISOString()
            });
            
            // Освобождаем стол
            if (order.tableId) {
                storage.update('tables', order.tableId, { status: 'available' });
            }
            
            auth.showNotification('Тапсырыс болдырылды!');
            this.render();
        }
    },

    showPaymentModal(orderId) {
        const order = storage.read('orders', orderId);
        if (!order || order.status !== 'delivered') {
            auth.showNotification('Тек жеткізілген тапсырыстарды төлеуге болады!', 'error');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Төлем</h2>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div style="margin-bottom: 20px;">
                    <h3>Тапсырыс #${order.id}</h3>
                    <p><strong>Жалпы сома:</strong> ${order.total} ₸</p>
                </div>
                <div class="form-group">
                    <label>Төлем түрі:</label>
                    <select id="paymentType" required>
                        <option value="cash">Қолма-қол</option>
                        <option value="card">Карта</option>
                        <option value="qr">QR код</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button class="btn btn-success" onclick="ordersModule.processPayment(${orderId})">Төлеу</button>
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Болдырмау</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    processPayment(orderId) {
        const paymentType = document.getElementById('paymentType').value;
        const payment = paymentsModule.processPayment(orderId, paymentType);
        if (payment) {
            document.querySelector('.modal').remove();
            this.render();
        }
    },

    generateReceipt(orderId) {
        const order = storage.read('orders', orderId);
        if (!order) return;

        const payment = storage.read('payments').find(p => p.orderId === orderId);
        const paymentType = payment ? paymentsModule.getPaymentTypeName(payment.type) : 'Төленбеген';

        const receipt = `
            ================================
            РЕСТОРАН ЧЕК
            ================================
            Тапсырыс #${order.id}
            Күні: ${new Date(order.createdAt).toLocaleString('kk-KZ')}
            Үстел: ${storage.read('tables', order.tableId)?.number || order.tableId}
            ================================
            ${order.items.map(item => `
            ${item.name} x${item.quantity} = ${item.price * item.quantity} ₸
            `).join('')}
            ================================
            ЖАЛПЫ: ${order.total} ₸
            Төлем түрі: ${paymentType}
            ================================
        `;

        // Создаем модальное окно с чеком
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Чек</h2>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <pre style="font-family: monospace; white-space: pre-wrap; background: #f8f9fa; padding: 20px; border-radius: 5px;">${receipt}</pre>
                <div class="form-actions">
                    <button class="btn btn-success" onclick="window.print()">Басып шығару</button>
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Жабу</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    renderCart() {
        // Корзина отображается в модальном окне
        return '';
    }
};

