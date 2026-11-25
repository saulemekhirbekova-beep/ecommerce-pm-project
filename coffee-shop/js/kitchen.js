// Модуль панели кухни
const kitchenModule = {
    intervalId: null,

    render() {
        // Очищаем предыдущий интервал, если он существует
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="content-section">
                <h2>Асхана панелі</h2>
                <div id="kitchenOrders"></div>
            </div>
        `;
        this.renderKitchenOrders();
        // Автообновление каждые 5 секунд
        this.intervalId = setInterval(() => this.renderKitchenOrders(), 5000);
    },

    renderKitchenOrders() {
        const kitchenOrders = document.getElementById('kitchenOrders');
        
        // Проверяем существование элемента
        if (!kitchenOrders) {
            // Если элемента нет, очищаем интервал
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
            return;
        }

        // Получаем заказы ресторана
        const restaurantOrders = storage.read('orders').filter(o => 
            o.status === 'pending' || o.status === 'preparing'
        ).map(o => ({ ...o, orderType: 'restaurant' }));

        // Получаем заказы доставки
        const deliveryOrders = (storage.read('deliveryOrders') || []).filter(o => 
            (o.status === 'pending' || o.status === 'preparing') && o.deliveryType === 'delivery'
        ).map(o => ({ ...o, orderType: 'delivery' }));

        // Объединяем все заказы
        const allOrders = [...restaurantOrders, ...deliveryOrders];

        if (allOrders.length === 0) {
            kitchenOrders.innerHTML = '<p>Тапсырыстар жоқ</p>';
            return;
        }

        // Сортируем: сначала pending, потом preparing
        allOrders.sort((a, b) => {
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (a.status !== 'pending' && b.status === 'pending') return 1;
            return new Date(a.createdAt) - new Date(b.createdAt);
        });

        kitchenOrders.innerHTML = `
            <div class="card-grid">
                ${allOrders.map(order => {
                    const timeElapsed = this.getTimeElapsed(order.createdAt);
                    const statusClass = order.status === 'pending' ? 'status-pending' : 'status-preparing';
                    const isDelivery = order.orderType === 'delivery';
                    const borderColor = order.status === 'pending' ? (isDelivery ? '#2196f3' : '#ffc107') : (isDelivery ? '#1976d2' : '#ff9800');
                    
                    return `
                        <div class="card" style="border-left: 5px solid ${borderColor};">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                                <div>
                                    <h3>Тапсырыс #${order.id}</h3>
                                    ${isDelivery ? `
                                        <p style="color: #2196f3; font-weight: bold;">🚚 Жеткізу</p>
                                        <p><strong>Клиент:</strong> ${order.customerName || '-'}</p>
                                        <p><strong>Телефон:</strong> ${order.phone || '-'}</p>
                                    ` : `
                                        <p>Үстел ${storage.read('tables', order.tableId)?.number || order.tableId}</p>
                                    `}
                                </div>
                                <span class="status ${statusClass}">
                                    ${order.status === 'pending' ? 'Күтуде' : 'Дайындалуда'}
                                </span>
                            </div>
                            ${isDelivery && order.address ? `
                                <div style="margin-bottom: 15px; padding: 8px; background: #e3f2fd; border-radius: 5px;">
                                    <strong>📍 Мекенжай:</strong> ${order.address}
                                </div>
                            ` : ''}
                            <div style="margin-bottom: 15px;">
                                <strong>Уақыт:</strong> ${timeElapsed}
                            </div>
                            <div style="margin-bottom: 15px;">
                                <strong>Тағамдар:</strong>
                                <ul style="margin-top: 10px; padding-left: 20px;">
                                    ${order.items.map(item => `
                                        <li>${item.name} x${item.quantity}</li>
                                    `).join('')}
                                </ul>
                            </div>
                            <div class="card-actions">
                                ${order.status === 'pending' ? `
                                    <button class="btn btn-info" onclick="kitchenModule.startPreparing(${order.id}, '${order.orderType}')">Дайындау бастау</button>
                                ` : ''}
                                ${order.status === 'preparing' ? `
                                    <button class="btn btn-success" onclick="kitchenModule.markReady(${order.id}, '${order.orderType}')">Дайын</button>
                                ` : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    getTimeElapsed(createdAt) {
        const now = new Date();
        const created = new Date(createdAt);
        const diff = Math.floor((now - created) / 1000); // секунды
        
        if (diff < 60) return `${diff} сек`;
        if (diff < 3600) return `${Math.floor(diff / 60)} мин`;
        return `${Math.floor(diff / 3600)} сағ ${Math.floor((diff % 3600) / 60)} мин`;
    },

    startPreparing(orderId, orderType = 'restaurant') {
        if (orderType === 'delivery') {
            // Обновляем заказ доставки
            const deliveryOrders = storage.read('deliveryOrders');
            const orderIndex = deliveryOrders.findIndex(o => o.id === orderId);
            if (orderIndex !== -1) {
                deliveryOrders[orderIndex].status = 'preparing';
                deliveryOrders[orderIndex].updatedAt = new Date().toISOString();
                const data = storage.getData();
                data.deliveryOrders = deliveryOrders;
                storage.saveData(data);
            }
        } else {
            // Обновляем заказ ресторана
            storage.update('orders', orderId, {
                status: 'preparing',
                updatedAt: new Date().toISOString()
            });
        }
        auth.showNotification('Дайындау басталды!');
        this.renderKitchenOrders();
    },

    markReady(orderId, orderType = 'restaurant') {
        if (orderType === 'delivery') {
            // Обновляем заказ доставки
            const deliveryOrders = storage.read('deliveryOrders');
            const orderIndex = deliveryOrders.findIndex(o => o.id === orderId);
            if (orderIndex !== -1) {
                deliveryOrders[orderIndex].status = 'ready';
                deliveryOrders[orderIndex].updatedAt = new Date().toISOString();
                const data = storage.getData();
                data.deliveryOrders = deliveryOrders;
                storage.saveData(data);
            }
        } else {
            // Обновляем заказ ресторана
            storage.update('orders', orderId, {
                status: 'ready',
                updatedAt: new Date().toISOString()
            });
        }
        auth.showNotification('Тағам дайын!');
        this.renderKitchenOrders();
    }
};

