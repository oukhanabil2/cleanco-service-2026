// MODULE CODES PANIQUE

function showPanicCodesList() {
    if (!panicCodes || panicCodes.length === 0) {
        let html = `<div class="info-section"><h3>Codes Panique</h3><p style="text-align:center; color:#7f8c8d; padding:20px;">Aucun code panique enregistré</p></div>`;
        openPopup("🚨 Codes Panique", html, `
            <button class="popup-button green" onclick="showAddPanicCodeForm()">➕ Ajouter</button>
            <button class="popup-button gray" onclick="displayPanicCodesMenu()">Retour</button>
        `);
        return;
    }
    
    let html = `
        <div class="info-section">
            <h3>Liste des Codes Panique</h3>
            <input type="text" id="searchPanicCode" placeholder="Rechercher agent ou code..." 
                   style="width:100%; padding:10px; margin-bottom:15px; border-radius:5px; border:none;"
                   onkeyup="filterPanicCodes()">
            <table class="classement-table">
                <thead>
                    <tr>
                        <th>Agent</th>
                        <th>Code</th>
                        <th>Poste</th>
                        <th>Date Création</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${panicCodes.map(code => {
                        const agent = agents.find(a => a.code === code.agent_code);
                        const agentName = agent ? `${agent.nom} ${agent.prenom}` : code.agent_code;
                        return `
                            <tr>
                                <td>${agentName}<br><small>${code.agent_code}</small></td>
                                <td><strong style="color:#e74c3c;">${code.code}</strong></td>
                                <td>${code.poste || 'Non spécifié'}</td>
                                <td>${new Date(code.created_at).toLocaleDateString('fr-FR')}</td>
                                <td style="white-space:nowrap;">
                                    <button class="action-btn small blue" onclick="showEditPanicCode('${code.agent_code}')">✏️</button>
                                    <button class="action-btn small red" onclick="deletePanicCode('${code.agent_code}')">🗑️</button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    openPopup("🚨 Codes Panique", html, `
        <button class="popup-button green" onclick="showAddPanicCodeForm()">➕ Ajouter</button>
        <button class="popup-button blue" onclick="exportPanicCodes()">📤 Exporter</button>
        <button class="popup-button gray" onclick="displayPanicCodesMenu()">Retour</button>
    `);
}

function showAddPanicCodeForm() {
    let html = `
        <div class="info-section">
            <h3>Ajouter un Code Panique</h3>
            <div class="form-group">
                <label>Agent *</label>
                <select id="panicAgent" class="form-input" required>
                    <option value="">Sélectionner un agent</option>
                    ${agents.filter(a => a.statut === 'actif').map(a => 
                        `<option value="${a.code}">${a.nom} ${a.prenom} (${a.code}) - Groupe ${a.groupe}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Code Panique *</label>
                <input type="text" id="panicCode" class="form-input" required placeholder="Ex: PANIC123" maxlength="20">
                <small style="color:#7f8c8d;">Code unique pour les situations d'urgence</small>
            </div>
            <div class="form-group">
                <label>Poste/Nom de poste</label>
                <input type="text" id="panicPoste" class="form-input" placeholder="Ex: Poste de commandement central">
            </div>
            <div class="form-group">
                <label>Commentaire (optionnel)</label>
                <textarea id="panicComment" class="form-input" rows="3" placeholder="Informations supplémentaires..."></textarea>
            </div>
            <div class="form-group">
                <label>Date d'activation</label>
                <input type="date" id="panicDate" class="form-input" value="${new Date().toISOString().split('T')[0]}">
            </div>
            <div style="padding:15px; background:#2c3e50; border-radius:5px; margin-top:20px;">
                <h4 style="margin-top:0; color:#e74c3c;">⚠️ Sécurité</h4>
                <p style="font-size:0.9em; margin:0;">Ce code sera utilisé uniquement en situation d'urgence. Assurez-vous qu'il reste confidentiel.</p>
            </div>
        </div>
    `;
    
    openPopup("➕ Ajouter Code Panique", html, `
        <button class="popup-button green" onclick="savePanicCode()">🔐 Enregistrer</button>
        <button class="popup-button gray" onclick="showPanicCodesList()">Annuler</button>
    `);
}

function savePanicCode() {
    const agentCode = document.getElementById('panicAgent').value;
    const code = document.getElementById('panicCode').value.toUpperCase();
    const poste = document.getElementById('panicPoste').value;
    const comment = document.getElementById('panicComment').value;
    const date = document.getElementById('panicDate').value;
    
    if (!agentCode || !code) {
        showSnackbar("⚠️ Veuillez remplir les champs obligatoires");
        return;
    }
    
    const existingIndex = panicCodes.findIndex(p => p.agent_code === agentCode);
    const panicCode = {
        agent_code: agentCode,
        code: code,
        poste: poste,
        comment: comment,
        created_at: date || new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
    };
    
    if (existingIndex !== -1) {
        panicCodes[existingIndex] = panicCode;
        showSnackbar(`✅ Code panique mis à jour pour ${agentCode}`);
    } else {
        panicCodes.push(panicCode);
        showSnackbar(`✅ Code panique ajouté pour ${agentCode}`);
    }
    
    saveData();
    showPanicCodesList();
}

function exportPanicCodes() {
    if (!panicCodes || panicCodes.length === 0) {
        showSnackbar("ℹ️ Aucun code panique à exporter");
        return;
    }
    
    let csvContent = "Rapport des Codes Panique\n\n";
    csvContent += "Agent;Code Agent;Code Panique;Poste;Commentaire;Créé le;Mis à jour le\n";
    
    panicCodes.forEach(code => {
        const agent = agents.find(a => a.code === code.agent_code);
        const agentName = agent ? `${agent.nom} ${agent.prenom}` : code.agent_code;
        csvContent += `"${agentName}";${code.agent_code};${code.code};"${code.poste || ''}";"${code.comment || ''}";${code.created_at};${code.updated_at || ''}\n`;
    });
    
    downloadCSV(csvContent, `Codes_Panique_${new Date().toISOString().split('T')[0]}.csv`);
    showSnackbar(`✅ Fichier téléchargé`);
}

// Fonctions placeholder pour les options du menu
function showEditPanicCodeList() {
    showSnackbar("✏️ Modifier Code Panique - Bientôt disponible");
}

function showDeletePanicCodeList() {
    showSnackbar("🗑️ Supprimer Code Panique - Bientôt disponible");
}

function showSearchPanicCode() {
    showSnackbar("🔍 Rechercher Code Panique - Bientôt disponible");
}

function showEditPanicCode(agentCode) {
    showSnackbar(`✏️ Modifier code panique pour ${agentCode} - Bientôt disponible`);
}

function deletePanicCode(agentCode) {
    if (confirm(`Supprimer le code panique de l'agent ${agentCode} ?`)) {
        const index = panicCodes.findIndex(p => p.agent_code === agentCode);
        if (index !== -1) {
            panicCodes.splice(index, 1);
            saveData();
            showSnackbar(`✅ Code panique supprimé pour ${agentCode}`);
            showPanicCodesList();
        }
    }
}

function filterPanicCodes() {
    const val = document.getElementById('searchPanicCode').value.toLowerCase();
    const filtered = panicCodes.filter(p => 
        p.agent_code.toLowerCase().includes(val) || 
        p.code.toLowerCase().includes(val)
    );
    
    let html = filtered.length === 0 ? 
        '<p style="text-align:center; color:#7f8c8d;">Aucun code panique trouvé</p>' :
        `
        <table class="classement-table">
            <thead>
                <tr>
                    <th>Agent</th>
                    <th>Code</th>
                    <th>Poste</th>
                    <th>Date Création</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${filtered.map(code => {
                    const agent = agents.find(a => a.code === code.agent_code);
                    const agentName = agent ? `${agent.nom} ${agent.prenom}` : code.agent_code;
                    return `
                        <tr>
                            <td>${agentName}<br><small>${code.agent_code}</small></td>
                            <td><strong style="color:#e74c3c;">${code.code}</strong></td>
                            <td>${code.poste || 'Non spécifié'}</td>
                            <td>${new Date(code.created_at).toLocaleDateString('fr-FR')}</td>
                            <td style="white-space:nowrap;">
                                <button class="action-btn small blue" onclick="showEditPanicCode('${code.agent_code}')">✏️</button>
                                <button class="action-btn small red" onclick="deletePanicCode('${code.agent_code}')">🗑️</button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
        `;
    
    document.querySelector('.popup-body').innerHTML = `
        <div class="info-section">
            <h3>Liste des Codes Panique</h3>
            <input type="text" id="searchPanicCode" placeholder="Rechercher agent ou code..." 
                   style="width:100%; padding:10px; margin-bottom:15px; border-radius:5px; border:none;"
                   onkeyup="filterPanicCodes()" value="${val}">
            ${html}
        </div>
    `;
}