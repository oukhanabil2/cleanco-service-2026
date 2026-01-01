// GESTIONNAIRE D'INTERFACE UTILISATEUR PROFESSIONNEL
class UIManager {
    constructor() {
        console.log("🎨 UIManager initialisé");
        this.init();
    }
    
    init() {
        this.createOverlay();
        this.createNotificationContainer();
        this.createLoadingOverlay();
        this.createStyleElement();
        
        // Mettre à jour les fonctions globales pour la compatibilité
        this.updateGlobalFunctions();
        
        console.log("✅ UIManager prêt à l'emploi");
    }
    
    // === GESTION DES POPUPS ===
    
    showPopup(options) {
        // Options peuvent être: { title, content, buttons, size, onClose }
        // Ou compatibilité avec l'ancien format: (title, content, buttons)
        let config = {};
        
        if (typeof options === 'string') {
            // Ancien format
            config = {
                title: options,
                content: arguments[1] || '',
                buttons: arguments[2] || '',
                size: 'medium'
            };
        } else {
            // Nouveau format
            config = {
                title: options.title || 'Information',
                content: options.content || '',
                buttons: options.buttons || this.createDefaultButtons(options.onConfirm),
                size: options.size || 'medium',
                onClose: options.onClose || null
            };
        }
        
        const overlay = this.getOrCreateElement('overlay');
        const popup = this.getOrCreateElement('popup-content');
        
        popup.className = `popup popup-${config.size}`;
        popup.innerHTML = `
            <div class="popup-header">
                <h2>${this.escapeHtml(config.title)}</h2>
                <button class="popup-close-btn" onclick="uiManager.hidePopup()" aria-label="Fermer">
                    &times;
                </button>
            </div>
            <div class="popup-body">${config.content}</div>
            ${config.buttons ? `<div class="popup-footer">${config.buttons}</div>` : ''}
        `;
        
        overlay.classList.add('visible');
        overlay.style.display = 'flex';
        
        // Focus sur le premier bouton focusable
        setTimeout(() => {
            const firstButton = popup.querySelector('button');
            if (firstButton) firstButton.focus();
        }, 100);
        
        // Stocker la callback de fermeture
        if (config.onClose) {
            this.currentPopupOnClose = config.onClose;
        }
        
        return popup;
    }
    
    hidePopup() {
        const overlay = document.getElementById('overlay');
        const popup = document.getElementById('popup-content');
        
        if (overlay) {
            overlay.classList.remove('visible');
            setTimeout(() => {
                overlay.style.display = 'none';
                if (popup) popup.innerHTML = '';
            }, 300);
        }
        
        // Exécuter la callback de fermeture si définie
        if (this.currentPopupOnClose) {
            this.currentPopupOnClose();
            this.currentPopupOnClose = null;
        }
    }
    
    createDefaultButtons(onConfirm) {
        if (onConfirm) {
            return `
                <button class="btn btn-secondary" onclick="uiManager.hidePopup()">
                    Annuler
                </button>
                <button class="btn btn-primary" onclick="${onConfirm}; uiManager.hidePopup();">
                    Confirmer
                </button>
            `;
        }
        return '';
    }
    
    // === GESTION DES NOTIFICATIONS ===
    
    showNotification(message, type = 'info', duration = 5000) {
        // Nettoyer les notifications trop anciennes
        this.cleanupOldNotifications();
        
        // Créer la notification
        const notification = document.createElement('div');
        const notificationId = 'notification-' + Date.now();
        
        notification.id = notificationId;
        notification.className = `notification notification-${type}`;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
        
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-text">${this.escapeHtml(message)}</span>
            </div>
            <button class="notification-close" 
                    onclick="uiManager.closeNotification('${notificationId}')" 
                    aria-label="Fermer la notification">
                &times;
            </button>
        `;
        
        // Ajouter au conteneur
        const container = document.getElementById('notification-container');
        container.appendChild(notification);
        
        // Animation d'entrée
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Auto-fermeture
        if (duration > 0) {
            setTimeout(() => {
                this.closeNotification(notificationId);
            }, duration);
        }
        
        return notificationId;
    }
    
    closeNotification(id) {
        const notification = document.getElementById(id);
        if (notification) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }
    
    cleanupOldNotifications() {
        const container = document.getElementById('notification-container');
        const notifications = container.querySelectorAll('.notification');
        
        if (notifications.length > 5) {
            // Garder seulement les 5 plus récentes
            Array.from(notifications)
                .slice(0, notifications.length - 5)
                .forEach(notif => notif.remove());
        }
    }
    
    // === GESTION DU CHARGEMENT ===
    
    showLoading(message = 'Chargement...', options = {}) {
        this.hideLoading();
        
        const loading = document.createElement('div');
        loading.id = 'global-loading';
        
        const spinner = options.spinner !== false ? 
            '<div class="loading-spinner"></div>' : '';
        
        loading.innerHTML = `
            <div class="loading-overlay">
                ${spinner}
                <div class="loading-text">${this.escapeHtml(message)}</div>
                ${options.progress ? 
                    `<div class="loading-progress">
                        <div class="loading-progress-bar" style="width: ${options.progress}%"></div>
                    </div>` : ''
                }
            </div>
        `;
        
        document.body.appendChild(loading);
        
        // Afficher avec animation
        setTimeout(() => {
            loading.classList.add('visible');
        }, 10);
        
        return loading;
    }
    
    updateLoadingProgress(percent, message = null) {
        const loading = document.getElementById('global-loading');
        if (loading) {
            const progressBar = loading.querySelector('.loading-progress-bar');
            if (progressBar) {
                progressBar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
            }
            
            if (message) {
                const text = loading.querySelector('.loading-text');
                if (text) text.textContent = message;
            }
        }
    }
    
    hideLoading() {
        const loading = document.getElementById('global-loading');
        if (loading) {
            loading.classList.remove('visible');
            setTimeout(() => {
                if (loading.parentNode) {
                    loading.remove();
                }
            }, 300);
        }
    }
    
    // === CONFIRMATIONS ET PROMPTS ===
    
    showConfirm(message, options = {}) {
        return new Promise((resolve) => {
            const config = {
                title: options.title || 'Confirmation',
                message: message,
                confirmText: options.confirmText || 'Confirmer',
                cancelText: options.cancelText || 'Annuler',
                type: options.type || 'warning', // warning, danger, info
                onConfirm: resolve.bind(null, true),
                onCancel: resolve.bind(null, false)
            };
            
            const icon = this.getConfirmIcon(config.type);
            const content = `
                <div class="confirm-dialog">
                    <div class="confirm-icon">${icon}</div>
                    <div class="confirm-message">${this.escapeHtml(config.message)}</div>
                </div>
            `;
            
            const buttons = `
                <button class="btn btn-secondary" onclick="uiManager.hidePopup(); (${config.onCancel})()">
                    ${config.cancelText}
                </button>
                <button class="btn btn-${config.type === 'danger' ? 'danger' : 'primary'}" 
                        onclick="uiManager.hidePopup(); (${config.onConfirm})()">
                    ${config.confirmText}
                </button>
            `;
            
            this.showPopup({
                title: config.title,
                content: content,
                buttons: buttons,
                size: 'small',
                onClose: () => config.onCancel()
            });
        });
    }
    
    showPrompt(title, message, defaultValue = '', options = {}) {
        return new Promise((resolve) => {
            const inputType = options.type || 'text';
            const placeholder = options.placeholder || '';
            
            const content = `
                <div class="prompt-dialog">
                    <p>${this.escapeHtml(message)}</p>
                    <input type="${inputType}" 
                           id="prompt-input" 
                           class="form-control" 
                           value="${this.escapeHtml(defaultValue)}" 
                           placeholder="${this.escapeHtml(placeholder)}"
                           autocomplete="off">
                    ${options.description ? `<p class="prompt-description">${options.description}</p>` : ''}
                </div>
            `;
            
            const buttons = `
                <button class="btn btn-secondary" onclick="uiManager.hidePopup(); (${() => resolve(null)})()">
                    Annuler
                </button>
                <button class="btn btn-primary" onclick="
                    const input = document.getElementById('prompt-input');
                    uiManager.hidePopup();
                    (${resolve})(input ? input.value : null);
                ">
                    OK
                </button>
            `;
            
            this.showPopup({
                title: title,
                content: content,
                buttons: buttons,
                size: 'small',
                onClose: () => resolve(null)
            });
            
            // Focus sur l'input après affichage
            setTimeout(() => {
                const input = document.getElementById('prompt-input');
                if (input) {
                    input.focus();
                    input.select();
                    
                    // Soumission avec Entrée
                    input.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') {
                            const btn = document.querySelector('.popup-footer .btn-primary');
                            if (btn) btn.click();
                        }
                    });
                }
            }, 100);
        });
    }
    
    // === VÉRIFICATION DE MOT DE PASSE ===
    
    async checkPassword(options = {}) {
        const config = {
            message: options.message || 'Veuillez entrer le mot de passe pour continuer:',
            correctPassword: options.correctPassword || 'Nabil1974',
            maxAttempts: options.maxAttempts || 3
        };
        
        let attempts = 0;
        
        while (attempts < config.maxAttempts) {
            const password = await this.showPrompt(
                'Authentification requise',
                config.message,
                '',
                { type: 'password', placeholder: 'Mot de passe' }
            );
            
            if (password === null) {
                // Annulé par l'utilisateur
                return false;
            }
            
            if (password === config.correctPassword) {
                this.showNotification('✅ Authentification réussie', 'success', 2000);
                return true;
            }
            
            attempts++;
            const remaining = config.maxAttempts - attempts;
            
            if (remaining > 0) {
                this.showNotification(
                    `❌ Mot de passe incorrect. Tentatives restantes: ${remaining}`,
                    'error',
                    3000
                );
            } else {
                this.showNotification('❌ Nombre maximal de tentatives atteint', 'error', 5000);
                return false;
            }
        }
        
        return false;
    }
    
    // === UTILITAIRES ===
    
    getNotificationIcon(type) {
        const icons = {
            'success': '✅',
            'error': '❌',
            'warning': '⚠️',
            'info': 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }
    
    getConfirmIcon(type) {
        const icons = {
            'warning': '⚠️',
            'danger': '🚨',
            'info': 'ℹ️',
            'success': '✅'
        };
        return icons[type] || '⚠️';
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // === CRÉATION DES ÉLÉMENTS DOM ===
    
    createOverlay() {
        if (!document.getElementById('overlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'overlay';
            overlay.className = 'overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 1000;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            
            const popup = document.createElement('div');
            popup.id = 'popup-content';
            popup.className = 'popup';
            popup.style.cssText = `
                background: white;
                border-radius: 12px;
                max-width: 90%;
                max-height: 90%;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                transform: scale(0.9);
                transition: transform 0.3s ease;
            `;
            
            overlay.appendChild(popup);
            document.body.appendChild(overlay);
            
            // Fermer en cliquant sur l'overlay
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.hidePopup();
                }
            });
        }
    }
    
    createNotificationContainer() {
        if (!document.getElementById('notification-container')) {
            const container = document.createElement('div');
            container.id = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 400px;
            `;
            document.body.appendChild(container);
        }
    }
    
    createLoadingOverlay() {
        if (!document.getElementById('global-loading')) {
            const loading = document.createElement('div');
            loading.id = 'global-loading';
            loading.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 9998;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            document.body.appendChild(loading);
        }
    }
    
    createStyleElement() {
        if (!document.getElementById('ui-manager-styles')) {
            const style = document.createElement('style');
            style.id = 'ui-manager-styles';
            style.textContent = `
                /* Styles pour les popups */
                .overlay.visible {
                    display: flex !important;
                    opacity: 1 !important;
                }
                
                .overlay.visible .popup {
                    transform: scale(1) !important;
                }
                
                .popup-header {
                    padding: 20px;
                    background: #2c3e50;
                    color: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .popup-header h2 {
                    margin: 0;
                    font-size: 1.3rem;
                }
                
                .popup-close-btn {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 28px;
                    cursor: pointer;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .popup-body {
                    padding: 20px;
                    max-height: 60vh;
                    overflow-y: auto;
                }
                
                .popup-footer {
                    padding: 15px 20px;
                    background: #f8f9fa;
                    border-top: 1px solid #dee2e6;
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                }
                
                /* Styles pour les notifications */
                .notification {
                    background: #3498db;
                    color: white;
                    padding: 15px 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    min-width: 300px;
                    max-width: 400px;
                    transform: translateX(100%);
                    opacity: 0;
                    transition: transform 0.3s ease, opacity 0.3s ease;
                }
                
                .notification.show {
                    transform: translateX(0);
                    opacity: 1;
                }
                
                .notification-success {
                    background: #27ae60;
                }
                
                .notification-error {
                    background: #e74c3c;
                }
                
                .notification-warning {
                    background: #f39c12;
                }
                
                .notification-info {
                    background: #3498db;
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    flex: 1;
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 20px;
                    cursor: pointer;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                /* Styles pour le chargement */
                #global-loading.visible {
                    display: flex !important;
                    opacity: 1 !important;
                }
                
                .loading-overlay {
                    background: white;
                    padding: 30px;
                    border-radius: 10px;
                    text-align: center;
                    min-width: 200px;
                }
                
                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #3498db;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 15px;
                }
                
                .loading-text {
                    margin-bottom: 10px;
                    color: #333;
                    font-size: 16px;
                }
                
                .loading-progress {
                    width: 100%;
                    height: 6px;
                    background: #ecf0f1;
                    border-radius: 3px;
                    overflow: hidden;
                }
                
                .loading-progress-bar {
                    height: 100%;
                    background: #3498db;
                    transition: width 0.3s ease;
                }
                
                /* Styles pour les boutons */
                .btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: background-color 0.3s;
                }
                
                .btn-primary {
                    background: #3498db;
                    color: white;
                }
                
                .btn-primary:hover {
                    background: #2980b9;
                }
                
                .btn-secondary {
                    background: #95a5a6;
                    color: white;
                }
                
                .btn-secondary:hover {
                    background: #7f8c8d;
                }
                
                .btn-danger {
                    background: #e74c3c;
                    color: white;
                }
                
                .btn-danger:hover {
                    background: #c0392b;
                }
                
                /* Animations */
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                
                /* Responsive */
                @media (max-width: 768px) {
                    .popup {
                        width: 95% !important;
                        max-width: 95% !important;
                    }
                    
                    .notification {
                        min-width: 250px;
                        max-width: 300px;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    getOrCreateElement(id) {
        let element = document.getElementById(id);
        if (!element) {
            element = document.createElement('div');
            element.id = id;
            document.body.appendChild(element);
        }
        return element;
    }
    
    updateGlobalFunctions() {
        // Compatibilité avec l'ancien code
        window.openPopup = (title, body, footer) => {
            this.showPopup({ title, content: body, buttons: footer });
        };
        
        window.closePopup = () => {
            this.hidePopup();
        };
        
        window.showSnackbar = (msg, type = 'info') => {
            this.showNotification(msg, type);
        };
        
        window.UIManager = this;
    }
}

// Initialisation automatique
if (typeof window !== 'undefined') {
    if (!window.uiManager) {
        window.uiManager = new UIManager();
        console.log("✅ UIManager initialisé globalement");
    } else {
        console.warn("⚠️ UIManager existe déjà, réutilisation");
    }
}

// Export pour modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}
