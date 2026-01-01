// js/modules/planning.js - Module de Gestion du Planning Professionnel

const PlanningModule = {
    // Variables du module
    planningData: {},
    currentFilters: {},
    
    // Initialisation
    init: function() {
        this.loadPlanningData();
        console.log('Module Planning initialisé');
    },
    
    // Charger l'interface principale
    load: function() {
        return `
            <div class="module-container">
                <div class="module-header">
                    <h2>📅 Gestion du Planning</h2>
                    <div class="header-actions">
                        <button class="btn-primary" onclick="PlanningModule.showMonthlyPlanning()">
                            📋 Planning Mensuel
                        </button>
                        <button class="btn-secondary" onclick="PlanningModule.showAdvancedOptions()">
                            ⚙️ Options Avancées
                        </button>
                    </div>
                </div>
                
                <!-- Tableau de bord rapide -->
                <div class="dashboard-cards">
                    <div class="dashboard-card" onclick="PlanningModule.showTodayPlanning()">
                        <div class="card-icon">📊</div>
                        <div class="card-content">
                            <div class="card-title">Planning du Jour</div>
                            <div class="card-value">${this.getTodayStats().totalAgents} agents</div>
                        </div>
                    </div>
                    
                    <div class="dashboard-card" onclick="PlanningModule.showMonthlyPlanning()">
                        <div class="card-icon">📅</div>
                        <div class="card-content">
                            <div class="card-title">Mois en cours</div>
                            <div class="card-value">${this.getMonthName(new Date().getMonth() + 1)}</div>
                        </div>
                    </div>
                    
                    <div class="dashboard-card" onclick="PlanningModule.showGroupPlanningSelection()">
                        <div class="card-icon">👥</div>
                        <div class="card-content">
                            <div class="card-title">Par Groupe</div>
                            <div class="card-value">5 groupes</div>
                        </div>
                    </div>
                    
                    <div class="dashboard-card" onclick="PlanningModule.showAgentPlanningSelection()">
                        <div class="card-icon">👤</div>
                        <div class="card-content">
                            <div class="card-title">Par Agent</div>
                            <div class="card-value">${DataManager.getAgents().filter(a => a.statut === 'actif').length} actifs</div>
                        </div>
                    </div>
                </div>
                
                <!-- Alertes et notifications -->
                <div class="alerts-section">
                    <h3>⚠️ Alertes du Jour</h3>
                    <div id="planning-alerts">
                        ${this.generateTodayAlerts()}
                    </div>
                </div>
                
                <!-- Vue rapide du mois -->
                <div class="quick-month-view">
                    <h3>${this.getMonthName(new Date().getMonth() + 1)} ${new Date().getFullYear()} - Vue Rapide</h3>
                    <div class="month-overview">
                        ${this.generateMonthOverview()}
                    </div>
                </div>
            </div>
        `;
    },
    
    // ============ FONCTIONS PRINCIPALES ============
    
    // Afficher le planning mensuel
    showMonthlyPlanning: function() {
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();
        
        const html = `
            <div class="planning-config">
                <h3>📅 Configuration du Planning</h3>
                
                <div class="config-grid">
                    <div class="config-group">
                        <label><i class="icon">📅</i> Période</label>
                        <div class="input-group">
                            <select id="planningMonth" class="form-input">
                                ${this.generateMonthOptions(currentMonth)}
                            </select>
                            <input type="number" id="planningYear" class="form-input" 
                                   value="${currentYear}" min="2020" max="2030">
                        </div>
                    </div>
                    
                    <div class="config-group">
                        <label><i class="icon">👁️</i> Vue</label>
                        <select id="planningType" class="form-input" onchange="PlanningModule.togglePlanningType()">
                            <option value="global">Planning Global</option>
                            <option value="groupe">Par Groupe</option>
                            <option value="agent">Par Agent</option>
                            <option value="poste">Par Poste</option>
                        </select>
                    </div>
                    
                    <div class="config-group" id="groupSelector" style="display:none;">
                        <label><i class="icon">👥</i> Groupe</label>
                        <select id="selectedGroup" class="form-input">
                            ${this.generateGroupOptions()}
                        </select>
                    </div>
                    
                    <div class="config-group" id="agentSelector" style="display:none;">
                        <label><i class="icon">👤</i> Agent</label>
                        <select id="selectedAgent" class="form-input">
                            ${this.generateAgentOptions()}
                        </select>
                    </div>
                    
                    <div class="config-group" id="posteSelector" style="display:none;">
                        <label><i class="icon">🏢</i> Poste</label>
                        <select id="selectedPoste" class="form-input">
                            ${this.generatePosteOptions()}
                        </select>
                    </div>
                </div>
                
                <div class="config-actions">
                    <button class="btn-primary" onclick="PlanningModule.generateMonthlyPlanning()">
                        <i class="icon">📋</i> Générer Planning
                    </button>
                    <button class="btn-secondary" onclick="PlanningModule.showAdvancedGeneration()">
                        <i class="icon">⚙️</i> Génération Avancée
                    </button>
                </div>
            </div>
        `;
        
        UIManager.showPopup("📅 Planning Mensuel", html, `
            <button class="btn-secondary" onclick="UIManager.hidePopup()">
                <i class="icon">✖️</i> Annuler
            </button>
        `);
        
        document.getElementById('planningType').addEventListener('change', () => this.togglePlanningType());
    },
    
    // Générer le planning mensuel
    generateMonthlyPlanning: function() {
        const month = parseInt(document.getElementById('planningMonth').value);
        const year = parseInt(document.getElementById('planningYear').value);
        const type = document.getElementById('planningType').value;
        
        // Sauvegarder les filtres
        this.currentFilters = { month, year, type };
        
        switch(type) {
            case 'groupe':
                const group = document.getElementById('selectedGroup').value;
                this.showGroupPlanning(group, month, year);
                break;
            case 'agent':
                const agentCode = document.getElementById('selectedAgent').value;
                this.showAgentPlanning(agentCode, month, year);
                break;
            case 'poste':
                const poste = document.getElementById('selectedPoste').value;
                this.showPostePlanning(poste, month, year);
                break;
            default:
                this.showGlobalPlanning(month, year);
        }
    },
    
    // Afficher le planning global
    showGlobalPlanning: function(month, year) {
        const activeAgents = DataManager.getActiveAgents();
        const daysInMonth = new Date(year, month, 0).getDate();
        
        // Récupérer les jours fériés
        const holidays = DataManager.getHolidays() || [];
        
        let html = `
            <div class="planning-container">
                <div class="planning-header">
                    <h2>📅 Planning Global - ${this.getMonthName(month)} ${year}</h2>
                    <div class="planning-tools">
                        <button class="btn-sm" onclick="PlanningModule.exportPlanningToExcel(${month}, ${year}, 'global')">
                            <i class="icon">📊</i> Excel
                        </button>
                        <button class="btn-sm" onclick="PlanningModule.printPlanning()">
                            <i class="icon">🖨️</i> Imprimer
                        </button>
                        <button class="btn-sm" onclick="PlanningModule.exportPlanningToPDF(${month}, ${year})">
                            <i class="icon">📄</i> PDF
                        </button>
                    </div>
                </div>
                
                <!-- Filtres rapides -->
                <div class="quick-filters">
                    <input type="text" id="searchAgent" placeholder="Rechercher un agent..." 
                           class="form-input" onkeyup="PlanningModule.filterPlanningTable()">
                    <select id="filterGroupe" class="form-input" onchange="PlanningModule.filterPlanningTable()">
                        <option value="">Tous les groupes</option>
                        ${this.generateGroupOptions()}
                    </select>
                    <select id="filterShift" class="form-input" onchange="PlanningModule.filterPlanningTable()">
                        <option value="">Tous les shifts</option>
                        ${Object.entries(DataManager.getShiftLabels()).map(([code, label]) => 
                            `<option value="${code}">${code} - ${label}</option>`
                        ).join('')}
                    </select>
                </div>
                
                <!-- Tableau du planning -->
                <div class="table-responsive">
                    <table class="planning-table" id="global-planning-table">
                        <thead>
                            <tr>
                                <th class="sticky-col">Agent / Groupe</th>
                                ${Array.from({length: daysInMonth}, (_, i) => {
                                    const day = i + 1;
                                    const date = new Date(year, month - 1, day);
                                    const dayName = Utilities.getDayName(date.getDay());
                                    const isHoliday = DataManager.isHoliday(date);
                                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                                    
                                    return `
                                        <th class="day-header ${isHoliday ? 'holiday' : ''} ${isWeekend ? 'weekend' : ''}" 
                                            title="${date.toLocaleDateString('fr-FR')}">
                                            <div>${day}</div>
                                            <small>${dayName}</small>
                                        </th>
                                    `;
                                }).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${activeAgents.map(agent => {
                                const agentShifts = this.getAgentShiftsForMonth(agent.code, month, year);
                                
                                return `
                                    <tr data-agent="${agent.code}" data-groupe="${agent.groupe}">
                                        <td class="sticky-col agent-cell">
                                            <div class="agent-info">
                                                <strong>${agent.code}</strong>
                                                <div class="agent-details">
                                                    ${agent.nom} ${agent.prenom}<br>
                                                    <span class="badge badge-secondary">${agent.groupe}</span>
                                                </div>
                                            </div>
                                        </td>
                                        ${Array.from({length: daysInMonth}, (_, i) => {
                                            const day = i + 1;
                                            const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                                            const shift = agentShifts[dateStr] || DataManager.getDefaultShift(agent, dateStr);
                                            const shiftData = DataManager.getShiftData(shift);
                                            
                                            return `
                                                <td class="shift-cell ${shiftData.class || ''}" 
                                                    data-shift="${shift}"
                                                    onclick="PlanningModule.showShiftModification('${agent.code}', '${dateStr}', '${shift}')"
                                                    title="${agent.code} - ${dateStr}: ${shiftData.label || shift}">
                                                    ${shift}
                                                </td>
                                            `;
                                        }).join('')}
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
                
                <!-- Légende -->
                <div class="planning-legend">
                    <h4><i class="icon">📋</i> Légende des Shifts</h4>
                    <div class="legend-items">
                        ${Object.entries(DataManager.getShiftData()).map(([code, data]) => 
    `<option value="${code}">${code} - ${data.label}</option>`
                            <div class="legend-item">
                                <span class="legend-color" style="background-color: ${data.color || '#ccc'}"></span>
                                <span class="legend-code">${code}</span>
                                <span class="legend-label">${data.label || code}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Statistiques -->
                <div class="planning-stats">
                    <h4><i class="icon">📊</i> Statistiques du Planning</h4>
                    <div class="stats-grid">
                        ${this.calculatePlanningStats(month, year).map(stat => `
                            <div class="stat-item">
                                <div class="stat-value">${stat.value}</div>
                                <div class="stat-label">${stat.label}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        UIManager.showPopup(`📅 Planning Global ${this.getMonthName(month)} ${year}`, html, `
            <button class="btn-secondary" onclick="PlanningModule.showMonthlyPlanning()">
                <i class="icon">🔄</i> Nouveau
            </button>
            <button class="btn-primary" onclick="PlanningModule.showGeneratePlanningModal(${month}, ${year})">
                <i class="icon">⚡</i> Générer Auto
            </button>
        `);
    },
    
    // ============ FONCTIONS POUR GROUPES ============
    
    showGroupPlanningSelection: function() {
        const html = `
            <div class="selection-modal">
                <h3><i class="icon">👥</i> Planning par Groupe</h3>
                
                <div class="form-grid">
                    <div class="form-group">
                        <label>Groupe</label>
                        <select id="selectedGroupPlanning" class="form-input">
                            ${this.generateGroupOptions()}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Mois</label>
                        <select id="groupMonth" class="form-input">
                            ${this.generateMonthOptions(new Date().getMonth() + 1)}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Année</label>
                        <input type="number" id="groupYear" class="form-input" 
                               value="${new Date().getFullYear()}" min="2020" max="2030">
                    </div>
                    
                    <div class="form-group">
                        <label>Mode d'affichage</label>
                        <select id="groupViewMode" class="form-input">
                            <option value="tableau">Tableau</option>
                            <option value="calendrier">Calendrier</option>
                            <option value="graphique">Graphique</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
        
        UIManager.showPopup("👥 Planning par Groupe", html, `
            <button class="btn-primary" onclick="PlanningModule.showSelectedGroupPlanning()">
                <i class="icon">👁️</i> Voir Planning
            </button>
            <button class="btn-secondary" onclick="PlanningModule.showGroupComparison()">
                <i class="icon">📊</i> Comparer Groupes
            </button>
        `);
    },
    
    showSelectedGroupPlanning: function() {
        const group = document.getElementById('selectedGroupPlanning').value;
        const month = parseInt(document.getElementById('groupMonth').value);
        const year = parseInt(document.getElementById('groupYear').value);
        const viewMode = document.getElementById('groupViewMode').value;
        
        this.showGroupPlanning(group, month, year, viewMode);
    },
    
    showGroupPlanning: function(group, month, year, viewMode = 'tableau') {
        const groupAgents = DataManager.getAgentsByGroup(group);
        const daysInMonth = new Date(year, month, 0).getDate();
        
        if (groupAgents.length === 0) {
            UIManager.showNotification(`Aucun agent actif dans le groupe ${group}`, 'warning');
            return;
        }
        
        let html = '';
        
        if (viewMode === 'tableau') {
            html = this.generateGroupTablePlanning(group, groupAgents, month, year);
        } else if (viewMode === 'calendrier') {
            html = this.generateGroupCalendarPlanning(group, month, year);
        } else {
            html = this.generateGroupChartPlanning(group, month, year);
        }
        
        UIManager.showPopup(`👥 Planning Groupe ${group}`, html, `
            <button class="btn-secondary" onclick="PlanningModule.showGroupPlanningSelection()">
                <i class="icon">👥</i> Autre Groupe
            </button>
            <button class="btn-primary" onclick="PlanningModule.generatePlanningForGroup('${group}', ${month}, ${year})">
                <i class="icon">⚡</i> Générer Auto
            </button>
        `);
    },
    
    // ============ FONCTIONS POUR AGENTS ============
    
    showAgentPlanningSelection: function() {
        const html = `
            <div class="selection-modal">
                <h3><i class="icon">👤</i> Planning par Agent</h3>
                
                <div class="form-grid">
                    <div class="form-group">
                        <label>Agent</label>
                        <select id="selectedAgentPlanning" class="form-input">
                            ${this.generateAgentOptions()}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Période</label>
                        <select id="agentPeriod" class="form-input" onchange="PlanningModule.toggleAgentPeriod()">
                            <option value="month">Mois</option>
                            <option value="week">Semaine</option>
                            <option value="custom">Personnalisée</option>
                        </select>
                    </div>
                    
                    <div id="monthSelection">
                        <div class="form-group">
                            <label>Mois</label>
                            <select id="agentMonth" class="form-input">
                                ${this.generateMonthOptions(new Date().getMonth() + 1)}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Année</label>
                            <input type="number" id="agentYear" class="form-input" 
                                   value="${new Date().getFullYear()}" min="2020" max="2030">
                        </div>
                    </div>
                    
                    <div id="weekSelection" style="display:none;">
                        <div class="form-group">
                            <label>Semaine</label>
                            <input type="week" id="agentWeek" class="form-input" 
                                   value="${this.getCurrentWeek()}">
                        </div>
                    </div>
                    
                    <div id="customSelection" style="display:none;">
                        <div class="form-group">
                            <label>Date début</label>
                            <input type="date" id="agentStartDate" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Date fin</label>
                            <input type="date" id="agentEndDate" class="form-input">
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        UIManager.showPopup("👤 Planning par Agent", html, `
            <button class="btn-primary" onclick="PlanningModule.showSelectedAgentPlanning()">
                <i class="icon">👁️</i> Voir Planning
            </button>
            <button class="btn-secondary" onclick="PlanningModule.showAgentStatsModal()">
                <i class="icon">📊</i> Statistiques
            </button>
        `);
        
        document.getElementById('agentPeriod').addEventListener('change', () => this.toggleAgentPeriod());
    },
    
    showSelectedAgentPlanning: function() {
        const agentCode = document.getElementById('selectedAgentPlanning').value;
        const period = document.getElementById('agentPeriod').value;
        
        let month, year, startDate, endDate;
        
        switch(period) {
            case 'month':
                month = parseInt(document.getElementById('agentMonth').value);
                year = parseInt(document.getElementById('agentYear').value);
                this.showAgentPlanning(agentCode, month, year);
                break;
            case 'week':
                const weekValue = document.getElementById('agentWeek').value;
                [startDate, endDate] = this.getWeekDates(weekValue);
                this.showAgentCustomPlanning(agentCode, startDate, endDate);
                break;
            case 'custom':
                startDate = document.getElementById('agentStartDate').value;
                endDate = document.getElementById('agentEndDate').value;
                this.showAgentCustomPlanning(agentCode, startDate, endDate);
                break;
        }
    },
    
    showAgentPlanning: function(agentCode, month, year) {
        const agent = DataManager.getAgent(agentCode);
        if (!agent) {
            UIManager.showNotification('Agent non trouvé', 'error');
            return;
        }
        
        const daysInMonth = new Date(year, month, 0).getDate();
        const agentShifts = this.getAgentShiftsForMonth(agentCode, month, year);
        
        let html = `
            <div class="agent-planning-container">
                <div class="agent-header">
                    <div class="agent-avatar">
                        <div class="avatar">${agent.nom.charAt(0)}${agent.prenom.charAt(0)}</div>
                    </div>
                    <div class="agent-info">
                        <h2>${agent.nom} ${agent.prenom}</h2>
                        <div class="agent-meta">
                            <span class="badge badge-primary">${agent.code}</span>
                            <span class="badge badge-secondary">Groupe ${agent.groupe}</span>
                            <span class="badge badge-info">${agent.poste}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Outils -->
                <div class="planning-tools">
                    <button class="btn-sm" onclick="PlanningModule.printAgentPlanning('${agentCode}', ${month}, ${year})">
                        <i class="icon">🖨️</i> Imprimer
                    </button>
                    <button class="btn-sm" onclick="PlanningModule.exportAgentPlanning('${agentCode}', ${month}, ${year})">
                        <i class="icon">📊</i> Exporter
                    </button>
                    <button class="btn-sm" onclick="PlanningModule.showAddLeaveForAgent('${agentCode}')">
                        <i class="icon">🏖️</i> Ajouter Congé
                    </button>
                </div>
                
                <!-- Calendrier du mois -->
                <div class="agent-calendar">
                    <h3>${this.getMonthName(month)} ${year}</h3>
                    <div class="calendar-grid">
                        ${['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => 
                            `<div class="calendar-header">${day}</div>`
                        ).join('')}
                        
                        ${this.generateAgentCalendarGrid(agentCode, month, year, agentShifts)}
                    </div>
                </div>
                
                <!-- Liste détaillée -->
                <div class="agent-shifts-list">
                    <h3><i class="icon">📋</i> Détail des Shifts</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Jour</th>
                                <th>Shift</th>
                                <th>Heures</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Array.from({length: daysInMonth}, (_, i) => {
                                const day = i + 1;
                                const date = new Date(year, month - 1, day);
                                const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                                const shift = agentShifts[dateStr] || DataManager.getDefaultShift(agent, dateStr);
                                const shiftData = DataManager.getShiftData(shift);
                                const isHoliday = DataManager.isHoliday(date);
                                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                                
                                return `
                                    <tr class="${isHoliday ? 'holiday-row' : ''} ${isWeekend ? 'weekend-row' : ''}">
                                        <td>${dateStr}</td>
                                        <td>${Utilities.getDayName(date.getDay(), 'long')}</td>
                                        <td>
                                            <span class="shift-badge" style="background-color: ${shiftData.color || '#ccc'}">
                                                ${shift} - ${shiftData.label || shift}
                                            </span>
                                        </td>
                                        <td>${shiftData.hours || 'N/A'}</td>
                                        <td>
                                            ${isHoliday ? '<span class="badge badge-warning">Férié</span>' : 
                                              isWeekend ? '<span class="badge badge-info">Weekend</span>' : 
                                              '<span class="badge badge-success">Normal</span>'}
                                        </td>
                                        <td>
                                            <button class="btn-sm" onclick="PlanningModule.showShiftModification('${agentCode}', '${dateStr}', '${shift}')">
                                                <i class="icon">✏️</i>
                                            </button>
                                            <button class="btn-sm btn-danger" onclick="PlanningModule.showAbsenceForm('${agentCode}', '${dateStr}')">
                                                <i class="icon">🚫</i>
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
                
                <!-- Statistiques de l'agent -->
                <div class="agent-stats">
                    <h3><i class="icon">📊</i> Statistiques du Mois</h3>
                    <div class="stats-grid">
                        ${this.calculateAgentStats(agentCode, month, year).map(stat => `
                            <div class="stat-card">
                                <div class="stat-icon">${stat.icon}</div>
                                <div class="stat-content">
                                    <div class="stat-value">${stat.value}</div>
                                    <div class="stat-label">${stat.label}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        UIManager.showPopup(`📅 Planning ${agent.nom} ${agent.prenom}`, html, `
            <button class="btn-secondary" onclick="PlanningModule.showAgentPlanningSelection()">
                <i class="icon">👤</i> Autre Agent
            </button>
            <button class="btn-primary" onclick="PlanningModule.showAgentSwapRequest('${agentCode}')">
                <i class="icon">🔄</i> Demander Échange
            </button>
        `);
    },
    
    // ============ GESTION DES SHIFTS ============
    
    showShiftModification: function(agentCode, dateStr, currentShift) {
        const agent = DataManager.getAgent(agentCode);
        const shiftData = DataManager.getShiftData();
        
        let html = `
            <div class="shift-modal">
                <h3><i class="icon">✏️</i> Modifier le Shift</h3>
                
                <div class="shift-info">
                    <div class="info-item">
                        <label>Agent:</label>
                        <span>${agent.nom} ${agent.prenom} (${agent.code})</span>
                    </div>
                    <div class="info-item">
                        <label>Date:</label>
                        <span>${dateStr} (${Utilities.getDayName(new Date(dateStr).getDay(), 'long')})</span>
                    </div>
                    <div class="info-item">
                        <label>Shift actuel:</label>
                        <span class="current-shift" style="background-color: ${shiftData[currentShift]?.color || '#ccc'}">
                            ${currentShift} - ${shiftData[currentShift]?.label || currentShift}
                        </span>
                    </div>
                </div>
                
                <form id="shift-modification-form">
                    <div class="form-group">
                        <label>Nouveau shift</label>
                        <select id="newShift" class="form-input" required>
                            ${Object.entries(shiftData).map(([code, data]) => `
                                <option value="${code}" ${code === currentShift ? 'selected' : ''}>
                                    ${code} - ${data.label} (${data.hours || 'N/A'})
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Type de modification</label>
                        <select id="modificationType" class="form-input">
                            <option value="standard">Modification standard</option>
                            <option value="swap">Échange avec un autre agent</option>
                            <option value="emergency">Changement d'urgence</option>
                            <option value="request">Demande de l'agent</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Raison du changement</label>
                        <textarea id="shiftReason" class="form-input" rows="3" 
                                  placeholder="Expliquez la raison du changement..."></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Notification</label>
                        <div class="checkbox-group">
                            <label>
                                <input type="checkbox" id="notifyAgent" checked>
                                Notifier l'agent par email
                            </label>
                            <label>
                                <input type="checkbox" id="notifySupervisor">
                                Notifier le superviseur
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Répéter ce changement</label>
                        <select id="repeatOption" class="form-input">
                            <option value="none">Ne pas répéter</option>
                            <option value="weekly">Toutes les semaines</option>
                            <option value="biweekly">Toutes les 2 semaines</option>
                            <option value="monthly">Tous les mois</option>
                            <option value="custom">Personnalisé</option>
                        </select>
                    </div>
                </form>
            </div>
        `;
        
        UIManager.showPopup("✏️ Modification de Shift", html, `
            <button class="btn-secondary" onclick="UIManager.hidePopup()">
                <i class="icon">✖️</i> Annuler
            </button>
            <button class="btn-primary" onclick="PlanningModule.applyShiftModification('${agentCode}', '${dateStr}')">
                <i class="icon">💾</i> Appliquer
            </button>
        `);
    },
    
    applyShiftModification: function(agentCode, dateStr) {
        const newShift = document.getElementById('newShift').value;
        const modificationType = document.getElementById('modificationType').value;
        const reason = document.getElementById('shiftReason').value;
        const notifyAgent = document.getElementById('notifyAgent').checked;
        const notifySupervisor = document.getElementById('notifySupervisor').checked;
        const repeatOption = document.getElementById('repeatOption').value;
        
        // Sauvegarder la modification
        const modification = {
            agentCode,
            date: dateStr,
            oldShift: this.getAgentShift(agentCode, dateStr),
            newShift,
            type: modificationType,
            reason,
            modifiedBy: 'user', // À remplacer par l'utilisateur connecté
            modifiedAt: new Date().toISOString(),
            notifications: { agent: notifyAgent, supervisor: notifySupervisor }
        };
        
        // Appliquer la modification
        this.saveShiftModification(modification);
        
        // Gérer la répétition si nécessaire
        if (repeatOption !== 'none') {
            this.applyRecurringModification(modification, repeatOption);
        }
        
        // Notifications
        if (notifyAgent) {
            this.sendShiftNotification(agentCode, dateStr, newShift, 'agent');
        }
        if (notifySupervisor) {
            this.sendShiftNotification(agentCode, dateStr, newShift, 'supervisor');
        }
        
        UIManager.showNotification('Shift modifié avec succès', 'success');
        UIManager.hidePopup();
        
        // Rafraîchir l'affichage si nécessaire
        if (this.currentFilters.type === 'agent' && this.currentFilters.agentCode === agentCode) {
            this.showAgentPlanning(agentCode, this.currentFilters.month, this.currentFilters.year);
        }
    },
    
    // ============ ÉCHANGE DE SHIFTS ============
    
    showShiftExchangeForm: function() {
        const activeAgents = DataManager.getActiveAgents();
        
        let html = `
            <div class="exchange-modal">
                <h3><i class="icon">🔄</i> Échange de Shifts</h3>
                
                <div class="exchange-grid">
                    <!-- Agent 1 -->
                    <div class="exchange-party">
                        <h4>Premier agent</h4>
                        <div class="form-group">
                            <label>Agent</label>
                            <select id="exchangeAgent1" class="form-input" onchange="PlanningModule.updateExchangePreview()">
                                ${activeAgents.map(agent => 
                                    `<option value="${agent.code}">${agent.nom} ${agent.prenom} (${agent.code})</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Date</label>
                            <input type="date" id="exchangeDate1" class="form-input" 
                                   value="${new Date().toISOString().split('T')[0]}" 
                                   onchange="PlanningModule.updateExchangePreview()">
                        </div>
                        <div class="shift-preview" id="agent1ShiftPreview">
                            Chargement...
                        </div>
                    </div>
                    
                    <!-- Flèche d'échange -->
                    <div class="exchange-arrow">
                        <i class="icon">🔄</i>
                    </div>
                    
                    <!-- Agent 2 -->
                    <div class="exchange-party">
                        <h4>Deuxième agent</h4>
                        <div class="form-group">
                            <label>Agent</label>
                            <select id="exchangeAgent2" class="form-input" onchange="PlanningModule.updateExchangePreview()">
                                ${activeAgents.map(agent => 
                                    `<option value="${agent.code}">${agent.nom} ${agent.prenom} (${agent.code})</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Date</label>
                            <input type="date" id="exchangeDate2" class="form-input" 
                                   value="${new Date().toISOString().split('T')[0]}" 
                                   onchange="PlanningModule.updateExchangePreview()">
                        </div>
                        <div class="shift-preview" id="agent2ShiftPreview">
                            Chargement...
                        </div>
                    </div>
                </div>
                
                <!-- Options d'échange -->
                <div class="exchange-options">
                    <h4><i class="icon">⚙️</i> Options</h4>
                    
                    <div class="form-group">
                        <label>Type d'échange</label>
                        <select id="exchangeType" class="form-input">
                            <option value="direct">Échange direct (swap)</option>
                            <option value="compensation">Avec compensation</option>
                            <option value="temporary">Temporaire (retour prévu)</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Raison de l'échange</label>
                        <textarea id="exchangeReason" class="form-input" rows="3" 
                                  placeholder="Expliquez la raison de l'échange..."></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Conditions</label>
                        <div class="checkbox-group">
                            <label>
                                <input type="checkbox" id="approvalRequired" checked>
                                Nécessite l'approbation du superviseur
                            </label>
                            <label>
                                <input type="checkbox" id="notifyBoth" checked>
                                Notifier les deux agents
                            </label>
                            <label>
                                <input type="checkbox" id="updatePlanning">
                                Mettre à jour le planning automatiquement
                            </label>
                        </div>
                    </div>
                </div>
                
                <!-- Validation automatique -->
                <div class="exchange-validation" id="exchangeValidation">
                    <!-- Les messages de validation apparaîtront ici -->
                </div>
            </div>
        `;
        
        UIManager.showPopup("🔄 Échange de Shifts", html, `
            <button class="btn-secondary" onclick="UIManager.hidePopup()">
                <i class="icon">✖️</i> Annuler
            </button>
            <button class="btn-primary" onclick="PlanningModule.executeShiftExchange()">
                <i class="icon">🔄</i> Proposer l'échange
            </button>
            <button class="btn-info" onclick="PlanningModule.previewShiftExchange()">
                <i class="icon">👁️</i> Prévisualiser
            </button>
        `);
        
        // Initialiser le preview
        this.updateExchangePreview();
    },
    
    updateExchangePreview: function() {
        const agent1Code = document.getElementById('exchangeAgent1').value;
        const date1 = document.getElementById('exchangeDate1').value;
        const agent2Code = document.getElementById('exchangeAgent2').value;
        const date2 = document.getElementById('exchangeDate2').value;
        
        const shift1 = this.getAgentShift(agent1Code, date1);
        const shift2 = this.getAgentShift(agent2Code, date2);
        const shiftData = DataManager.getShiftData();
        
        // Afficher les previews
        document.getElementById('agent1ShiftPreview').innerHTML = `
            <div class="preview-shift" style="background-color: ${shiftData[shift1]?.color || '#ccc'}">
                <strong>${shift1}</strong><br>
                ${shiftData[shift1]?.label || 'Non défini'}<br>
                ${shiftData[shift1]?.hours || ''}
            </div>
        `;
        
        document.getElementById('agent2ShiftPreview').innerHTML = `
            <div class="preview-shift" style="background-color: ${shiftData[shift2]?.color || '#ccc'}">
                <strong>${shift2}</strong><br>
                ${shiftData[shift2]?.label || 'Non défini'}<br>
                ${shiftData[shift2]?.hours || ''}
            </div>
        `;
        
        // Valider l'échange
        this.validateExchange(agent1Code, date1, agent2Code, date2);
    },
    
    validateExchange: function(agent1Code, date1, agent2Code, date2) {
        const validationMessages = [];
        
        // Vérifier si les agents sont différents
        if (agent1Code === agent2Code) {
            validationMessages.push('❌ Les agents doivent être différents');
        }
        
        // Vérifier les dates
        if (date1 === date2) {
            validationMessages.push('⚠️ Les dates sont identiques');
        }
        
        // Vérifier les compatibilités de poste
        const agent1 = DataManager.getAgent(agent1Code);
        const agent2 = DataManager.getAgent(agent2Code);
        
        if (agent1.poste !== agent2.poste) {
            validationMessages.push('⚠️ Les agents ont des postes différents');
        }
        
        // Vérifier les congés et absences
        if (DataManager.isAgentOnLeave(agent1Code, date2)) {
            validationMessages.push(`⚠️ ${agent1Code} est en congé le ${date2}`);
        }
        
        if (DataManager.isAgentOnLeave(agent2Code, date1)) {
            validationMessages.push(`⚠️ ${agent2Code} est en congé le ${date1}`);
        }
        
        // Afficher les messages
        const validationDiv = document.getElementById('exchangeValidation');
        if (validationMessages.length > 0) {
            validationDiv.innerHTML = `
                <div class="validation-messages">
                    ${validationMessages.map(msg => `<div class="validation-message">${msg}</div>`).join('')}
                </div>
            `;
        } else {
            validationDiv.innerHTML = `
                <div class="validation-success">
                    ✅ L'échange est valide
                </div>
            `;
        }
    },
    
    previewShiftExchange: function() {
        const agent1Code = document.getElementById('exchangeAgent1').value;
        const date1 = document.getElementById('exchangeDate1').value;
        const agent2Code = document.getElementById('exchangeAgent2').value;
        const date2 = document.getElementById('exchangeDate2').value;
        
        const shift1 = this.getAgentShift(agent1Code, date1);
        const shift2 = this.getAgentShift(agent2Code, date2);
        
        let html = `
            <div class="exchange-preview">
                <h3><i class="icon">👁️</i> Prévisualisation de l'échange</h3>
                
                <div class="preview-grid">
                    <div class="preview-before">
                        <h4>Avant l'échange</h4>
                        <div class="preview-agent">
                            <strong>${agent1Code}</strong> le ${date1}<br>
                            <span class="shift-badge">${shift1}</span>
                        </div>
                        <div class="preview-agent">
                            <strong>${agent2Code}</strong> le ${date2}<br>
                            <span class="shift-badge">${shift2}</span>
                        </div>
                    </div>
                    
                    <div class="preview-arrow">
                        <i class="icon">➡️</i>
                    </div>
                    
                    <div class="preview-after">
                        <h4>Après l'échange</h4>
                        <div class="preview-agent">
                            <strong>${agent1Code}</strong> le ${date1}<br>
                            <span class="shift-badge">${shift2}</span>
                        </div>
                        <div class="preview-agent">
                            <strong>${agent2Code}</strong> le ${date2}<br>
                            <span class="shift-badge">${shift1}</span>
                        </div>
                    </div>
                </div>
                
                <div class="preview-impact">
                    <h4>Impact sur le planning</h4>
                    <ul>
                        <li>Les shifts seront échangés définitivement</li>
                        <li>Les statistiques seront mises à jour</li>
                        <li>Une notification sera envoyée aux agents</li>
                        <li>L'historique sera enregistré</li>
                    </ul>
                </div>
            </div>
        `;
        
        UIManager.showPopup("👁️ Prévisualisation", html, `
            <button class="btn-secondary" onclick="UIManager.hidePopup()">
                <i class="icon">✖️</i> Fermer
            </button>
            <button class="btn-primary" onclick="PlanningModule.showShiftExchangeForm()">
                <i class="icon">🔄</i> Retour
            </button>
        `);
    },
    
    executeShiftExchange: function() {
        const agent1Code = document.getElementById('exchangeAgent1').value;
        const date1 = document.getElementById('exchangeDate1').value;
        const agent2Code = document.getElementById('exchangeAgent2').value;
        const date2 = document.getElementById('exchangeDate2').value;
        const exchangeType = document.getElementById('exchangeType').value;
        const reason = document.getElementById('exchangeReason').value;
        const approvalRequired = document.getElementById('approvalRequired').checked;
        const notifyBoth = document.getElementById('notifyBoth').checked;
        const updatePlanning = document.getElementById('updatePlanning').checked;
        
        // Créer l'enregistrement d'échange
        const exchangeRecord = {
            id: Utilities.generateId(),
            agent1: agent1Code,
            agent2: agent2Code,
            date1: date1,
            date2: date2,
            shift1_before: this.getAgentShift(agent1Code, date1),
            shift2_before: this.getAgentShift(agent2Code, date2),
            type: exchangeType,
            reason: reason,
            status: approvalRequired ? 'pending_approval' : 'approved',
            createdBy: 'user',
            createdAt: new Date().toISOString(),
            requiresApproval: approvalRequired
        };
        
        // Si approbation requise, stocker la demande
        if (approvalRequired) {
            DataManager.saveExchangeRequest(exchangeRecord);
            UIManager.showNotification('Demande d\'échange envoyée pour approbation', 'info');
        } else {
            // Appliquer directement l'échange
            this.applyExchange(exchangeRecord);
            UIManager.showNotification('Échange effectué avec succès', 'success');
        }
        
        // Notifications
        if (notifyBoth) {
            this.notifyExchange(exchangeRecord);
        }
        
        UIManager.hidePopup();
    },
    
    // ============ GÉNÉRATION AUTOMATIQUE ============
    
    showGeneratePlanningModal: function(month, year) {
        let html = `
            <div class="generation-modal">
                <h3><i class="icon">⚡</i> Génération Automatique du Planning</h3>
                
                <div class="generation-options">
                    <div class="form-group">
                        <label>Portée</label>
                        <select id="generationScope" class="form-input">
                            <option value="all">Tous les agents</option>
                            <option value="group">Par groupe</option>
                            <option value="department">Par département</option>
                            <option value="poste">Par poste</option>
                        </select>
                    </div>
                    
                    <div class="form-group" id="scopeGroupSelector" style="display:none;">
                        <label>Sélectionner un groupe</label>
                        <select id="selectedGenerationGroup" class="form-input">
                            ${this.generateGroupOptions()}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Algorithme de génération</label>
                        <select id="generationAlgorithm" class="form-input">
                            <option value="rotating">Rotation équilibrée</option>
                            <option value="seniority">Par ancienneté</option>
                            <option value="preferences">Selon préférences</option>
                            <option value="optimized">Optimisé (IA)</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Contraintes à respecter</label>
                        <div class="checkbox-group">
                            ${this.getGenerationConstraints().map(constraint => `
                                <label>
                                    <input type="checkbox" name="constraints" value="${constraint.id}" checked>
                                    ${constraint.label}
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Paramètres avancés</label>
                        <div class="advanced-params">
                            <label>Jours de repos minimum entre shifts de nuit: 
                                <input type="number" id="minRestDays" value="2" min="1" max="7" class="form-input-sm">
                            </label>
                            <label>Shifts consécutifs maximum: 
                                <input type="number" id="maxConsecutiveShifts" value="5" min="1" max="10" class="form-input-sm">
                            </label>
                            <label>Weekends travaillés maximum par mois: 
                                <input type="number" id="maxWeekendShifts" value="2" min="0" max="8" class="form-input-sm">
                            </label>
                        </div>
                    </div>
                </div>
                
                <!-- Simulation -->
                <div class="generation-preview">
                    <h4><i class="icon">👁️</i> Simulation</h4>
                    <button class="btn-sm" onclick="PlanningModule.previewGeneratedPlanning(${month}, ${year})">
                        <i class="icon">🔍</i> Prévisualiser
                    </button>
                    <div id="generationPreview"></div>
                </div>
            </div>
        `;
        
        UIManager.showPopup("⚡ Génération Automatique", html, `
            <button class="btn-secondary" onclick="UIManager.hidePopup()">
                <i class="icon">✖️</i> Annuler
            </button>
            <button class="btn-primary" onclick="PlanningModule.generateAutoPlanning(${month}, ${year})">
                <i class="icon">⚡</i> Générer
            </button>
        `);
        
        // Gérer l'affichage conditionnel
        document.getElementById('generationScope').addEventListener('change', function() {
            const groupSelector = document.getElementById('scopeGroupSelector');
            groupSelector.style.display = this.value === 'group' ? 'block' : 'none';
        });
    },
    
    generateAutoPlanning: function(month, year) {
        const scope = document.getElementById('generationScope').value;
        const algorithm = document.getElementById('generationAlgorithm').value;
        const constraints = Array.from(document.querySelectorAll('input[name="constraints"]:checked'))
                                .map(c => c.value);
        
        // Récupérer les paramètres avancés
        const params = {
            minRestDays: parseInt(document.getElementById('minRestDays').value),
            maxConsecutiveShifts: parseInt(document.getElementById('maxConsecutiveShifts').value),
            maxWeekendShifts: parseInt(document.getElementById('maxWeekendShifts').value)
        };
        
        // Déterminer la cible
        let targetAgents = [];
        if (scope === 'group') {
            const group = document.getElementById('selectedGenerationGroup').value;
            targetAgents = DataManager.getAgentsByGroup(group);
        } else {
            targetAgents = DataManager.getActiveAgents();
        }
        
        // Afficher le loading
        UIManager.showLoading('Génération du planning en cours...');
        
        // Générer le planning (simulation)
        setTimeout(() => {
            const generatedPlanning = this.runPlanningAlgorithm(targetAgents, month, year, algorithm, constraints, params);
            
            // Sauvegarder le planning généré
            this.saveGeneratedPlanning(generatedPlanning, month, year);
            
            // Afficher les résultats
            UIManager.hideLoading();
            this.showGenerationResults(generatedPlanning, month, year);
        }, 2000);
    },
    
    // ============ STATISTIQUES ET RAPPORTS ============
    
    showPlanningStatistics: function(month, year) {
        const stats = this.calculatePlanningStats(month, year);
        
        let html = `
            <div class="stats-modal">
                <h3><i class="icon">📊</i> Statistiques du Planning</h3>
                
                <!-- Métriques principales -->
                <div class="main-metrics">
                    ${stats.main.map(metric => `
                        <div class="metric-card">
                            <div class="metric-value">${metric.value}</div>
                            <div class="metric-label">${metric.label}</div>
                            ${metric.trend ? `<div class="metric-trend ${metric.trend > 0 ? 'positive' : 'negative'}">
                                ${metric.trend > 0 ? '↑' : '↓'} ${Math.abs(metric.trend)}%
                            </div>` : ''}
                        </div>
                    `).join('')}
                </div>
                
                <!-- Graphiques -->
                <div class="charts-container">
                    <div class="chart">
                        <h4>Répartition des shifts</h4>
                        <canvas id="shiftsChart" width="400" height="200"></canvas>
                    </div>
                    <div class="chart">
                        <h4>Couverture par groupe</h4>
                        <canvas id="coverageChart" width="400" height="200"></canvas>
                    </div>
                </div>
                
                <!-- Tableau détaillé -->
                <div class="detailed-stats">
                    <h4>Détail par groupe</h4>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Groupe</th>
                                <th>Agents</th>
                                <th>Jours travaillés</th>
                                <th>Heures totales</th>
                                <th>Taux de couverture</th>
                                <th>Congés</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${stats.byGroup.map(groupStat => `
                                <tr>
                                    <td>${groupStat.group}</td>
                                    <td>${groupStat.agents}</td>
                                    <td>${groupStat.workingDays}</td>
                                    <td>${groupStat.totalHours}</td>
                                    <td>
                                        <div class="coverage-bar">
                                            <div class="coverage-fill" style="width: ${groupStat.coverage}%"></div>
                                            <span>${groupStat.coverage}%</span>
                                        </div>
                                    </td>
                                    <td>${groupStat.leaves}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <!-- Export -->
                <div class="export-options">
                    <h4><i class="icon">📤</i> Exporter les statistiques</h4>
                    <div class="export-buttons">
                        <button class="btn-sm" onclick="PlanningModule.exportStatsToExcel(${month}, ${year})">
                            <i class="icon">📊</i> Excel
                        </button>
                        <button class="btn-sm" onclick="PlanningModule.exportStatsToPDF(${month}, ${year})">
                            <i class="icon">📄</i> PDF
                        </button>
                        <button class="btn-sm" onclick="PlanningModule.printStats(${month}, ${year})">
                            <i class="icon">🖨️</i> Imprimer
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        UIManager.showPopup(`📊 Statistiques ${this.getMonthName(month)} ${year}`, html, `
            <button class="btn-secondary" onclick="UIManager.hidePopup()">
                <i class="icon">✖️</i> Fermer
            </button>
            <button class="btn-primary" onclick="PlanningModule.showComparisonModal(${month}, ${year})">
                <i class="icon">📈</i> Comparer
            </button>
        `);
        
        // Générer les graphiques
        setTimeout(() => {
            this.renderStatsCharts(stats);
        }, 100);
    },
    
    // ============ FONCTIONS UTILITAIRES ============
    
    loadPlanningData: function() {
        this.planningData = DataManager.getPlanningData() || {};
    },
    
    getAgentShift: function(agentCode, dateStr) {
        const monthKey = dateStr.substring(0, 7); // YYYY-MM
        if (this.planningData[monthKey] && this.planningData[monthKey][agentCode]) {
            return this.planningData[monthKey][agentCode][dateStr]?.shift || 'X';
        }
        return 'X'; // Non défini
    },
    
    getAgentShiftsForMonth: function(agentCode, month, year) {
        const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
        const shifts = {};
        
        if (this.planningData[monthKey] && this.planningData[monthKey][agentCode]) {
            Object.assign(shifts, this.planningData[monthKey][agentCode]);
        }
        
        return shifts;
    },
    
    saveShiftModification: function(modification) {
        const { agentCode, date, newShift } = modification;
        const monthKey = date.substring(0, 7);
        
        if (!this.planningData[monthKey]) {
            this.planningData[monthKey] = {};
        }
        if (!this.planningData[monthKey][agentCode]) {
            this.planningData[monthKey][agentCode] = {};
        }
        
        this.planningData[monthKey][agentCode][date] = {
            shift: newShift,
            modified: modification
        };
        
        DataManager.savePlanningData(this.planningData);
    },
    
    generateMonthOptions: function(selectedMonth) {
        return Array.from({length: 12}, (_, i) => {
            const monthNum = i + 1;
            return `<option value="${monthNum}" ${monthNum === selectedMonth ? 'selected' : ''}>
                ${this.getMonthName(monthNum)}
            </option>`;
        }).join('');
    },
    
    generateGroupOptions: function() {
        const groups = ['A', 'B', 'C', 'D', 'E'];
        return groups.map(group => 
            `<option value="${group}">Groupe ${group}</option>`
        ).join('');
    },
    
    generateAgentOptions: function() {
        return DataManager.getActiveAgents().map(agent => 
            `<option value="${agent.code}">${agent.nom} ${agent.prenom} (${agent.code}) - Groupe ${agent.groupe}</option>`
        ).join('');
    },
    
    generatePosteOptions: function() {
        const postes = [...new Set(DataManager.getActiveAgents().map(a => a.poste))];
        return postes.map(poste => 
            `<option value="${poste}">${poste}</option>`
        ).join('');
    },
    
    getMonthName: function(month) {
        const months = [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];
        return months[month - 1];
    },
    
    calculateAgentStats: function(agentCode, month, year) {
        const agentShifts = this.getAgentShiftsForMonth(agentCode, month, year);
        const shiftData = DataManager.getShiftData();
        
        let stats = {
            totalDays: Object.keys(agentShifts).length,
            morning: 0,
            afternoon: 0,
            night: 0,
            off: 0,
            totalHours: 0,
            weekends: 0,
            holidays: 0
        };
        
        Object.entries(agentShifts).forEach(([date, data]) => {
            const shift = data.shift;
            const dateObj = new Date(date);
            
            // Compter les types de shifts
            if (shiftData[shift]) {
                if (shiftData[shift].type === 'morning') stats.morning++;
                else if (shiftData[shift].type === 'afternoon') stats.afternoon++;
                else if (shiftData[shift].type === 'night') stats.night++;
                else if (shift === 'X') stats.off++;
                
                // Ajouter les heures
                stats.totalHours += shiftData[shift].hours || 0;
            }
            
            // Compter les weekends
            if (dateObj.getDay() === 0 || dateObj.getDay() === 6) {
                stats.weekends++;
            }
            
            // Compter les jours fériés
            if (DataManager.isHoliday(dateObj)) {
                stats.holidays++;
            }
        });
        
        return [
            { icon: '📅', label: 'Jours travaillés', value: stats.totalDays },
            { icon: '🌅', label: 'Matin', value: stats.morning },
            { icon: '🌇', label: 'Après-midi', value: stats.afternoon },
            { icon: '🌃', label: 'Nuit', value: stats.night },
            { icon: '⏱️', label: 'Heures totales', value: `${stats.totalHours}h` },
            { icon: '🏖️', label: 'Weekends', value: stats.weekends },
            { icon: '🎉', label: 'Jours fériés', value: stats.holidays }
        ];
    },
    
    calculatePlanningStats: function(month, year) {
        const activeAgents = DataManager.getActiveAgents();
        const daysInMonth = new Date(year, month, 0).getDate();
        
        let stats = {
            totalAgents: activeAgents.length,
            totalDays: activeAgents.length * daysInMonth,
            totalShifts: 0,
            coverageRate: 0,
            byGroup: {}
        };
        
        // Calculer par groupe
        activeAgents.forEach(agent => {
            const group = agent.groupe;
            if (!stats.byGroup[group]) {
                stats.byGroup[group] = {
                    agents: 0,
                    workingDays: 0,
                    totalHours: 0,
                    leaves: 0
                };
            }
            
            stats.byGroup[group].agents++;
            
            // Compter les jours travaillés
            const agentShifts = this.getAgentShiftsForMonth(agent.code, month, year);
            stats.byGroup[group].workingDays += Object.keys(agentShifts).length;
        });
        
        // Calculer le taux de couverture
        const totalRequiredDays = activeAgents.length * daysInMonth;
        const totalWorkingDays = Object.values(stats.byGroup).reduce((sum, group) => sum + group.workingDays, 0);
        stats.coverageRate = Math.round((totalWorkingDays / totalRequiredDays) * 100);
        
        return stats;
    },
    
    // ============ FONCTIONS DE METIER À IMPLÉMENTER ============
    
    // À implémenter selon vos besoins métier:
    
    showAdvancedOptions: function() {
        // Options avancées de planning
        UIManager.showNotification('Fonctionnalité en développement', 'info');
    },
    
    showTodayPlanning: function() {
        // Planning du jour en cours
        UIManager.showNotification('Fonctionnalité en développement', 'info');
    },
    
    generateTodayAlerts: function() {
        // Générer les alertes du jour
        return '<div class="alert alert-info">Aucune alerte pour aujourd\'hui</div>';
    },
    
    generateMonthOverview: function() {
        // Vue d'ensemble du mois
        return '<div class="overview-placeholder">Vue d\'ensemble en cours de développement</div>';
    },
    
    togglePlanningType: function() {
        // Gérer l'affichage des sélecteurs selon le type
        const type = document.getElementById('planningType').value;
        document.getElementById('groupSelector').style.display = type === 'groupe' ? 'block' : 'none';
        document.getElementById('agentSelector').style.display = type === 'agent' ? 'block' : 'none';
        document.getElementById('posteSelector').style.display = type === 'poste' ? 'block' : 'none';
    },
    
    showPostePlanning: function(poste, month, year) {
        // Planning par poste
        UIManager.showNotification(`Planning par poste ${poste} en développement`, 'info');
    },
    
    filterPlanningTable: function() {
        // Filtrer le tableau de planning
        UIManager.showNotification('Filtrage en développement', 'info');
    },
    
    exportPlanningToExcel: function(month, year, type) {
        // Export Excel
        UIManager.showNotification('Export Excel en développement', 'info');
    },
    
    printPlanning: function() {
        // Impression
        UIManager.showNotification('Impression en développement', 'info');
    },
    
    exportPlanningToPDF: function(month, year) {
        // Export PDF
        UIManager.showNotification('Export PDF en développement', 'info');
    },
    
    generateGroupTablePlanning: function(group, agents, month, year) {
        // Tableau de planning pour groupe
        return `<div>Planning tableau pour groupe ${group} en développement</div>`;
    },
    
    generateGroupCalendarPlanning: function(group, month, year) {
        // Calendrier pour groupe
        return `<div>Calendrier pour groupe ${group} en développement</div>`;
    },
    
    generateGroupChartPlanning: function(group, month, year) {
        // Graphique pour groupe
        return `<div>Graphique pour groupe ${group} en développement</div>`;
    },
    
    generatePlanningForGroup: function(group, month, year) {
        // Génération automatique pour groupe
        UIManager.showNotification(`Génération pour groupe ${group} en développement`, 'info');
    },
    
    showGroupComparison: function() {
        // Comparaison de groupes
        UIManager.showNotification('Comparaison de groupes en développement', 'info');
    },
    
    toggleAgentPeriod: function() {
        // Basculer entre mois/semaine/personnalisé
        const period = document.getElementById('agentPeriod').value;
        document.getElementById('monthSelection').style.display = period === 'month' ? 'block' : 'none';
        document.getElementById('weekSelection').style.display = period === 'week' ? 'block' : 'none';
        document.getElementById('customSelection').style.display = period === 'custom' ? 'block' : 'none';
    },
    
    getCurrentWeek: function() {
        // Retourner la semaine actuelle
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const pastDaysOfYear = (now - startOfYear) / 86400000;
        const week = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
        return `${now.getFullYear()}-W${week.toString().padStart(2, '0')}`;
    },
    
    getWeekDates: function(weekValue) {
        // Retourner les dates de début et fin de semaine
        return [new Date().toISOString().split('T')[0], new Date().toISOString().split('T')[0]];
    },
    
    showAgentCustomPlanning: function(agentCode, startDate, endDate) {
        // Planning personnalisé pour agent
        UIManager.showNotification('Planning personnalisé en développement', 'info');
    },
    
    printAgentPlanning: function(agentCode, month, year) {
        // Impression planning agent
        UIManager.showNotification('Impression planning agent en développement', 'info');
    },
    
    exportAgentPlanning: function(agentCode, month, year) {
        // Export planning agent
        UIManager.showNotification('Export planning agent en développement', 'info');
    },
    
    showAddLeaveForAgent: function(agentCode) {
        // Ajouter un congé
        UIManager.showNotification('Ajout de congé en développement', 'info');
    },
    
    showAgentStatsModal: function() {
        // Modal statistiques agent
        UIManager.showNotification('Statistiques agent en développement', 'info');
    },
    
    generateAgentCalendarGrid: function(agentCode, month, year, shifts) {
        // Grille calendrier agent
        return '<div>Calendrier agent en développement</div>';
    },
    
    showAbsenceForm: function(agentCode, dateStr) {
        // Formulaire d'absence
        UIManager.showNotification('Formulaire d\'absence en développement', 'info');
    },
    
    showAgentSwapRequest: function(agentCode) {
        // Demande d'échange
        UIManager.showNotification('Demande d\'échange en développement', 'info');
    },
    
    applyRecurringModification: function(modification, repeatOption) {
        // Appliquer modification récurrente
        console.log('Modification récurrente à implémenter');
    },
    
    sendShiftNotification: function(agentCode, dateStr, newShift, recipient) {
        // Envoyer notification
        console.log('Notification à implémenter');
    },
    
    applyExchange: function(exchangeRecord) {
        // Appliquer échange
        console.log('Application échange à implémenter');
    },
    
    notifyExchange: function(exchangeRecord) {
        // Notifier échange
        console.log('Notification échange à implémenter');
    },
    
    getGenerationConstraints: function() {
        // Retourner les contraintes disponibles
        return [
            { id: 'max_consecutive', label: 'Shifts consécutifs maximum' },
            { id: 'min_rest', label: 'Jours de repos minimum' },
            { id: 'weekend_balance', label: 'Équilibre des weekends' },
            { id: 'skill_match', label: 'Correspondance des compétences' }
        ];
    },
    
    previewGeneratedPlanning: function(month, year) {
        // Prévisualiser planning généré
        UIManager.showNotification('Prévisualisation en développement', 'info');
    },
    
    runPlanningAlgorithm: function(agents, month, year, algorithm, constraints, params) {
        // Exécuter algorithme de génération
        return { generated: true, message: 'Planning généré avec succès' };
    },
    
    saveGeneratedPlanning: function(generatedPlanning, month, year) {
        // Sauvegarder planning généré
        console.log('Sauvegarde planning généré à implémenter');
    },
    
    showGenerationResults: function(generatedPlanning, month, year) {
        // Afficher résultats génération
        UIManager.showPopup('Résultats Génération', 
            `<div>Planning généré pour ${this.getMonthName(month)} ${year}</div>`,
            '<button onclick="UIManager.hidePopup()">Fermer</button>'
        );
    },
    
    exportStatsToExcel: function(month, year) {
        // Export stats Excel
        UIManager.showNotification('Export stats Excel en développement', 'info');
    },
    
    exportStatsToPDF: function(month, year) {
        // Export stats PDF
        UIManager.showNotification('Export stats PDF en développement', 'info');
    },
    
    printStats: function(month, year) {
        // Impression stats
        UIManager.showNotification('Impression stats en développement', 'info');
    },
    
    showComparisonModal: function(month, year) {
        // Modal comparaison
        UIManager.showNotification('Comparaison en développement', 'info');
    },
    
    renderStatsCharts: function(stats) {
        // Rendu graphiques
        console.log('Rendu graphiques à implémenter');
    },
    
    getTodayStats: function() {
        // Stats du jour
        return {
            totalAgents: DataManager.getActiveAgents().length,
            present: 0,
            absent: 0,
            onLeave: 0
        };
    }
};