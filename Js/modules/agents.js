// MODULE GESTION DES AGENTS

function displayAgentsList() {
    let html = `
        <div class="info-section">
            <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
                <input type="text" id="searchAgent" placeholder="Rechercher nom ou code..." 
                       style="width:70%; padding:10px; border-radius:5px; border:none;"
                       onkeyup="filterAgents()">
                <button class="popup-button blue" onclick="refreshAgentsList()">🔄</button>
            </div>
            <div id="list-container" style="margin-top:15px;">
                ${generateAgentsTable(agents)}
            </div>
        </div>
    `;
    openPopup("📋 Liste des Agents", html, `
        <button class="popup-button green" onclick="showAddAgentForm()">➕ Ajouter</button>
        <button class="popup-button gray" onclick="closePopup()">Fermer</button>
    `);
}

function generateAgentsTable(data) {
    if (data.length === 0) return '<p style="text-align:center; color:#7f8c8d;">Aucun agent trouvé</p>';
    
    return `
        <table class="classement-table">
            <thead>
                <tr>
                    <th>Code</th>
                    <th>Nom & Prénom</th>
                    <th>Groupe</th>
                    <th>Statut</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(a => `
                    <tr>
                        <td><strong>${a.code}</strong></td>
                        <td onclick="showAgentDetails('${a.code}')" style="cursor:pointer;">
                            ${a.nom} ${a.prenom}
                        </td>
                        <td>${a.groupe}</td>
                        <td><span class="status-badge ${a.statut === 'actif' ? 'active' : 'inactive'}">${a.statut}</span></td>
                        <td style="white-space:nowrap;">
                            <button class="action-btn small" onclick="showEditAgentForm('${a.code}')" title="Modifier">✏️</button>
                            <button class="action-btn small red" onclick="confirmDeleteAgent('${a.code}')" title="Supprimer">🗑️</button>
                            <button class="action-btn small blue" onclick="showAgentDetails('${a.code}')" title="Détails">👁️</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function showAgentDetails(code) {
    const a = agents.find(agent => agent.code === code);
    if (!a) return;
    
    const details = `
        <div class="info-section">
            <h3>Informations Personnelles</h3>
            <div class="info-item"><span class="info-label">Matricule:</span><span class="info-value">${a.matricule || 'N/A'}</span></div>
            <div class="info-item"><span class="info-label">CIN:</span><span class="info-value">${a.cin || 'N/A'}</span></div>
            <div class="info-item"><span class="info-label">Téléphone:</span><span class="info-value">${a.tel || 'N/A'}</span></div>
            <div class="info-item"><span class="info-label">Poste:</span><span class="info-value">${a.poste || 'N/A'}</span></div>
            <div class="info-item"><span class="info-label">Date d'entrée:</span><span class="info-value">${a.date_entree || 'N/A'}</span></div>
            <div class="info-item"><span class="info-label">Date de sortie:</span><span class="info-value">${a.date_sortie || 'Actif'}</span></div>
            
            <h3 style="margin-top:20px;">Actions Rapides</h3>
            <div style="display:flex; gap:10px; margin-top:10px;">
                <button class="popup-button small blue" onclick="showAgentPlanning('${a.code}')">📅 Planning</button>
                <button class="popup-button small green" onclick="showAgentStats('${a.code}')">📊 Stats</button>
                <button class="popup-button small orange" onclick="showAddLeaveForAgent('${a.code}')">🏖️ Congé</button>
            </div>
        </div>
    `;
    
    openPopup(`👤 Détails : ${a.nom} ${a.prenom}`, details, `
        <button class="popup-button green" onclick="showEditAgentForm('${a.code}')">✏️ Modifier</button>
        <button class="popup-button blue" onclick="displayAgentsList()">📋 Retour liste</button>
        <button class="popup-button gray" onclick="closePopup()">Fermer</button>
    `);
}

function showAddAgentForm() {
    const html = `
        <div class="info-section">
            <h3>Ajouter un nouvel agent</h3>
            <form id="addAgentForm" onsubmit="return addNewAgent(event)">
                <div class="form-group">
                    <label>Code Agent *</label>
                    <input type="text" id="agentCode" required placeholder="Ex: A01" class="form-input">
                </div>
                <div class="form-group">
                    <label>Nom *</label>
                    <input type="text" id="agentNom" required placeholder="Ex: Dupont" class="form-input">
                </div>
                <div class="form-group">
                    <label>Prénom *</label>
                    <input type="text" id="agentPrenom" required placeholder="Ex: Alice" class="form-input">
                </div>
                <div class="form-group">
                    <label>Groupe *</label>
                    <select id="agentGroupe" required class="form-input">
                        <option value="">Sélectionner</option>
                        <option value="A">Groupe A</option>
                        <option value="B">Groupe B</option>
                        <option value="C">Groupe C</option>
                        <option value="D">Groupe D</option>
                        <option value="E">Groupe E</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Matricule</label>
                    <input type="text" id="agentMatricule" placeholder="Ex: MAT001" class="form-input">
                </div>
                <div class="form-group">
                    <label>CIN</label>
                    <input type="text" id="agentCIN" placeholder="Ex: AA123456" class="form-input">
                </div>
                <div class="form-group">
                    <label>Téléphone</label>
                    <input type="tel" id="agentTel" placeholder="Ex: 0601-010101" class="form-input">
                </div>
                <div class="form-group">
                    <label>Poste</label>
                    <input type="text" id="agentPoste" placeholder="Ex: Agent de sécurité" class="form-input">
                </div>
                <div class="form-group">
                    <label>Date d'entrée</label>
                    <input type="date" id="agentDateEntree" class="form-input" value="${new Date().toISOString().split('T')[0]}">
                </div>
            </form>
        </div>
    `;
    
    openPopup("➕ Ajouter un Agent", html, `
        <button class="popup-button green" onclick="document.getElementById('addAgentForm').submit()">💾 Enregistrer</button>
        <button class="popup-button gray" onclick="displayAgentsManagementMenu()">Annuler</button>
    `);
}

function addNewAgent(event) {
    if (event) event.preventDefault();
    const code = document.getElementById('agentCode').value.toUpperCase();
    const nom = document.getElementById('agentNom').value;
    const prenom = document.getElementById('agentPrenom').value;
    const groupe = document.getElementById('agentGroupe').value;
    
    if (!code || !nom || !prenom || !groupe) {
        showSnackbar("⚠️ Veuillez remplir les champs obligatoires (*)");
        return false;
    }
    
    if (agents.find(a => a.code === code)) {
        showSnackbar(`⚠️ Le code ${code} existe déjà`);
        return false;
    }
    
    agents.push({
        code: code, nom: nom, prenom: prenom, groupe: groupe,
        matricule: document.getElementById('agentMatricule').value || '',
        cin: document.getElementById('agentCIN').value || '',
        tel: document.getElementById('agentTel').value || '',
        poste: document.getElementById('agentPoste').value || '',
        date_entree: document.getElementById('agentDateEntree').value || new Date().toISOString().split('T')[0],
        date_sortie: null, statut: 'actif'
    });
    
    saveData();
    showSnackbar(`✅ Agent ${code} ajouté avec succès`);
    displayAgentsList();
    closePopup();
    return false;
}

function showEditAgentList() {
    if (agents.length === 0) {
        showSnackbar("⚠️ Aucun agent à modifier");
        return;
    }
    
    let html = `
        <div class="info-section">
            <h3>Sélectionnez un agent à modifier</h3>
            <input type="text" id="searchEditAgent" placeholder="Rechercher..." 
                   style="width:100%; padding:10px; margin-bottom:15px; border-radius:5px; border:none;"
                   onkeyup="filterEditAgents()">
            <div id="edit-list-container">
                ${generateEditAgentsList()}
            </div>
        </div>
    `;
    
    openPopup("✏️ Modifier un Agent", html, `
        <button class="popup-button gray" onclick="closePopup()">Annuler</button>
    `);
}

function generateEditAgentsList() {
    return `
        <table class="classement-table">
            <thead><tr><th>Code</th><th>Nom & Prénom</th><th>Groupe</th><th>Action</th></tr></thead>
            <tbody>
                ${agents.map(a => `
                    <tr>
                        <td>${a.code}</td>
                        <td>${a.nom} ${a.prenom}</td>
                        <td>${a.groupe}</td>
                        <td><button class="popup-button small blue" onclick="showEditAgentForm('${a.code}')">Modifier</button></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function showEditAgentForm(code) {
    const agent = agents.find(a => a.code === code);
    if (!agent) {
        showSnackbar("⚠️ Agent non trouvé");
        return;
    }
    
    const html = `
        <div class="info-section">
            <h3>Modifier l'agent ${agent.code}</h3>
            <form id="editAgentForm" onsubmit="return updateAgent('${code}', event)">
                <div class="form-group">
                    <label>Code Agent</label>
                    <input type="text" value="${agent.code}" readonly class="form-input" style="background:#34495e;">
                </div>
                <div class="form-group">
                    <label>Nom *</label>
                    <input type="text" id="editNom" value="${agent.nom}" required class="form-input">
                </div>
                <div class="form-group">
                    <label>Prénom *</label>
                    <input type="text" id="editPrenom" value="${agent.prenom}" required class="form-input">
                </div>
                <div class="form-group">
                    <label>Groupe *</label>
                    <select id="editGroupe" required class="form-input">
                        <option value="A" ${agent.groupe === 'A' ? 'selected' : ''}>Groupe A</option>
                        <option value="B" ${agent.groupe === 'B' ? 'selected' : ''}>Groupe B</option>
                        <option value="C" ${agent.groupe === 'C' ? 'selected' : ''}>Groupe C</option>
                        <option value="D" ${agent.groupe === 'D' ? 'selected' : ''}>Groupe D</option>
                        <option value="E" ${agent.groupe === 'E' ? 'selected' : ''}>Groupe E</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Matricule</label>
                    <input type="text" id="editMatricule" value="${agent.matricule || ''}" class="form-input">
                </div>
                <div class="form-group">
                    <label>CIN</label>
                    <input type="text" id="editCIN" value="${agent.cin || ''}" class="form-input">
                </div>
                <div class="form-group">
                    <label>Téléphone</label>
                    <input type="tel" id="editTel" value="${agent.tel || ''}" class="form-input">
                </div>
                <div class="form-group">
                    <label>Poste</label>
                    <input type="text" id="editPoste" value="${agent.poste || ''}" class="form-input">
                </div>
                <div class="form-group">
                    <label>Date d'entrée</label>
                    <input type="date" id="editDateEntree" value="${agent.date_entree || ''}" class="form-input">
                </div>
                <div class="form-group">
                    <label>Date de sortie</label>
                    <input type="date" id="editDateSortie" value="${agent.date_sortie || ''}" class="form-input">
                    <small style="color:#7f8c8d;">Remplir seulement si l'agent n'est plus actif</small>
                </div>
            </form>
        </div>
    `;
    
    openPopup(`✏️ Modifier ${agent.code}`, html, `
        <button class="popup-button green" onclick="document.getElementById('editAgentForm').submit()">💾 Enregistrer</button>
        <button class="popup-button blue" onclick="showEditAgentList()">↩️ Retour</button>
        <button class="popup-button gray" onclick="closePopup()">Annuler</button>
    `);
}

function updateAgent(oldCode, event) {
    if (event) event.preventDefault();
    const agentIndex = agents.findIndex(a => a.code === oldCode);
    if (agentIndex === -1) {
        showSnackbar("⚠️ Agent non trouvé");
        return false;
    }
    
    agents[agentIndex] = {
        ...agents[agentIndex],
        nom: document.getElementById('editNom').value,
        prenom: document.getElementById('editPrenom').value,
        groupe: document.getElementById('editGroupe').value,
        matricule: document.getElementById('editMatricule').value,
        cin: document.getElementById('editCIN').value,
        tel: document.getElementById('editTel').value,
        poste: document.getElementById('editPoste').value,
        date_entree: document.getElementById('editDateEntree').value,
        date_sortie: document.getElementById('editDateSortie').value || null,
        statut: document.getElementById('editDateSortie').value ? 'inactif' : 'actif'
    };
    
    saveData();
    showSnackbar(`✅ Agent ${oldCode} modifié avec succès`);
    displayAgentsList();
    closePopup();
    return false;
}

function showDeleteAgentList() {
    const activeAgents = agents.filter(a => a.statut === 'actif');
    if (activeAgents.length === 0) {
        showSnackbar("⚠️ Aucun agent actif à supprimer");
        return;
    }
    
    let html = `
        <div class="info-section">
            <h3>Sélectionnez un agent à supprimer (marquer comme inactif)</h3>
            <p style="color:#e74c3c; font-size:0.9em;">⚠️ Attention: Cette action marquera l'agent comme inactif mais conservera ses données historiques.</p>
            <input type="text" id="searchDeleteAgent" placeholder="Rechercher..." 
                   style="width:100%; padding:10px; margin:15px 0; border-radius:5px; border:none;"
                   onkeyup="filterDeleteAgents()">
            <div id="delete-list-container">
                ${generateDeleteAgentsList(activeAgents)}
            </div>
        </div>
    `;
    
    openPopup("🗑️ Supprimer un Agent", html, `
        <button class="popup-button gray" onclick="closePopup()">Annuler</button>
    `);
}

function generateDeleteAgentsList(agentsList) {
    return `
        <table class="classement-table">
            <thead><tr><th>Code</th><th>Nom & Prénom</th><th>Groupe</th><th>Action</th></tr></thead>
            <tbody>
                ${agentsList.map(a => `
                    <tr>
                        <td>${a.code}</td>
                        <td>${a.nom} ${a.prenom}</td>
                        <td>${a.groupe}</td>
                        <td><button class="popup-button small red" onclick="confirmDeleteAgent('${a.code}')">Supprimer</button></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function confirmDeleteAgent(code) {
    const agent = agents.find(a => a.code === code);
    if (!agent) return;
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'agent ${code} (${agent.nom} ${agent.prenom}) ?\n\nCette action marquera l'agent comme inactif.`)) {
        const agentIndex = agents.findIndex(a => a.code === code);
        if (agentIndex !== -1) {
            agents[agentIndex].date_sortie = new Date().toISOString().split('T')[0];
            agents[agentIndex].statut = 'inactif';
            saveData();
            showSnackbar(`✅ Agent ${code} marqué comme inactif`);
            displayAgentsList();
            closePopup();
        }
    }
}

function filterAgents() {
    const val = document.getElementById('searchAgent').value.toLowerCase();
    const filtered = agents.filter(a => 
        a.nom.toLowerCase().includes(val) || 
        a.code.toLowerCase().includes(val) ||
        a.prenom.toLowerCase().includes(val)
    );
    document.getElementById('list-container').innerHTML = generateAgentsTable(filtered);
}

function filterEditAgents() {
    const val = document.getElementById('searchEditAgent').value.toLowerCase();
    const filtered = agents.filter(a => 
        a.nom.toLowerCase().includes(val) || 
        a.code.toLowerCase().includes(val) ||
        a.prenom.toLowerCase().includes(val)
    );
    document.getElementById('edit-list-container').innerHTML = generateEditAgentsList(filtered);
}

function filterDeleteAgents() {
    const val = document.getElementById('searchDeleteAgent').value.toLowerCase();
    const activeAgents = agents.filter(a => a.statut === 'actif');
    const filtered = activeAgents.filter(a => 
        a.nom.toLowerCase().includes(val) || 
        a.code.toLowerCase().includes(val) ||
        a.prenom.toLowerCase().includes(val)
    );
    document.getElementById('delete-list-container').innerHTML = generateDeleteAgentsList(filtered);
}

function refreshAgentsList() {
    displayAgentsList();
}

function initializeTestDataWithConfirm() {
    if (confirm("Voulez-vous initialiser avec des données de test ?\n\n⚠️ Attention : Cela écrasera les données existantes.")) {
        initializeTestData();
        showSnackbar("✅ Données de test initialisées");
        displayAgentsManagementMenu();
    }
}