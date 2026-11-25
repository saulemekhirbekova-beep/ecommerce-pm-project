// Модуль бронирования столов
const reservationsModule = {
    render() {
        const mainContent = document.getElementById('mainContent');
        const canManage = auth && auth.hasPermission ? auth.hasPermission('waiter') : false;
        const isGuest = auth && auth.currentUser && auth.currentUser.role === 'guest';
        
        mainContent.innerHTML = `
            <div class="content-section">
                <div class="reservation-header">
                    <h2>ҮСТЕЛ БРОНДАУ <span class="free-badge">ТЕГІН</span></h2>
                </div>
                <div id="reservationFormContainer" class="reservation-form-container">
                    ${this.getReservationFormHTML()}
                </div>
                ${canManage ? `
                    <div style="margin-top: 30px;">
                        <h3>Брондаулар тізімі</h3>
                        <div id="reservationsList"></div>
                    </div>
                ` : ''}
            </div>
        `;
        this.initializeReservationForm();
        if (canManage) {
            this.renderReservations();
        }
    },

    getReservationFormHTML() {
        // Генерируем временные слоты от 12:00 до 23:00 с интервалом 30 минут
        const timeSlots = [];
        for (let hour = 12; hour < 24; hour++) {
            timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
            if (hour < 23) {
                timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
            }
        }

        return `
            <form id="reservationForm" class="reservation-form">
                <div class="form-group">
                    <label for="reservationDateInput">Күні:</label>
                    <div class="date-input-wrapper">
                        <input type="date" id="reservationDateInput" required>
                        <span class="calendar-icon">📅</span>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="guestCount">Қонақтар саны:</label>
                    <input type="number" id="guestCount" min="1" max="20" value="4" required>
                </div>
                
                <div class="form-group">
                    <label>Уақыт:</label>
                    <div class="time-slots-grid">
                        ${timeSlots.map(time => `
                            <label class="time-slot-radio">
                                <input type="radio" name="reservationTime" value="${time}" required>
                                <span class="time-slot-label">${time}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="customerNameInput">Аты-жөніңіз:</label>
                    <input type="text" id="customerNameInput" required>
                </div>
                
                <div class="form-group">
                    <label for="customerPhoneInput">Телефон:</label>
                    <input type="tel" id="customerPhoneInput" placeholder="+7 (___) ___-__-__" required>
                </div>
                
                <div class="form-group">
                    <label for="reservationWishes">Брондауға тілектеріңіз:</label>
                    <textarea id="reservationWishes" rows="4" placeholder="Қосымша ақпарат..."></textarea>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary btn-large">БРОНДАУ</button>
                </div>
            </form>
        `;
    },

    initializeReservationForm() {
        const form = document.getElementById('reservationForm');
        if (!form) return;

        // Маска для телефона - дәл 11 цифр
        const phoneInput = document.getElementById('customerPhoneInput');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, ''); // Тек цифрлар
                
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

        // Обработка отправки формы
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitReservationForm();
        });

        // Устанавливаем минимальную дату (сегодня)
        const dateInput = document.getElementById('reservationDateInput');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.setAttribute('min', today);
        }
    },

    submitReservationForm() {
        try {
            const dateInput = document.getElementById('reservationDateInput');
            const guestCountInput = document.getElementById('guestCount');
            const timeInput = document.querySelector('input[name="reservationTime"]:checked');
            const customerNameInput = document.getElementById('customerNameInput');
            const phoneInput = document.getElementById('customerPhoneInput');
            const wishesInput = document.getElementById('reservationWishes');

            if (!dateInput || !guestCountInput || !timeInput || !customerNameInput || !phoneInput) {
                if (auth && auth.showNotification) {
                    auth.showNotification('Форма элементтері табылмады!', 'error');
                }
                console.error('Form elements not found');
                return;
            }

            const date = dateInput.value;
            const guestCount = parseInt(guestCountInput.value) || 1;
            const customerName = storage && storage.sanitizeInput ? storage.sanitizeInput(customerNameInput.value) : customerNameInput.value;
            let phone = phoneInput.value.replace(/\D/g, ''); // Тек цифрларды алу
            const wishes = wishesInput ? (storage && storage.sanitizeInput ? storage.sanitizeInput(wishesInput.value) : wishesInput.value) : '';

            if (!date || !timeInput || !customerName) {
                if (auth && auth.showNotification) {
                    auth.showNotification('Барлық қажетті өрістерді толтырыңыз!', 'error');
                }
                return;
            }
            
            // Телефон нөмірін тексеру және нормализация
            if (!phone || phone.length === 0) {
                if (auth && auth.showNotification) {
                    auth.showNotification('Телефон нөмірін енгізіңіз!', 'error');
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
            
            // Форматированное значение для сохранения: +7 (XXX) XXX-XX-XX
            phone = '+7 (' + phone.substring(1, 4) + ') ' + phone.substring(4, 7) + '-' + phone.substring(7, 9) + '-' + phone.substring(9, 11);

            // Находим подходящий стол
            if (!storage || !storage.read) {
                console.error('Storage not available');
                return;
            }

            const tables = storage.read('tables');
            if (!tables || !Array.isArray(tables) || tables.length === 0) {
                if (auth && auth.showNotification) {
                    auth.showNotification('Үстелдер табылмады!', 'error');
                }
                return;
            }

            const availableTable = tables.find(t => 
                t.status === 'available' && t.capacity >= guestCount
            ) || tables.find(t => t.capacity >= guestCount);

            if (!availableTable || !availableTable.id) {
                if (auth && auth.showNotification) {
                    auth.showNotification('Кешіріңіз, қолжетімді үстел табылмады!', 'error');
                }
                return;
            }

            const newReservation = {
                tableId: availableTable.id,
                customerName,
                phone,
                date,
                time: timeInput.value,
                guestCount,
                notes: wishes,
                status: 'pending',
                createdAt: new Date().toISOString()
            };

            if (!storage.create) {
                console.error('storage.create method not available');
                return;
            }

            storage.create('reservations', newReservation);
            
            if (storage.update) {
                storage.update('tables', availableTable.id, { status: 'reserved' });
            }
            
            if (auth && auth.showNotification) {
                auth.showNotification('Брондау сәтті жіберілді! Біз сізбен хабарласамыз.', 'success');
            }
            
            // Очищаем форму
            const form = document.getElementById('reservationForm');
            if (form) {
                form.reset();
                if (guestCountInput) {
                    guestCountInput.value = 4;
                }
            }
        } catch (error) {
            console.error('Error in submitReservationForm:', error);
            if (auth && auth.showNotification) {
                auth.showNotification('Қате орын алды: ' + error.message, 'error');
            }
        }
    },

    renderTables() {
        const tablesGrid = document.getElementById('tablesGrid');
        const tables = storage.read('tables');
        
        tablesGrid.innerHTML = tables.map(table => {
            const statusClass = table.status === 'available' ? '' : 
                              table.status === 'occupied' ? 'occupied' : 'reserved';
            const statusText = table.status === 'available' ? 'Бос' : 
                             table.status === 'occupied' ? 'Бос емес' : 'Брондалған';
            
            return `
                <div class="table-card ${statusClass}">
                    <div class="table-number">Үстел ${table.number}</div>
                    <div>${table.capacity} орын</div>
                    <div class="status status-${table.status}" style="margin-top: 10px;">${statusText}</div>
                </div>
            `;
        }).join('');
    },

    renderReservations() {
        const reservationsList = document.getElementById('reservationsList');
        const reservations = storage.read('reservations');
        
        if (reservations.length === 0) {
            reservationsList.innerHTML = '<p>Брондаулар жоқ</p>';
            return;
        }

        reservationsList.innerHTML = `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Үстел</th>
                            <th>Клиент аты</th>
                            <th>Телефон</th>
                            <th>Күні</th>
                            <th>Уақыт</th>
                            <th>Статус</th>
                            <th>Әрекеттер</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${reservations.map(reservation => {
                            const table = storage.read('tables', reservation.tableId);
                            return `
                                <tr>
                                    <td>#${reservation.id}</td>
                                    <td>Үстел ${table?.number || reservation.tableId}</td>
                                    <td>${reservation.customerName}</td>
                                    <td>${reservation.phone}</td>
                                    <td>${new Date(reservation.date).toLocaleDateString('kk-KZ')}</td>
                                    <td>${reservation.time}</td>
                                    <td>
                                        <span class="status status-${reservation.status}">${reservation.status === 'confirmed' ? 'Расталған' : 'Күтуде'}</span>
                                    </td>
                                    <td>
                                        ${this.getReservationActions(reservation)}
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    getReservationActions(reservation) {
        const canManage = auth.hasPermission('waiter');
        const isGuest = auth.currentUser && auth.currentUser.role === 'guest';
        
        // Гость может только просматривать свои бронирования
        if (isGuest) {
            // Гость может видеть только свои бронирования, но не может их редактировать
            return '';
        }
        
        if (!canManage) return '';
        
        const actions = [];
        if (reservation.status === 'pending') {
            actions.push(`<button class="btn btn-success" onclick="reservationsModule.confirmReservation(${reservation.id})">Растау</button>`);
        }
        actions.push(`<button class="btn btn-warning" onclick="reservationsModule.editReservation(${reservation.id})">Өзгерту</button>`);
        actions.push(`<button class="btn btn-danger" onclick="reservationsModule.deleteReservation(${reservation.id})">Жою</button>`);
        return actions.join(' ');
    },

    showReservationForm(reservation = null) {
        const isEdit = reservation !== null;
        const res = reservation ? storage.read('reservations', reservation) : null;
        const tables = storage.read('tables').filter(t => t.status === 'available' || t.id === res?.tableId);
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${isEdit ? 'Брондауды өзгерту' : 'Жаңа брондау'}</h2>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <form onsubmit="reservationsModule.saveReservation(event, ${isEdit ? reservation : 'null'})">
                    <div class="form-group">
                        <label>Үстел:</label>
                        <select id="reservationTable" required>
                            ${tables.map(table => `
                                <option value="${table.id}" ${res?.tableId === table.id ? 'selected' : ''}>
                                    Үстел ${table.number} (${table.capacity} орын)
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Клиент аты:</label>
                        <input type="text" id="customerName" value="${res?.customerName || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Телефон:</label>
                        <input type="tel" id="customerPhone" value="${res?.phone ? res.phone.replace(/\D/g, '').substring(0, 11) : ''}" maxlength="11" pattern="[0-9]{11}" placeholder="87079853551" required>
                    </div>
                    <div class="form-group">
                        <label>Күні:</label>
                        <input type="date" id="reservationDate" value="${res ? new Date(res.date).toISOString().split('T')[0] : ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Уақыт:</label>
                        <input type="time" id="reservationTime" value="${res?.time || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Ескертпе:</label>
                        <textarea id="reservationNotes" rows="3">${res?.notes || ''}</textarea>
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
        const phoneInputAdmin = document.getElementById('customerPhone');
        if (phoneInputAdmin) {
            phoneInputAdmin.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, ''); // Тек цифрларды қалдыру
                // Егер 8-ден басталса, оны 7-ге ауыстыру
                if (value.startsWith('8')) {
                    value = '7' + value.substring(1);
                }
                if (value.length > 11) {
                    value = value.substring(0, 11); // 11 цифрдан артық емес
                }
                e.target.value = value;
            });
        }
    },

    saveReservation(e, id) {
        e.preventDefault();
        const tableId = parseInt(document.getElementById('reservationTable').value);
        const customerName = storage.sanitizeInput(document.getElementById('customerName').value);
        let phone = document.getElementById('customerPhone').value.replace(/\D/g, ''); // Тек цифрлар
        
        // Егер 8-ден басталса, оны 7-ге ауыстыру
        if (phone.startsWith('8')) {
            phone = '7' + phone.substring(1);
        }
        // Егер 7-ден басталмаса және 10 цифр болса, 7-ді қосу
        if (!phone.startsWith('7') && phone.length === 10) {
            phone = '7' + phone;
        }
        
        // Валидация: дәл 11 цифр болуы керек
        if (phone.length !== 11) {
            auth.showNotification('Телефон нөмірі дәл 11 цифрдан тұруы керек!', 'error');
            return;
        }
        
        phone = storage.sanitizeInput(phone);
        const date = document.getElementById('reservationDate').value;
        const time = document.getElementById('reservationTime').value;
        const notes = storage.sanitizeInput(document.getElementById('reservationNotes').value);

        if (id) {
            storage.update('reservations', id, {
                tableId,
                customerName,
                phone,
                date,
                time,
                notes
            });
            auth.showNotification('Брондау сәтті өзгертілді!');
        } else {
            storage.create('reservations', {
                tableId,
                customerName,
                phone,
                date,
                time,
                notes,
                status: 'pending'
            });
            
            // Обновляем статус стола
            storage.update('tables', tableId, { status: 'reserved' });
            auth.showNotification('Брондау сәтті қосылды!');
        }

        document.querySelector('.modal').remove();
        this.render();
    },

    confirmReservation(id) {
        storage.update('reservations', id, { status: 'confirmed' });
        auth.showNotification('Брондау расталды!');
        this.render();
    },

    editReservation(id) {
        this.showReservationForm(id);
    },

    deleteReservation(id) {
        if (confirm('Брондауды жоюға сенімдісіз бе?')) {
            const reservation = storage.read('reservations', id);
            storage.delete('reservations', id);
            
            // Освобождаем стол
            if (reservation?.tableId) {
                storage.update('tables', reservation.tableId, { status: 'available' });
            }
            
            auth.showNotification('Брондау жойылды!');
            this.render();
        }
    }
};

