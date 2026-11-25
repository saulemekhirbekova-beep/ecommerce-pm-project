// Система авторизации
class Auth {
    constructor() {
        this.currentUser = null;
        this.checkAuth();
    }

    checkAuth() {
        const savedUser = sessionStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showMainScreen();
        } else {
            this.showLoginScreen();
        }
    }

    showLoginScreen() {
        const loginScreen = document.getElementById('loginScreen');
        const mainScreen = document.getElementById('mainScreen');
        if (loginScreen) loginScreen.classList.add('active');
        if (mainScreen) mainScreen.classList.remove('active');
    }

    showMainScreen() {
        const loginScreen = document.getElementById('loginScreen');
        const mainScreen = document.getElementById('mainScreen');
        
        // Проверяем, что элементы существуют (не в section.html)
        if (!loginScreen || !mainScreen) {
            return; // Это section.html, не нужно показывать экраны
        }
        
        loginScreen.classList.remove('active');
        mainScreen.classList.add('active');
        this.updateUserInfo();
        
        // Проверяем, что app загружен (теперь app.js загружается перед auth.js)
        if (typeof app !== 'undefined' && app) {
            try {
                app.loadNavigation();
                app.loadDefaultSection();
            } catch (error) {
                console.error('Ошибка при загрузке навигации:', error);
                // Пытаемся загрузить позже
                setTimeout(() => {
                    if (typeof app !== 'undefined' && app) {
                        try {
                            app.loadNavigation();
                            app.loadDefaultSection();
                        } catch (e) {
                            console.error('Ошибка при повторной загрузке:', e);
                        }
                    }
                }, 100);
            }
        } else {
            // Если по какой-то причине app еще не загружен, ждем
            setTimeout(() => {
                if (typeof app !== 'undefined' && app) {
                    try {
                        app.loadNavigation();
                        app.loadDefaultSection();
                    } catch (error) {
                        console.error('Ошибка при загрузке навигации:', error);
                    }
                }
            }, 100);
        }
    }

    handleRoleChange() {
        const role = document.getElementById('role').value;
        const loginFields = document.getElementById('loginFields');
        const username = document.getElementById('username');
        const password = document.getElementById('password');
        
        if (role === 'guest') {
            loginFields.style.display = 'none';
            username.removeAttribute('required');
            password.removeAttribute('required');
        } else {
            loginFields.style.display = 'block';
            username.setAttribute('required', 'required');
            password.setAttribute('required', 'required');
        }
    }

    async login(username, password, role) {
        role = storage.sanitizeInput(role);

        // Гость - вход без авторизации
        if (role === 'guest') {
            this.currentUser = {
                id: 0,
                username: 'guest',
                name: 'Қонақ',
                role: 'guest'
            };
            sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            storage.log('LOGIN', 0, { role: 'guest' });
            this.showMainScreen();
            this.showNotification('Қонақ ретінде кірдіңіз!', 'success');
            return true;
        }

        // Обычная авторизация для сотрудников
        username = storage.sanitizeInput(username);
        password = storage.sanitizeInput(password);

        const users = storage.read('users');
        const hashedPassword = storage.hashPassword(password);
        
        const user = users.find(u => 
            u.username === username && 
            u.password === hashedPassword && 
            u.role === role
        );

        if (user) {
            this.currentUser = { ...user, password: undefined };
            sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            storage.log('LOGIN', user.id, { username, role });
            this.showMainScreen();
            this.showNotification('Сәтті кірдіңіз!', 'success');
            return true;
        } else {
            this.showNotification('Қате логин, пароль немесе рөл!', 'error');
            return false;
        }
    }

    logout() {
        if (this.currentUser) {
            storage.log('LOGOUT', this.currentUser.id, {});
        }
        this.currentUser = null;
        sessionStorage.removeItem('currentUser');
        this.showLoginScreen();
        this.showNotification('Сіз жүйеден шықтыңыз', 'info');
    }

    updateUserInfo() {
        if (this.currentUser) {
            const currentUserEl = document.getElementById('currentUser');
            const currentRoleEl = document.getElementById('currentRole');
            
            if (currentUserEl) {
                currentUserEl.textContent = `Қолданушы: ${this.currentUser.name || this.currentUser.username}`;
            }
            
            if (currentRoleEl) {
                const roleNames = {
                    admin: 'Админ',
                    manager: 'Менеджер',
                    chef: 'Аспаз',
                    waiter: 'Официант',
                    cashier: 'Кассир',
                    guest: 'Қонақ'
                };
                currentRoleEl.textContent = `Рөл: ${roleNames[this.currentUser.role] || this.currentUser.role}`;
            }
        }
    }

    hasPermission(requiredRole) {
        if (!this.currentUser) return false;
        
        // Гость имеет минимальные права
        if (this.currentUser.role === 'guest') {
            return false; // Гость не имеет прав на управление
        }
        
        const roleHierarchy = {
            admin: 5,
            manager: 4,
            chef: 3,
            waiter: 2,
            cashier: 1
        };
        return roleHierarchy[this.currentUser.role] >= roleHierarchy[requiredRole];
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification`;
        notification.style.background = type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Инициализация после загрузки DOM
let auth;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        auth = new Auth();
        initAuthHandlers();
    });
} else {
    // DOM уже загружен
    auth = new Auth();
    initAuthHandlers();
}

function initAuthHandlers() {
    // Обработчик формы входа
    document.getElementById('loginForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;
        auth.login(username, password, role);
    });

    // Обработчик кнопки выхода
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        auth.logout();
    });
}

