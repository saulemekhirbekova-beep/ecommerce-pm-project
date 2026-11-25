// Админ панель
const adminModule = {
    render() {
        if (!auth.hasPermission('admin')) {
            document.getElementById('mainContent').innerHTML = `
                <div class="content-section">
                    <h2>Қол жеткізу шектеулі</h2>
                    <p>Бұл бөлімге тек админ кіре алады.</p>
                </div>
            `;
            return;
        }

        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="content-section">
                <h2>Админ панель</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-label">Жалпы тапсырыстар</div>
                        <div class="stat-value">${this.getTotalOrders()}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Жеткізу тапсырыстары</div>
                        <div class="stat-value">${this.getTotalDeliveryOrders()}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Жалпы табыс</div>
                        <div class="stat-value">${this.getTotalRevenue().toLocaleString()} ₸</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Бүгінгі табыс</div>
                        <div class="stat-value">${this.getTodayRevenue().toLocaleString()} ₸</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Клиенттер</div>
                        <div class="stat-value">${this.getTotalCustomers()}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Қызметкерлер</div>
                        <div class="stat-value">${this.getTotalStaff()}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Брондаулар</div>
                        <div class="stat-value">${this.getTotalReservations()}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Банкет брондаулары</div>
                        <div class="stat-value">${this.getTotalBanquetBookings()}</div>
                    </div>
                </div>
                
                <div style="margin-top: 30px;">
                    <h3>👨‍🍳 Асханаға берілген тапсырыстар</h3>
                    <div id="kitchenOrdersSection"></div>
                </div>
                
                <div style="margin-top: 30px;">
                    <h3>📦 Жеткізу тапсырыстары (Гость төлемдері)</h3>
                    <div id="deliveryOrdersSection"></div>
                </div>
                
                <div style="margin-top: 30px;">
                    <h3>💳 Соңғы төлемдер</h3>
                    <div id="recentPaymentsSection"></div>
                </div>
                
                <div style="margin-top: 30px;">
                    <h3>📅 Брондаулар (Үстелдер)</h3>
                    <div id="reservationsSection"></div>
                </div>
                
                <div style="margin-top: 30px;">
                    <h3>🏛️ Банкет залдары брондаулары</h3>
                    <div id="banquetBookingsSection"></div>
                </div>
                
                <div style="margin-top: 30px;">
                    <h3>Жүйе басқару</h3>
                    <div class="form-actions">
                        <button class="btn btn-info" onclick="adminModule.viewLogs()">Кіру журналы</button>
                        <button class="btn btn-info" onclick="adminModule.backupData()">Резервтік көшіру</button>
                        <button class="btn btn-info" onclick="adminModule.exportData()">Деректерді экспорттау</button>
                        <button class="btn btn-warning" onclick="adminModule.clearData()">Деректерді тазалау</button>
                    </div>
                </div>

                <div style="margin-top: 30px;">
                    <h3>Соңғы әрекеттер</h3>
                    <div id="recentLogs"></div>
                </div>
            </div>
        `;
        this.renderRecentLogs();
        this.renderKitchenOrders();
        this.renderDeliveryOrders();
        this.renderRecentPayments();
        this.renderReservations();
        this.renderBanquetBookings();
    },

    getTotalOrders() {
        return storage.read('orders').length;
    },

    getTotalDeliveryOrders() {
        const deliveryOrders = storage.read('deliveryOrders') || [];
        return deliveryOrders.length;
    },

    getTotalRevenue() {
        const payments = storage.read('payments') || [];
        return payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    },

    getTodayRevenue() {
        const payments = storage.read('payments') || [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return payments
            .filter(p => {
                const paymentDate = new Date(p.date);
                paymentDate.setHours(0, 0, 0, 0);
                return paymentDate.getTime() === today.getTime();
            })
            .reduce((sum, p) => sum + (p.amount || 0), 0);
    },

    getTotalCustomers() {
        return storage.read('customers').length;
    },

    getTotalStaff() {
        return storage.read('users').filter(u => u.role !== 'guest').length;
    },

    getTotalReservations() {
        return (storage.read('reservations') || []).length;
    },

    getTotalBanquetBookings() {
        return (storage.read('banquetBookings') || []).length;
    },

    renderKitchenOrders() {
        const section = document.getElementById('kitchenOrdersSection');
        if (!section) return;
        
        // Получаем заказы ресторана со статусами pending и preparing
        const restaurantOrders = storage.read('orders').filter(o => 
            o.status === 'pending' || o.status === 'preparing'
        ).map(o => ({ ...o, orderType: 'restaurant' }));
        
        // Получаем заказы доставки со статусами pending и preparing
        const deliveryOrders = (storage.read('deliveryOrders') || []).filter(o => 
            (o.status === 'pending' || o.status === 'preparing') && o.deliveryType === 'delivery'
        ).map(o => ({ ...o, orderType: 'delivery' }));
        
        // Объединяем все заказы
        const allOrders = [...restaurantOrders, ...deliveryOrders];
        
        if (allOrders.length === 0) {
            section.innerHTML = '<p style="color: #666; padding: 20px; text-align: center;">Асханаға берілген тапсырыстар жоқ</p>';
            return;
        }
        
        // Сортируем: сначала pending, потом preparing
        allOrders.sort((a, b) => {
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (a.status !== 'pending' && b.status === 'pending') return 1;
            return new Date(a.createdAt) - new Date(b.createdAt);
        });
        
        const statusNames = {
            pending: '⏳ Күтуде',
            preparing: '👨‍🍳 Дайындалуда'
        };
        
        section.innerHTML = `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Түрі</th>
                            <th>Клиент/Үстел</th>
                            <th>Тағамдар</th>
                            <th>Сома</th>
                            <th>Статус</th>
                            <th>Жіберілді</th>
                            <th>Уақыт өтті</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${allOrders.map(order => {
                            const timeElapsed = this.getTimeElapsed(order.createdAt);
                            const isDelivery = order.orderType === 'delivery';
                            const rowStyle = order.status === 'pending' 
                                ? (isDelivery ? 'background: #e3f2fd;' : 'background: #fff3cd;')
                                : (isDelivery ? 'background: #bbdefb;' : 'background: #ffe0b2;');
                            
                            return `
                                <tr style="${rowStyle}">
                                    <td><strong>#${order.id}</strong></td>
                                    <td>${isDelivery ? '<span style="color: #2196f3; font-weight: bold;">🚚 Жеткізу</span>' : '<span>🍽️ Ресторан</span>'}</td>
                                    <td>
                                        ${isDelivery ? `
                                            <strong>${order.customerName || '-'}</strong><br>
                                            <small>${order.phone || '-'}</small>
                                        ` : `
                                            ${storage.read('tables', order.tableId) ? `Үстел ${storage.read('tables', order.tableId).number}` : `ID: ${order.tableId}`}
                                        `}
                                    </td>
                                    <td>
                                        ${order.items.map(item => `${item.name} x${item.quantity}`).join('<br>')}
                                    </td>
                                    <td><strong>${order.total ? order.total.toLocaleString() : '0'} ₸</strong></td>
                                    <td>
                                        <span class="status status-${order.status}">${statusNames[order.status] || order.status}</span>
                                    </td>
                                    <td>${new Date(order.createdAt).toLocaleString('kk-KZ')}</td>
                                    <td><strong style="color: ${order.status === 'pending' ? '#dc3545' : '#ff9800'};">${timeElapsed}</strong></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 15px;">
                <button class="btn btn-info" onclick="app.loadSection('kitchen')">Асхана панелін ашу</button>
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

    renderRecentLogs() {
        const recentLogs = document.getElementById('recentLogs');
        const logs = storage.read('logs').slice(-10).reverse();
        
        if (logs.length === 0) {
            recentLogs.innerHTML = '<p>Журнал жазбалары жоқ</p>';
            return;
        }

        recentLogs.innerHTML = `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Уақыт</th>
                            <th>Әрекет</th>
                            <th>Қолданушы ID</th>
                            <th>Детальдар</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${logs.map(log => `
                            <tr>
                                <td>${new Date(log.timestamp).toLocaleString('kk-KZ')}</td>
                                <td>${log.action}</td>
                                <td>#${log.userId}</td>
                                <td>${JSON.stringify(log.details)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    viewLogs() {
        const logs = storage.read('logs').reverse();
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 900px;">
                <div class="modal-header">
                    <h2>Кіру журналы</h2>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div class="table-container" style="max-height: 500px; overflow-y: auto;">
                    <table>
                        <thead>
                            <tr>
                                <th>Уақыт</th>
                                <th>Әрекет</th>
                                <th>Қолданушы ID</th>
                                <th>Детальдар</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${logs.map(log => `
                                <tr>
                                    <td>${new Date(log.timestamp).toLocaleString('kk-KZ')}</td>
                                    <td>${log.action}</td>
                                    <td>#${log.userId}</td>
                                    <td>${JSON.stringify(log.details)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="form-actions">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Жабу</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    backupData() {
        const data = storage.getData();
        const backup = JSON.stringify(data, null, 2);
        const blob = new Blob([backup], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        auth.showNotification('Резервтік көшірме сәтті жүктелді!');
    },

    exportData() {
        const data = storage.getData();
        
        // Экспорт в JSON
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        auth.showNotification('Деректер сәтті экспортталды!');
    },

    renderDeliveryOrders() {
        const section = document.getElementById('deliveryOrdersSection');
        if (!section) return;
        
        const deliveryOrders = (storage.read('deliveryOrders') || []).slice(-10).reverse();
        
        if (deliveryOrders.length === 0) {
            section.innerHTML = '<p style="color: #666; padding: 20px; text-align: center;">Жеткізу тапсырыстары жоқ</p>';
            return;
        }
        
        section.innerHTML = `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Клиент</th>
                            <th>Түрі</th>
                            <th>Тағамдар</th>
                            <th>Сома</th>
                            <th>Телефон</th>
                            <th>Мекенжай</th>
                            <th>Төлем</th>
                            <th>Статус</th>
                            <th>Уақыт</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${deliveryOrders.map(order => {
                            const paymentTypeNames = {
                                cash: '💵 Қолма-қол',
                                card: '💳 Карта',
                                qr: '📱 QR код'
                            };
                            const statusNames = {
                                pending: '⏳ Күтуде',
                                ready: '✅ Дайын',
                                delivered: '🚚 Жеткізілді',
                                cancelled: '❌ Бас тартылды'
                            };
                            
                            return `
                                <tr style="${order.paid ? 'background: #e8f5e9;' : ''}">
                                    <td>#${order.id}</td>
                                    <td><strong>${order.customerName || '-'}</strong></td>
                                    <td>${order.deliveryType === 'delivery' ? '🚚 Жеткізу' : '📦 Алып кету'}</td>
                                    <td>
                                        ${order.items.map(item => `${item.name} x${item.quantity}`).join('<br>')}
                                    </td>
                                    <td><strong>${order.total.toLocaleString()} ₸</strong></td>
                                    <td>${order.phone || '-'}</td>
                                    <td>${order.address || '-'}</td>
                                    <td>
                                        ${order.paid ? `<span style="color: #28a745; font-weight: bold;">✓ ${paymentTypeNames[order.paymentType] || order.paymentType}</span>` : '<span style="color: #dc3545;">Төленбеген</span>'}
                                    </td>
                                    <td>
                                        <span class="status status-${order.status}">${statusNames[order.status] || order.status}</span>
                                    </td>
                                    <td>${new Date(order.createdAt).toLocaleString('kk-KZ')}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 15px;">
                <button class="btn btn-info" onclick="adminModule.viewAllDeliveryOrders()">Барлық жеткізу тапсырыстарын көру</button>
            </div>
        `;
    },

    renderRecentPayments() {
        const section = document.getElementById('recentPaymentsSection');
        if (!section) return;
        
        const payments = (storage.read('payments') || []).slice(-10).reverse();
        
        if (payments.length === 0) {
            section.innerHTML = '<p style="color: #666; padding: 20px; text-align: center;">Төлемдер жоқ</p>';
            return;
        }
        
        const paymentTypeNames = {
            cash: '💵 Қолма-қол',
            card: '💳 Карта',
            qr: '📱 QR код'
        };
        
        section.innerHTML = `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Тапсырыс</th>
                            <th>Түрі</th>
                            <th>Сома</th>
                            <th>Төлем түрі</th>
                            <th>Күні</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${payments.map(payment => {
                            const isDelivery = payment.deliveryOrder || false;
                            return `
                                <tr style="background: ${isDelivery ? '#e3f2fd;' : '#fff;'}">
                                    <td>#${payment.id}</td>
                                    <td>
                                        ${isDelivery ? '🚚 Жеткізу' : '🍽️ Ресторан'} 
                                        #${payment.orderId}
                                    </td>
                                    <td>${isDelivery ? 'Гость төлемі' : 'Үстел тапсырысы'}</td>
                                    <td><strong style="color: #28a745;">${payment.amount.toLocaleString()} ₸</strong></td>
                                    <td>${paymentTypeNames[payment.type] || payment.type}</td>
                                    <td>${new Date(payment.date).toLocaleString('kk-KZ')}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    renderReservations() {
        const section = document.getElementById('reservationsSection');
        if (!section) return;
        
        const reservations = (storage.read('reservations') || []).slice(-10).reverse();
        
        if (reservations.length === 0) {
            section.innerHTML = '<p style="color: #666; padding: 20px; text-align: center;">Брондаулар жоқ</p>';
            return;
        }
        
        const statusNames = {
            pending: '⏳ Күтуде',
            confirmed: '✅ Расталған',
            cancelled: '❌ Бас тартылды',
            completed: '✓ Аяқталған'
        };
        
        section.innerHTML = `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Клиент аты</th>
                            <th>Телефон</th>
                            <th>Үстел</th>
                            <th>Күні</th>
                            <th>Уақыт</th>
                            <th>Адам саны</th>
                            <th>Тілектер</th>
                            <th>Статус</th>
                            <th>Әрекеттер</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${reservations.map(reservation => {
                            const table = storage.read('tables', reservation.tableId);
                            return `
                                <tr style="${reservation.status === 'confirmed' ? 'background: #e8f5e9;' : reservation.status === 'cancelled' ? 'background: #ffebee;' : ''}">
                                    <td>#${reservation.id}</td>
                                    <td><strong>${reservation.customerName || '-'}</strong></td>
                                    <td>${reservation.phone || '-'}</td>
                                    <td>${table ? `Үстел ${table.number}` : `ID: ${reservation.tableId}`}</td>
                                    <td>${new Date(reservation.date).toLocaleDateString('kk-KZ')}</td>
                                    <td>${reservation.time || '-'}</td>
                                    <td>${reservation.guestCount || '-'}</td>
                                    <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${reservation.wishes || ''}">
                                        ${reservation.wishes || '-'}
                                    </td>
                                    <td>
                                        <span class="status status-${reservation.status}">${statusNames[reservation.status] || reservation.status}</span>
                                    </td>
                                    <td>
                                        ${reservation.status === 'pending' ? `
                                            <button class="btn btn-success" onclick="adminModule.confirmReservation(${reservation.id})" style="padding: 5px 10px; font-size: 12px; margin-right: 5px;">Растау</button>
                                        ` : ''}
                                        <button class="btn btn-danger" onclick="adminModule.deleteReservation(${reservation.id})" style="padding: 5px 10px; font-size: 12px;">Жою</button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 15px;">
                <button class="btn btn-info" onclick="adminModule.viewAllReservations()">Барлық брондауларды көру</button>
            </div>
        `;
    },

    confirmReservation(id) {
        const reservation = storage.read('reservations', id);
        if (!reservation) {
            auth.showNotification('Брондау табылмады!', 'error');
            return;
        }
        
        storage.update('reservations', id, { status: 'confirmed' });
        auth.showNotification('Брондау расталды!', 'success');
        this.renderReservations();
    },

    deleteReservation(id) {
        if (!confirm('Бұл брондауды жоюға сенімдісіз бе?')) {
            return;
        }
        
        const reservations = storage.read('reservations');
        const updatedReservations = reservations.filter(r => r.id !== id);
        const data = storage.getData();
        data.reservations = updatedReservations;
        storage.saveData(data);
        
        auth.showNotification('Брондау жойылды!', 'success');
        this.renderReservations();
    },

    viewAllReservations() {
        const reservations = (storage.read('reservations') || []).reverse();
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 1200px;">
                <div class="modal-header">
                    <h2>📅 Барлық брондаулар</h2>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div class="table-container" style="max-height: 600px; overflow-y: auto;">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Клиент аты</th>
                                <th>Телефон</th>
                                <th>Үстел</th>
                                <th>Күні</th>
                                <th>Уақыт</th>
                                <th>Адам саны</th>
                                <th>Тілектер</th>
                                <th>Статус</th>
                                <th>Әрекеттер</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${reservations.length === 0 ? `
                                <tr>
                                    <td colspan="10" style="text-align: center; padding: 40px; color: #666;">
                                        Брондаулар жоқ
                                    </td>
                                </tr>
                            ` : reservations.map(reservation => {
                                const table = storage.read('tables', reservation.tableId);
                                const statusNames = {
                                    pending: '⏳ Күтуде',
                                    confirmed: '✅ Расталған',
                                    cancelled: '❌ Бас тартылды',
                                    completed: '✓ Аяқталған'
                                };
                                
                                return `
                                    <tr style="${reservation.status === 'confirmed' ? 'background: #e8f5e9;' : reservation.status === 'cancelled' ? 'background: #ffebee;' : ''}">
                                        <td>#${reservation.id}</td>
                                        <td><strong>${reservation.customerName || '-'}</strong></td>
                                        <td>${reservation.phone || '-'}</td>
                                        <td>${table ? `Үстел ${table.number}` : `ID: ${reservation.tableId}`}</td>
                                        <td>${new Date(reservation.date).toLocaleDateString('kk-KZ')}</td>
                                        <td>${reservation.time || '-'}</td>
                                        <td>${reservation.guestCount || '-'}</td>
                                        <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${reservation.wishes || ''}">
                                            ${reservation.wishes || '-'}
                                        </td>
                                        <td>
                                            <span class="status status-${reservation.status}">${statusNames[reservation.status] || reservation.status}</span>
                                        </td>
                                        <td>
                                            ${reservation.status === 'pending' ? `
                                                <button class="btn btn-success" onclick="adminModule.confirmReservation(${reservation.id}); this.closest('.modal').remove(); adminModule.render();" style="padding: 5px 10px; font-size: 12px; margin-right: 5px;">Растау</button>
                                            ` : ''}
                                            <button class="btn btn-danger" onclick="adminModule.deleteReservation(${reservation.id}); this.closest('.modal').remove(); adminModule.render();" style="padding: 5px 10px; font-size: 12px;">Жою</button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="form-actions">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Жабу</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    renderBanquetBookings() {
        const section = document.getElementById('banquetBookingsSection');
        if (!section) return;
        
        const bookings = (storage.read('banquetBookings') || []).slice(-10).reverse();
        
        if (bookings.length === 0) {
            section.innerHTML = '<p style="color: #666; padding: 20px; text-align: center;">Банкет залдары брондаулары жоқ</p>';
            return;
        }
        
        // Получаем список залов для отображения названий
        const halls = banquetModule ? banquetModule.halls : [];
        
        const statusNames = {
            pending: '⏳ Күтуде',
            confirmed: '✅ Расталған',
            cancelled: '❌ Бас тартылды',
            completed: '✓ Аяқталған'
        };
        
        section.innerHTML = `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Клиент аты</th>
                            <th>Телефон</th>
                            <th>Зал</th>
                            <th>Күні</th>
                            <th>Уақыт</th>
                            <th>Адам саны</th>
                            <th>Ескертпе</th>
                            <th>Статус</th>
                            <th>Әрекеттер</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${bookings.map(booking => {
                            const hall = halls.find(h => h.id === booking.hallId);
                            const hallName = hall ? hall.name : `Зал #${booking.hallId}`;
                            
                            return `
                                <tr style="${booking.status === 'confirmed' ? 'background: #e8f5e9;' : booking.status === 'cancelled' ? 'background: #ffebee;' : ''}">
                                    <td>#${booking.id}</td>
                                    <td><strong>${booking.customerName || '-'}</strong></td>
                                    <td>${booking.phone || '-'}</td>
                                    <td>${hallName}</td>
                                    <td>${new Date(booking.date).toLocaleDateString('kk-KZ')}</td>
                                    <td>${booking.time || '-'}</td>
                                    <td>${booking.guestCount || '-'}</td>
                                    <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${booking.notes || ''}">
                                        ${booking.notes || '-'}
                                    </td>
                                    <td>
                                        <span class="status status-${booking.status}">${statusNames[booking.status] || booking.status}</span>
                                    </td>
                                    <td>
                                        ${booking.status === 'pending' ? `
                                            <button class="btn btn-success" onclick="adminModule.confirmBanquetBooking(${booking.id})" style="padding: 5px 10px; font-size: 12px; margin-right: 5px;">Растау</button>
                                        ` : ''}
                                        <button class="btn btn-danger" onclick="adminModule.deleteBanquetBooking(${booking.id})" style="padding: 5px 10px; font-size: 12px;">Жою</button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 15px;">
                <button class="btn btn-info" onclick="adminModule.viewAllBanquetBookings()">Барлық банкет брондауларын көру</button>
            </div>
        `;
    },

    confirmBanquetBooking(id) {
        const booking = storage.read('banquetBookings', id);
        if (!booking) {
            auth.showNotification('Банкет брондауы табылмады!', 'error');
            return;
        }
        
        storage.update('banquetBookings', id, { status: 'confirmed' });
        auth.showNotification('Банкет брондауы расталды!', 'success');
        this.renderBanquetBookings();
    },

    deleteBanquetBooking(id) {
        if (!confirm('Бұл банкет брондауын жоюға сенімдісіз бе?')) {
            return;
        }
        
        const bookings = storage.read('banquetBookings');
        const updatedBookings = bookings.filter(b => b.id !== id);
        const data = storage.getData();
        data.banquetBookings = updatedBookings;
        storage.saveData(data);
        
        auth.showNotification('Банкет брондауы жойылды!', 'success');
        this.renderBanquetBookings();
    },

    viewAllBanquetBookings() {
        const bookings = (storage.read('banquetBookings') || []).reverse();
        const halls = banquetModule ? banquetModule.halls : [];
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 1200px;">
                <div class="modal-header">
                    <h2>🏛️ Барлық банкет залдары брондаулары</h2>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div class="table-container" style="max-height: 600px; overflow-y: auto;">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Клиент аты</th>
                                <th>Телефон</th>
                                <th>Зал</th>
                                <th>Күні</th>
                                <th>Уақыт</th>
                                <th>Адам саны</th>
                                <th>Ескертпе</th>
                                <th>Статус</th>
                                <th>Әрекеттер</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${bookings.length === 0 ? `
                                <tr>
                                    <td colspan="10" style="text-align: center; padding: 40px; color: #666;">
                                        Банкет залдары брондаулары жоқ
                                    </td>
                                </tr>
                            ` : bookings.map(booking => {
                                const hall = halls.find(h => h.id === booking.hallId);
                                const hallName = hall ? hall.name : `Зал #${booking.hallId}`;
                                const statusNames = {
                                    pending: '⏳ Күтуде',
                                    confirmed: '✅ Расталған',
                                    cancelled: '❌ Бас тартылды',
                                    completed: '✓ Аяқталған'
                                };
                                
                                return `
                                    <tr style="${booking.status === 'confirmed' ? 'background: #e8f5e9;' : booking.status === 'cancelled' ? 'background: #ffebee;' : ''}">
                                        <td>#${booking.id}</td>
                                        <td><strong>${booking.customerName || '-'}</strong></td>
                                        <td>${booking.phone || '-'}</td>
                                        <td>${hallName}</td>
                                        <td>${new Date(booking.date).toLocaleDateString('kk-KZ')}</td>
                                        <td>${booking.time || '-'}</td>
                                        <td>${booking.guestCount || '-'}</td>
                                        <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${booking.notes || ''}">
                                            ${booking.notes || '-'}
                                        </td>
                                        <td>
                                            <span class="status status-${booking.status}">${statusNames[booking.status] || booking.status}</span>
                                        </td>
                                        <td>
                                            ${booking.status === 'pending' ? `
                                                <button class="btn btn-success" onclick="adminModule.confirmBanquetBooking(${booking.id}); this.closest('.modal').remove(); adminModule.render();" style="padding: 5px 10px; font-size: 12px; margin-right: 5px;">Растау</button>
                                            ` : ''}
                                            <button class="btn btn-danger" onclick="adminModule.deleteBanquetBooking(${booking.id}); this.closest('.modal').remove(); adminModule.render();" style="padding: 5px 10px; font-size: 12px;">Жою</button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="form-actions">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Жабу</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    viewAllDeliveryOrders() {
        const deliveryOrders = (storage.read('deliveryOrders') || []).reverse();
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 1200px;">
                <div class="modal-header">
                    <h2>📦 Барлық жеткізу тапсырыстары</h2>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div class="table-container" style="max-height: 600px; overflow-y: auto;">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Клиент</th>
                                <th>Түрі</th>
                                <th>Тағамдар</th>
                                <th>Сома</th>
                                <th>Телефон</th>
                                <th>Мекенжай</th>
                                <th>Төлем</th>
                                <th>Статус</th>
                                <th>Уақыт</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${deliveryOrders.length === 0 ? `
                                <tr>
                                    <td colspan="10" style="text-align: center; padding: 40px; color: #666;">
                                        Жеткізу тапсырыстары жоқ
                                    </td>
                                </tr>
                            ` : deliveryOrders.map(order => {
                                const paymentTypeNames = {
                                    cash: '💵 Қолма-қол',
                                    card: '💳 Карта',
                                    qr: '📱 QR код'
                                };
                                const statusNames = {
                                    pending: '⏳ Күтуде',
                                    ready: '✅ Дайын',
                                    delivered: '🚚 Жеткізілді',
                                    cancelled: '❌ Бас тартылды'
                                };
                                
                                return `
                                    <tr style="${order.paid ? 'background: #e8f5e9;' : ''}">
                                        <td>#${order.id}</td>
                                        <td><strong>${order.customerName || '-'}</strong></td>
                                        <td>${order.deliveryType === 'delivery' ? '🚚 Жеткізу' : '📦 Алып кету'}</td>
                                        <td>
                                            ${order.items.map(item => `${item.name} x${item.quantity}`).join('<br>')}
                                        </td>
                                        <td><strong>${order.total.toLocaleString()} ₸</strong></td>
                                        <td>${order.phone || '-'}</td>
                                        <td>${order.address || '-'}</td>
                                        <td>
                                            ${order.paid ? `<span style="color: #28a745; font-weight: bold;">✓ ${paymentTypeNames[order.paymentType] || order.paymentType}</span>` : '<span style="color: #dc3545;">Төленбеген</span>'}
                                        </td>
                                        <td>
                                            <span class="status status-${order.status}">${statusNames[order.status] || order.status}</span>
                                        </td>
                                        <td>${new Date(order.createdAt).toLocaleString('kk-KZ')}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="form-actions">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Жабу</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    clearData() {
        if (!confirm('Барлық деректерді жоюға сенімдісіз бе? Бұл әрекетті қайтару мүмкін емес!')) {
            return;
        }
        
        if (!confirm('ШЫНЫМЕН ЖОЮҒА СЕНІМДІСІЗ БЕ?')) {
            return;
        }

        // Оставляем только пользователей
        const users = storage.read('users');
        const initialData = {
            users: users,
            menu: [],
            orders: [],
            reservations: [],
            customers: [],
            payments: [],
            deliveryOrders: [],
            staff: [],
            warehouse: [],
            tables: storage.read('tables').map(t => ({ ...t, status: 'available' })),
            logs: []
        };
        
        storage.saveData(initialData);
        auth.showNotification('Деректер тазаланды!');
        this.render();
    }
};

