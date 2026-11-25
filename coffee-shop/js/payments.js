// Модуль платежей и отчетности
const paymentsModule = {
    render() {
        const mainContent = document.getElementById('mainContent');
        const role = auth.currentUser?.role;
        
        mainContent.innerHTML = `
            <div class="content-section">
                <h2>Төлем және есеп-қисап</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-label">Бүгінгі табыс</div>
                        <div class="stat-value">${this.getTodayRevenue()} ₸</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Апталық табыс</div>
                        <div class="stat-value">${this.getWeekRevenue()} ₸</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Айлық табыс</div>
                        <div class="stat-value">${this.getMonthRevenue()} ₸</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Бүгінгі тапсырыстар</div>
                        <div class="stat-value">${this.getTodayOrders()}</div>
                    </div>
                </div>
                ${role === 'cashier' || role === 'admin' || role === 'manager' ? `
                    <div style="margin: 30px 0;">
                        <h3>Төлемдер</h3>
                        <div id="paymentsList"></div>
                    </div>
                ` : ''}
                ${role === 'admin' || role === 'manager' ? `
                    <div style="margin: 30px 0;">
                        <h3>Есептер</h3>
                        <div class="form-actions">
                            <button class="btn btn-info" onclick="paymentsModule.generateDailyReport()">Күндік есеп</button>
                            <button class="btn btn-info" onclick="paymentsModule.generateWeeklyReport()">Апталық есеп</button>
                            <button class="btn btn-info" onclick="paymentsModule.generateMonthlyReport()">Айлық есеп</button>
                            <button class="btn btn-success" onclick="paymentsModule.exportToExcel()">Excel-ге экспорт</button>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        if (role === 'cashier' || role === 'admin' || role === 'manager') {
            this.renderPayments();
        }
    },

    renderPayments() {
        const paymentsList = document.getElementById('paymentsList');
        const payments = storage.read('payments');
        
        if (payments.length === 0) {
            paymentsList.innerHTML = '<p>Төлемдер жоқ</p>';
            return;
        }

        paymentsList.innerHTML = `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Тапсырыс</th>
                            <th>Түрі</th>
                            <th>Клиент</th>
                            <th>Сома</th>
                            <th>Төлем түрі</th>
                            <th>Күні</th>
                            <th>Әрекеттер</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${payments.map(payment => {
                            const isDelivery = payment.deliveryOrder || false;
                            const orderType = isDelivery ? '🚚 Жеткізу' : '🍽️ Ресторан';
                            const orderTypeClass = isDelivery ? 'delivery-payment' : 'restaurant-payment';
                            
                            // Получаем имя клиента для доставки
                            let customerName = '-';
                            if (isDelivery) {
                                const deliveryOrders = storage.read('deliveryOrders') || [];
                                const order = deliveryOrders.find(o => o.id === payment.orderId);
                                if (order && order.customerName) {
                                    customerName = order.customerName;
                                }
                            } else {
                                const orders = storage.read('orders') || [];
                                const order = orders.find(o => o.id === payment.orderId);
                                if (order && order.customerName) {
                                    customerName = order.customerName;
                                }
                            }
                            
                            return `
                                <tr class="${orderTypeClass}">
                                    <td>#${payment.id}</td>
                                    <td>Тапсырыс #${payment.orderId}</td>
                                    <td><strong>${orderType}</strong></td>
                                    <td>${customerName}</td>
                                    <td>${payment.amount.toLocaleString()} ₸</td>
                                    <td>${this.getPaymentTypeName(payment.type)}</td>
                                    <td>${new Date(payment.date).toLocaleString('kk-KZ')}</td>
                                    <td>
                                        <button class="btn btn-info" onclick="paymentsModule.viewPayment(${payment.id})">Көру</button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    getPaymentTypeName(type) {
        const types = {
            cash: 'Қолма-қол',
            card: 'Карта',
            qr: 'QR код'
        };
        return types[type] || type;
    },

    processPayment(orderId, type) {
        const order = storage.read('orders', orderId);
        if (!order || order.status !== 'delivered') {
            auth.showNotification('Тек жеткізілген тапсырыстарды төлеуге болады!', 'error');
            return;
        }

        const payment = storage.create('payments', {
            orderId,
            amount: order.total,
            type,
            date: new Date().toISOString(),
            cashierId: auth.currentUser?.id || null
        });

        // Обновляем статус заказа
        storage.update('orders', orderId, { paid: true });
        
        // Освобождаем стол
        if (order.tableId) {
            storage.update('tables', order.tableId, { status: 'available' });
        }

        auth.showNotification('Төлем сәтті өтті!');
        this.render();
        return payment;
    },
    
    processDeliveryPayment(orderId, type, amount) {
        // Обработка платежей для заказов доставки
        const payment = storage.create('payments', {
            orderId,
            amount: amount,
            type,
            date: new Date().toISOString(),
            deliveryOrder: true,
            cashierId: auth.currentUser?.id || null
        });

        // Обновляем статус заказа доставки
        const deliveryOrders = storage.read('deliveryOrders');
        const orderIndex = deliveryOrders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
            deliveryOrders[orderIndex].paid = true;
            deliveryOrders[orderIndex].paymentType = type;
            const data = storage.getData();
            data.deliveryOrders = deliveryOrders;
            storage.saveData(data);
        }

        return payment;
    },

    viewPayment(id) {
        const payment = storage.read('payments', id);
        if (!payment) return;

        const isDelivery = payment.deliveryOrder || false;
        let order = null;
        
        if (isDelivery) {
            const deliveryOrders = storage.read('deliveryOrders');
            order = deliveryOrders.find(o => o.id === payment.orderId);
        } else {
            order = storage.read('orders', payment.orderId);
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h2>Төлем ақпараты</h2>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div style="padding: 20px;">
                    <div style="background: ${isDelivery ? '#e3f2fd' : '#e8f5e9'}; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid ${isDelivery ? '#2196f3' : '#28a745'};">
                        <p style="margin: 5px 0;"><strong>Тапсырыс түрі:</strong> ${isDelivery ? '🚚 Жеткізу тапсырысы' : '🍽️ Ресторан тапсырысы'}</p>
                        <p style="margin: 5px 0;"><strong>Төлем ID:</strong> #${payment.id}</p>
                        <p style="margin: 5px 0;"><strong>Тапсырыс ID:</strong> #${payment.orderId}</p>
                        ${order && order.customerName ? `<p style="margin: 5px 0;"><strong>👤 Клиент:</strong> ${order.customerName}</p>` : ''}
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <p><strong>Сома:</strong> <span style="font-size: 20px; color: #28a745; font-weight: bold;">${payment.amount.toLocaleString()} ₸</span></p>
                        <p><strong>Төлем түрі:</strong> ${this.getPaymentTypeName(payment.type)}</p>
                        <p><strong>Күні:</strong> ${new Date(payment.date).toLocaleString('kk-KZ')}</p>
                    </div>
                    
                    ${order ? `
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px;">
                            <h3 style="margin-bottom: 15px;">Тапсырыс ақпараты:</h3>
                            ${isDelivery ? `
                                <p><strong>👤 Аты-жөні:</strong> ${order.customerName || '-'}</p>
                                <p><strong>📱 Телефон:</strong> ${order.phone || '-'}</p>
                                <p><strong>📍 Мекенжай:</strong> ${order.address || '-'}</p>
                                <p><strong>Түрі:</strong> ${order.deliveryType === 'delivery' ? '🚚 Жеткізу' : '📦 Алып кету'}</p>
                                <p><strong>Статус:</strong> ${order.status || 'pending'}</p>
                            ` : order.tableId ? `
                                <p><strong>Үстел:</strong> Үстел ${order.tableId}</p>
                            ` : ''}
                            <div style="margin-top: 15px;">
                                <strong>Тағамдар:</strong>
                                <ul style="margin-top: 10px; padding-left: 20px;">
                                    ${order.items.map(item => `<li style="margin-bottom: 5px;">${item.name} x${item.quantity} = ${(item.price * item.quantity).toLocaleString()} ₸</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    ` : '<p style="color: #666;">Тапсырыс ақпараты табылмады</p>'}
                </div>
                <div class="form-actions">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Жабу</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    getTodayRevenue() {
        const today = new Date().toDateString();
        const payments = storage.read('payments');
        return payments
            .filter(p => new Date(p.date).toDateString() === today)
            .reduce((sum, p) => sum + p.amount, 0);
    },

    getWeekRevenue() {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const payments = storage.read('payments');
        return payments
            .filter(p => new Date(p.date) >= weekAgo)
            .reduce((sum, p) => sum + p.amount, 0);
    },

    getMonthRevenue() {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        const payments = storage.read('payments');
        return payments
            .filter(p => new Date(p.date) >= monthAgo)
            .reduce((sum, p) => sum + p.amount, 0);
    },

    getTodayOrders() {
        const today = new Date().toDateString();
        const orders = storage.read('orders');
        return orders.filter(o => new Date(o.createdAt).toDateString() === today).length;
    },

    generateDailyReport() {
        const today = new Date().toDateString();
        const payments = storage.read('payments').filter(p => new Date(p.date).toDateString() === today);
        const orders = storage.read('orders').filter(o => new Date(o.createdAt).toDateString() === today);
        
        const revenue = payments.reduce((sum, p) => sum + p.amount, 0);
        
        this.showReport('Күндік есеп', {
            date: today,
            orders: orders.length,
            revenue,
            payments: payments.length
        });
    },

    generateWeeklyReport() {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const payments = storage.read('payments').filter(p => new Date(p.date) >= weekAgo);
        const orders = storage.read('orders').filter(o => new Date(o.createdAt) >= weekAgo);
        
        const revenue = payments.reduce((sum, p) => sum + p.amount, 0);
        
        this.showReport('Апталық есеп', {
            period: 'Соңғы 7 күн',
            orders: orders.length,
            revenue,
            payments: payments.length
        });
    },

    generateMonthlyReport() {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        const payments = storage.read('payments').filter(p => new Date(p.date) >= monthAgo);
        const orders = storage.read('orders').filter(o => new Date(o.createdAt) >= monthAgo);
        
        const revenue = payments.reduce((sum, p) => sum + p.amount, 0);
        
        this.showReport('Айлық есеп', {
            period: 'Соңғы 30 күн',
            orders: orders.length,
            revenue,
            payments: payments.length
        });
    },

    showReport(title, data) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div>
                    ${data.date ? `<p><strong>Күні:</strong> ${data.date}</p>` : ''}
                    ${data.period ? `<p><strong>Кезең:</strong> ${data.period}</p>` : ''}
                    <p><strong>Тапсырыстар саны:</strong> ${data.orders}</p>
                    <p><strong>Төлемдер саны:</strong> ${data.payments}</p>
                    <p><strong>Жалпы табыс:</strong> ${data.revenue} ₸</p>
                </div>
                <div class="form-actions">
                    <button class="btn btn-success" onclick="window.print()">Басып шығару</button>
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Жабу</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    exportToExcel() {
        auth.showNotification('Excel экспорт функциясы дамып жатыр', 'info');
    }
};

