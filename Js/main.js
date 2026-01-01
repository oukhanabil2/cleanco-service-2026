// MAIN.JS CORRIGÉ - Version définitive
console.log("🚀 SGA CleanCo 2026 - Chargement...");

// Force le cache à se vider
const CACHE_BUSTER = '?v=' + Date.now();

// Scripts essentiels dans l'ordre
const ESSENTIAL_SCRIPTS = [
    { id: 'constants', src: 'js/constants.js' + CACHE_BUSTER },
    { id: 'dataManager', src: 'js/dataManager.js' + CACHE_BUSTER },
    { id: 'uiManager', src: 'js/uiManager.js' + CACHE_BUSTER }
];

// Modules disponibles
const APP_MODULES = {
    agents: {
        name: '👥 Gestion des Agents',
        icon: '👥',
        color: '#3498db',
        requires: ['dataManager', 'uiManager'],
        script: 'js/modules/agents.js' + CACHE_BUSTER
    },
    planning: {
        name: '📅 Planning',
        icon: '📅',
        color: '#2ecc71'
    },
    leaves: {
        name: '🏖️ Gestion des Congés',
        icon: '🏖️',
        color: '#e67e22'
    },
    statistics: {
        name: '📊 Statistiques',
        icon: '📊',
        color: '#9b59b6'
    },
    panicCodes: {
        name: '🚨 Codes Panique',
        icon: '🚨',
        color: '#e74c3c'
    },
    radios: {
        name: '📻 Radios',
        icon: '📻',
        color: '#1abc9c'
    },
    uniforms: {
        name: '👕 Habillement',
        icon: '👕',
        color: '#34495e'
    },
    warnings: {
        name: '⚠️ Avertissements',
        icon: '⚠️',
        color: '#f39c12'
    },
    holidays: {
        name: '🎉 Jours Fériés',
        icon: '🎉',
        color: '#d35400'
    },
    export: {
        name: '📤 Exportation',
        icon: '📤',
        color: '#16a085'
    },
    config: {
        name: '⚙️ Configuration',
        icon: '⚙️',
        color: '#7f8c8d'
    }
};

// Classe principale
class MainApp {
    constructor() {
        console.log("🎯 MainApp créé");
        this.loadedModules = {};
        this.currentModule = null;
        this.appReady = false;
    }
    
    async init() {
        console.log("🔧 Initialisation de l'application...");
        
        // Afficher l'écran de chargement
        this.showLoadingScreen();
        
        // Charger les scripts essentiels
        await this.loadEssentialScripts();
        
        // Vérifier les prérequis
        if (!this.checkRequirements()) {
            this.showErrorScreen("Scripts essentiels manquants");
            return;
        }
        
        // Initialiser les gestionnaires
        await this.initManagers();
        
        // Afficher le menu principal
        this.appReady = true;
        this.showMainMenu();
        
        console.log("✅ Application initialisée avec succès");
    }
    
    showLoadingScreen() {
        const container = document.getElementById('main-content');
        if (!container) return;
        
        container.innerHTML = `
            <div class="app-loading">
                <div class="loading-logo">
                    <div class="logo-icon">📋</div>
                    <h1>SGA CleanCo 2026</h1>
                </div>
                
                <div class="loading-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" id="loading-progress"></div>
                    </div>
                    <div class="loading-steps">
                        <div class="step" id="step-1">1. Chargement des scripts</div>
                        <div class="step" id="step-2">2. Initialisation des données</div>
                        <div class="step" id="step-3">3. Préparation de l'interface</div>
                    </div>
                </div>
                
                <div class="loading-tip">
                    <p>💡 <strong>Astuce :</strong> L'application fonctionne entièrement hors ligne</p>
                    <p>Toutes les données sont sauvegardées localement sur votre appareil.</p>
                </div>
            </div>
        `;
    }
    
    updateLoading(step, message) {
        const progress = document.getElementById('loading-progress');
        const stepElement = document.getElementById(`step-${step}`);
        
        if (progress) {
            const percent = (step / 3) * 100;
            progress.style.width = percent + '%';
        }
        
        if (stepElement) {
            stepElement.classList.add('active');
            stepElement.innerHTML = `${step}. ${message}`;
        }
        
        console.log(`📊 ${message}`);
    }
    
    async loadEssentialScripts() {
        this.updateLoading(1, 'Chargement des scripts essentiels...');
        
        for (const script of ESSENTIAL_SCRIPTS) {
            await this.loadScript(script.src);
            console.log(`✅ ${script.id} chargé`);
        }
    }
    
    loadScript(src) {
        return new Promise((resolve, reject) => {
            // Vérifier si déjà chargé
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Échec chargement: ${src}`));
            document.head.appendChild(script);
        });
    }
    
    checkRequirements() {
        const required = {
            'dataManager': window.dataManager,
            'uiManager': window.uiManager,
            'localStorage': typeof localStorage !== 'undefined'
        };
        
        const missing = Object.keys(required).filter(key => !required[key]);
        
        if (missing.length > 0) {
            console.error("❌ Prérequis manquants:", missing);
            return false;
        }
        
        return true;
    }
    
    async initManagers() {
        this.updateLoading(2, 'Initialisation des gestionnaires...');
        
        try {
            // Initialiser dataManager
            if (window.dataManager && typeof window.dataManager.init === 'function') {
                await window.dataManager.init();
                console.log("✅ dataManager initialisé");
            }
            
            // Initialiser uiManager
            if (window.uiManager && typeof window.uiManager.init === 'function') {
                await window.uiManager.init();
                console.log("✅ uiManager initialisé");
            }
            
            this.updateLoading(3, 'Préparation de l\'interface...');
            
        } catch (error) {
            console.error("❌ Erreur initialisation gestionnaires:", error);
            throw error;
        }
    }
    
    showMainMenu() {
        const container = document.getElementById('main-content');
        if (!container) {
            console.error("❌ Conteneur principal non trouvé");
            return;
        }
        
        // Récupérer les statistiques
        const agents = window.dataManager.getAgents();
        const activeAgents = agents.filter(a => a.statut === 'actif').length;
        const groups = [...new Set(agents.map(a => a.groupe))].filter(g => g);
        
        container.innerHTML = `
            <div class="app-menu">
                <header class="menu-header">
                    <h1>📋 SGA CleanCo 2026</h1>
                    <p class="menu-subtitle">Système de Gestion des Agents</p>
                    <div class="menu-version">Version 1.0.0</div>
                </header>
                
                <div class="quick-stats">
                    <div class="stat">
                        <span class="stat-icon">👥</span>
                        <span class="stat-value">${agents.length}</span>
                        <span class="stat-label">Agents</span>
                    </div>
                    <div class="stat">
                        <span class="stat-icon">✅</span>
                        <span class="stat-value">${activeAgents}</span>
                        <span class="stat-label">Actifs</span>
                    </div>
                    <div class="stat">
                        <span class="stat-icon">📊</span>
                        <span class="stat-value">${groups.length}</span>
                        <span class="stat-label">Groupes</span>
                    </div>
                    <div class="stat">
                        <span class="stat-icon">💾</span>
                        <span class="stat-value">${Math.round(JSON.stringify(localStorage).length / 1024)}</span>
                        <span class="stat-label">KB</span>
                    </div>
                </div>
                
                <div class="modules-grid">
                    ${Object.entries(APP_MODULES).map(([id, module]) => `
                        <div class="module-card" 
                             onclick="mainApp.loadModule('${id}')"
                             style="border-left: 5px solid ${module.color}">
                            <div class="module-icon">${module.icon}</div>
                            <div class="module-content">
                                <h3>${module.name}</h3>
                                <p>${module.description || 'Cliquez pour ouvrir'}</p>
                            </div>
                            <div class="module-arrow">→</div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="menu-footer">
                    <button class="btn btn-primary" onclick="mainApp.quickAddAgent()">
                        ➕ Ajouter un agent rapide
                    </button>
                    <button class="btn btn-secondary" onclick="mainApp.showSettings()">
                        ⚙️ Paramètres
                    </button>
                    <button class="btn btn-info" onclick="mainApp.showHelp()">
                        ❓ Aide
                    </button>
                </div>
            </div>
        `;
        
        // Ajouter les styles dynamiquement
        this.addMenuStyles();
    }
    
    async loadModule(moduleId) {
        console.log(`📂 Chargement module: ${moduleId}`);
        
        this.currentModule = moduleId;
        const module = APP_MODULES[moduleId];
        
        if (!module) {
            this.showModuleError(moduleId, "Module non trouvé");
            return;
        }
        
        // Afficher le chargement du module
        this.showModuleLoading(module);
        
        try {
            // Vérifier les prérequis
            if (module.requires) {
                for (const req of module.requires) {
                    if (!window[req]) {
                        throw new Error(`Prérequis manquant: ${req}`);
                    }
                }
            }
            
            // Charger le script si nécessaire
            if (module.script && !this.loadedModules[moduleId]) {
                await this.loadScript(module.script);
                this.loadedModules[moduleId] = true;
            }
            
            // Exécuter le module
            await this.executeModule(moduleId);
            
        } catch (error) {
            console.error(`❌ Erreur module ${moduleId}:`, error);
            this.showModuleError(moduleId, error.message);
        }
    }
    
    showModuleLoading(module) {
        const container = document.getElementById('main-content');
        if (!container) return;
        
        container.innerHTML = `
            <div class="module-loading">
                <div class="loading-header">
                    <button class="btn-back" onclick="mainApp.showMainMenu()">← Retour</button>
                    <h2>${module.icon} ${module.name}</h2>
                </div>
                
                <div class="loading-content">
                    <div class="loading-spinner large"></div>
                    <h3>Chargement en cours...</h3>
                    <p>Préparation du module ${module.name}</p>
                </div>
            </div>
        `;
    }
    
    async executeModule(moduleId) {
        console.log(`🚀 Exécution module: ${moduleId}`);
        
        switch (moduleId) {
            case 'agents':
                await this.executeAgentsModule();
                break;
                
            case 'planning':
                this.showModulePlaceholder('planning', '📅 Planning');
                break;
                
            case 'leaves':
                this.showModulePlaceholder('leaves', '🏖️ Congés');
                break;
                
            default:
                this.showModulePlaceholder(moduleId, APP_MODULES[moduleId].name);
                break;
        }
    }
    
    async executeAgentsModule() {
        console.log("🎯 Exécution module agents");
        
        const container = document.getElementById('main-content');
        if (!container) return;
        
        // Méthode 1: Vérifier si le module est chargé
        if (window.agentsModule && typeof window.agentsModule.displayAgentsList === 'function') {
            console.log("✅ Module agents trouvé, affichage...");
            window.agentsModule.displayAgentsList();
            return;
        }
        
        // Méthode 2: Charger le module depuis agents.js
        const moduleContent = await this.loadAgentsModuleContent();
        container.innerHTML = moduleContent;
        
        // Initialiser les événements
        this.initAgentsModuleEvents();
    }
    
    async loadAgentsModuleContent() {
        try {
            // Essayer de charger le fichier
            const response = await fetch('js/modules/agents.js');
            if (!response.ok) throw new Error('Fichier non trouvé');
            
            // Si le fichier existe mais qu'on ne peut pas l'exécuter, afficher l'interface de secours
            return this.getAgentsFallbackInterface();
            
        } catch (error) {
            console.log("ℹ️ Utilisation de l'interface fallback pour agents");
            return this.getAgentsFallbackInterface();
        }
    }
    
    getAgentsFallbackInterface() {
        const agents = window.dataManager.getAgents();
        const groups = [...new Set(agents.map(a => a.groupe))].filter(g => g);
        
        return `
            <div class="module-container">
                <div class="module-header">
                    <button class="btn-back" onclick="mainApp.showMainMenu()">← Menu</button>
                    <h1>👥 Gestion des Agents</h1>
                    <div class="header-actions">
                        <button class="btn btn-primary" onclick="mainApp.addAgent()">➕ Ajouter</button>
                        <button class="btn btn-secondary" onclick="mainApp.refreshAgents()">🔄 Actualiser</button>
                    </div>
                </div>
                
                <div class="module-content">
                    <div class="agents-overview">
                        <div class="overview-card">
                            <h3>📊 Aperçu</h3>
                            <p>Total agents: <strong>${agents.length}</strong></p>
                            <p>Groupes actifs: <strong>${groups.length}</strong></p>
                            <p>Dernière modification: <strong>Aujourd'hui</strong></p>
                        </div>
                        
                        <div class="overview-card">
                            <h3>🚀 Actions rapides</h3>
                            <button class="btn-action" onclick="mainApp.addAgent()">➕ Nouvel agent</button>
                            <button class="btn-action" onclick="mainApp.exportAgents()">📤 Exporter</button>
                            <button class="btn-action" onclick="mainApp.printAgents()">🖨️ Imprimer</button>
                        </div>
                    </div>
                    
                    <div class="agents-list">
                        <h2>Liste des agents (${agents.length})</h2>
                        
                        ${agents.length === 0 ? `
                            <div class="empty-state">
                                <div class="empty-icon">👥</div>
                                <h3>Aucun agent enregistré</h3>
                                <p>Commencez par ajouter votre premier agent.</p>
                                <button class="btn btn-primary" onclick="mainApp.addAgent()">
                                    ➕ Ajouter le premier agent
                                </button>
                            </div>
                        ` : `
                            <div class="table-container">
                                <table class="agents-table">
                                    <thead>
                                        <tr>
                                            <th>Code</th>
                                            <th>Nom & Prénom</th>
                                            <th>Groupe</th>
                                            <th>Téléphone</th>
                                            <th>Statut</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${agents.map(agent => `
                                            <tr>
                                                <td><code>${agent.code}</code></td>
                                                <td><strong>${agent.prenom} ${agent.nom}</strong></td>
                                                <td><span class="badge badge-group">${agent.groupe}</span></td>
                                                <td>${agent.tel || 'N/A'}</td>
                                                <td><span class="badge ${agent.statut === 'actif' ? 'badge-success' : 'badge-warning'}">${agent.statut}</span></td>
                                                <td>
                                                    <button class="btn-icon" onclick="mainApp.viewAgent('${agent.code}')" title="Voir">👁️</button>
                                                    <button class="btn-icon" onclick="mainApp.editAgent('${agent.code}')" title="Modifier">✏️</button>
                                                    <button class="btn-icon btn-danger" onclick="mainApp.deleteAgent('${agent.code}')" title="Supprimer">🗑️</button>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
    }
    
    initAgentsModuleEvents() {
        // Les événements seront initialisés après le chargement
        console.log("🔌 Événements agents initialisés");
    }
    
    showModulePlaceholder(moduleId, name) {
        const container = document.getElementById('main-content');
        if (!container) return;
        
        container.innerHTML = `
            <div class="module-placeholder">
                <div class="placeholder-header">
                    <button class="btn-back" onclick="mainApp.showMainMenu()">← Menu</button>
                    <h1>${APP_MODULES[moduleId].icon} ${name}</h1>
                </div>
                
                <div class="placeholder-content">
                    <div class="placeholder-icon">🔧</div>
                    <h2>Module en développement</h2>
                    <p>Le module <strong>${name}</strong> est actuellement en cours de développement.</p>
                    <p>Il sera disponible dans une prochaine mise à jour de l'application.</p>
                    
                    <div class="placeholder-actions">
                        <button class="btn btn-primary" onclick="mainApp.showMainMenu()">
                            ← Retour au menu principal
                        </button>
                        <button class="btn btn-secondary" onclick="mainApp.loadModule('agents')">
                            👥 Aller à Gestion des Agents
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    showModuleError(moduleId, error) {
        const container = document.getElementById('main-content');
        if (!container) return;
        
        container.innerHTML = `
            <div class="error-screen">
                <div class="error-icon">❌</div>
                <h2>Erreur de chargement</h2>
                <p>Impossible de charger le module <strong>${moduleId}</strong>.</p>
                <div class="error-details">${error}</div>
                
                <div class="error-actions">
                    <button class="btn btn-primary" onclick="mainApp.showMainMenu()">← Retour au menu</button>
                    <button class="btn btn-secondary" onclick="location.reload()">🔄 Recharger la page</button>
                    <button class="btn btn-danger" onclick="mainApp.clearCache()">🧹 Effacer le cache</button>
                </div>
            </div>
        `;
    }
    
    addMenuStyles() {
        const styleId = 'mainapp-styles';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* Styles pour MainApp */
            .app-loading {
                text-align: center;
                padding: 40px 20px;
                max-width: 600px;
                margin: 0 auto;
            }
            
            .loading-logo {
                margin-bottom: 40px;
            }
            
            .logo-icon {
                font-size: 4rem;
                margin-bottom: 20px;
            }
            
            .loading-progress {
                margin: 40px 0;
            }
            
            .progress-bar {
                height: 10px;
                background: #ecf0f1;
                border-radius: 5px;
                overflow: hidden;
                margin-bottom: 20px;
            }
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #3498db, #2ecc71);
                width: 0%;
                transition: width 1s ease;
            }
            
            .loading-steps {
                display: flex;
                justify-content: space-between;
                color: #7f8c8d;
            }
            
            .step {
                flex: 1;
                text-align: center;
                padding: 10px;
                border-right: 1px solid #eee;
            }
            
            .step:last-child {
                border-right: none;
            }
            
            .step.active {
                color: #2c3e50;
                font-weight: bold;
            }
            
            .loading-tip {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 10px;
                margin-top: 40px;
                text-align: left;
            }
            
            /* Menu principal */
            .app-menu {
                padding: 20px;
                max-width: 1200px;
                margin: 0 auto;
            }
            
            .menu-header {
                text-align: center;
                margin-bottom: 40px;
                padding-bottom: 20px;
                border-bottom: 2px solid #eee;
            }
            
            .menu-header h1 {
                color: #2c3e50;
                font-size: 2.5rem;
                margin-bottom: 10px;
            }
            
            .menu-subtitle {
                color: #7f8c8d;
                font-size: 1.2rem;
                margin-bottom: 10px;
            }
            
            .menu-version {
                display: inline-block;
                background: #3498db;
                color: white;
                padding: 5px 15px;
                border-radius: 20px;
                font-size: 0.9rem;
            }
            
            .quick-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 15px;
                margin-bottom: 40px;
            }
            
            .stat {
                background: white;
                padding: 20px;
                border-radius: 10px;
                text-align: center;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                border: 2px solid #f8f9fa;
            }
            
            .stat-icon {
                font-size: 2rem;
                display: block;
                margin-bottom: 10px;
            }
            
            .stat-value {
                font-size: 2rem;
                font-weight: bold;
                color: #2c3e50;
                display: block;
            }
            
            .stat-label {
                color: #7f8c8d;
                font-size: 0.9rem;
            }
            
            .modules-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 20px;
                margin-bottom: 40px;
            }
            
            .module-card {
                background: white;
                border-radius: 10px;
                padding: 25px;
                cursor: pointer;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                display: flex;
                align-items: center;
                gap: 20px;
                transition: all 0.3s;
                border-left: 5px solid;
            }
            
            .module-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 20px rgba(0,0,0,0.15);
            }
            
            .module-icon {
                font-size: 2.5rem;
            }
            
            .module-content {
                flex: 1;
            }
            
            .module-content h3 {
                margin: 0 0 5px 0;
                color: #2c3e50;
            }
            
            .module-content p {
                margin: 0;
                color: #7f8c8d;
                font-size: 0.9rem;
            }
            
            .module-arrow {
                font-size: 1.5rem;
                color: #3498db;
                opacity: 0.7;
            }
            
            .menu-footer {
                display: flex;
                gap: 10px;
                justify-content: center;
                padding-top: 30px;
                border-top: 1px solid #eee;
            }
            
            /* Module agents fallback */
            .module-container {
                padding: 20px;
            }
            
            .module-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #eee;
            }
            
            .btn-back {
                background: #95a5a6;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
            }
            
            .btn {
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
            }
            
            .btn-primary {
                background: #3498db;
                color: white;
            }
            
            .btn-secondary {
                background: #95a5a6;
                color: white;
            }
            
            .btn-info {
                background: #17a2b8;
                color: white;
            }
            
            .btn-danger {
                background: #e74c3c;
                color: white;
            }
            
            .agents-overview {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .overview-card {
                background: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            
            .overview-card h3 {
                margin-top: 0;
                color: #2c3e50;
                border-bottom: 1px solid #eee;
                padding-bottom: 10px;
                margin-bottom: 15px;
            }
            
            .btn-action {
                display: block;
                width: 100%;
                padding: 10px;
                margin: 5px 0;
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 5px;
                cursor: pointer;
                text-align: center;
            }
            
            .agents-list {
                background: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            
            .empty-state {
                text-align: center;
                padding: 40px;
                color: #6c757d;
            }
            
            .empty-icon {
                font-size: 4rem;
                margin-bottom: 20px;
                opacity: 0.5;
            }
            
            .table-container {
                overflow-x: auto;
            }
            
            .agents-table {
                width: 100%;
                border-collapse: collapse;
            }
            
            .agents-table th {
                background: #2c3e50;
                color: white;
                padding: 12px;
                text-align: left;
            }
            
            .agents-table td {
                padding: 12px;
                border-bottom: 1px solid #eee;
            }
            
            .agents-table tr:hover {
                background: #f8f9fa;
            }
            
            .badge {
                display: inline-block;
                padding: 5px 10px;
                border-radius: 20px;
                font-size: 0.85rem;
                font-weight: bold;
            }
            
            .badge-success {
                background: #d4edda;
                color: #155724;
            }
            
            .badge-warning {
                background: #fff3cd;
                color: #856404;
            }
            
            .badge-group {
                background: #3498db;
                color: white;
            }
            
            .btn-icon {
                background: none;
                border: none;
                font-size: 1.2rem;
                cursor: pointer;
                padding: 5px;
                margin: 0 5px;
            }
            
            /* Module placeholder */
            .module-placeholder {
                text-align: center;
                padding: 40px 20px;
            }
            
            .placeholder-icon {
                font-size: 4rem;
                margin-bottom: 20px;
                opacity: 0.5;
            }
            
            .placeholder-actions {
                margin-top: 30px;
            }
            
            /* Error screen */
            .error-screen {
                text-align: center;
                padding: 40px 20px;
            }
            
            .error-icon {
                font-size: 4rem;
                color: #e74c3c;
                margin-bottom: 20px;
            }
            
            .error-details {
                background: #f8d7da;
                color: #721c24;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
                font-family: monospace;
            }
            
            .error-actions {
                display: flex;
                gap: 10px;
                justify-content: center;
                margin-top: 30px;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .modules-grid {
                    grid-template-columns: 1fr;
                }
                
                .quick-stats {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .menu-footer {
                    flex-direction: column;
                }
                
                .module-header {
                    flex-direction: column;
                    gap: 15px;
                    text-align: center;
                }
                
                .error-actions {
                    flex-direction: column;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // Méthodes utilitaires
    quickAddAgent() {
        alert("Fonctionnalité d'ajout rapide d'agent - À implémenter");
    }
    
    showSettings() {
        alert("Paramètres de l'application - À implémenter");
    }
    
    showHelp() {
        window.uiManager.showPopup({
            title: "❓ Aide SGA CleanCo",
            content: `
                <div style="padding: 20px;">
                    <h3>Guide d'utilisation</h3>
                    <p><strong>Module Agents :</strong> Gestion complète des agents de nettoyage</p>
                    <p><strong>Planning :</strong> Planification des interventions (bientôt disponible)</p>
                    <p><strong>Congés :</strong> Gestion des absences (bientôt disponible)</p>
                    
                    <h4>Support technique :</h4>
                    <p>Email : support@cleanco.com</p>
                    <p>Téléphone : +212 XXX XXX XXX</p>
                </div>
            `,
            size: 'medium'
        });
    }
    
    clearCache() {
        if (confirm("Voulez-vous vraiment effacer toutes les données locales ?")) {
            localStorage.clear();
            location.reload();
        }
    }
}

// === INITIALISATION GLOBALE ===

// Créer l'instance principale
if (!window.mainApp) {
    window.mainApp = new MainApp();
}

// Démarrer l'application quand le DOM est chargé
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log("🏁 DOM prêt, démarrage de l'application...");
        window.mainApp.init();
    });
} else {
    console.log("🏁 DOM déjà chargé, démarrage immédiat...");
    window.mainApp.init();
}

// Exporter pour modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MainApp;
}
