// js/uiManager.js - Gestionnaire d'interface utilisateur

const UIManager = {
    // Afficher une popup
    showPopup: function(title, content, buttons) {
        const overlay = document.getElementById('overlay');
        const popupContent = document.getElementById('popup-content');
        
        popupContent.innerHTML = `
            <div class="popup-header">
                <h2>${title}</h2>
                <button class="popup-close-btn" onclick="UIManager.hidePopup()">&times;</button>
            </div>
            <div class="popup-body">${content}</div>
            <div class="popup-footer">${buttons}</div>
        `;
        
        overlay.classList.add('visible');
    },
    
    // Masquer une popup
    hidePopup: function() {
        document.getElementById('overlay').classList.remove('visible');
    },
    
    // Afficher une notification (remplace showSnackbar)
    showNotification: function(message, type = 'info') {
        // Supprimer les notifications existantes
        const existing = document.querySelectorAll('.notification');
        existing.forEach(n => n.remove());
        
        // Créer la nouvelle notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
        `;
        
        // Styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-width: 300px;
            max-width: 400px;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Auto-suppression après 5 secondes
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    },
    
    // Afficher un indicateur de chargement
    showLoading: function(message = 'Chargement...') {
        this.hideLoading(); // Supprimer d'abord les loadings existants
        
        const loading = document.createElement('div');
        loading.id = 'global-loading';
        loading.innerHTML = `
            <div class="loading-overlay">
                <div class="loading-spinner"></div>
                <div class="loading-text">${message}</div>
            </div>
        `;
        
        // Styles
        loading.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;
        
        document.body.appendChild(loading);
    },
    
    // Masquer l'indicateur de chargement
    hideLoading: function() {
        const loading = document.getElementById('global-loading');
        if (loading) {
            loading.remove();
        }
    },
    
    // Fonctions utilitaires pour les notifications
    getNotificationIcon: function(type) {
        const icons = {
            'success': '✅',
            'error': '❌',
            'warning': '⚠️',
            'info': 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    },
    
    getNotificationColor: function(type) {
        const colors = {
            'success': '#27ae60',
            'error': '#e74c3c',
            'warning': '#f39c12',
            'info': '#3498db'
        };
        return colors[type] || '#3498db';
    },
    
    // Vérification de mot de passe
    checkPassword: function() {
        const password = prompt("🔐 Veuillez entrer le mot de passe pour continuer:");
        if (password === "Nabil1974") {
            return true;
        } else {
            this.showNotification("❌ Mot de passe incorrect", "error");
            return false;
        }
    },
    
    // Confirmation dialog
    showConfirm: function(message, onConfirm, onCancel = null) {
        const confirmId = 'confirm-' + Date.now();
        
        this.showPopup(
            "Confirmation",
            `
                <div class="confirm-dialog">
                    <p>${message}</p>
                </div>
            `,
            `
                <button class="btn-secondary" onclick="UIManager.hidePopup()">
                    Annuler
                </button>
                <button class="btn-danger" onclick="
                    ${onConfirm};
                    UIManager.hidePopup();
                ">
                    Confirmer
                </button>
            `
        );
    }
};

// Gardez les fonctions globales pour la compatibilité avec l'ancien code
function openPopup(title, body, footer) {
    UIManager.showPopup(title, body, footer);
}

function closePopup() {
    UIManager.hidePopup();
}

function showSnackbar(msg) {
    UIManager.showNotification(msg, 'info');
}