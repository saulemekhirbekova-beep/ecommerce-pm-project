// Модуль склада
const warehouseModule = {
    render() {
        const mainContent = document.getElementById('mainContent');
        const canManage = auth.hasPermission('manager');
        
        mainContent.innerHTML = `
            <div class="content-section">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2>Қойма басқару</h2>
                    ${canManage ? '<button class="btn btn-success" onclick="warehouseModule.showItemForm()">Ингредиент қосу</button>' : ''}
                </div>
                <div id="warehouseAlerts" style="margin-bottom: 20px;"></div>
                <div id="warehouseList"></div>
            </div>
        `;
        this.renderWarehouse();
        this.checkLowStock();
    },

    renderWarehouse() {
        const warehouseList = document.getElementById('warehouseList');
        const items = storage.read('warehouse');
        
        if (items.length === 0) {
            warehouseList.innerHTML = '<p>Ингредиенттер жоқ</p>';
            return;
        }

        warehouseList.innerHTML = `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Атауы</th>
                            <th>Мөлшер</th>
                            <th>Өлшем бірлігі</th>
                            <th>Минималды мөлшер</th>
                            <th>Статус</th>
                            <th>Әрекеттер</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(item => {
                            const status = this.getItemStatus(item);
                            return `
                                <tr>
                                    <td><strong>${item.name}</strong></td>
                                    <td>${item.quantity}</td>
                                    <td>${item.unit}</td>
                                    <td>${item.minQuantity}</td>
                                    <td>
                                        <span class="status status-${status.class}">${status.text}</span>
                                    </td>
                                    <td>
                                        ${this.getWarehouseActions(item)}
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    getItemStatus(item) {
        if (item.quantity <= 0) {
            return { class: 'out-of-stock', text: 'Жоқ' };
        }
        if (item.quantity <= item.minQuantity) {
            return { class: 'low-stock', text: 'Аз қалды' };
        }
        return { class: 'in-stock', text: 'Бар' };
    },

    getWarehouseActions(item) {
        const canManage = auth.hasPermission('manager');
        if (!canManage) return '-';
        
        return `
            <button class="btn btn-info" onclick="warehouseModule.addStock(${item.id})">Қосу</button>
            <button class="btn btn-warning" onclick="warehouseModule.editItem(${item.id})">Өзгерту</button>
            <button class="btn btn-danger" onclick="warehouseModule.deleteItem(${item.id})">Жою</button>
        `;
    },

    checkLowStock() {
        const alerts = document.getElementById('warehouseAlerts');
        const items = storage.read('warehouse');
        const lowStockItems = items.filter(item => item.quantity <= item.minQuantity && item.quantity > 0);
        const outOfStockItems = items.filter(item => item.quantity <= 0);

        if (lowStockItems.length === 0 && outOfStockItems.length === 0) {
            alerts.innerHTML = '';
            return;
        }

        let alertHTML = '';
        if (outOfStockItems.length > 0) {
            alertHTML += `
                <div style="background: #dc3545; color: white; padding: 15px; border-radius: 5px; margin-bottom: 10px;">
                    <strong>Ескерту:</strong> ${outOfStockItems.length} ингредиент таусылды:
                    ${outOfStockItems.map(item => item.name).join(', ')}
                </div>
            `;
        }
        if (lowStockItems.length > 0) {
            alertHTML += `
                <div style="background: #ffc107; color: #333; padding: 15px; border-radius: 5px;">
                    <strong>Ескерту:</strong> ${lowStockItems.length} ингредиент аз қалды:
                    ${lowStockItems.map(item => item.name).join(', ')}
                </div>
            `;
        }
        alerts.innerHTML = alertHTML;
    },

    showItemForm(item = null) {
        const isEdit = item !== null;
        const warehouseItem = item ? storage.read('warehouse', item) : null;
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${isEdit ? 'Ингредиентті өзгерту' : 'Жаңа ингредиент'}</h2>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <form onsubmit="warehouseModule.saveItem(event, ${isEdit ? item : 'null'})">
                    <div class="form-group">
                        <label>Атауы:</label>
                        <input type="text" id="itemName" value="${warehouseItem?.name || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Мөлшер:</label>
                        <input type="number" id="itemQuantity" value="${warehouseItem?.quantity || 0}" min="0" step="0.1" required>
                    </div>
                    <div class="form-group">
                        <label>Өлшем бірлігі:</label>
                        <select id="itemUnit" required>
                            <option value="кг" ${warehouseItem?.unit === 'кг' ? 'selected' : ''}>кг</option>
                            <option value="г" ${warehouseItem?.unit === 'г' ? 'selected' : ''}>г</option>
                            <option value="л" ${warehouseItem?.unit === 'л' ? 'selected' : ''}>л</option>
                            <option value="мл" ${warehouseItem?.unit === 'мл' ? 'selected' : ''}>мл</option>
                            <option value="дана" ${warehouseItem?.unit === 'дана' ? 'selected' : ''}>дана</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Минималды мөлшер:</label>
                        <input type="number" id="itemMinQuantity" value="${warehouseItem?.minQuantity || 0}" min="0" step="0.1" required>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-success">Сақтау</button>
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Болдырмау</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
    },

    saveItem(e, id) {
        e.preventDefault();
        const name = storage.sanitizeInput(document.getElementById('itemName').value);
        const quantity = parseFloat(document.getElementById('itemQuantity').value);
        const unit = document.getElementById('itemUnit').value;
        const minQuantity = parseFloat(document.getElementById('itemMinQuantity').value);

        if (id) {
            storage.update('warehouse', id, { name, quantity, unit, minQuantity });
            auth.showNotification('Ингредиент сәтті өзгертілді!');
        } else {
            storage.create('warehouse', { name, quantity, unit, minQuantity });
            auth.showNotification('Ингредиент сәтті қосылды!');
        }

        document.querySelector('.modal').remove();
        this.render();
    },

    addStock(id) {
        const item = storage.read('warehouse', id);
        if (!item) return;

        const amount = prompt(`Қосу мөлшері (${item.unit}):`, '0');
        if (amount === null) return;

        const addAmount = parseFloat(amount);
        if (isNaN(addAmount) || addAmount <= 0) {
            auth.showNotification('Дұрыс мөлшер енгізіңіз!', 'error');
            return;
        }

        storage.update('warehouse', id, { quantity: item.quantity + addAmount });
        auth.showNotification('Мөлшер сәтті қосылды!');
        this.render();
    },

    editItem(id) {
        this.showItemForm(id);
    },

    deleteItem(id) {
        if (confirm('Ингредиентті жоюға сенімдісіз бе?')) {
            storage.delete('warehouse', id);
            auth.showNotification('Ингредиент жойылды!');
            this.render();
        }
    }
};

