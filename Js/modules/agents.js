// MODULE GESTION DES AGENTS - Version professionnelle
class AgentsModule {
    constructor() {
        console.log("👥 Module Agents initialisé");
        this.name = "Gestion des Agents";
        this.version = "2026.1.0";
        this.currentFilter = '';
        this.selectedAgent = null;
    }
    
    // === INITIALISATION ===
    async init() {
        try {
            console.log(`🚀 ${this.name} ${this.version} prêt`);
            
            // Vérifier que dataManager est disponible
            if (!window.dataManager) {
                throw new Error("dataManager non disponible");
            }
            
            return true;
        } catch (error) {
            console.error("❌ Erreur initialisation module Agents:", error);
            return false;
        }
    }
    
    // === GESTION DE L'INTERFACE ===
    
    async displayAgentsList() {
        try {
            // Afficher le chargement
            window.uiManager.showLoading('Chargement des agents...');
            
            // Récupérer les agents
            const agents = window.dataManager.getAgents();
            
            const html = `
                <div class="agents-management">
                    <div class="agents-header">
                        <h2>📋 Liste des Agents</h2>
                        <div class="agents-controls">
                            <div class="search-box">
                                <input type="text" 
                                       id="searchAgent" 
                                       placeholder="Rechercher par nom, code ou groupe..."
                                       onkeyup="agentsModule.filterAgents(this.value)"
                                       class="search-input">
                                <span class="search-icon">🔍</span>
                            </div>
                            <div class="buttons-group">
                                <button class="btn btn-primary" onclick="agentsModule.showAddAgentForm()">
                                    ➕ Ajouter
                                </button>
                                <button class="btn btn-secondary" onclick="agentsModule.refreshList()">
                                    🔄 Actualiser
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="agents-stats">
                        <div class="stat-card">
                            <span class="stat-icon">👥</span>
                            <span class="stat-value">${agents.length}</span>
                            <span class="stat-label">Total</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-icon">✅</span>
                            <span class="stat-value">${agents.filter(a => a.statut === 'actif').length}</span>
                            <span class="stat-label">Actifs</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-icon">⏸️</span>
                            <span class="stat-value">${agents.filter(a => a.statut === 'inactif').length}</span>
                            <span class="stat-label">Inactifs</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-icon">📊</span>
                            <span class="stat-value">${new Set(agents.map(a => a.groupe)).size}</span>
                            <span class="stat-label">Groupes</span>
                        </div>
                    </div>
                    
                    <div class="agents-table-container">
                        ${this.generateAgentsTable(agents)}
                    </div>
                </div>
            `;
            
            // Mettre à jour l'interface
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.innerHTML = html;
            }
            
            window.uiManager.hideLoading();
            
        } catch (error) {
            console.error("❌ Erreur affichage liste agents:", error);
            window.uiManager.hideLoading();
            window.uiManager.showNotification('Erreur chargement des agents', 'error');
        }
    }
    
    generateAgentsTable(agents) {
        if (!agents || agents.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">👥</div>
                    <h3>Aucun agent trouvé</h3>
                    <p>Commencez par ajouter votre premier agent.</p>
                    <button class="btn btn-primary" onclick="agentsModule.showAddAgentForm()">
                        ➕ Ajouter un agent
                    </button>
                </div>
            `;
        }
        
        return `
            <table class="agents-table">
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Nom & Prénom</th>
                        <th>Groupe</th>
                        <th>Téléphone</th>
                        <th>Poste</th>
                        <th>Statut</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${agents.map(agent => `
                        <tr>
                            <td>
                                <span class="agent-code">${agent.code}</span>
                            </td>
                            <td>
                                <div class="agent-name" onclick="agentsModule.showAgentDetails('${agent.code}')">
                                    <strong>${agent.prenom} ${agent.nom}</strong>
                                </div>
                            </td>
                            <td>
                                <span class="group-badge group-${agent.groupe}">
                                    ${agent.groupe}
                                </span>
                            </td>
                            <td>${agent.tel || 'N/A'}</td>
                            <td>${agent.poste || 'Non défini'}</td>
                            <td>
                                <span class="status-badge ${agent.statut}">
                                    ${agent.statut === 'actif' ? '✅ Actif' : '⏸️ Inactif'}
                                </span>
                            </td>
                            <td class="actions-cell">
                                <button class="btn-icon" onclick="agentsModule.showAgentDetails('${agent.code}')" title="Détails">
                                    👁️
                                </button>
                                <button class="btn-icon" onclick="agentsModule.showEditAgentForm('${agent.code}')" title="Modifier">
                                    ✏️
                                </button>
                                <button class="btn-icon btn-danger" onclick="agentsModule.confirmDeleteAgent('${agent.code}')" title="Supprimer">
                                    🗑️
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
    
    // === GESTION DES AGENTS ===
    
    async showAddAgentForm() {
        try {
            // Générer un code unique
            const agents = window.dataManager.getAgents();
            const existingCodes = agents.map(a => a.code);
            let newCode = 'A01';
            let counter = 1;
            
            while (existingCodes.includes(newCode)) {
                counter++;
                newCode = `A${counter.toString().padStart(2, '0')}`;
            }
            
            const html = `
                <div class="agent-form">
                    <h2>➕ Ajouter un nouvel agent</h2>
                    
                    <form id="addAgentForm" onsubmit="return agentsModule.handleAddAgent(event)">
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="agentCode">Code Agent *</label>
                                <input type="text" 
                                       id="agentCode" 
                                       value="${newCode}"
                                       required 
                                       class="form-control"
                                       placeholder="Ex: A01">
                                <small class="form-hint">Code unique identifiant l'agent</small>
                            </div>
                            
                            <div class="form-group">
                                <label for="agentNom">Nom *</label>
                                <input type="text" 
                                       id="agentNom" 
                                       required 
                                       class="form-control"
                                       placeholder="Ex: Dupont">
                            </div>
                            
                            <div class="form-group">
                                <label for="agentPrenom">Prénom *</label>
                                <input type="text" 
                                       id="agentPrenom" 
                                       required 
                                       class="form-control"
                                       placeholder="Ex: Alice">
                            </div>
                            
                            <div class="form-group">
                                <label for="agentGroupe">Groupe *</label>
                                <select id="agentGroupe" required class="form-control">
                                    <option value="">Sélectionner un groupe</option>
                                    <option value="A">Groupe A</option>
                                    <option value="B">Groupe B</option>
                                    <option value="C">Groupe C</option>
                                    <option value="D">Groupe D</option>
                                    <option value="E">Groupe E</option>
                                    <option value="F">Groupe F</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="agentMatricule">Matricule</label>
                                <input type="text" 
                                       id="agentMatricule" 
                                       class="form-control"
                                       placeholder="Ex: MAT001">
                            </div>
                            
                            <div class="form-group">
                                <label for="agentCIN">CIN / N° Identité</label>
                                <input type="text" 
                                       id="agentCIN" 
                                       class="form-control"
                                       placeholder="Ex: AA123456">
                            </div>
                            
                            <div class="form-group">
                                <label for="agentTel">Téléphone</label>
                                <input type="tel" 
                                       id="agentTel" 
                                       class="form-control"
                                       placeholder="Ex: 0601-010101">
                            </div>
                            
                            <div class="form-group">
                                <label for="agentPoste">Poste / Fonction</label>
                                <input type="text" 
                                       id="agentPoste" 
                                       class="form-control"
                                       placeholder="Ex: Agent de sécurité">
                            </div>
                            
                            <div class="form-group">
                                <label for="agentDateEntree">Date d'entrée</label>
                                <input type="date" 
                                       id="agentDateEntree" 
                                       class="form-control"
                                       value="${new Date().toISOString().split('T')[0]}">
                            </div>
                            
                            <div class="form-group">
                                <label for="agentEmail">Email (optionnel)</label>
                                <input type="email" 
                                       id="agentEmail" 
                                       class="form-control"
                                       placeholder="exemple@email.com">
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">
                                💾 Enregistrer l'agent
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="agentsModule.displayAgentsList()">
                                Annuler
                            </button>
                        </div>
                    </form>
                </div>
            `;
            
            // Afficher dans le contenu principal
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.innerHTML = html;
            }
            
        } catch (error) {
            console.error("❌ Erreur affichage formulaire:", error);
            window.uiManager.showNotification('Erreur affichage formulaire', 'error');
        }
    }
    
    async handleAddAgent(event) {
        event.preventDefault();
        
        try {
            // Récupérer les valeurs du formulaire
            const code = document.getElementById('agentCode').value.toUpperCase().trim();
            const nom = document.getElementById('agentNom').value.trim();
            const prenom = document.getElementById('agentPrenom').value.trim();
            const groupe = document.getElementById('agentGroupe').value;
            
            // Validation
            if (!code || !nom || !prenom || !groupe) {
                window.uiManager.showNotification('Veuillez remplir tous les champs obligatoires', 'error');
                return false;
            }
            
            // Vérifier si le code existe déjà
            const agents = window.dataManager.getAgents();
            if (agents.some(a => a.code === code)) {
                window.uiManager.showNotification(`Le code ${code} existe déjà`, 'error');
                return false;
            }
            
            // Créer l'objet agent
            const newAgent = {
                id: Date.now(),
                code: code,
                nom: nom,
                prenom: prenom,
                groupe: groupe,
                matricule: document.getElementById('agentMatricule').value.trim(),
                cin: document.getElementById('agentCIN').value.trim(),
                tel: document.getElementById('agentTel').value.trim(),
                poste: document.getElementById('agentPoste').value.trim(),
                email: document.getElementById('agentEmail').value.trim(),
                date_entree: document.getElementById('agentDateEntree').value || new Date().toISOString().split('T')[0],
                date_sortie: null,
                statut: 'actif',
                date_creation: new Date().toISOString(),
                date_modification: new Date().toISOString()
            };
            
            // Ajouter via dataManager
            const result = window.dataManager.addAgent(newAgent);
            
            if (result) {
                window.uiManager.showNotification(`✅ Agent ${code} ajouté avec succès`, 'success');
                setTimeout(() => {
                    this.displayAgentsList();
                }, 1000);
                return true;
            } else {
                throw new Error('Erreur lors de l\'ajout');
            }
            
        } catch (error) {
            console.error("❌ Erreur ajout agent:", error);
            window.uiManager.showNotification('Erreur lors de l\'ajout', 'error');
            return false;
        }
    }
    
    async showAgentDetails(code) {
        try {
            const agent = window.dataManager.getAgentByCode(code);
            if (!agent) {
                window.uiManager.showNotification('Agent non trouvé', 'error');
                return;
            }
            
            const html = `
                <div class="agent-details">
                    <div class="details-header">
                        <button class="btn btn-secondary" onclick="agentsModule.displayAgentsList()">
                            ← Retour
                        </button>
                        <h2>👤 Détails de l'agent</h2>
                        <div class="details-actions">
                            <button class="btn btn-primary" onclick="agentsModule.showEditAgentForm('${code}')">
                                ✏️ Modifier
                            </button>
                        </div>
                    </div>
                    
                    <div class="details-body">
                        <div class="agent-card">
                            <div class="agent-avatar">
                                <span class="avatar-icon">👤</span>
                                <div class="agent-code-badge">${agent.code}</div>
                            </div>
                            
                            <div class="agent-info">
                                <h3>${agent.prenom} ${agent.nom}</h3>
                                <p class="agent-position">${agent.poste || 'Poste non spécifié'}</p>
                                
                                <div class="info-grid">
                                    <div class="info-item">
                                        <span class="info-label">Groupe:</span>
                                        <span class="info-value group-badge group-${agent.groupe}">
                                            ${agent.groupe}
                                        </span>
                                    </div>
                                    
                                    <div class="info-item">
                                        <span class="info-label">Statut:</span>
                                        <span class="info-value status-badge ${agent.statut}">
                                            ${agent.statut === 'actif' ? '✅ Actif' : '⏸️ Inactif'}
                                        </span>
                                    </div>
                                    
                                    <div class="info-item">
                                        <span class="info-label">Matricule:</span>
                                        <span class="info-value">${agent.matricule || 'N/A'}</span>
                                    </div>
                                    
                                    <div class="info-item">
                                        <span class="info-label">CIN:</span>
                                        <span class="info-value">${agent.cin || 'N/A'}</span>
                                    </div>
                                    
                                    <div class="info-item">
                                        <span class="info-label">Téléphone:</span>
                                        <span class="info-value">
                                            ${agent.tel ? `<a href="tel:${agent.tel}">${agent.tel}</a>` : 'N/A'}
                                        </span>
                                    </div>
                                    
                                    <div class="info-item">
                                        <span class="info-label">Email:</span>
                                        <span class="info-value">
                                            ${agent.email ? `<a href="mailto:${agent.email}">${agent.email}</a>` : 'N/A'}
                                        </span>
                                    </div>
                                    
                                    <div class="info-item">
                                        <span class="info-label">Date d'entrée:</span>
                                        <span class="info-value">${agent.date_entree || 'N/A'}</span>
                                    </div>
                                    
                                    <div class="info-item">
                                        <span class="info-label">Date de sortie:</span>
                                        <span class="info-value">${agent.date_sortie || 'En activité'}</span>
                                    </div>
                                    
                                    <div class="info-item">
                                        <span class="info-label">Date création:</span>
                                        <span class="info-value">${new Date(agent.date_creation).toLocaleDateString()}</span>
                                    </div>
                                    
                                    <div class="info-item">
                                        <span class="info-label">Dernière modification:</span>
                                        <span class="info-value">${new Date(agent.date_modification).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="actions-section">
                            <h3>Actions rapides</h3>
                            <div class="actions-grid">
                                <button class="action-card" onclick="mainApp.loadModule('planning')">
                                    <span class="action-icon">📅</span>
                                    <span class="action-label">Voir planning</span>
                                </button>
                                
                                <button class="action-card" onclick="mainApp.loadModule('leaves')">
                                    <span class="action-icon">🏖️</span>
                                    <span class="action-label">Gérer les congés</span>
                                </button>
                                
                                <button class="action-card" onclick="agentsModule.exportAgentData('${code}')">
                                    <span class="action-icon">📤</span>
                                    <span class="action-label">Exporter données</span>
                                </button>
                                
                                <button class="action-card" onclick="agentsModule.printAgentCard('${code}')">
                                    <span class="action-icon">🖨️</span>
                                    <span class="action-label">Importer fiche</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Afficher dans le contenu principal
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.innerHTML = html;
            }
            
        } catch (error) {
            console.error("❌ Erreur affichage détails:", error);
            window.uiManager.showNotification('Erreur affichage détails', 'error');
        }
    }
    
    async showEditAgentForm(code) {
        try {
            const agent = window.dataManager.getAgentByCode(code);
            if (!agent) {
                window.uiManager.showNotification('Agent non trouvé', 'error');
                return;
            }
            
            this.selectedAgent = agent;
            
            const html = `
                <div class="agent-form">
                    <div class="form-header">
                        <button class="btn btn-secondary" onclick="agentsModule.showAgentDetails('${code}')">
                            ← Retour
                        </button>
                        <h2>✏️ Modifier l'agent ${agent.code}</h2>
                    </div>
                    
                    <form id="editAgentForm" onsubmit="return agentsModule.handleEditAgent(event, '${code}')">
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="editCode">Code Agent</label>
                                <input type="text" 
                                       id="editCode" 
                                       value="${agent.code}"
                                       readonly 
                                       class="form-control" 
                                       style="background: #f8f9fa;">
                                <small class="form-hint">Code non modifiable</small>
                            </div>
                            
                            <div class="form-group">
                                <label for="editNom">Nom *</label>
                                <input type="text" 
                                       id="editNom" 
                                       value="${agent.nom}"
                                       required 
                                       class="form-control">
                            </div>
                            
                            <div class="form-group">
                                <label for="editPrenom">Prénom *</label>
                                <input type="text" 
                                       id="editPrenom" 
                                       value="${agent.prenom}"
                                       required 
                                       class="form-control">
                            </div>
                            
                            <div class="form-group">
                                <label for="editGroupe">Groupe *</label>
                                <select id="editGroupe" required class="form-control">
                                    <option value="A" ${agent.groupe === 'A' ? 'selected' : ''}>Groupe A</option>
                                    <option value="B" ${agent.groupe === 'B' ? 'selected' : ''}>Groupe B</option>
                                    <option value="C" ${agent.groupe === 'C' ? 'selected' : ''}>Groupe C</option>
                                    <option value="D" ${agent.groupe === 'D' ? 'selected' : ''}>Groupe D</option>
                                    <option value="E" ${agent.groupe === 'E' ? 'selected' : ''}>Groupe E</option>
                                    <option value="F" ${agent.groupe === 'F' ? 'selected' : ''}>Groupe F</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="editMatricule">Matricule</label>
                                <input type="text" 
                                       id="editMatricule" 
                                       value="${agent.matricule || ''}"
                                       class="form-control">
                            </div>
                            
                            <div class="form-group">
                                <label for="editCIN">CIN / N° Identité</label>
                                <input type="text" 
                                       id="editCIN" 
                                       value="${agent.cin || ''}"
                                       class="form-control">
                            </div>
                            
                            <div class="form-group">
                                <label for="editTel">Téléphone</label>
                                <input type="tel" 
                                       id="editTel" 
                                       value="${agent.tel || ''}"
                                       class="form-control">
                            </div>
                            
                            <div class="form-group">
                                <label for="editPoste">Poste / Fonction</label>
                                <input type="text" 
                                       id="editPoste" 
                                       value="${agent.poste || ''}"
                                       class="form-control">
                            </div>
                            
                            <div class="form-group">
                                <label for="editEmail">Email</label>
                                <input type="email" 
                                       id="editEmail" 
                                       value="${agent.email || ''}"
                                       class="form-control">
                            </div>
                            
                            <div class="form-group">
                                <label for="editDateEntree">Date d'entrée</label>
                                <input type="date" 
                                       id="editDateEntree" 
                                       value="${agent.date_entree || ''}"
                                       class="form-control">
                            </div>
                            
                            <div class="form-group">
                                <label for="editDateSortie">Date de sortie</label>
                                <input type="date" 
                                       id="editDateSortie" 
                                       value="${agent.date_sortie || ''}"
                                       class="form-control">
                                <small class="form-hint">Remplir uniquement si l'agent quitte l'entreprise</small>
                            </div>
                            
                            <div class="form-group">
                                <label for="editStatut">Statut</label>
                                <select id="editStatut" class="form-control">
                                    <option value="actif" ${agent.statut === 'actif' ? 'selected' : ''}>Actif</option>
                                    <option value="inactif" ${agent.statut === 'inactif' ? 'selected' : ''}>Inactif</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">
                                💾 Enregistrer les modifications
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="agentsModule.showAgentDetails('${code}')">
                                Annuler
                            </button>
                            <button type="button" class="btn btn-danger" onclick="agentsModule.confirmDeleteAgent('${code}')">
                                🗑️ Supprimer
                            </button>
                        </div>
                    </form>
                </div>
            `;
            
            // Afficher dans le contenu principal
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.innerHTML = html;
            }
            
        } catch (error) {
            console.error("❌ Erreur affichage formulaire édition:", error);
            window.uiManager.showNotification('Erreur affichage formulaire', 'error');
        }
    }
    
    async handleEditAgent(event, oldCode) {
        event.preventDefault();
        
        try {
            // Récupérer les nouvelles valeurs
            const updates = {
                nom: document.getElementById('editNom').value.trim(),
                prenom: document.getElementById('editPrenom').value.trim(),
                groupe: document.getElementById('editGroupe').value,
                matricule: document.getElementById('editMatricule').value.trim(),
                cin: document.getElementById('editCIN').value.trim(),
                tel: document.getElementById('editTel').value.trim(),
                poste: document.getElementById('editPoste').value.trim(),
                email: document.getElementById('editEmail').value.trim(),
                date_entree: document.getElementById('editDateEntree').value,
                date_sortie: document.getElementById('editDateSortie').value || null,
                statut: document.getElementById('editStatut').value,
                date_modification: new Date().toISOString()
            };
            
            // Validation
            if (!updates.nom || !updates.prenom || !updates.groupe) {
                window.uiManager.showNotification('Les champs nom, prénom et groupe sont obligatoires', 'error');
                return false;
            }
            
            // Mettre à jour via dataManager
            const result = window.dataManager.updateAgent(oldCode, updates);
            
            if (result) {
                window.uiManager.showNotification(`✅ Agent ${oldCode} modifié avec succès`, 'success');
                setTimeout(() => {
                    this.showAgentDetails(oldCode);
                }, 1000);
                return true;
            } else {
                throw new Error('Erreur lors de la modification');
            }
            
        } catch (error) {
            console.error("❌ Erreur modification agent:", error);
            window.uiManager.showNotification('Erreur lors de la modification', 'error');
            return false;
        }
    }
    
    async confirmDeleteAgent(code) {
        try {
            const agent = window.dataManager.getAgentByCode(code);
            if (!agent) {
                window.uiManager.showNotification('Agent non trouvé', 'error');
                return;
            }
            
            const confirmed = await window.uiManager.showConfirm(
                `Êtes-vous sûr de vouloir supprimer l'agent ${code} (${agent.prenom} ${agent.nom}) ?`,
                {
                    title: 'Confirmation de suppression',
                    confirmText: 'Supprimer',
                    cancelText: 'Annuler',
                    type: 'danger'
                }
            );
            
            if (confirmed) {
                await this.deleteAgent(code);
            }
            
        } catch (error) {
            console.error("❌ Erreur confirmation suppression:", error);
            window.uiManager.showNotification('Erreur lors de la suppression', 'error');
        }
    }
    
    async deleteAgent(code) {
        try {
            const result = window.dataManager.deleteAgent(code);
            
            if (result) {
                window.uiManager.showNotification(`✅ Agent ${code} supprimé avec succès`, 'success');
                setTimeout(() => {
                    this.displayAgentsList();
                }, 1000);
            } else {
                throw new Error('Erreur lors de la suppression');
            }
            
        } catch (error) {
            console.error("❌ Erreur suppression agent:", error);
            window.uiManager.showNotification('Erreur lors de la suppression', 'error');
        }
    }
    
    // === FONCTIONS UTILITAIRES ===
    
    filterAgents(searchTerm) {
        const agents = window.dataManager.getAgents();
        const search = searchTerm.toLowerCase().trim();
        
        if (!search) {
            // Afficher tous les agents
            document.querySelector('.agents-table-container').innerHTML = 
                this.generateAgentsTable(agents);
            return;
        }
        
        // Filtrer les agents
        const filtered = agents.filter(agent => {
            return (
                agent.code.toLowerCase().includes(search) ||
                agent.nom.toLowerCase().includes(search) ||
                agent.prenom.toLowerCase().includes(search) ||
                agent.groupe.toLowerCase().includes(search) ||
                agent.poste?.toLowerCase().includes(search) ||
                agent.tel?.includes(search) ||
                agent.cin?.includes(search)
            );
        });
        
        // Mettre à jour le tableau
        document.querySelector('.agents-table-container').innerHTML = 
            this.generateAgentsTable(filtered);
    }
    
    refreshList() {
        this.displayAgentsList();
    }
    
    exportAgentData(code) {
        const agent = window.dataManager.getAgentByCode(code);
        if (!agent) {
            window.uiManager.showNotification('Agent non trouvé', 'error');
            return;
        }
        
        // Créer un objet exportable
        const exportData = {
            agent: agent,
            exportDate: new Date().toISOString(),
            system: 'SGA CleanCo 2026'
        };
        
        // Convertir en JSON
        const jsonData = JSON.stringify(exportData, null, 2);
        
        // Créer un blob et télécharger
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `agent-${code}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        window.uiManager.showNotification(`📤 Données de l'agent ${code} exportées`, 'success');
    }
    
    printAgentCard(code) {
        window.uiManager.showNotification('🖨️ Impression en cours de développement', 'info');
        // Implémentation de l'impression à ajouter
    }
    
    // === FONCTIONS DE COMPATIBILITÉ ===
    
    // Pour la compatibilité avec l'ancien code
    static init() {
        if (!window.agentsModule) {
            window.agentsModule = new AgentsModule();
            window.agentsModule.init();
        }
        return window.agentsModule;
    }
}

// === INITIALISATION AUTOMATIQUE ===

// Initialiser le module quand le DOM est chargé
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        AgentsModule.init();
    });
} else {
    AgentsModule.init();
}

// Exporter pour modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgentsModule;
}
