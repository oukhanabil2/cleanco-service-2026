// POINT D'ENTRÉE PRINCIPAL - Version professionnelle
class MainApp {
    constructor() {
        console.log("🚀 MainApp initialisé");
        this.isInitialized = false;
        this.currentModule = null;
        this.init();
    }
    
    async init() {
        try {
            // Afficher le chargement
            this.showLoading('Initialisation de l\'application...', 0);
            
            // Initialiser les gestionnaires
            await this.initManagers();
            
            // Charger les données
            await this.loadAppData();
            
            // Initialiser l'interface
            await this.initUI();
            
            // Vérifications automatiques
            this.runAutoChecks();
            
            // Masquer le chargement
            this.hideLoading();
            
            this.isInitialized = true;
            console.log("✅ Application prête");
            
            // Afficher le menu principal
            this.displayMainMenu();
            
        } catch (error) {
            console.error("❌ Erreur initialisation:", error);
            this.showErrorScreen(error);
        }
    }
    
    // === INITIALISATION ===
    
    async initManagers() {
        this.updateLoading(20, 'Initialisation des gestionnaires...');
        
        // Vérifier que les gestionnaires sont disponibles
        if (!window.dataManager || !window.uiManager) {
            throw new Error("Gestionnaires non chargés. Vérifiez l'ordre des scripts.");
        }
        
        console.log("📦 Gestionnaires détectés:", {
            dataManager: !!window.dataManager,
            uiManager: !!window.uiManager
        });
        
        return true;
    }
    
    async loadAppData() {
        this.updateLoading(40, 'Chargement des données...');
        
        try {
            // Charger depuis localStorage via dataManager
            const hasData = window.dataManager.initFromStorage();
            
            if (!hasData || window.dataManager.getAgents().length === 0) {
                this.updateLoading(60, 'Création des données de test...');
                console.log("🧪 Données de test nécessaires");
                
                // Demander à l'utilisateur
                const useTestData = await uiManager.showConfirm(
                    'Aucune donnée trouvée. Voulez-vous initialiser avec des données de test ?',
                    { 
                        title: 'Données initiales',
                        confirmText: 'Initialiser',
                        cancelText: 'Garder vide'
                    }
                );
                
                if (useTestData) {
                    window.dataManager.initializeTestData();
                    uiManager.showNotification('✅ Données de test initialisées', 'success');
                }
            }
            
            this.updateLoading(80, 'Vérification des données...');
            
            // Vérifier les données chargées
            const agentsCount = window.dataManager.getAgents().length;
            const planningCount = Object.keys(window.dataManager.getPlanningData()).length;
            
            console.log("📊 Données chargées:", {
                agents: agentsCount,
                planning: planningCount,
                holidays: window.dataManager.getHolidays().length
            });
            
            return true;
            
        } catch (error) {
            console.error("❌ Erreur chargement données:", error);
            throw error;
        }
    }
    
    async initUI() {
        this.updateLoading(90, 'Préparation de l\'interface...');
        
        // Créer les éléments UI de base si nécessaires
        this.createBaseElements();
        
        // Ajouter les styles d'animation
        this.addAnimationStyles();
        
        // Configurer les écouteurs d'événements globaux
        this.setupGlobalEventListeners();
        
        return true;
    }
    
    // === INTERFACE UTILISATEUR ===
    
    displayMainMenu() {
        try {
            const container = document.getElementById('main-content');
            if (!container) {
                console.error("❌ Conteneur principal non trouvé");
                return;
            }
            
            // Données pour le menu
            const modules = [
                {
                    id: 'agents',
                    icon: '👥',
                    title: 'Gestion des Agents',
                    description: 'Ajouter, modifier et gérer les agents',
                    color: '#3498db',
                    badge: window.dataManager.getAgents().length
                },
                {
                    id: 'planning',
                    icon: '📅',
                    title: 'Planning',
                    description: 'Planification et suivi des shifts',
                    color: '#2ecc71',
                    badge: Object.keys(window.dataManager.getPlanningData()).length
                },
                {
                    id: 'leaves',
                    icon: '🏖️',
                    title: 'Gestion des Congés',
                    description: 'Demandes et suivi des congés',
                    color: '#e67e22',
                    badge: window.dataManager.getLeaves().length
                },
                {
                    id: 'statistics',
                    icon: '📊',
                    title: 'Statistiques',
                    description: 'Analyses et rapports',
                    color: '#9b59b6',
                    badge: 'Nouveau'
                },
                {
                    id: 'panicCodes',
                    icon: '🚨',
                    title: 'Codes Panique',
                    description: 'Gestion des codes d\'urgence',
                    color: '#e74c3c',
                    badge: window.dataManager.getPanicCodes().length
                },
                {
                    id: 'radios',
                    icon: '📻',
                    title: 'Gestion des Radios',
                    description: 'Inventaire et attribution',
                    color: '#1abc9c',
                    badge: window.dataManager.getRadios().length
                },
                {
                    id: 'uniforms',
                    icon: '👕',
                    title: 'Habillement',
                    description: 'Gestion des tenues et équipements',
                    color: '#34495e',
                    badge: window.dataManager.getUniforms().uniforms.length
                },
                {
                    id: 'warnings',
                    icon: '⚠️',
                    title: 'Avertissements',
                    description: 'Suivi des avertissements',
                    color: '#f39c12',
                    badge: window.dataManager.getWarnings().length
                },
                {
                    id: 'holidays',
                    icon: '🎉',
                    title: 'Jours Fériés',
                    description: 'Calendrier des jours fériés',
                    color: '#d35400',
                    badge: window.dataManager.getHolidays().length
                },
                {
                    id: 'export',
                    icon: '📤',
                    title: 'Exportation',
                    description: 'Exporter les données',
                    color: '#16a085',
                    badge: 'PDF/Excel'
                },
                {
                    id: 'config',
                    icon: '⚙️',
                    title: 'Configuration',
                    description: 'Paramètres de l\'application',
                    color: '#7f8c8d',
                    badge: ''
                }
            ];
            
            // Afficher les statistiques globales
            const agents = window.dataManager.getAgents();
            const activeAgents = agents.filter(a => a.statut === 'actif').length;
            const inactiveAgents = agents.filter(a => a.statut === 'inactif').length;
            
            container.innerHTML = `
                <div class="dashboard">
                    <div class="dashboard-header">
                        <h2>📋 Tableau de bord SGA</h2>
                        <p class="dashboard-subtitle">Système de Gestion des Agents - Version 2026</p>
                    </div>
                    
                    <div class="stats-grid">
                        <div class="stat-card" style="border-color: #3498db;">
                            <div class="stat-icon">👥</div>
                            <div class="stat-content">
                                <h3>${agents.length}</h3>
                                <p>Agents</p>
                                <small>${activeAgents} actifs • ${inactiveAgents} inactifs</small>
                            </div>
                        </div>
                        
                        <div class="stat-card" style="border-color: #2ecc71;">
                            <div class="stat-icon">📅</div>
                            <div class="stat-content">
                                <h3>${Object.keys(window.dataManager.getPlanningData()).length}</h3>
                                <p>Jours planifiés</p>
                                <small>Planning en cours</small>
                            </div>
                        </div>
                        
                        <div class="stat-card" style="border-color: #e67e22;">
                            <div class="stat-icon">🏖️</div>
                            <div class="stat-content">
                                <h3>${window.dataManager.getLeaves().length}</h3>
                                <p>Congés enregistrés</p>
                                <small>Demandes récentes</small>
                            </div>
                        </div>
                        
                        <div class="stat-card" style="border-color: #9b59b6;">
                            <div class="stat-icon">⚠️</div>
                            <div class="stat-content">
                                <h3>${window.dataManager.getWarnings().length}</h3>
                                <p>Avertissements</p>
                                <small>À surveiller</small>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modules-grid">
                        ${modules.map(module => `
                            <div class="module-card" 
                                 onclick="mainApp.loadModule('${module.id}')"
                                 style="border-color: ${module.color};">
                                <div class="module-header">
                                    <span class="module-icon">${module.icon}</span>
                                    ${module.badge ? `<span class="module-badge">${module.badge}</span>` : ''}
                                </div>
                                <div class="module-content">
                                    <h3 class="module-title">${module.title}</h3>
                                    <p class="module-description">${module.description}</p>
                                </div>
                                <div class="module-footer">
                                    <span class="module-action">Ouvrir →</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="app-footer">
                        <p>Version ${APP_CONFIG?.VERSION || '1.0.0'} • © ${new Date().getFullYear()} CleanCo Service</p>
                        <button onclick="mainApp.showAbout()" class="btn-link">À propos</button>
                        <button onclick="mainApp.showHelp()" class="btn-link">Aide</button>
                    </div>
                </div>
            `;
            
            // Ajouter les styles pour ce menu
            this.addMenuStyles();
            
        } catch (error) {
            console.error("❌ Erreur affichage menu:", error);
            uiManager.showNotification('Erreur affichage menu', 'error');
        }
    }
    
    async loadModule(moduleId) {
        try {
            this.currentModule = moduleId;
            
            // Vérifier l'authentification pour certains modules sensibles
            if (['config', 'export', 'warnings'].includes(moduleId)) {
                const authenticated = await uiManager.checkPassword();
                if (!authenticated) {
                    uiManager.showNotification('Accès non autorisé', 'error');
                    return;
                }
            }
            
            // Afficher le chargement
            this.showLoading(`Chargement ${moduleId}...`, 0);
            
            // Charger dynamiquement le module si disponible
            await this.loadModuleScript(moduleId);
            
            // Mettre à jour l'interface
            case 'agents':
    if (window.agentsModule) {
        window.agentsModule.displayAgentsList();
    } else {
        this.loadModuleScript('agents').then(() => {
            window.agentsModule.displayAgentsList();
        });
    }
    break;
            await this.updateModuleUI(moduleId);
            
            this.hideLoading();
            
        } catch (error) {
            console.error(`❌ Erreur chargement module ${moduleId}:`, error);
            this.hideLoading();
            this.showModuleFallback(moduleId, error);
        }
    }
    
    async loadModuleScript(moduleId) {
        // Essayer de charger le module depuis js/modules/
        const modulePath = `js/modules/${moduleId}.js`;
        
        try {
            // Vérifier si le module existe
            const response = await fetch(modulePath);
            if (response.ok) {
                // Charger dynamiquement
                await import(modulePath);
                console.log(`✅ Module ${moduleId} chargé dynamiquement`);
            } else {
                console.log(`ℹ️ Module ${moduleId} non trouvé, utilisation du fallback`);
            }
        } catch (error) {
            console.log(`ℹ️ Module ${moduleId} non chargé:`, error.message);
        }
    }
    
    async updateModuleUI(moduleId) {
        const container = document.getElementById('main-content');
        if (!container) return;
        
        // Interface par défaut pour chaque module
        const modulesUI = {
            agents: this.getAgentsModuleUI(),
            planning: this.getPlanningModuleUI(),
            leaves: this.getLeavesModuleUI(),
            statistics: this.getStatisticsModuleUI(),
            panicCodes: this.getPanicCodesModuleUI(),
            radios: this.getRadiosModuleUI(),
            uniforms: this.getUniformsModuleUI(),
            warnings: this.getWarningsModuleUI(),
            holidays: this.getHolidaysModuleUI(),
            export: this.getExportModuleUI(),
            config: this.getConfigModuleUI()
        };
        
        const moduleUI = modulesUI[moduleId] || this.getDefaultModuleUI(moduleId);
        
        container.innerHTML = `
            <div class="module-view">
                <div class="module-header">
                    <button class="btn-back" onclick="mainApp.displayMainMenu()">← Retour</button>
                    <h2>${moduleUI.title}</h2>
                    <div class="module-actions">
                        ${moduleUI.actions || ''}
                    </div>
                </div>
                
                <div class="module-content">
                    ${moduleUI.content}
                </div>
            </div>
        `;
        
        // Initialiser le module si une fonction d'initialisation existe
        if (moduleUI.onInit && typeof moduleUI.onInit === 'function') {
            setTimeout(() => moduleUI.onInit(), 100);
        }
    }
    
    // === INTERFACES DES MODULES (fallback) ===
    
    getAgentsModuleUI() {
        const agents = window.dataManager.getAgents();
        
        return {
            title: '👥 Gestion des Agents',
            actions: `
                <button class="btn-primary" onclick="mainApp.showAddAgentForm()">➕ Ajouter un agent</button>
                <button class="btn-secondary" onclick="mainApp.exportAgentsData()">📤 Exporter</button>
            `,
            content: `
                <div class="agents-list">
                    <div class="agents-header">
                        <h3>Liste des agents (${agents.length})</h3>
                        <input type="text" 
                               placeholder="Rechercher un agent..." 
                               onkeyup="mainApp.searchAgents(this.value)"
                               class="search-input">
                    </div>
                    
                    <div class="agents-table-container">
                        <table class="agents-table">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Nom & Prénom</th>
                                    <th>Groupe</th>
                                    <th>Poste</th>
                                    <th>Téléphone</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${agents.map(agent => `
                                    <tr>
                                        <td><strong>${agent.code}</strong></td>
                                        <td>${agent.prenom} ${agent.nom}</td>
                                        <td><span class="badge badge-group-${agent.groupe}">${agent.groupe}</span></td>
                                        <td>${agent.poste}</td>
                                        <td>${agent.tel}</td>
                                        <td>
                                            <span class="badge badge-${agent.statut === 'actif' ? 'success' : 'warning'}">
                                                ${agent.statut}
                                            </span>
                                        </td>
                                        <td>
                                            <button onclick="mainApp.showAgentDetails('${agent.code}')" class="btn-small">👁️</button>
                                            <button onclick="mainApp.editAgent('${agent.code}')" class="btn-small">✏️</button>
                                            <button onclick="mainApp.showAgentPlanning('${agent.code}')" class="btn-small">📅</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="agents-summary">
                        <div class="summary-card">
                            <h4>📊 Répartition par groupe</h4>
                            <div id="group-chart"></div>
                        </div>
                        <div class="summary-card">
                            <h4>📈 État des agents</h4>
                            <div id="status-chart"></div>
                        </div>
                    </div>
                </div>
            `,
            onInit: () => {
                console.log("Module Agents initialisé");
                // Ici, vous pouvez initialiser des graphiques ou des fonctionnalités spécifiques
            }
        };
    }
    
    getPlanningModuleUI() {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        return {
            title: '📅 Planning',
            actions: `
                <button class="btn-primary" onclick="mainApp.generatePlanning()">🔄 Générer planning</button>
                <button class="btn-secondary" onclick="mainApp.printPlanning()">🖨️ Imprimer</button>
                <button class="btn-secondary" onclick="mainApp.showImportExcelForm()">📁 Importer</button>
            `,
            content: `
                <div class="planning-container">
                    <div class="planning-header">
                        <div class="month-navigation">
                            <button onclick="mainApp.prevMonth()">←</button>
                            <h3>${this.getMonthName(currentMonth)} ${currentYear}</h3>
                            <button onclick="mainApp.nextMonth()">→</button>
                        </div>
                        
                        <div class="planning-controls">
                            <select id="groupFilter" onchange="mainApp.filterPlanningByGroup()">
                                <option value="">Tous les groupes</option>
                                <option value="A">Groupe A</option>
                                <option value="B">Groupe B</option>
                                <option value="C">Groupe C</option>
                                <option value="D">Groupe D</option>
                                <option value="E">Groupe E</option>
                            </select>
                            
                            <button onclick="mainApp.showHolidaysConfig()" class="btn-small">🎉 Jours fériés</button>
                        </div>
                    </div>
                    
                    <div class="planning-grid" id="planningGrid">
                        <!-- Le planning sera généré dynamiquement ici -->
                        <div class="loading-planning">
                            <div class="spinner"></div>
                            <p>Chargement du planning...</p>
                        </div>
                    </div>
                    
                    <div class="planning-legend">
                        <div class="legend-item"><span class="legend-color" style="background:#FFD700"></span> Matin</div>
                        <div class="legend-item"><span class="legend-color" style="background:#87CEEB"></span> Après-midi</div>
                        <div class="legend-item"><span class="legend-color" style="background:#4169E1"></span> Nuit</div>
                        <div class="legend-item"><span class="legend-color" style="background:#32CD32"></span> Repos</div>
                        <div class="legend-item"><span class="legend-color" style="background:#FF6347"></span> Congé</div>
                        <div class="legend-item"><span class="legend-color" style="background:#CCCCCC"></span> Non défini</div>
                    </div>
                </div>
            `
        };
    }
    
    // ... autres getters de modules (leaves, statistics, etc.) ...
    // Pour gagner de l'espace, je montre le pattern, mais chaque module aurait son interface
    
    getDefaultModuleUI(moduleId) {
        return {
            title: `Module ${moduleId}`,
            content: `
                <div class="module-placeholder">
                    <div class="placeholder-icon">🔧</div>
                    <h3>Module en développement</h3>
                    <p>Le module <strong>${moduleId}</strong> est actuellement en cours de développement.</p>
                    <p>Il sera disponible dans une prochaine mise à jour.</p>
                    <button onclick="mainApp.displayMainMenu()" class="btn-primary">Retour au menu</button>
                </div>
            `
        };
    }
    
    // === FONCTIONS PLACEHOLDER POUR COMPATIBILITÉ ===
    
    // Ces fonctions maintiennent la compatibilité avec le code existant
    showGlobalStats() { 
        uiManager.showNotification("📈 Statistiques Globales - Bientôt disponible", 'info'); 
    }
    
    showAgentStatsSelection() { 
        uiManager.showNotification("👤 Statistiques par Agent - Bientôt disponible", 'info'); 
    }
    
    showWorkedDaysMenu() { 
        uiManager.showNotification("📊 Jours Travaillés - Bientôt disponible", 'info'); 
    }
    
    showGroupStatsSelection() { 
        uiManager.showNotification("📉 Statistiques par Groupe - Bientôt disponible", 'info'); 
    }
    
    showMonthlyStats() { 
        uiManager.showNotification("📅 Statistiques Mensuelles - Bientôt disponible", 'info'); 
    }
    
    generateFullReport() { 
        uiManager.showNotification("📋 Rapport Complet - Bientôt disponible", 'info'); 
    }
    
    showDeleteLeaveForm() { 
        uiManager.showNotification("🗑️ Supprimer Congé - Bientôt disponible", 'info'); 
    }
    
    showGroupLeavesSelection() { 
        uiManager.showNotification("📊 Congés par Groupe - Bientôt disponible", 'info'); 
    }
    
    showImportExcelForm() { 
        uiManager.showNotification("📁 Importer Excel - Bientôt disponible", 'info'); 
    }
    
    showImportCSVForm() { 
        uiManager.showNotification("📥 Importer CSV - Bientôt disponible", 'info'); 
    }
    
    exportAgentsData() { 
        uiManager.showNotification("📤 Exporter Agents - Bientôt disponible", 'info'); 
    }
    
    showShiftModification(agentCode, dateStr, currentShift) { 
        uiManager.showNotification(`✏️ Modification de shift pour ${agentCode} - Bientôt disponible`, 'info'); 
    }
    
    showAbsenceFormForDate(agentCode, dateStr) { 
        uiManager.showNotification(`🚫 Absence pour ${agentCode} - Bientôt disponible`, 'info'); 
    }
    
    showAddLeaveForAgent(agentCode) { 
        uiManager.showNotification(`🏖️ Congé pour ${agentCode} - Bientôt disponible`, 'info'); 
    }
    
    showAgentPlanning(agentCode) { 
        uiManager.showNotification(`📅 Planning ${agentCode} - Bientôt disponible`, 'info'); 
    }
    
    showAgentStats(agentCode) { 
        uiManager.showNotification(`📊 Stats ${agentCode} - Bientôt disponible`, 'info'); 
    }
    
    printPlanning() { 
        uiManager.showNotification("🖨️ Impression - Bientôt disponible", 'info'); 
    }
    
    printAgentPlanning(agentCode, month, year) { 
        uiManager.showNotification(`🖨️ Impression planning ${agentCode} - Bientôt disponible`, 'info'); 
    }
    
    previewShiftExchange() { 
        uiManager.showNotification("👁️ Prévisualisation échange - Bientôt disponible", 'info'); 
    }
    
    showGroupStats(group, month, year) { 
        uiManager.showNotification(`📊 Stats groupe ${group} - Bientôt disponible`, 'info'); 
    }
    
    generatePlanningForGroup(group, month, year) { 
        uiManager.showNotification(`🔄 Génération groupe ${group} - Bientôt disponible", 'info`); 
    }
    
    showTrimesterDetailed(startMonth, year) { 
        uiManager.showNotification("📊 Détail trimestriel - Bientôt disponible", 'info'); 
    }
    
    previewLeave() { 
        uiManager.showNotification("👁️ Prévisualisation congé - Bientôt disponible", 'info'); 
    }
    
    // === UTILITAIRES ===
    
    runAutoChecks() {
        // Vérifier les avertissements expirés
        this.checkExpiredWarnings();
        
        // Vérifier les radios à faible batterie
        this.checkLowBatteryRadios();
        
        // Vérifier le stock d'uniformes
        this.checkUniformStock();
    }
    
    checkExpiredWarnings() {
        try {
            const warnings = window.dataManager.getWarnings();
            const now = new Date();
            let expiredCount = 0;
            
            warnings.forEach(warning => {
                if (warning.expirationDate) {
                    const expDate = new Date(warning.expirationDate);
                    if (expDate < now && warning.status !== 'resolved') {
                        expiredCount++;
                    }
                }
            });
            
            if (expiredCount > 0) {
                console.log(`⚠️ ${expiredCount} avertissements expirés`);
                // Vous pourriez afficher une notification ici
            }
        } catch (error) {
            console.error("❌ Erreur vérification avertissements:", error);
        }
    }
    
    checkLowBatteryRadios() {
        // Implémentation à ajouter
    }
    
    checkUniformStock() {
        // Implémentation à ajouter
    }
    
    // === GESTION DU CHARGEMENT ===
    
    showLoading(message = 'Chargement...', progress = 0) {
        uiManager.showLoading(message, { progress });
    }
    
    updateLoading(progress, message = null) {
        uiManager.updateLoadingProgress(progress, message);
    }
    
    hideLoading() {
        uiManager.hideLoading();
    }
    
    showErrorScreen(error) {
        const container = document.getElementById('main-content');
        if (container) {
            container.innerHTML = `
                <div class="error-screen">
                    <div class="error-icon">❌</div>
                    <h2>Erreur d'initialisation</h2>
                    <p>L'application n'a pas pu démarrer correctement.</p>
                    <pre class="error-details">${error.message || error}</pre>
                    <div class="error-actions">
                        <button onclick="location.reload()" class="btn-primary">🔄 Recharger</button>
                        <button onclick="mainApp.showSafeMode()" class="btn-secondary">🔧 Mode sans échec</button>
                    </div>
                </div>
            `;
        }
    }
    
    // === CONFIGURATION DOM ===
    
    createBaseElements() {
        // Vérifier que les éléments nécessaires existent
        const requiredIds = ['main-content', 'sub-title'];
        
        requiredIds.forEach(id => {
            if (!document.getElementById(id)) {
                const element = document.createElement('div');
                element.id = id;
                document.body.appendChild(element);
            }
        });
    }
    
    addAnimationStyles() {
        if (!document.getElementById('app-animations')) {
            const style = document.createElement('style');
            style.id = 'app-animations';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes fadeOut {
                    from { opacity: 1; transform: translateY(0); }
                    to { opacity: 0; transform: translateY(-20px); }
                }
                
                @keyframes slideIn {
                    from { transform: translateX(-100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .fade-in {
                    animation: fadeIn 0.3s ease forwards;
                }
                
                .fade-out {
                    animation: fadeOut 0.3s ease forwards;
                }
                
                .slide-in {
                    animation: slideIn 0.3s ease forwards;
                }
                
                .slide-out {
                    animation: slideOut 0.3s ease forwards;
                }
                
                .spinner {
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid #3498db;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    addMenuStyles() {
        if (!document.getElementById('menu-styles')) {
            const style = document.createElement('style');
            style.id = 'menu-styles';
            style.textContent = `
                /* Styles pour le menu principal */
                .dashboard {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 20px;
                    animation: fadeIn 0.5s ease;
                }
                
                .dashboard-header {
                    text-align: center;
                    margin-bottom: 40px;
                }
                
                .dashboard-header h2 {
                    color: #2c3e50;
                    font-size: 2.5rem;
                    margin-bottom: 10px;
                }
                
                .dashboard-subtitle {
                    color: #7f8c8d;
                    font-size: 1.1rem;
                }
                
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                    margin-bottom: 40px;
                }
                
                .stat-card {
                    background: white;
                    border-left: 5px solid;
                    border-radius: 10px;
                    padding: 20px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    transition: transform 0.3s ease;
                }
                
                .stat-card:hover {
                    transform: translateY(-5px);
                }
                
                .stat-icon {
                    font-size: 2.5rem;
                }
                
                .stat-content h3 {
                    font-size: 2rem;
                    margin: 0;
                    color: #2c3e50;
                }
                
                .stat-content p {
                    margin: 5px 0;
                    font-weight: bold;
                    color: #34495e;
                }
                
                .stat-content small {
                    color: #7f8c8d;
                    font-size: 0.85rem;
                }
                
                .modules-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 20px;
                    margin-bottom: 40px;
                }
                
                .module-card {
                    background: white;
                    border: 3px solid;
                    border-radius: 12px;
                    padding: 20px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    display: flex;
                    flex-direction: column;
                    min-height: 180px;
                }
                
                .module-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.15);
                }
                
                .module-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }
                
                .module-icon {
                    font-size: 2.5rem;
                }
                
                .module-badge {
                    background: #e74c3c;
                    color: white;
                    padding: 3px 8px;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    font-weight: bold;
                }
                
                .module-title {
                    margin: 0 0 10px 0;
                    color: #2c3e50;
                    font-size: 1.3rem;
                }
                
                .module-description {
                    color: #7f8c8d;
                    margin: 0 0 15px 0;
                    flex-grow: 1;
                }
                
                .module-footer {
                    text-align: right;
                }
                
                .module-action {
                    color: #3498db;
                    font-weight: bold;
                    font-size: 0.9rem;
                }
                
                .app-footer {
                    text-align: center;
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #ecf0f1;
                    color: #7f8c8d;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 20px;
                }
                
                .btn-link {
                    background: none;
                    border: none;
                    color: #3498db;
                    cursor: pointer;
                    text-decoration: underline;
                    font-size: 0.9rem;
                }
                
                /* Responsive */
                @media (max-width: 768px) {
                    .dashboard-header h2 {
                        font-size: 2rem;
                    }
                    
                    .modules-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    setupGlobalEventListeners() {
        // Sauvegarde avant fermeture
        window.addEventListener('beforeunload', (e) => {
            if (window.dataManager) {
                window.dataManager.saveAllData();
            }
        });
        
        // Touche Échap pour retour au menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModule) {
                this.displayMainMenu();
            }
        });
        
        // Clic en dehors des popups pour les fermer
        document.addEventListener('click', (e) => {
            const overlay = document.getElementById('overlay');
            if (overlay && e.target === overlay) {
                uiManager.hidePopup();
            }
        });
    }
    
    // === AUTRES MÉTHODES UTILITAIRES ===
    
    getMonthName(monthIndex) {
        const months = [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];
        return months[monthIndex] || '';
    }
    
    showAbout() {
        uiManager.showPopup({
            title: 'À propos',
            content: `
                <div class="about-content">
                    <h3>Système de Gestion des Agents (SGA)</h3>
                    <p>Version: ${APP_CONFIG?.VERSION || '1.0.0'}</p>
                    <p>© ${new Date().getFullYear()} CleanCo Service</p>
                    <hr>
                    <p>Application développée pour la gestion des agents de nettoyage.</p>
                    <p><strong>Fonctionnalités principales :</strong></p>
                    <ul>
                        <li>Gestion des agents et équipes</li>
                        <li>Planification des interventions</li>
                        <li>Suivi des congés et absences</li>
                        <li>Statistiques et rapports</li>
                    </ul>
                </div>
            `,
            size: 'medium'
        });
    }
    
    showHelp() {
        uiManager.showPopup({
            title: 'Aide & Support',
            content: `
                <div class="help-content">
                    <h3>Guide d'utilisation</h3>
                    <p>Pour obtenir de l'aide ou signaler un problème :</p>
                    <ul>
                        <li>📞 Support technique : +212 XXX XXX XXX</li>
                        <li>✉️ Email : support@cleanco.com</li>
                        <li>🏢 Adresse : [Votre adresse]</li>
                    </ul>
                    <hr>
                    <h4>Raccourcis clavier :</h4>
                    <ul>
                        <li><kbd>Échap</kbd> : Retour au menu principal</li>
                        <li><kbd>Ctrl + S</kbd> : Sauvegarder</li>
                        <li><kbd>F5</kbd> : Actualiser</li>
                    </ul>
                </div>
            `,
            size: 'medium'
        });
    }
    
    showSafeMode() {
        uiManager.showConfirm(
            'Mode sans échec désactivera certaines fonctionnalités. Continuer ?',
            {
                title: 'Mode sans échec',
                confirmText: 'Activer',
                onConfirm: () => {
                    localStorage.removeItem('cleanco_app_data');
                    location.reload();
                }
            }
        );
    }
}

// === INITIALISATION GLOBALE ===

// Attendre que le DOM soit chargé
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Initialiser l'application
        if (!window.mainApp) {
            window.mainApp = new MainApp();
        }
    });
} else {
    // DOM déjà chargé
    if (!window.mainApp) {
        window.mainApp = new MainApp();
    }
}

// Exporter pour modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MainApp;
}
