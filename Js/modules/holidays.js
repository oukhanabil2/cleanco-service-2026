// js/modules/holidays.js - Module de gestion des jours fériés

const HolidaysModule = {
    // Variables du module
    holidays: [],
    
    // Initialisation
    init: function() {
        this.loadHolidays();
        console.log('Module Jours Fériés initialisé');
    },
    
    // Charger l'interface
    load: function() {
        return `
            <div class="module-container">
                <div class="module-header">
                    <h2>🎉 Gestion des Jours Fériés</h2>
                    <div class="header-actions">
                        <button class="btn-primary" onclick="HolidaysModule.showAddForm()">
                            + Ajouter un jour férié
                        </button>
                        <button class="btn-secondary" onclick="HolidaysModule.generateYearlyHolidays()">
                            🔄 Générer année complète
                        </button>
                    </div>
                </div>
                
                <!-- Filtres -->
                <div class="filters">
                    <div class="filter-group">
                        <label>Année :</label>
                        <select id="yearFilter" class="form-input" onchange="HolidaysModule.filterByYear()">
                            ${this.generateYearOptions()}
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Type :</label>
                        <select id="typeFilter" class="form-input" onchange="HolidaysModule.filterHolidays()">
                            <option value="all">Tous les types</option>
                            <option value="fixe">Fêtes fixes</option>
                            <option value="variable">Fêtes variables</option>
                            <option value="religieux">Religieuses</option>
                            <option value="local">Locales</option>
                        </select>
                    </div>
                </div>
                
                <!-- Statistiques rapides -->
                <div class="stats-cards">
                    <div class="stat-card">
                        <div class="stat-number">${this.getCurrentYearHolidays().length}</div>
                        <div class="stat-label">Jours fériés cette année</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${this.getNextHoliday()}</div>
                        <div class="stat-label">Prochain jour férié</div>
                    </div>
                </div>
                
                <!-- Liste des jours fériés -->
                <div id="holidays-container">
                    ${this.generateHolidaysTable()}
                </div>
                
                <!-- Calendrier des congés (optionnel) -->
                <div class="calendar-preview">
                    <h3>📅 Calendrier des jours fériés ${new Date().getFullYear()}</h3>
                    <div class="mini-calendar">
                        ${this.generateMiniCalendar()}
                    </div>
                </div>
            </div>
        `;
    },
    
    // ============ FONCTIONS CORE ============
    
    // Charger les jours fériés depuis DataManager
    loadHolidays: function() {
        this.holidays = DataManager.getHolidays();
        if (!this.holidays || this.holidays.length === 0) {
            this.initializeDefaultHolidays();
        }
    },
    
    // Initialiser les jours fériés par défaut (Maroc)
    initializeDefaultHolidays: function() {
        const currentYear = new Date().getFullYear();
        
        // Jours fériés fixes au Maroc
        const defaultHolidays = [
            // Fêtes nationales fixes
            { date: `${currentYear}-01-01`, name: "Nouvel An", type: "fixe", country: "MA" },
            { date: `${currentYear}-01-11`, name: "Manifeste de l'Indépendance", type: "fixe", country: "MA" },
            { date: `${currentYear}-05-01`, name: "Fête du Travail", type: "fixe", country: "MA" },
            { date: `${currentYear}-07-30`, name: "Fête du Trône", type: "fixe", country: "MA" },
            { date: `${currentYear}-08-14`, name: "Allégeance Oued Eddahab", type: "fixe", country: "MA" },
            { date: `${currentYear}-08-20`, name: "Révolution du Roi et du Peuple", type: "fixe", country: "MA" },
            { date: `${currentYear}-08-21`, name: "Fête de la Jeunesse", type: "fixe", country: "MA" },
            { date: `${currentYear}-11-06`, name: "Marche Verte", type: "fixe", country: "MA" },
            { date: `${currentYear}-11-18`, name: "Fête de l'Indépendance", type: "fixe", country: "MA" },
            
            // Fêtes religieuses (à calculer - dates approximatives)
            { date: `${currentYear}-01-10`, name: "Achoura", type: "religieux", country: "MA", calculated: true },
            { date: `${currentYear}-03-11`, name: "Aïd al-Mawlid", type: "religieux", country: "MA", calculated: true },
            { date: `${currentYear}-04-10`, name: "Aïd al-Fitr", type: "religieux", country: "MA", calculated: true },
            { date: `${currentYear}-06-16`, name: "Aïd al-Adha", type: "religieux", country: "MA", calculated: true },
        ];
        
        this.holidays = defaultHolidays.map(holiday => ({
            id: Utilities.generateId(),
            ...holiday,
            description: holiday.name,
            recurring: holiday.type === 'fixe',
            createdAt: new Date().toISOString()
        }));
        
        DataManager.saveHolidays(this.holidays);
    },
    
    // Générer le tableau des jours fériés
    generateHolidaysTable: function() {
        const filteredHolidays = this.getFilteredHolidays();
        
        if (filteredHolidays.length === 0) {
            return '<div class="empty-state">Aucun jour férié trouvé</div>';
        }
        
        return `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Jour</th>
                        <th>Nom</th>
                        <th>Type</th>
                        <th>Récurrent</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredHolidays.sort((a, b) => new Date(a.date) - new Date(b.date)).map(holiday => `
                        <tr>
                            <td><strong>${Utilities.formatDate(holiday.date)}</strong></td>
                            <td>${this.getDayName(holiday.date)}</td>
                            <td>${holiday.name || holiday.description}</td>
                            <td>${this.getTypeBadge(holiday.type)}</td>
                            <td>${holiday.recurring ? '✅ Oui' : '❌ Non'}</td>
                            <td class="actions">
                                <button onclick="HolidaysModule.editHoliday('${holiday.id}')" class="btn-sm">
                                    ✏️ Modifier
                                </button>
                                <button onclick="HolidaysModule.deleteHoliday('${holiday.id}')" class="btn-sm btn-danger">
                                    🗑️ Supprimer
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="table-summary">
                <p>Total : <strong>${filteredHolidays.length}</strong> jours fériés</p>
            </div>
        `;
    },
    
    // ============ FORMULAIRES ============
    
    // Afficher le formulaire d'ajout
    showAddForm: function() {
        UIManager.showPopup(`
            <div class="form-container">
                <h3>➕ Ajouter un jour férié</h3>
                
                <form id="add-holiday-form" onsubmit="return HolidaysModule.saveHoliday(event)">
                    <div class="form-group">
                        <label for="holiday-date">Date *</label>
                        <input type="date" id="holiday-date" class="form-input" required 
                               value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    
                    <div class="form-group">
                        <label for="holiday-name">Nom du jour férié *</label>
                        <input type="text" id="holiday-name" class="form-input" required 
                               placeholder="Ex: Fête du Travail">
                    </div>
                    
                    <div class="form-group">
                        <label for="holiday-description">Description</label>
                        <textarea id="holiday-description" class="form-input" rows="3" 
                                  placeholder="Description détaillée..."></textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="holiday-type">Type *</label>
                            <select id="holiday-type" class="form-input" required>
                                <option value="fixe">Fête nationale fixe</option>
                                <option value="religieux">Fête religieuse</option>
                                <option value="local">Fête locale</option>
                                <option value="variable">Fête variable</option>
                                <option value="autre">Autre</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="holiday-country">Pays</label>
                            <select id="holiday-country" class="form-input">
                                <option value="MA">Maroc</option>
                                <option value="FR">France</option>
                                <option value="XX">International</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="holiday-recurring" checked>
                            <span>Répéter chaque année</span>
                        </label>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" onclick="UIManager.hidePopup()" class="btn-secondary">
                            Annuler
                        </button>
                        <button type="submit" class="btn-primary">
                            💾 Enregistrer
                        </button>
                    </div>
                </form>
            </div>
        `);
    },
    
    // Sauvegarder un jour férié
    saveHoliday: function(event) {
        if (event) event.preventDefault();
        
        const holidayData = {
            id: Utilities.generateId(),
            date: document.getElementById('holiday-date').value,
            name: document.getElementById('holiday-name').value,
            description: document.getElementById('holiday-description').value,
            type: document.getElementById('holiday-type').value,
            country: document.getElementById('holiday-country').value,
            recurring: document.getElementById('holiday-recurring').checked,
            createdAt: new Date().toISOString()
        };
        
        // Validation
        if (!holidayData.date || !holidayData.name) {
            UIManager.showNotification('Veuillez remplir les champs obligatoires', 'error');
            return false;
        }
        
        // Vérifier si la date existe déjà
        const existingIndex = this.holidays.findIndex(h => h.date === holidayData.date && h.name === holidayData.name);
        
        if (existingIndex !== -1) {
            this.holidays[existingIndex] = holidayData;
            UIManager.showNotification('Jour férié mis à jour', 'success');
        } else {
            this.holidays.push(holidayData);
            UIManager.showNotification('Jour férié ajouté', 'success');
        }
        
        // Sauvegarder
        DataManager.saveHolidays(this.holidays);
        
        // Fermer popup et rafraîchir
        UIManager.hidePopup();
        MenuManager.loadModule('holidays');
        
        return false;
    },
    
    // Éditer un jour férié
    editHoliday: function(holidayId) {
        const holiday = this.holidays.find(h => h.id === holidayId);
        if (!holiday) return;
        
        UIManager.showPopup(`
            <div class="form-container">
                <h3>✏️ Modifier le jour férié</h3>
                
                <form id="edit-holiday-form" onsubmit="return HolidaysModule.updateHoliday(event, '${holidayId}')">
                    <div class="form-group">
                        <label for="edit-holiday-date">Date</label>
                        <input type="date" id="edit-holiday-date" class="form-input" 
                               value="${holiday.date}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-holiday-name">Nom</label>
                        <input type="text" id="edit-holiday-name" class="form-input" 
                               value="${holiday.name}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-holiday-description">Description</label>
                        <textarea id="edit-holiday-description" class="form-input" rows="3">${holiday.description || ''}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-holiday-type">Type</label>
                        <select id="edit-holiday-type" class="form-input" required>
                            <option value="fixe" ${holiday.type === 'fixe' ? 'selected' : ''}>Fête nationale fixe</option>
                            <option value="religieux" ${holiday.type === 'religieux' ? 'selected' : ''}>Fête religieuse</option>
                            <option value="local" ${holiday.type === 'local' ? 'selected' : ''}>Fête locale</option>
                            <option value="variable" ${holiday.type === 'variable' ? 'selected' : ''}>Fête variable</option>
                            <option value="autre" ${holiday.type === 'autre' ? 'selected' : ''}>Autre</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="edit-holiday-recurring" ${holiday.recurring ? 'checked' : ''}>
                            <span>Répéter chaque année</span>
                        </label>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" onclick="UIManager.hidePopup()" class="btn-secondary">
                            Annuler
                        </button>
                        <button type="submit" class="btn-primary">
                            💾 Mettre à jour
                        </button>
                    </div>
                </form>
            </div>
        `);
    },
    
    // Mettre à jour un jour férié
    updateHoliday: function(event, holidayId) {
        if (event) event.preventDefault();
        
        const index = this.holidays.findIndex(h => h.id === holidayId);
        if (index === -1) return false;
        
        this.holidays[index] = {
            ...this.holidays[index],
            date: document.getElementById('edit-holiday-date').value,
            name: document.getElementById('edit-holiday-name').value,
            description: document.getElementById('edit-holiday-description').value,
            type: document.getElementById('edit-holiday-type').value,
            recurring: document.getElementById('edit-holiday-recurring').checked,
            updatedAt: new Date().toISOString()
        };
        
        DataManager.saveHolidays(this.holidays);
        UIManager.showNotification('Jour férié mis à jour', 'success');
        UIManager.hidePopup();
        MenuManager.loadModule('holidays');
        
        return false;
    },
    
    // Supprimer un jour férié
    deleteHoliday: function(holidayId) {
        if (!confirm('Supprimer ce jour férié ? Cette action est irréversible.')) return;
        
        this.holidays = this.holidays.filter(h => h.id !== holidayId);
        DataManager.saveHolidays(this.holidays);
        
        UIManager.showNotification('Jour férié supprimé', 'warning');
        MenuManager.loadModule('holidays');
    },
    
    // ============ FONCTIONS UTILITAIRES ============
    
    // Générer les jours fériés pour une année complète
    generateYearlyHolidays: function() {
        const year = prompt('Pour quelle année générer les jours fériés ?', new Date().getFullYear());
        if (!year || isNaN(year)) return;
        
        const yearlyHolidays = this.calculateYearlyHolidays(parseInt(year));
        const newHolidays = [];
        
        yearlyHolidays.forEach(holiday => {
            if (!this.holidays.find(h => h.date === holiday.date && h.name === holiday.name)) {
                newHolidays.push({
                    id: Utilities.generateId(),
                    ...holiday,
                    recurring: holiday.type === 'fixe',
                    createdAt: new Date().toISOString()
                });
            }
        });
        
        if (newHolidays.length > 0) {
            this.holidays.push(...newHolidays);
            DataManager.saveHolidays(this.holidays);
            UIManager.showNotification(`${newHolidays.length} jours fériés générés pour ${year}`, 'success');
            MenuManager.loadModule('holidays');
        } else {
            UIManager.showNotification('Tous les jours fériés existent déjà pour cette année', 'info');
        }
    },
    
    // Calculer les jours fériés d'une année
    calculateYearlyHolidays: function(year) {
        return [
            // Jours fixes
            { date: `${year}-01-01`, name: "Nouvel An", type: "fixe" },
            { date: `${year}-01-11`, name: "Manifeste de l'Indépendance", type: "fixe" },
            { date: `${year}-05-01`, name: "Fête du Travail", type: "fixe" },
            { date: `${year}-07-30`, name: "Fête du Trône", type: "fixe" },
            { date: `${year}-08-14`, name: "Allégeance Oued Eddahab", type: "fixe" },
            { date: `${year}-08-20`, name: "Révolution du Roi et du Peuple", type: "fixe" },
            { date: `${year}-08-21`, name: "Fête de la Jeunesse", type: "fixe" },
            { date: `${year}-11-06`, name: "Marche Verte", type: "fixe" },
            { date: `${year}-11-18`, name: "Fête de l'Indépendance", type: "fixe" },
        ];
    },
    
    // Filtrer par année
    filterByYear: function() {
        const year = document.getElementById('yearFilter').value;
        this.displayHolidaysForYear(year);
    },
    
    // Filtrer les jours fériés
    filterHolidays: function() {
        MenuManager.loadModule('holidays');
    },
    
    // Obtenir les jours fériés filtrés
    getFilteredHolidays: function() {
        const selectedYear = document.getElementById('yearFilter') ? 
                            document.getElementById('yearFilter').value : 
                            new Date().getFullYear().toString();
        
        const selectedType = document.getElementById('typeFilter') ? 
                            document.getElementById('typeFilter').value : 
                            'all';
        
        return this.holidays.filter(holiday => {
            const holidayYear = holiday.date.substring(0, 4);
            const yearMatch = holidayYear === selectedYear;
            const typeMatch = selectedType === 'all' || holiday.type === selectedType;
            
            return yearMatch && typeMatch;
        });
    },
    
    // Obtenir les jours fériés de l'année courante
    getCurrentYearHolidays: function() {
        const currentYear = new Date().getFullYear();
        return this.holidays.filter(h => h.date.startsWith(currentYear));
    },
    
    // Obtenir le prochain jour férié
    getNextHoliday: function() {
        const today = new Date();
        const futureHolidays = this.holidays
            .filter(h => new Date(h.date) >= today)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        if (futureHolidays.length > 0) {
            const nextHoliday = futureHolidays[0];
            return Utilities.formatDate(nextHoliday.date);
        }
        
        return 'Aucun';
    },
    
    // Générer les options d'année
    generateYearOptions: function() {
        const currentYear = new Date().getFullYear();
        const years = [];
        
        // 5 ans en arrière et 5 ans en avant
        for (let i = currentYear - 5; i <= currentYear + 5; i++) {
            years.push(i);
        }
        
        return years.map(year => 
            `<option value="${year}" ${year === currentYear ? 'selected' : ''}>${year}</option>`
        ).join('');
    },
    
    // Afficher les jours fériés pour une année spécifique
    displayHolidaysForYear: function(year) {
        document.getElementById('holidays-container').innerHTML = this.generateHolidaysTable();
    },
    
    // Générer un mini-calendrier
    generateMiniCalendar: function() {
        const currentYear = new Date().getFullYear();
        const yearHolidays = this.holidays.filter(h => h.date.startsWith(currentYear));
        
        let html = '<div class="month-grid">';
        
        for (let month = 0; month < 12; month++) {
            const monthHolidays = yearHolidays.filter(h => 
                new Date(h.date).getMonth() === month
            );
            
            html += `
                <div class="month-card">
                    <div class="month-header">${Utilities.getMonthName(month)}</div>
                    <div class="month-holidays">
                        ${monthHolidays.length > 0 ? 
                          monthHolidays.map(h => 
                            `<div class="holiday-dot" title="${h.name}"></div>`
                          ).join('') : 
                          '<span class="no-holiday">Aucun</span>'
                        }
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        return html;
    },
    
    // ============ HELPERS ============
    
    // Obtenir le nom du jour
    getDayName: function(dateString) {
        const date = new Date(dateString);
        const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        return days[date.getDay()];
    },
    
    // Générer un badge pour le type
    getTypeBadge: function(type) {
        const badges = {
            'fixe': '<span class="badge badge-primary">Fixe</span>',
            'religieux': '<span class="badge badge-warning">Religieux</span>',
            'local': '<span class="badge badge-info">Local</span>',
            'variable': '<span class="badge badge-success">Variable</span>',
            'autre': '<span class="badge badge-secondary">Autre</span>'
        };
        
        return badges[type] || '<span class="badge">' + type + '</span>';
    },
    
    // Vérifier si une date est un jour férié
    isHoliday: function(date) {
        const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
        return this.holidays.some(h => h.date === dateStr);
    },
    
    // Exporter les jours fériés
    exportHolidays: function() {
        const dataStr = JSON.stringify(this.holidays, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `jours-feries-${new Date().getFullYear()}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        UIManager.showNotification('Export réussi', 'success');
    }
};