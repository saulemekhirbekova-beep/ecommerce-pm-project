// Модуль управления меню
const menuModule = {
    render() {
        const mainContent = document.getElementById('mainContent');
        if (!mainContent) return;
        
        const canEdit = auth && auth.hasPermission ? auth.hasPermission('manager') : false;
        const isGuest = auth && auth.currentUser && auth.currentUser.role === 'guest';
        
        mainContent.innerHTML = `
            <div class="content-section">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2>${isGuest ? 'Мәзір' : 'Мәзір басқару'}</h2>
                    ${canEdit ? '<button class="btn btn-success" onclick="menuModule.showAddForm()">Тағам қосу</button>' : ''}
                </div>
                <div class="form-group">
                    <label>Санат бойынша сүзгі:</label>
                    <select id="categoryFilter" onchange="menuModule.filterMenu()" style="padding: 8px; border-radius: 5px;">
                        <option value="">Барлығы</option>
                        <option value="first">Бірінші тағам</option>
                        <option value="second">Екінші тағам</option>
                        <option value="salad">Салат</option>
                        <option value="dessert">Десерт</option>
                        <option value="drink">Сусындар</option>
                    </select>
                </div>
                <div id="menuGrid" class="card-grid"></div>
            </div>
        `;
        this.renderMenu();
    },

    renderMenu(category = '') {
        const menuGrid = document.getElementById('menuGrid');
        if (!menuGrid) return;
        
        let menuItems = storage.read('menu');
        
        if (category) {
            menuItems = menuItems.filter(item => item.category === category);
        }

        if (menuItems.length === 0) {
            menuGrid.innerHTML = '<p>Тағамдар табылмады</p>';
            return;
        }

        const canEdit = auth && auth.hasPermission ? auth.hasPermission('manager') : false;
        const categoryNames = {
            first: 'Бірінші тағам',
            second: 'Екінші тағам',
            salad: 'Салат',
            dessert: 'Десерт',
            drink: 'Сусындар'
        };

        menuGrid.innerHTML = menuItems.map(item => {
            // Убеждаемся, что у каждого блюда есть фото
            const imageUrl = item.image && item.image.trim() !== '' 
                ? item.image 
                : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';
            
            return `
            <div class="card">
                <img src="${imageUrl}" alt="${item.name}" 
                     onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';"
                     style="width: 100%; height: 200px; object-fit: cover; border-radius: 5px; margin-bottom: 10px; background: #f0f0f0;">
                <div class="card-title">${item.name}</div>
                <div style="color: #666; margin-bottom: 10px;">${categoryNames[item.category] || item.category}</div>
                <div class="card-price">${item.price} ₸</div>
                <div class="status ${item.available ? 'status-available' : 'status-out-of-stock'}">
                    ${item.available ? 'Бар' : 'Жоқ'}
                </div>
                ${canEdit ? `
                    <div class="card-actions">
                        <button class="btn btn-info" onclick="menuModule.editItem(${item.id})">Өзгерту</button>
                        <button class="btn btn-danger" onclick="menuModule.deleteItem(${item.id})">Жою</button>
                    </div>
                ` : ''}
            </div>
        `;
        }).join('');
    },

    filterMenu() {
        const category = document.getElementById('categoryFilter').value;
        this.renderMenu(category);
    },

    showAddForm(item = null) {
        const isEdit = item !== null;
        const menuItem = item ? storage.read('menu', item) : null;
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${isEdit ? 'Тағамды өзгерту' : 'Жаңа тағам қосу'}</h2>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <form id="menuForm" onsubmit="menuModule.saveItem(event, ${isEdit ? item : 'null'})">
                    <div class="form-group">
                        <label>Атауы:</label>
                        <input type="text" id="menuName" value="${menuItem?.name || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Санат:</label>
                        <select id="menuCategory" required>
                            <option value="">Таңдаңыз...</option>
                            <option value="first" ${menuItem?.category === 'first' ? 'selected' : ''}>Бірінші тағам</option>
                            <option value="second" ${menuItem?.category === 'second' ? 'selected' : ''}>Екінші тағам</option>
                            <option value="salad" ${menuItem?.category === 'salad' ? 'selected' : ''}>Салат</option>
                            <option value="dessert" ${menuItem?.category === 'dessert' ? 'selected' : ''}>Десерт</option>
                            <option value="drink" ${menuItem?.category === 'drink' ? 'selected' : ''}>Сусындар</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Баға (₸):</label>
                        <input type="number" id="menuPrice" value="${menuItem?.price || ''}" min="0" step="100" required>
                    </div>
                    <div class="form-group">
                        <label>Сурет URL:</label>
                        <input type="text" id="menuImage" value="${menuItem?.image || ''}" placeholder="Сурет сілтемесі">
                    </div>
                    <div class="form-group">
                        <label>Статус:</label>
                        <select id="menuAvailable">
                            <option value="true" ${menuItem?.available !== false ? 'selected' : ''}>Бар</option>
                            <option value="false" ${menuItem?.available === false ? 'selected' : ''}>Жоқ</option>
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

    saveItem(e, id) {
        e.preventDefault();
        const name = storage.sanitizeInput(document.getElementById('menuName').value);
        const category = document.getElementById('menuCategory').value;
        const price = parseFloat(document.getElementById('menuPrice').value);
        const image = storage.sanitizeInput(document.getElementById('menuImage').value);
        const available = document.getElementById('menuAvailable').value === 'true';

        if (id) {
            storage.update('menu', id, { name, category, price, image, available });
            auth.showNotification('Тағам сәтті өзгертілді!');
        } else {
            storage.create('menu', { name, category, price, image, available });
            auth.showNotification('Тағам сәтті қосылды!');
        }

        document.querySelector('.modal').remove();
        this.render();
    },

    editItem(id) {
        this.showAddForm(id);
    },

    deleteItem(id) {
        if (confirm('Тағамды жоюға сенімдісіз бе?')) {
            storage.delete('menu', id);
            auth.showNotification('Тағам жойылды!');
            this.render();
        }
    }
};

