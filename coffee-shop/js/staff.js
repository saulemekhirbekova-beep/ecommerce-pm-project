// Модуль управления персоналом
const staffModule = {
    render() {
        const mainContent = document.getElementById('mainContent');
        const canManage = auth.hasPermission('admin');
        
        mainContent.innerHTML = `
            <div class="content-section">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2>Қызметкерлер басқару</h2>
                    ${canManage ? '<button class="btn btn-success" onclick="staffModule.showStaffForm()">Қызметкер қосу</button>' : ''}
                </div>
                <div id="staffList"></div>
            </div>
        `;
        this.renderStaff();
    },

    renderStaff() {
        const staffList = document.getElementById('staffList');
        const users = storage.read('users');
        const canManage = auth.hasPermission('admin');
        
        const roleNames = {
            admin: 'Админ',
            manager: 'Менеджер',
            chef: 'Аспаз',
            waiter: 'Официант',
            cashier: 'Кассир'
        };

        staffList.innerHTML = `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Аты</th>
                            <th>Логин</th>
                            <th>Рөл</th>
                            <th>Әрекеттер</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(user => `
                            <tr>
                                <td>#${user.id}</td>
                                <td>${user.name || user.username}</td>
                                <td>${user.username}</td>
                                <td>${roleNames[user.role] || user.role}</td>
                                <td>
                                    ${canManage ? `
                                        <button class="btn btn-warning" onclick="staffModule.editStaff(${user.id})">Өзгерту</button>
                                        ${user.id !== auth.currentUser.id ? `
                                            <button class="btn btn-danger" onclick="staffModule.deleteStaff(${user.id})">Жою</button>
                                        ` : ''}
                                    ` : '-'}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    showStaffForm(user = null) {
        const isEdit = user !== null;
        const staff = user ? storage.read('users', user) : null;
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${isEdit ? 'Қызметкерді өзгерту' : 'Жаңа қызметкер'}</h2>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <form onsubmit="staffModule.saveStaff(event, ${isEdit ? user : 'null'})">
                    <div class="form-group">
                        <label>Аты:</label>
                        <input type="text" id="staffName" value="${staff?.name || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Логин:</label>
                        <input type="text" id="staffUsername" value="${staff?.username || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>${isEdit ? 'Жаңа пароль (өзгертпеу үшін бос қалдырыңыз):' : 'Пароль:'}</label>
                        <input type="password" id="staffPassword" ${isEdit ? '' : 'required'}>
                    </div>
                    <div class="form-group">
                        <label>Рөл:</label>
                        <select id="staffRole" required>
                            <option value="">Таңдаңыз...</option>
                            <option value="admin" ${staff?.role === 'admin' ? 'selected' : ''}>Админ</option>
                            <option value="manager" ${staff?.role === 'manager' ? 'selected' : ''}>Менеджер</option>
                            <option value="chef" ${staff?.role === 'chef' ? 'selected' : ''}>Аспаз</option>
                            <option value="waiter" ${staff?.role === 'waiter' ? 'selected' : ''}>Официант</option>
                            <option value="cashier" ${staff?.role === 'cashier' ? 'selected' : ''}>Кассир</option>
                        </select>
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

    saveStaff(e, id) {
        e.preventDefault();
        const name = storage.sanitizeInput(document.getElementById('staffName').value);
        const username = storage.sanitizeInput(document.getElementById('staffUsername').value);
        const password = document.getElementById('staffPassword').value;
        const role = document.getElementById('staffRole').value;

        // Проверка уникальности логина
        const users = storage.read('users');
        const existingUser = users.find(u => u.username === username && u.id !== id);
        if (existingUser) {
            auth.showNotification('Бұл логин қолданыста!', 'error');
            return;
        }

        if (id) {
            const updates = { name, username, role };
            if (password) {
                updates.password = storage.hashPassword(password);
            }
            storage.update('users', id, updates);
            auth.showNotification('Қызметкер сәтті өзгертілді!');
        } else {
            if (!password) {
                auth.showNotification('Пароль енгізіңіз!', 'error');
                return;
            }
            storage.create('users', {
                name,
                username,
                password: storage.hashPassword(password),
                role
            });
            auth.showNotification('Қызметкер сәтті қосылды!');
        }

        document.querySelector('.modal').remove();
        this.render();
    },

    editStaff(id) {
        this.showStaffForm(id);
    },

    deleteStaff(id) {
        if (id === auth.currentUser.id) {
            auth.showNotification('Өзіңізді жоюға болмайды!', 'error');
            return;
        }
        
        if (confirm('Қызметкерді жоюға сенімдісіз бе?')) {
            storage.delete('users', id);
            auth.showNotification('Қызметкер жойылды!');
            this.render();
        }
    }
};

