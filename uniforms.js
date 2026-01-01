// js/modules/uniforms.js - Module de Gestion de l'Habillement

const UniformsModule = {
    // Variables du module
    uniforms: [],
    uniformsHistory: [],
    
    // Initialisation
    init: function() {
        this.loadUniformsData();
        console.log('Module Habillement initialisé');
    },
    
    // Charger l'interface principale
    load: function() {
        const stats = this.calculateUniformStats();
        
        return `
            <div class="module-container">
                <div class="module-header">
                    <h2>👕 Gestion de l'Habillement</h2>
                    <div class="header-actions">
                        <button class="btn-primary" onclick="UniformsModule.showAddUniformForm()">
                            + Ajouter une tenue
                        </button>
                        <button class="btn-secondary" onclick="UniformsModule.showBulkAssignment()">
                            📦 Attribution groupée
                        </button>
                    </div>
                </div>
                
                <!-- Statistiques rapides -->
                <div class="stats-cards">
                    <div class="stat-card">
                        <div class="stat-number">${stats.totalUniforms}</div>
                        <div class="stat-label">Tenues enregistrées</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${stats.pendingDelivery}</div>
                        <div class="stat-label">Livraisons en attente</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${stats.nearExpiry}</div>
                        <div class="stat-label">Échéances proches</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${stats.totalCost} DH</div>
                        <div class="stat-label">Valeur totale</div>
                    </div>
                </div>
                
                <!-- Menu des fonctionnalités -->
                <div class="features-grid">
                    <div class="feature-card" onclick="UniformsModule.showUniformCatalog()">
                        <div class="feature-icon">👕</div>
                        <h3>Catalogue des tenues</h3>
                        <p>Liste complète des tenues disponibles</p>
                    </div>
                    
                    <div class="feature-card" onclick="UniformsModule.showUniformAssignment()">
                        <div class="feature-icon">👤</div>
                        <h3>Attribution aux agents</h3>
                        <p>Assigner des tenues aux agents</p>
                    </div>
                    
                    <div class="feature-card" onclick="UniformsModule.showUniformReport()">
                        <div class="feature-icon">📋</div>
                        <h3>Rapports d'habillement</h3>
                        <p>Générer des rapports détaillés</p>
                    </div>
                    
                    <div class="feature-card" onclick="UniformsModule.showUniformStats()">
                        <div class="feature-icon">📊</div>
                        <h3>Statistiques tailles</h3>
                        <p>Analyses par tailles et types</p>
                    </div>
                    
                    <div class="feature-card" onclick="UniformsModule.showUniformDeadlines()">
                        <div class="feature-icon">📅</div>
                        <h3>Échéances & Renouvellements</h3>
                        <p>Gestion des dates d'échéance</p>
                    </div>
                    
                    <div class="feature-card" onclick="UniformsModule.showInventoryManagement()">
                        <div class="feature-icon">📦</div>
                        <h3>Gestion des stocks</h3>
                        <p>Suivi des entrées/sorties</p>
                    </div>
                </div>
                
                <!-- Alertes échéances -->
                <div class="alerts-section">
                    <h3>⚠️ Alertes d'échéance (30 prochains jours)</h3>
                    <div id="uniform-alerts">
                        ${this.generateDeadlineAlerts()}
                    </div>
                </div>
            </div>
        `;
    },
    
    // ============ CATALOGUE DES TENUES ============
    
    showUniformCatalog: function() {
        const uniforms = this.getUniforms();
        
        let html = `
            <div class="uniform-catalog">
                <div class="catalog-header">
                    <h2>👕 Catalogue des Tenues</h2>
                    <div class="catalog-tools">
                        <input type="text" id="searchUniform" placeholder="Rechercher..." 
                               class="form-input" onkeyup="UniformsModule.filterUniforms()">
                        <select id="filterCategory" class="form-input" onchange="UniformsModule.filterUniforms()">
                            <option value="">Toutes catégories</option>
                            <option value="tenue_complete">Tenue complète</option>
                            <option value="veste">Veste</option>
                            <option value="pantalon">Pantalon</option>
                            <option value="chemise">Chemise</option>
                            <option value="chaussures">Chaussures</option>
                            <option value="accessoire">Accessoire</option>
                        </select>
                    </div>
                </div>
                
                <div class="uniforms-grid" id="uniforms-grid">
                    ${this.generateUniformsGrid(uniforms)}
                </div>
                
                <div class="catalog-summary">
                    <p><strong>Total :</strong> ${uniforms.length} tenues répertoriées</p>
                    <button class="btn-primary" onclick="UniformsModule.showAddUniformForm()">
                        + Ajouter une nouvelle tenue
                    </button>
                </div>
            </div>
        `;
        
        UIManager.showPopup("👕 Catalogue des Tenues", html, `
            <button class="btn-secondary" onclick="UIManager.hidePopup()">
                Fermer
            </button>
        `);
    },
    
    generateUniformsGrid: function(uniforms) {
        if (uniforms.length === 0) {
            return '<div class="empty-state">Aucune tenue enregistrée</div>';
        }
        
        return uniforms.map(uniform => `
            <div class="uniform-card" data-category="${uniform.category}" data-code="${uniform.code}">
                <div class="uniform-header" style="background-color: ${this.getCategoryColor(uniform.category)}">
                    <span class="uniform-code">${uniform.code}</span>
                    <span class="uniform-status ${uniform.status}">${this.getStatusText(uniform.status)}</span>
                </div>
                <div class="uniform-body">
                    <h4>${uniform.name}</h4>
                    <div class="uniform-details">
                        <p><strong>Type:</strong> ${this.getCategoryText(uniform.category)}</p>
                        <p><strong>Taille:</strong> ${uniform.size}</p>
                        <p><strong>Couleur:</strong> ${uniform.color}</p>
                        <p><strong>Fournisseur:</strong> ${uniform.supplier}</p>
                        <p><strong>Prix:</strong> ${uniform.price} DH</p>
                    </div>
                    ${uniform.assignedTo ? 
                        `<div class="uniform-assigned">
                            <strong>Attribué à:</strong> ${uniform.assignedTo}
                        </div>` : 
                        `<div class="uniform-available">
                            <strong>Disponible en stock</strong>
                        </div>`
                    }
                </div>
                <div class="uniform-actions">
                    <button class="btn-sm" onclick="UniformsModule.editUniform('${uniform.id}')">
                        ✏️ Modifier
                    </button>
                    <button class="btn-sm btn-danger" onclick="UniformsModule.deleteUniform('${uniform.id}')">
                        🗑️ Supprimer
                    </button>
                </div>
            </div>
        `).join('');
    },
    
    // ============ AJOUT/MODIFICATION DES TENUES ============
    
    showAddUniformForm: function() {
        let html = `
            <div class="uniform-form">
                <h3>➕ Ajouter une nouvelle tenue</h3>
                
                <form id="add-uniform-form">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Code de la tenue *</label>
                            <input type="text" id="uniform-code" class="form-input" required 
                                   placeholder="Ex: UNIF-2024-001">
                        </div>
                        
                        <div class="form-group">
                            <label>Nom de la tenue *</label>
                            <input type="text" id="uniform-name" class="form-input" required 
                                   placeholder="Ex: Tenue d'été complète">
                        </div>
                        
                        <div class="form-group">
                            <label>Catégorie *</label>
                            <select id="uniform-category" class="form-input" required>
                                <option value="">Sélectionner une catégorie</option>
                                <option value="tenue_complete">Tenue complète</option>
                                <option value="veste">Veste</option>
                                <option value="pantalon">Pantalon</option>
                                <option value="chemise">Chemise</option>
                                <option value="chaussures">Chaussures</option>
                                <option value="casquette">Casquette/Béret</option>
                                <option value="ceinture">Ceinture</option>
                                <option value="accessoire">Accessoire</option>
                                <option value="autre">Autre</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Taille *</label>
                            <select id="uniform-size" class="form-input" required>
                                <option value="">Sélectionner une taille</option>
                                <option value="XS">XS</option>
                                <option value="S">S</option>
                                <option value="M">M</option>
                                <option value="L">L</option>
                                <option value="XL">XL</option>
                                <option value="XXL">XXL</option>
                                <option value="XXXL">XXXL</option>
                                <option value="sur_mesure">Sur mesure</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Couleur</label>
                            <input type="text" id="uniform-color" class="form-input" 
                                   placeholder="Ex: Bleu marine">
                        </div>
                        
                        <div class="form-group">
                            <label>Matériau</label>
                            <input type="text" id="uniform-material" class="form-input" 
                                   placeholder="Ex: Polycoton">
                        </div>
                        
                        <div class="form-group">
                            <label>Fournisseur *</label>
                            <input type="text" id="uniform-supplier" class="form-input" required 
                                   placeholder="Ex: ABC Uniformes">
                        </div>
                        
                        <div class="form-group">
                            <label>Prix d'achat (DH)</label>
                            <input type="number" id="uniform-price" class="form-input" 
                                   placeholder="0.00" step="0.01">
                        </div>
                        
                        <div class="form-group">
                            <label>Date d'achat</label>
                            <input type="date" id="uniform-purchase-date" class="form-input" 
                                   value="${new Date().toISOString().split('T')[0]}">
                        </div>
                        
                        <div class="form-group">
                            <label>Durée de vie (mois)</label>
                            <input type="number" id="uniform-lifespan" class="form-input" 
                                   value="24" min="1" max="120">
                            <small>Durée estimée avant renouvellement</small>
                        </div>
                        
                        <div class="form-group">
                            <label>Quantité en stock *</label>
                            <input type="number" id="uniform-quantity" class="form-input" required 
                                   value="1" min="1">
                        </div>
                        
                        <div class="form-group full-width">
                            <label>Description</label>
                            <textarea id="uniform-description" class="form-input" rows="3" 
                                      placeholder="Description détaillée de la tenue..."></textarea>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" onclick="UIManager.hidePopup()" class="btn-secondary">
                            Annuler
                        </button>
                        <button type="submit" class="btn-primary">
                            💾 Enregistrer la tenue
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        UIManager.showPopup("➕ Ajouter une tenue", html, '');
        
        // Gérer la soumission du formulaire
        document.getElementById('add-uniform-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveUniform();
        });
    },
    
    saveUniform: function() {
        const uniformData = {
            id: Utilities.generateId(),
            code: document.getElementById('uniform-code').value,
            name: document.getElementById('uniform-name').value,
            category: document.getElementById('uniform-category').value,
            size: document.getElementById('uniform-size').value,
            color: document.getElementById('uniform-color').value,
            material: document.getElementById('uniform-material').value,
            supplier: document.getElementById('uniform-supplier').value,
            price: parseFloat(document.getElementById('uniform-price').value) || 0,
            purchaseDate: document.getElementById('uniform-purchase-date').value,
            lifespan: parseInt(document.getElementById('uniform-lifespan').value) || 24,
            quantity: parseInt(document.getElementById('uniform-quantity').value),
            description: document.getElementById('uniform-description').value,
            status: 'in_stock',
            createdAt: new Date().toISOString(),
            createdBy: 'user'
        };
        
        // Calculer la date d'échéance
        const purchaseDate = new Date(uniformData.purchaseDate);
        purchaseDate.setMonth(purchaseDate.getMonth() + uniformData.lifespan);
        uniformData.expiryDate = purchaseDate.toISOString().split('T')[0];
        
        // Validation
        if (!uniformData.code || !uniformData.name || !uniformData.category || !uniformData.size) {
            UIManager.showNotification('Veuillez remplir les champs obligatoires', 'error');
            return;
        }
        
        // Vérifier si le code existe déjà
        const existingIndex = this.uniforms.findIndex(u => u.code === uniformData.code);
        
        if (existingIndex !== -1) {
            this.uniforms[existingIndex] = uniformData;
            UIManager.showNotification('Tenue mise à jour', 'success');
        } else {
            this.uniforms.push(uniformData);
            UIManager.showNotification('Tenue ajoutée avec succès', 'success');
        }
        
        // Sauvegarder
        this.saveUniformsData();
        
        // Fermer popup et rafraîchir
        UIManager.hidePopup();
        
        // Si nous étions dans le catalogue, le rafraîchir
        if (document.querySelector('.uniform-catalog')) {
            this.showUniformCatalog();
        } else {
            MenuManager.loadModule('uniforms');
        }
    },
    
    editUniform: function(uniformId) {
        const uniform = this.uniforms.find(u => u.id === uniformId);
        if (!uniform) return;
        
        let html = `
            <div class="uniform-form">
                <h3>✏️ Modifier la tenue</h3>
                
                <form id="edit-uniform-form">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Code de la tenue</label>
                            <input type="text" id="edit-uniform-code" class="form-input" 
                                   value="${uniform.code}" readonly>
                        </div>
                        
                        <div class="form-group">
                            <label>Nom de la tenue *</label>
                            <input type="text" id="edit-uniform-name" class="form-input" required 
                                   value="${uniform.name}">
                        </div>
                        
                        <div class="form-group">
                            <label>Catégorie *</label>
                            <select id="edit-uniform-category" class="form-input" required>
                                <option value="">Sélectionner une catégorie</option>
                                <option value="tenue_complete" ${uniform.category === 'tenue_complete' ? 'selected' : ''}>Tenue complète</option>
                                <option value="veste" ${uniform.category === 'veste' ? 'selected' : ''}>Veste</option>
                                <option value="pantalon" ${uniform.category === 'pantalon' ? 'selected' : ''}>Pantalon</option>
                                <option value="chemise" ${uniform.category === 'chemise' ? 'selected' : ''}>Chemise</option>
                                <option value="chaussures" ${uniform.category === 'chaussures' ? 'selected' : ''}>Chaussures</option>
                                <option value="casquette" ${uniform.category === 'casquette' ? 'selected' : ''}>Casquette/Béret</option>
                                <option value="ceinture" ${uniform.category === 'ceinture' ? 'selected' : ''}>Ceinture</option>
                                <option value="accessoire" ${uniform.category === 'accessoire' ? 'selected' : ''}>Accessoire</option>
                                <option value="autre" ${uniform.category === 'autre' ? 'selected' : ''}>Autre</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Taille *</label>
                            <select id="edit-uniform-size" class="form-input" required>
                                <option value="">Sélectionner une taille</option>
                                <option value="XS" ${uniform.size === 'XS' ? 'selected' : ''}>XS</option>
                                <option value="S" ${uniform.size === 'S' ? 'selected' : ''}>S</option>
                                <option value="M" ${uniform.size === 'M' ? 'selected' : ''}>M</option>
                                <option value="L" ${uniform.size === 'L' ? 'selected' : ''}>L</option>
                                <option value="XL" ${uniform.size === 'XL' ? 'selected' : ''}>XL</option>
                                <option value="XXL" ${uniform.size === 'XXL' ? 'selected' : ''}>XXL</option>
                                <option value="XXXL" ${uniform.size === 'XXXL' ? 'selected' : ''}>XXXL</option>
                                <option value="sur_mesure" ${uniform.size === 'sur_mesure' ? 'selected' : ''}>Sur mesure</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Couleur</label>
                            <input type="text" id="edit-uniform-color" class="form-input" 
                                   value="${uniform.color || ''}">
                        </div>
                        
                        <div class="form-group">
                            <label>Statut</label>
                            <select id="edit-uniform-status" class="form-input">
                                <option value="in_stock" ${uniform.status === 'in_stock' ? 'selected' : ''}>En stock</option>
                                <option value="assigned" ${uniform.status === 'assigned' ? 'selected' : ''}>Attribué</option>
                                <option value="in_use" ${uniform.status === 'in_use' ? 'selected' : ''}>En utilisation</option>
                                <option value="maintenance" ${uniform.status === 'maintenance' ? 'selected' : ''}>En maintenance</option>
                                <option value="expired" ${uniform.status === 'expired' ? 'selected' : ''}>Périmé</option>
                                <option value="lost" ${uniform.status === 'lost' ? 'selected' : ''}>Perdu</option>
                                <option value="damaged" ${uniform.status === 'damaged' ? 'selected' : ''}>Endommagé</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Agent attribué</label>
                            <select id="edit-uniform-agent" class="form-input">
                                <option value="">Non attribué</option>
                                ${DataManager.getAgents().filter(a => a.statut === 'actif').map(agent => `
                                    <option value="${agent.code}" ${uniform.assignedTo === agent.code ? 'selected' : ''}>
                                        ${agent.nom} ${agent.prenom} (${agent.code})
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Date d'attribution</label>
                            <input type="date" id="edit-uniform-assignment-date" class="form-input" 
                                   value="${uniform.assignmentDate || ''}">
                        </div>
                        
                        <div class="form-group">
                            <label>Date d'échéance</label>
                            <input type="date" id="edit-uniform-expiry-date" class="form-input" 
                                   value="${uniform.expiryDate || ''}">
                        </div>
                        
                        <div class="form-group full-width">
                            <label>Remarques</label>
                            <textarea id="edit-uniform-notes" class="form-input" rows="3">${uniform.notes || ''}</textarea>
                        </div>
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
        `;
        
        UIManager.showPopup("✏️ Modifier la tenue", html, '');
        
        document.getElementById('edit-uniform-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateUniform(uniformId);
        });
    },
    
    updateUniform: function(uniformId) {
        const index = this.uniforms.findIndex(u => u.id === uniformId);
        if (index === -1) return;
        
        const updatedUniform = {
            ...this.uniforms[index],
            name: document.getElementById('edit-uniform-name').value,
            category: document.getElementById('edit-uniform-category').value,
            size: document.getElementById('edit-uniform-size').value,
            color: document.getElementById('edit-uniform-color').value,
            status: document.getElementById('edit-uniform-status').value,
            assignedTo: document.getElementById('edit-uniform-agent').value,
            assignmentDate: document.getElementById('edit-uniform-assignment-date').value,
            expiryDate: document.getElementById('edit-uniform-expiry-date').value,
            notes: document.getElementById('edit-uniform-notes').value,
            updatedAt: new Date().toISOString(),
            updatedBy: 'user'
        };
        
        // Si attribution changée, enregistrer dans l'historique
        if (updatedUniform.assignedTo !== this.uniforms[index].assignedTo) {
            this.recordAssignmentChange(uniformId, this.uniforms[index].assignedTo, updatedUniform.assignedTo);
        }
        
        this.uniforms[index] = updatedUniform;
        this.saveUniformsData();
        
        UIManager.showNotification('Tenue mise à jour', 'success');
        UIManager.hidePopup();
        
        // Rafraîchir l'affichage
        if (document.querySelector('.uniform-catalog')) {
            this.showUniformCatalog();
        }
    },
    
    deleteUniform: function(uniformId) {
        UIManager.showConfirm(
            "Êtes-vous sûr de vouloir supprimer cette tenue ? Cette action est irréversible.",
            `UniformsModule.confirmDeleteUniform('${uniformId}')`
        );
    },
    
    confirmDeleteUniform: function(uniformId) {
        this.uniforms = this.uniforms.filter(u => u.id !== uniformId);
        this.saveUniformsData();
        
        UIManager.showNotification('Tenue supprimée', 'success');
        
        // Rafraîchir l'affichage
        if (document.querySelector('.uniform-catalog')) {
            this.showUniformCatalog();
        }
    },
    
    // ============ ATTRIBUTION DES TENUES ============
    
    showUniformAssignment: function() {
        const agents = DataManager.getAgents().filter(a => a.statut === 'actif');
        const availableUniforms = this.uniforms.filter(u => u.status === 'in_stock');
        
        let html = `
            <div class="uniform-assignment">
                <h2>👤 Attribution des Tenues</h2>
                
                <div class="assignment-container">
                    <div class="assignment-form">
                        <h3>Attribuer une tenue à un agent</h3>
                        
                        <div class="form-group">
                            <label>Sélectionner l'agent *</label>
                            <select id="assignment-agent" class="form-input">
                                <option value="">Choisir un agent</option>
                                ${agents.map(agent => `
                                    <option value="${agent.code}">
                                        ${agent.nom} ${agent.prenom} (${agent.code}) - Taille: ${agent.taille || 'Non définie'}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Sélectionner la tenue *</label>
                            <select id="assignment-uniform" class="form-input">
                                <option value="">Choisir une tenue</option>
                                ${availableUniforms.map(uniform => `
                                    <option value="${uniform.id}">
                                        ${uniform.code} - ${uniform.name} (${uniform.size})
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Date d'attribution</label>
                            <input type="date" id="assignment-date" class="form-input" 
                                   value="${new Date().toISOString().split('T')[0]}">
                        </div>
                        
                        <div class="form-group">
                            <label>Remarques</label>
                            <textarea id="assignment-notes" class="form-input" rows="3" 
                                      placeholder="Notes sur l'attribution..."></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="assignment-send-notification" checked>
                                Notifier l'agent par email
                            </label>
                        </div>
                        
                        <button class="btn-primary" onclick="UniformsModule.assignUniform()">
                            📝 Attribuer la tenue
                        </button>
                    </div>
                    
                    <div class="assignment-history">
                        <h3>Historique des attributions récentes</h3>
                        ${this.generateRecentAssignments()}
                    </div>
                </div>
                
                <div class="assigned-uniforms-list">
                    <h3>Tenues actuellement attribuées</h3>
                    ${this.generateAssignedUniformsList()}
                </div>
            </div>
        `;
        
        UIManager.showPopup("👤 Attribution des Tenues", html, `
            <button class="btn-secondary" onclick="UIManager.hidePopup()">
                Fermer
            </button>
        `);
    },
    
    assignUniform: function() {
        const agentCode = document.getElementById('assignment-agent').value;
        const uniformId = document.getElementById('assignment-uniform').value;
        const assignmentDate = document.getElementById('assignment-date').value;
        const notes = document.getElementById('assignment-notes').value;
        const sendNotification = document.getElementById('assignment-send-notification').checked;
        
        if (!agentCode || !uniformId) {
            UIManager.showNotification('Veuillez sélectionner un agent et une tenue', 'error');
            return;
        }
        
        const uniformIndex = this.uniforms.findIndex(u => u.id === uniformId);
        if (uniformIndex === -1) {
            UIManager.showNotification('Tenue non trouvée', 'error');
            return;
        }
        
        const agent = DataManager.getAgents().find(a => a.code === agentCode);
        if (!agent) {
            UIManager.showNotification('Agent non trouvé', 'error');
            return;
        }
        
        // Mettre à jour la tenue
        this.uniforms[uniformIndex] = {
            ...this.uniforms[uniformIndex],
            status: 'assigned',
            assignedTo: agentCode,
            assignmentDate: assignmentDate,
            notes: notes
        };
        
        // Enregistrer dans l'historique
        const assignmentRecord = {
            id: Utilities.generateId(),
            uniformId: uniformId,
            uniformCode: this.uniforms[uniformIndex].code,
            agentCode: agentCode,
            agentName: `${agent.nom} ${agent.prenom}`,
            assignmentDate: assignmentDate,
            notes: notes,
            assignedBy: 'user',
            assignedAt: new Date().toISOString()
        };
        
        this.uniformsHistory.unshift(assignmentRecord);
        
        // Sauvegarder
        this.saveUniformsData();
        
        // Notification
        if (sendNotification) {
            this.sendAssignmentNotification(agent, this.uniforms[uniformIndex]);
        }
        
        UIManager.showNotification(`Tenue attribuée à ${agent.nom} ${agent.prenom}`, 'success');
        
        // Rafraîchir l'affichage
        this.showUniformAssignment();
    },
    
    // ============ RAPPORTS ET STATISTIQUES ============
    
    showUniformReport: function() {
        const reportData = this.generateUniformReport();
        
        let html = `
            <div class="uniform-report">
                <h2>📋 Rapport d'Habillement</h2>
                
                <div class="report-actions">
                    <button class="btn-sm" onclick="UniformsModule.exportUniformReport('pdf')">
                        📄 Exporter PDF
                    </button>
                    <button class="btn-sm" onclick="UniformsModule.exportUniformReport('excel')">
                        📊 Exporter Excel
                    </button>
                    <button class="btn-sm" onclick="UniformsModule.printUniformReport()">
                        🖨️ Imprimer
                    </button>
                </div>
                
                <!-- Résumé du rapport -->
                <div class="report-summary">
                    <div class="summary-item">
                        <span class="summary-label">Total tenues:</span>
                        <span class="summary-value">${reportData.totalUniforms}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Tenues attribuées:</span>
                        <span class="summary-value">${reportData.assignedUniforms}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Valeur totale:</span>
                        <span class="summary-value">${reportData.totalValue} DH</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Taux d'utilisation:</span>
                        <span class="summary-value">${reportData.utilizationRate}%</span>
                    </div>
                </div>
                
                <!-- Tableau détaillé -->
                <div class="report-table">
                    <h3>Détail par catégorie</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Catégorie</th>
                                <th>Quantité</th>
                                <th>Attribuées</th>
                                <th>En stock</th>
                                <th>Valeur (DH)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${reportData.byCategory.map(cat => `
                                <tr>
                                    <td>${this.getCategoryText(cat.category)}</td>
                                    <td>${cat.quantity}</td>
                                    <td>${cat.assigned}</td>
                                    <td>${cat.inStock}</td>
                                    <td>${cat.value}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <!-- Tenues à renouveler -->
                <div class="report-renewals">
                    <h3>Tenues à renouveler (prochains 30 jours)</h3>
                    ${this.generateRenewalList()}
                </div>
            </div>
        `;
        
        UIManager.showPopup("📋 Rapport d'Habillement", html, `
            <button class="btn-secondary" onclick="UIManager.hidePopup()">
                Fermer
            </button>
        `);
    },
    
    showUniformStats: function() {
        const stats = this.calculateSizeStats();
        
        let html = `
            <div class="uniform-stats">
                <h2>📊 Statistiques par Tailles</h2>
                
                <!-- Répartition des tailles -->
                <div class="size-distribution">
                    <h3>Répartition des tailles</h3>
                    <div class="size-chart">
                        ${stats.sizeDistribution.map(item => `
                            <div class="size-bar">
                                <div class="size-label">${item.size}</div>
                                <div class="size-bar-container">
                                    <div class="size-bar-fill" style="width: ${item.percentage}%"></div>
                                    <div class="size-count">${item.count}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Statistiques par catégorie -->
                <div class="category-stats">
                    <h3>Statistiques par catégorie</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Catégorie</th>
                                <th>Plus petite taille</th>
                                <th>Plus grande taille</th>
                                <th>Taille moyenne</th>
                                <th>Quantité</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${stats.byCategory.map(cat => `
                                <tr>
                                    <td>${this.getCategoryText(cat.category)}</td>
                                    <td>${cat.minSize}</td>
                                    <td>${cat.maxSize}</td>
                                    <td>${cat.avgSize}</td>
                                    <td>${cat.quantity}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <!-- Besoins par taille -->
                <div class="needs-analysis">
                    <h3>Analyse des besoins</h3>
                    ${this.generateNeedsAnalysis()}
                </div>
            </div>
        `;
        
        UIManager.showPopup("📊 Statistiques par Tailles", html, `
            <button class="btn-secondary" onclick="UIManager.hidePopup()">
                Fermer
            </button>
        `);
    },
    
    showUniformDeadlines: function() {
        const deadlines = this.getUpcomingDeadlines();
        
        let html = `
            <div class="uniform-deadlines">
                <h2>📅 Échéances & Renouvellements</h2>
                
                <!-- Filtres -->
                <div class="deadline-filters">
                    <select id="deadline-filter" class="form-input" onchange="UniformsModule.filterDeadlines()">
                        <option value="30">Prochains 30 jours</option>
                        <option value="60">Prochains 60 jours</option>
                        <option value="90">Prochains 90 jours</option>
                        <option value="expired">Déjà expirés</option>
                        <option value="all">Toutes les échéances</option>
                    </select>
                </div>
                
                <!-- Liste des échéances -->
                <div class="deadlines-list">
                    ${this.generateDeadlinesList(deadlines)}
                </div>
                
                <!-- Actions groupées -->
                <div class="deadline-actions">
                    <h3>Actions groupées</h3>
                    <div class="action-buttons">
                        <button class="btn-sm" onclick="UniformsModule.generateRenewalOrders()">
                            📝 Générer commandes de renouvellement
                        </button>
                        <button class="btn-sm" onclick="UniformsModule.sendRenewalReminders()">
                            📧 Envoyer rappels
                        </button>
                        <button class="btn-sm" onclick="UniformsModule.markAsRenewed()">
                            ✅ Marquer comme renouvelé
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        UIManager.showPopup("📅 Échéances & Renouvellements", html, `
            <button class="btn-secondary" onclick="UIManager.hidePopup()">
                Fermer
            </button>
        `);
    },
    
    // ============ FONCTIONS UTILITAIRES ============
    
    loadUniformsData: function() {
        const savedData = DataManager.getUniforms();
        if (savedData) {
            this.uniforms = savedData.uniforms || [];
            this.uniformsHistory = savedData.history || [];
        }
    },
    
    saveUniformsData: function() {
        const data = {
            uniforms: this.uniforms,
            history: this.uniformsHistory
        };
        DataManager.saveUniforms(data);
    },
    
    getUniforms: function() {
        return this.uniforms;
    },
    
    getCategoryText: function(category) {
        const categories = {
            'tenue_complete': 'Tenue complète',
            'veste': 'Veste',
            'pantalon': 'Pantalon',
            'chemise': 'Chemise',
            'chaussures': 'Chaussures',
            'casquette': 'Casquette/Béret',
            'ceinture': 'Ceinture',
            'accessoire': 'Accessoire',
            'autre': 'Autre'
        };
        return categories[category] || category;
    },
    
    getCategoryColor: function(category) {
        const colors = {
            'tenue_complete': '#3498db',
            'veste': '#e74c3c',
            'pantalon': '#2ecc71',
            'chemise': '#f39c12',
            'chaussures': '#9b59b6',
            'casquette': '#1abc9c',
            'ceinture': '#34495e',
            'accessoire': '#7f8c8d',
            'autre': '#95a5a6'
        };
        return colors[category] || '#95a5a6';
    },
    
    getStatusText: function(status) {
        const statuses = {
            'in_stock': 'En stock',
            'assigned': 'Attribué',
            'in_use': 'En utilisation',
            'maintenance': 'Maintenance',
            'expired': 'Périmé',
            'lost': 'Perdu',
            'damaged': 'Endommagé'
        };
        return statuses[status] || status;
    },
    
    calculateUniformStats: function() {
        const uniforms = this.uniforms;
        
        const stats = {
            totalUniforms: uniforms.length,
            assignedUniforms: uniforms.filter(u => u.status === 'assigned' || u.status === 'in_use').length,
            inStock: uniforms.filter(u => u.status === 'in_stock').length,
            pendingDelivery: uniforms.filter(u => u.status === 'ordered').length,
            nearExpiry: this.getUpcomingDeadlines(30).length,
            totalCost: uniforms.reduce((sum, u) => sum + (u.price || 0), 0)
        };
        
        return stats;
    },
    
    generateDeadlineAlerts: function() {
        const deadlines = this.getUpcomingDeadlines(30);
        
        if (deadlines.length === 0) {
            return '<div class="alert alert-success">Aucune échéance dans les 30 prochains jours</div>';
        }
        
        return deadlines.map(deadline => `
            <div class="alert alert-warning">
                <strong>${deadline.code}</strong> - ${deadline.name}<br>
                <small>Expire le ${Utilities.formatDate(deadline.expiryDate)}</small>
            </div>
        `).join('');
    },
    
    getUpcomingDeadlines: function(days = 30) {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + days);
        
        return this.uniforms.filter(uniform => {
            if (!uniform.expiryDate) return false;
            
            const expiryDate = new Date(uniform.expiryDate);
            return expiryDate >= today && expiryDate <= futureDate;
        });
    },
    
    // ============ FONCTIONS À COMPLÉTER ============
    
    showBulkAssignment: function() {
        UIManager.showNotification('Attribution groupée en développement', 'info');
    },
    
    showInventoryManagement: function() {
        UIManager.showNotification('Gestion des stocks en développement', 'info');
    },
    
    filterUniforms: function() {
        // À implémenter
        UIManager.showNotification('Filtrage en développement', 'info');
    },
    
    recordAssignmentChange: function(uniformId, oldAgent, newAgent) {
        // Enregistrer le changement dans l'historique
        const record = {
            uniformId: uniformId,
            oldAgent: oldAgent,
            newAgent: newAgent,
            changedAt: new Date().toISOString(),
            changedBy: 'user'
        };
        this.uniformsHistory.push(record);
    },
    
    generateRecentAssignments: function() {
        const recent = this.uniformsHistory.slice(0, 10);
        
        if (recent.length === 0) {
            return '<div class="empty-state">Aucune attribution récente</div>';
        }
        
        return `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Tenue</th>
                        <th>Agent</th>
                        <th>Par</th>
                    </tr>
                </thead>
                <tbody>
                    ${recent.map(record => `
                        <tr>
                            <td>${Utilities.formatDate(record.assignedAt || record.changedAt)}</td>
                            <td>${record.uniformCode || 'N/A'}</td>
                            <td>${record.agentName || record.newAgent || 'N/A'}</td>
                            <td>${record.assignedBy || record.changedBy || 'N/A'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },
    
    generateAssignedUniformsList: function() {
        const assigned = this.uniforms.filter(u => u.assignedTo);
        
        if (assigned.length === 0) {
            return '<div class="empty-state">Aucune tenue attribuée</div>';
        }
        
        return `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Tenue</th>
                        <th>Agent</th>
                        <th>Date attribution</th>
                        <th>Date échéance</th>
                        <th>Statut</th>
                    </tr>
                </thead>
                <tbody>
                    ${assigned.map(uniform => {
                        const agent = DataManager.getAgents().find(a => a.code === uniform.assignedTo);
                        return `
                            <tr>
                                <td>${uniform.code} - ${uniform.name}</td>
                                <td>${agent ? `${agent.nom} ${agent.prenom}` : uniform.assignedTo}</td>
                                <td>${Utilities.formatDate(uniform.assignmentDate)}</td>
                                <td>${Utilities.formatDate(uniform.expiryDate)}</td>
                                <td><span class="badge badge-${uniform.status}">${this.getStatusText(uniform.status)}</span></td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    },
    
    sendAssignmentNotification: function(agent, uniform) {
        // À implémenter : envoi d'email de notification
        console.log(`Notification envoyée à ${agent.nom} ${agent.prenom} pour la tenue ${uniform.code}`);
    },
    
    generateUniformReport: function() {
        const uniforms = this.uniforms;
        
        // Group by category
        const byCategory = {};
        uniforms.forEach(uniform => {
            const category = uniform.category || 'autre';
            if (!byCategory[category]) {
                byCategory[category] = {
                    category: category,
                    quantity: 0,
                    assigned: 0,
                    inStock: 0,
                    value: 0
                };
            }
            
            byCategory[category].quantity++;
            byCategory[category].value += uniform.price || 0;
            
            if (uniform.status === 'assigned' || uniform.status === 'in_use') {
                byCategory[category].assigned++;
            } else if (uniform.status === 'in_stock') {
                byCategory[category].inStock++;
            }
        });
        
        const report = {
            totalUniforms: uniforms.length,
            assignedUniforms: uniforms.filter(u => u.status === 'assigned' || u.status === 'in_use').length,
            totalValue: uniforms.reduce((sum, u) => sum + (u.price || 0), 0),
            utilizationRate: Math.round((uniforms.filter(u => u.status === 'assigned' || u.status === 'in_use').length / uniforms.length) * 100) || 0,
            byCategory: Object.values(byCategory)
        };
        
        return report;
    },
    
    generateRenewalList: function() {
        const renewals = this.getUpcomingDeadlines(30);
        
        if (renewals.length === 0) {
            return '<div class="empty-state">Aucun renouvellement prévu dans les 30 jours</div>';
        }
        
        return `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Tenue</th>
                        <th>Agent</th>
                        <th>Date expiration</th>
                        <th>Jours restants</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${renewals.map(uniform => {
                        const expiryDate = new Date(uniform.expiryDate);
                        const today = new Date();
                        const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                        
                        return `
                            <tr>
                                <td>${uniform.code} - ${uniform.name}</td>
                                <td>${uniform.assignedTo || 'Non attribué'}</td>
                                <td>${Utilities.formatDate(uniform.expiryDate)}</td>
                                <td>${daysLeft} jours</td>
                                <td>
                                    <button class="btn-sm" onclick="UniformsModule.renewUniform('${uniform.id}')">
                                        🔄 Renouveler
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    },
    
    calculateSizeStats: function() {
        const uniforms = this.uniforms;
        
        // Distribution par taille
        const sizeCount = {};
        uniforms.forEach(uniform => {
            const size = uniform.size || 'Non définie';
            sizeCount[size] = (sizeCount[size] || 0) + 1;
        });
        
        const total = uniforms.length;
        const sizeDistribution = Object.entries(sizeCount).map(([size, count]) => ({
            size: size,
            count: count,
            percentage: total > 0 ? Math.round((count / total) * 100) : 0
        }));
        
        // Statistiques par catégorie
        const byCategory = {};
        uniforms.forEach(uniform => {
            const category = uniform.category || 'autre';
            if (!byCategory[category]) {
                byCategory[category] = {
                    category: category,
                    sizes: [],
                    quantity: 0
                };
            }
            byCategory[category].sizes.push(uniform.size);
            byCategory[category].quantity++;
        });
        
        const categoryStats = Object.values(byCategory).map(cat => ({
            category: cat.category,
            minSize: cat.sizes.length > 0 ? Math.min(...cat.sizes.map(s => this.getSizeValue(s))) : 'N/A',
            maxSize: cat.sizes.length > 0 ? Math.max(...cat.sizes.map(s => this.getSizeValue(s))) : 'N/A',
            avgSize: cat.sizes.length > 0 ? this.calculateAverageSize(cat.sizes) : 'N/A',
            quantity: cat.quantity
        }));
        
        return {
            sizeDistribution: sizeDistribution,
            byCategory: categoryStats
        };
    },
    
    getSizeValue: function(size) {
        const sizeValues = {
            'XS': 1, 'S': 2, 'M': 3, 'L': 4, 'XL': 5, 'XXL': 6, 'XXXL': 7
        };
        return sizeValues[size] || 0;
    },
    
    calculateAverageSize: function(sizes) {
        const values = sizes.map(s => this.getSizeValue(s)).filter(v => v > 0);
        if (values.length === 0) return 'N/A';
        
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const sizeKeys = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
        return sizeKeys[Math.round(avg) - 1] || 'N/A';
    },
    
    generateNeedsAnalysis: function() {
        // À implémenter : analyse des besoins par taille
        return '<div class="empty-state">Analyse des besoins en développement</div>';
    },
    
    generateDeadlinesList: function(deadlines) {
        if (deadlines.length === 0) {
            return '<div class="empty-state">Aucune échéance trouvée</div>';
        }
        
        return `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Tenue</th>
                        <th>Agent</th>
                        <th>Date expiration</th>
                        <th>Jours restants</th>
                        <th>Statut</th>
                    </tr>
                </thead>
                <tbody>
                    ${deadlines.map(uniform => {
                        const expiryDate = new Date(uniform.expiryDate);
                        const today = new Date();
                        const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                        const status = daysLeft < 0 ? 'expired' : daysLeft <= 7 ? 'urgent' : daysLeft <= 30 ? 'warning' : 'normal';
                        
                        return `
                            <tr class="deadline-${status}">
                                <td>${uniform.code} - ${uniform.name}</td>
                                <td>${uniform.assignedTo || 'Non attribué'}</td>
                                <td>${Utilities.formatDate(uniform.expiryDate)}</td>
                                <td>${daysLeft} jours</td>
                                <td><span class="badge badge-${status}">${this.getDeadlineStatusText(status)}</span></td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    },
    
    getDeadlineStatusText: function(status) {
        const texts = {
            'expired': 'Expiré',
            'urgent': 'Urgent (< 7 jours)',
            'warning': 'Attention (< 30 jours)',
            'normal': 'Normal'
        };
        return texts[status] || status;
    },
    
    filterDeadlines: function() {
        // À implémenter
        UIManager.showNotification('Filtrage des échéances en développement', 'info');
    },
    
    generateRenewalOrders: function() {
        UIManager.showNotification('Génération des commandes en développement', 'info');
    },
    
    sendRenewalReminders: function() {
        UIManager.showNotification('Envoi des rappels en développement', 'info');
    },
    
    markAsRenewed: function() {
        UIManager.showNotification('Marquage comme renouvelé en développement', 'info');
    },
    
    renewUniform: function(uniformId) {
        UIManager.showNotification('Renouvellement de tenue en développement', 'info');
    },
    
    exportUniformReport: function(format) {
        UIManager.showNotification(`Export ${format} en développement`, 'info');
    },
    
    printUniformReport: function() {
        UIManager.showNotification('Impression en développement', 'info');
    }
};