// POINT D'ENTRÉE PRINCIPAL - Version corrigée
class MainApp {
    constructor() {
        console.log("🚀 MainApp initialisé");
        this.modules = {};
        this.currentModule = null;
        this.init();
    }
    
    async init() {
        console.log("🎯 Démarrage application");
        
        // Vérifier les gestionnaires
        this.checkManagers();
        
        // Afficher le menu principal
        this.displayMainMenu();
        
        console.log("✅ Application prête");
    }
    
    checkManagers() {
        console.log("🔍 Vérification des gestionnaires:");
        console.log("- dataManager:", window.dataManager ? "✅ OK" : "❌ Manquant");
        console.log("- uiManager:", window.uiManager ? "✅ OK" : "❌ Manquant");
        
        if (!window.dataManager || !window.uiManager) {
            console.warn("⚠️ Gestionnaires manquants, chargement des scripts...");
            this.loadEssentialScripts();
        }
    }
    
    loadEssentialScripts() {
        const scripts = [
            'js/constants.js',
            'js/dataManager.js',
            'js/uiManager.js'
        ];
        
        scripts.forEach(src => {
            if (!document.querySelector(`script[src="${src}"]`)) {
                const script = document.createElement('script');
                script.src = src;
                document.head.appendChild(script);
            }
        });
    }
    
    displayMainMenu() {
        const container = document.getElementById('main-content');
        if (!container) {
            console.error("❌ Conteneur principal non trouvé");
            return;
        }
        
        // Stats
        const agents = window.dataManager ? window.dataManager.getAgents() : [];
        const activeAgents = agents.filter(a => a.statut === 'actif').length;
        
        container.innerHTML = `
            <div class="dashboard">
                <div class="dashboard-header">
                    <h2>📋 Tableau de bord SGA</h2>
                    <p class="dashboard-subtitle">Sélectionnez un module à gérer</p>
                </div>
                
                <div class="modules-grid">
                    <!-- Module Agents -->
                    <div class="module-card" onclick="mainApp.loadModule('agents')">
                        <div class="module-icon">👥</div>
                        <h3 class="module-title">Gestion des Agents</h3>
                        <p class="module-description">Ajouter, modifier et gérer les agents</p>
                        <div class="module-badge">${agents.length} agents</div>
                    </div>
                    
                    <!-- Module Planning -->
                    <div class="module-card" onclick="mainApp.loadModule('planning')">
                        <div class="module-icon">📅</div>
                        <h3 class="module-title">Planning</h3>
                        <p class="module-description">Planification des interventions</p>
                        <div class="module-badge">Planifier</div>
                    </div>
                    
                    <!-- Module Congés -->
                    <div class="module-card" onclick="mainApp.loadModule('leaves')">
                        <div class="module-icon">🏖️</div>
                        <h3 class="module-title">Gestion des Congés</h3>
                        <p class="module-description">Demandes et suivi des congés</p>
                        <div class="module-badge">Gérer</div>
                    </div>
                    
                    <!-- Module Statistiques -->
                    <div class="module-card" onclick="mainApp.loadModule('statistics')">
                        <div class="module-icon">📊</div>
                        <h3 class="module-title">Statistiques</h3>
                        <p class="module-description">Analyses et rapports</p>
                        <div class="module-badge">Analyser</div>
                    </div>
                    
                    <!-- Autres modules -->
                    <div class="module-card" onclick="mainApp.loadModule('panicCodes')">
                        <div class="module-icon">🚨</div>
                        <h3 class="module-title">Codes Panique</h3>
                        <p class="module-description">Gestion des codes d'urgence</p>
                    </div>
                    
                    <div class="module-card" onclick="mainApp.loadModule('radios')">
                        <div class="module-icon">📻</div>
                        <h3 class="module-title">Gestion des Radios</h3>
                        <p class="module-description">Inventaire et attribution</p>
                    </div>
                    
                    <div class="module-card" onclick="mainApp.loadModule('uniforms')">
                        <div class="module-icon">👕</div>
                        <h3 class="module-title">Habillement</h3>
                        <p class="module-description">Gestion des tenues</p>
                    </div>
                    
                    <div class="module-card" onclick="mainApp.loadModule('config')">
                        <div class="module-icon">⚙️</div>
                        <h3 class="module-title">Configuration</h3>
                        <p class="module-description">Paramètres de l'application</p>
                    </div>
                </div>
                
                <div class="dashboard-stats">
                    <div class="stat-card">
                        <h4>📊 Vue d'ensemble</h4>
                        <p>Agents actifs: <strong>${activeAgents}</strong></p>
                        <p>Agents totaux: <strong>${agents.length}</strong></p>
                        <p>Groupes: <strong>${new Set(agents.map(a => a.groupe)).size}</strong></p>
                    </div>
                    
                    <div class="stat-card">
                        <h4>🚀 Actions rapides</h4>
                        <button class="btn-small" onclick="mainApp.loadModule('agents', 'add')">➕ Ajouter agent</button>
                        <button class="btn-small" onclick="mainApp.initializeTestData()">🧪 Données test</button>
                        <button class="btn-small" onclick="mainApp.exportData()">📤 Exporter</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    async loadModule(moduleId, action = null) {
        console.log(`📂 Chargement module: ${moduleId} (action: ${action})`);
        
        this.currentModule = moduleId;
        const container = document.getElementById('main-content');
        
        if (!container) {
            console.error("❌ Conteneur non trouvé");
            return;
        }
        
        // Afficher le chargement
        container.innerHTML = `
            <div class="loading-module">
                <div class="loading-spinner"></div>
                <h3>Chargement du module ${moduleId}...</h3>
                <p>Veuillez patienter</p>
            </div>
        `;
        
        try {
            // Module AGENTS - Chargement spécial
            if (moduleId === 'agents') {
                await this.loadAgentsModule(action);
                return;
            }
            
            // Autres modules - fallback
            setTimeout(() => {
                this.showModuleFallback(moduleId);
            }, 500);
            
        } catch (error) {
            console.error(`❌ Erreur module ${moduleId}:`, error);
            this.showError(moduleId, error);
        }
    }
    
    async loadAgentsModule(action = null) {
        const container = document.getElementById('main-content');
        
        // Vérifier si le module existe déjà
        if (window.agentsModule) {
            console.log("✅ Module agents déjà chargé");
            
            if (action === 'add') {
                window.agentsModule.showAddAgentForm();
            } else {
                window.agentsModule.displayAgentsList();
            }
            return;
        }
        
        // Charger le script dynamiquement
        console.log("📥 Chargement dynamique du module agents...");
        
        try {
            // Vérifier si le fichier existe
            const response = await fetch('js/modules/agents.js');
            
            if (!response.ok) {
                throw new Error(`Fichier non trouvé (${response.status})`);
            }
            
            // Créer et charger le script
            const script = document.createElement('script');
            script.src = 'js/modules/agents.js';
            
            script.onload = () => {
                console.log("✅ Script agents.js chargé");
                
                // Vérifier que le module est bien initialisé
                if (window.agentsModule && typeof window.agentsModule.init === 'function') {
                    window.agentsModule.init().then(() => {
                        console.log("✅ Module agents initialisé");
                        
                        if (action === 'add') {
                            window.agentsModule.showAddAgentForm();
                        } else {
                            window.agentsModule.displayAgentsList();
                        }
                    });
                } else {
                    this.showAgentsFallback();
                }
            };
            
            script.onerror = (error) => {
                console.error("❌ Erreur chargement script:", error);
                this.showAgentsFallback();
            };
            
            document.head.appendChild(script);
            
        } catch (error) {
            console.error("❌ Erreur vérification fichier:", error);
            this.showAgentsFallback();
        }
    }
    
    showAgentsFallback() {
        const container = document.getElementById('main-content');
        const agents = window.dataManager ? window.dataManager.getAgents() : [];
        
        container.innerHTML = `
            <div class="module-fallback">
                <div class="fallback-header">
                    <button class="btn-back" onclick="mainApp.displayMainMenu()">← Retour</button>
                    <h2>👥 Gestion des Agents (Mode simplifié)</h2>
                </div>
                
                <div class="fallback-content">
                    <p>Le module avancé n'est pas disponible. Utilisation du mode simplifié.</p>
                    
                    <div class="agents-list-simple">
                        <h3>Liste des agents (${agents.length})</h3>
                        
                        ${agents.length === 0 ? `
                            <div class="empty-state">
                                <p>Aucun agent enregistré</p>
                                <button class="btn-primary" onclick="mainApp.addAgentSimple()">➕ Ajouter le premier agent</button>
                            </div>
                        ` : `
                            <table class="simple-table">
                                <thead>
                                    <tr>
                                        <th>Code</th>
                                        <th>Nom</th>
                                        <th>Groupe</th>
                                        <th>Statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${agents.map(agent => `
                                        <tr>
                                            <td><strong>${agent.code}</strong></td>
                                            <td>${agent.prenom} ${agent.nom}</td>
                                            <td>${agent.groupe}</td>
                                            <td>
                                                <span class="badge ${agent.statut === 'actif' ? 'badge-success' : 'badge-warning'}">
                                                    ${agent.statut}
                                                </span>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                            
                            <div style="margin-top: 20px;">
                                <button class="btn-primary" onclick="mainApp.addAgentSimple()">➕ Ajouter un agent</button>
                                <button class="btn-secondary" onclick="mainApp.displayMainMenu()">← Retour au menu</button>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
    }
    
    addAgentSimple() {
        const container = document.getElementById('main-content');
        
        container.innerHTML = `
            <div class="simple-form">
                <div class="form-header">
                    <button class="btn-back" onclick="mainApp.loadModule('agents')">← Retour</button>
                    <h2>➕ Ajouter un agent</h2>
                </div>
                
                <form onsubmit="return mainApp.saveAgentSimple(event)">
                    <div class="form-group">
                        <label>Code *</label>
                        <input type="text" id="simple-code" required placeholder="Ex: A01">
                    </div>
                    
                    <div class="form-group">
                        <label>Nom *</label>
                        <input type="text" id="simple-nom" required placeholder="Ex: Dupont">
                    </div>
                    
                    <div class="form-group">
                        <label>Prénom *</label>
                        <input type="text" id="simple-prenom" required placeholder="Ex: Alice">
                    </div>
                    
                    <div class="form-group">
                        <label>Groupe *</label>
                        <select id="simple-groupe" required>
                            <option value="">Choisir</option>
                            <option value="A">Groupe A</option>
                            <option value="B">Groupe B</option>
                            <option value="C">Groupe C</option>
                            <option value="D">Groupe D</option>
                            <option value="E">Groupe E</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Téléphone</label>
                        <input type="tel" id="simple-tel" placeholder="Ex: 0601-010101">
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn-primary">💾 Enregistrer</button>
                        <button type="button" class="btn-secondary" onclick="mainApp.loadModule('agents')">Annuler</button>
                    </div>
                </form>
            </div>
        `;
    }
    
    saveAgentSimple(event) {
        event.preventDefault();
        
        const agent = {
            code: document.getElementById('simple-code').value.toUpperCase(),
            nom: document.getElementById('simple-nom').value,
            prenom: document.getElementById('simple-prenom').value,
            groupe: document.getElementById('simple-groupe').value,
            tel: document.getElementById('simple-tel').value || '',
            date_entree: new Date().toISOString().split('T')[0],
            statut: 'actif'
        };
        
        if (window.dataManager) {
            try {
                window.dataManager.addAgent(agent);
                
                if (window.uiManager) {
                    window.uiManager.showNotification(`✅ Agent ${agent.code} ajouté`, 'success');
                }
                
                this.loadModule('agents');
                
            } catch (error) {
                alert(`Erreur: ${error.message}`);
            }
        } else {
            alert("Gestionnaire de données non disponible");
        }
        
        return false;
    }
    
    showModuleFallback(moduleId) {
        const container = document.getElementById('main-content');
        
        container.innerHTML = `
            <div class="module-fallback">
                <div class="fallback-header">
                    <button class="btn-back" onclick="mainApp.displayMainMenu()">← Retour</button>
                    <h2>${this.getModuleIcon(moduleId)} ${this.getModuleName(moduleId)}</h2>
                </div>
                
                <div class="fallback-content">
                    <div class="module-placeholder">
                        <div class="placeholder-icon">🔧</div>
                        <h3>Module en développement</h3>
                        <p>Le module <strong>${moduleId}</strong> est actuellement en cours de développement.</p>
                        <p>Il sera disponible dans une prochaine mise à jour.</p>
                        
                        <div class="placeholder-actions">
                            <button class="btn-primary" onclick="mainApp.displayMainMenu()">← Retour au menu</button>
                            <button class="btn-secondary" onclick="mainApp.reloadPage()">🔄 Actualiser</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    showError(moduleId, error) {
        const container = document.getElementById('main-content');
        
        container.innerHTML = `
            <div class="error-screen">
                <div class="error-icon">❌</div>
                <h2>Erreur de chargement</h2>
                <p>Le module ${moduleId} n'a pas pu être chargé.</p>
                <div class="error-details">${error.message || error}</div>
                
                <div class="error-actions">
                    <button class="btn-primary" onclick="mainApp.displayMainMenu()">← Retour au menu</button>
                    <button class="btn-secondary" onclick="location.reload()">🔄 Recharger la page</button>
                    <button class="btn-danger" onclick="mainApp.reportError('${moduleId}', '${error.message}')">🚨 Signaler l'erreur</button>
                </div>
            </div>
        `;
    }
    
    getModuleIcon(moduleId) {
        const icons = {
            'agents': '👥',
            'planning': '📅',
            'leaves': '🏖️',
            'statistics': '📊',
            'panicCodes': '🚨',
            'radios': '📻',
            'uniforms': '👕',
            'warnings': '⚠️',
            'holidays': '🎉',
            'export': '📤',
            'config': '⚙️'
        };
        return icons[moduleId] || '📁';
    }
    
    getModuleName(moduleId) {
        const names = {
            'agents': 'Gestion des Agents',
            'planning': 'Planning',
            'leaves': 'Gestion des Congés',
            'statistics': 'Statistiques',
            'panicCodes': 'Codes Panique',
            'radios': 'Gestion des Radios',
            'uniforms': 'Habillement',
            'warnings': 'Avertissements',
            'holidays': 'Jours Fériés',
            'export': 'Exportation',
            'config': 'Configuration'
        };
        return names[moduleId] || moduleId;
    }
    
    initializeTestData() {
        if (window.dataManager && confirm("Initialiser avec des données de test ?")) {
            window.dataManager.initializeTestData();
            
            if (window.uiManager) {
                window.uiManager.showNotification('✅ Données de test initialisées', 'success');
            }
            
            this.displayMainMenu();
        }
    }
    
    exportData() {
        if (window.dataManager) {
            const data = {
                agents: window.dataManager.getAgents(),
                exportDate: new Date().toISOString(),
                system: 'SGA CleanCo 2026'
            };
            
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sga-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            if (window.uiManager) {
                window.uiManager.showNotification('📤 Données exportées', 'success');
            }
        }
    }
    
    reloadPage() {
        location.reload();
    }
    
    reportError(moduleId, error) {
        const subject = `Erreur SGA - Module ${moduleId}`;
        const body = `Module: ${moduleId}\nErreur: ${error}\nDate: ${new Date().toISOString()}\nURL: ${location.href}`;
        
        if (window.uiManager) {
            window.uiManager.showPopup({
                title: 'Signaler une erreur',
                content: `
                    <div style="padding: 15px;">
                        <p>Pour signaler cette erreur :</p>
                        <ul>
                            <li>Envoyez un email à: <strong>support@cleanco.com</strong></li>
                            <li>Sujet: <code>${subject}</code></li>
                            <li>Description: ${error}</li>
                        </ul>
                        <button onclick="navigator.clipboard.writeText('${body}')" class="btn-secondary">
                            📋 Copier les détails
                        </button>
                    </div>
                `,
                size: 'medium'
            });
        }
    }
}

// === INITIALISATION GLOBALE ===

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser l'application
    if (!window.mainApp) {
        window.mainApp = new MainApp();
    }
});

// Exporter pour modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MainApp;
}
