// Негізгі қолданба
class App {
    constructor() {
        this.currentSection = null;
    }

    loadNavigation() {
        const sidebarNav = document.getElementById('sidebarNav');
        if (!sidebarNav) {
            // Элемент табылмады (мүмкін, бұл section.html)
            return;
        }
        
        sidebarNav.innerHTML = '';

        // Auth объектісінің бар екенін және жүктелгенін тексеру
        if (typeof auth === 'undefined' || !auth || !auth.currentUser) {
            // Егер auth әлі жүктелмеген болса, сәл күтеміз
            setTimeout(() => {
                if (typeof auth !== 'undefined' && auth && auth.currentUser) {
                    this.loadNavigation();
                }
            }, 100);
            return;
        }

        const role = auth.currentUser.role;
        const navItems = this.getNavItemsForRole(role);

        navItems.forEach(item => {
            // Барлық пункттер сол терезеде ашылады
            const navItem = document.createElement('div');
            navItem.className = 'sidebar-nav-item';
            navItem.textContent = item.label;
            navItem.onclick = () => {
                this.loadSection(item.section);
                this.toggleSidebar();
            };
            sidebarNav.appendChild(navItem);
        });
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (sidebar) sidebar.classList.toggle('active');
        if (overlay) overlay.classList.toggle('active');
    }

    getNavItemsForRole(role) {
        const allItems = {
            admin: [
                { label: 'Басты бет', section: 'dashboard' },
                { label: 'Мәзір', section: 'menu' },
                { label: 'Тапсырыстар', section: 'orders' },
                { label: 'Брондау', section: 'reservations' },
                { label: 'Клиенттер', section: 'customers' },
                { label: 'Төлемдер', section: 'payments' },
                { label: 'Персонал', section: 'staff' },
                { label: 'Асхана', section: 'kitchen' },
                { label: 'Қойма', section: 'warehouse' },
                { label: 'Пікірлер', section: 'reviews' },
                { label: 'Админ панель', section: 'admin' }
            ],
            manager: [
                { label: 'Басты бет', section: 'dashboard' },
                { label: 'Мәзір', section: 'menu' },
                { label: 'Тапсырыстар', section: 'orders' },
                { label: 'Брондау', section: 'reservations' },
                { label: 'Клиенттер', section: 'customers' },
                { label: 'Пікірлер', section: 'reviews' },
                { label: 'Төлемдер', section: 'payments' },
                { label: 'Персонал', section: 'staff' },
                { label: 'Асхана', section: 'kitchen' },
                { label: 'Қойма', section: 'warehouse' }
            ],
            chef: [
                { label: 'Асхана', section: 'kitchen' },
                { label: 'Қойма', section: 'warehouse' }
            ],
            waiter: [
                { label: 'Басты бет', section: 'dashboard' },
                { label: 'Мәзір', section: 'menu' },
                { label: 'Тапсырыстар', section: 'orders' },
                { label: 'Брондау', section: 'reservations' },
                { label: 'Клиенттер', section: 'customers' }
            ],
            cashier: [
                { label: 'Басты бет', section: 'dashboard' },
                { label: 'Тапсырыстар', section: 'orders' },
                { label: 'Төлемдер', section: 'payments' },
                { label: 'Клиенттер', section: 'customers' }
            ],
            guest: [
                { label: 'Басты бет', section: 'dashboard' },
                { label: 'Мәзір', section: 'menu' },
                { label: 'Брондау', section: 'reservations' },
                { label: 'Оқиғалар', section: 'events' },
                { label: 'Жеткізу', section: 'delivery' },
                { label: 'Пікірлер', section: 'reviews' },
                { label: 'Банкет залдары', section: 'banquet' }
            ]
        };

        return allItems[role] || [];
    }

    loadDefaultSection() {
        if (!auth || !auth.currentUser) {
            // Егер auth әлі жүктелмеген болса, әдепкі бойынша dashboard жүктейміз
            this.loadSection('dashboard');
            return;
        }
        
        const role = auth.currentUser?.role;
        const defaultSections = {
            admin: 'dashboard',
            manager: 'orders',
            chef: 'kitchen',
            waiter: 'orders',
            cashier: 'orders',
            guest: 'dashboard'
        };
        this.loadSection(defaultSections[role] || 'orders');
    }

    loadSection(section) {
        this.currentSection = section;
        const mainContent = document.getElementById('mainContent');
        
        if (!mainContent) {
            // Элемент табылмады (мүмкін, бұл section.html)
            return;
        }
        
        // Навигацияның белсенді батырмасын жаңарту (егер бар болса)
        const navButtons = document.querySelectorAll('.nav-btn');
        if (navButtons.length > 0 && auth && auth.currentUser) {
            navButtons.forEach(btn => {
                btn.classList.remove('active');
                const role = auth.currentUser?.role;
                const navItems = this.getNavItemsForRole(role);
                if (btn.textContent === navItems.find(item => item.section === section)?.label) {
                    btn.classList.add('active');
                }
            });
        }

        // Сәйкес модульді жүктеу
        switch(section) {
            case 'dashboard':
                dashboardModule.render();
                break;
            case 'menu':
                menuModule.render();
                break;
            case 'orders':
                ordersModule.render();
                break;
            case 'reservations':
                reservationsModule.render();
                break;
            case 'customers':
                customersModule.render();
                break;
            case 'payments':
                paymentsModule.render();
                break;
            case 'staff':
                staffModule.render();
                break;
            case 'kitchen':
                kitchenModule.render();
                break;
            case 'warehouse':
                warehouseModule.render();
                break;
            case 'admin':
                adminModule.render();
                break;
            case 'events':
                eventsModule.render();
                break;
            case 'delivery':
                deliveryModule.render();
                break;
            case 'reviews':
                reviewsModule.render();
                break;
            case 'banquet':
                banquetModule.render();
                break;
            default:
                mainContent.innerHTML = '<div class="content-section"><h2>Бөлім табылмады</h2></div>';
        }
    }

    openSectionInNewWindow(section) {
        // Бөлімді жаңа терезеде ашу
        const sectionWindow = window.open(`section.html?section=${section}`, `section_${section}`, 'width=1200,height=800,scrollbars=yes,resizable=yes');
        if (!sectionWindow) {
            auth.showNotification('Браузер бұғаттады. Жаңа терезені рұқсат етіңіз.', 'error');
        }
    }
}

const app = new App();

