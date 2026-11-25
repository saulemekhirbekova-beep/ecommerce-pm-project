// Модуль базы клиентов
const customersModule = {
    render() {
        const mainContent = document.getElementById('mainContent');
        const canManage = auth.hasPermission('manager');
        
        mainContent.innerHTML = `
            <div class="content-section">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2>Клиенттер базасы</h2>
                    ${canManage ? '<button class="btn btn-success" onclick="customersModule.showCustomerForm()">Клиент қосу</button>' : ''}
                </div>
                <div class="form-group">
                    <input type="text" id="customerSearch" placeholder="Клиентті іздеу..." 
                           onkeyup="customersModule.searchCustomers()" style="width: 100%; padding: 10px; border-radius: 5px;">
                </div>
                <div id="customersList"></div>
            </div>
        `;
        this.renderCustomers();
    },

    renderCustomers(searchTerm = '') {
        const customersList = document.getElementById('customersList');
        let customers = storage.read('customers');
        
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            customers = customers.filter(c => 
                c.name.toLowerCase().includes(term) ||
                c.phone.includes(term) ||
                c.email?.toLowerCase().includes(term)
            );
        }

        if (customers.length === 0) {
            customersList.innerHTML = '<p>Клиенттер табылмады</p>';
            return;
        }

        // Сортируем по частоте посещений
        customers.sort((a, b) => (b.visitCount || 0) - (a.visitCount || 0));

        customersList.innerHTML = `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Аты</th>
                            <th>Телефон</th>
                            <th>Email</th>
                            <th>Келу саны</th>
                            <th>Бонус балл</th>
                            <th>Жеңілдік</th>
                            <th>Әрекеттер</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${customers.map(customer => `
                            <tr>
                                <td><strong>${customer.name}</strong></td>
                                <td>${customer.phone}</td>
                                <td>${customer.email || '-'}</td>
                                <td>${customer.visitCount || 0}</td>
                                <td>${customer.bonusPoints || 0}</td>
                                <td>${customer.discount || 0}%</td>
                                <td>
                                    ${this.getCustomerActions(customer)}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    getCustomerActions(customer) {
        const canManage = auth.hasPermission('manager');
        if (!canManage) return '';
        
        return `
            <button class="btn btn-info" onclick="customersModule.viewCustomer(${customer.id})">Көру</button>
            <button class="btn btn-warning" onclick="customersModule.editCustomer(${customer.id})">Өзгерту</button>
            <button class="btn btn-danger" onclick="customersModule.deleteCustomer(${customer.id})">Жою</button>
        `;
    },

    searchCustomers() {
        const searchTerm = document.getElementById('customerSearch').value;
        this.renderCustomers(searchTerm);
    },

    showCustomerForm(customer = null) {
        const isEdit = customer !== null;
        const cust = customer ? storage.read('customers', customer) : null;
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${isEdit ? 'Клиентті өзгерту' : 'Жаңа клиент'}</h2>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <form onsubmit="customersModule.saveCustomer(event, ${isEdit ? customer : 'null'})">
                    <div class="form-group">
                        <label>Аты:</label>
                        <input type="text" id="customerName" value="${cust?.name || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Телефон:</label>
                        <input type="tel" id="customerPhone" value="${cust?.phone || ''}" maxlength="11" pattern="[0-9]{11}" placeholder="87079853551" required>
                    </div>
                    <div class="form-group">
                        <label>Email:</label>
                        <input type="email" id="customerEmail" value="${cust?.email || ''}">
                    </div>
                    <div class="form-group">
                        <label>Бонус балл:</label>
                        <input type="number" id="customerBonus" value="${cust?.bonusPoints || 0}" min="0">
                    </div>
                    <div class="form-group">
                        <label>Жеңілдік (%):</label>
                        <input type="number" id="customerDiscount" value="${cust?.discount || 0}" min="0" max="100">
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-success">Сақтау</button>
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Болдырмау</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Телефон үшін валидация - тек 11 цифр
        const phoneInput = document.getElementById('customerPhone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, ''); // Тек цифрларды қалдыру
                if (value.length > 11) {
                    value = value.substring(0, 11); // 11 цифрдан артық емес
                }
                e.target.value = value;
            });
        }
    },

    saveCustomer(e, id) {
        e.preventDefault();
        const name = storage.sanitizeInput(document.getElementById('customerName').value);
        let phone = document.getElementById('customerPhone').value.replace(/\D/g, ''); // Тек цифрлар
        
        // Валидация: дәл 11 цифр болуы керек
        if (phone.length !== 11) {
            if (auth && auth.showNotification) {
                auth.showNotification('Телефон нөмірі дәл 11 цифрдан тұруы керек!', 'error');
            } else {
                alert('Телефон нөмірі дәл 11 цифрдан тұруы керек!');
            }
            return;
        }
        
        phone = storage.sanitizeInput(phone);
        const email = storage.sanitizeInput(document.getElementById('customerEmail').value);
        const bonusPoints = parseInt(document.getElementById('customerBonus').value) || 0;
        const discount = parseInt(document.getElementById('customerDiscount').value) || 0;

        if (id) {
            const existing = storage.read('customers', id);
            storage.update('customers', id, {
                name,
                phone,
                email,
                bonusPoints,
                discount,
                visitCount: existing.visitCount || 0
            });
            auth.showNotification('Клиент сәтті өзгертілді!');
        } else {
            storage.create('customers', {
                name,
                phone,
                email,
                bonusPoints,
                discount,
                visitCount: 0
            });
            auth.showNotification('Клиент сәтті қосылды!');
        }

        document.querySelector('.modal').remove();
        this.render();
    },

    viewCustomer(id) {
        const customer = storage.read('customers', id);
        if (!customer) return;

        const orders = storage.read('orders').filter(o => o.customerId === id);
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Клиент ақпараты</h2>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div>
                    <p><strong>Аты:</strong> ${customer.name}</p>
                    <p><strong>Телефон:</strong> ${customer.phone}</p>
                    <p><strong>Email:</strong> ${customer.email || '-'}</p>
                    <p><strong>Келу саны:</strong> ${customer.visitCount || 0}</p>
                    <p><strong>Бонус балл:</strong> ${customer.bonusPoints || 0}</p>
                    <p><strong>Жеңілдік:</strong> ${customer.discount || 0}%</p>
                    <h3 style="margin-top: 20px;">Тапсырыстар (${orders.length})</h3>
                    ${orders.length > 0 ? `
                        <ul>
                            ${orders.map(order => `
                                <li>Тапсырыс #${order.id} - ${order.total} ₸ - ${new Date(order.createdAt).toLocaleDateString('kk-KZ')}</li>
                            `).join('')}
                        </ul>
                    ` : '<p>Тапсырыстар жоқ</p>'}
                </div>
                <div class="form-actions">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Жабу</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    editCustomer(id) {
        this.showCustomerForm(id);
    },

    deleteCustomer(id) {
        if (confirm('Клиентті жоюға сенімдісіз бе?')) {
            storage.delete('customers', id);
            auth.showNotification('Клиент жойылды!');
            this.render();
        }
    }
};

