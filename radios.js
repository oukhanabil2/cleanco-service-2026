// MODULE GESTION DES RADIOS

function showRadiosList() {
    if (!radios || radios.length === 0) {
        let html = `<div class="info-section"><h3>Gestion des Radios</h3><p style="text-align:center; color:#7f8c8d; padding:20px;">Aucune radio enregistrée</p></div>`;
        openPopup("📻 Radios", html, `
            <button class="popup-button green" onclick="showAddRadioForm()">➕ Ajouter</button>
            <button class="popup-button gray" onclick="displayRadiosMenu()">Retour</button>
        `);
        return;
    }
    
    const stats = {
        total: radios.length,
        disponible: radios.filter(r => r.statut === 'DISPONIBLE').length,
        attribuee: radios.filter(r => r.statut === 'ATTRIBUÉE').length,
        hs: radios.filter(r => r.statut === 'HS').length,
        reparation: radios.filter(r => r.statut === 'RÉPARATION').length
    };
    
    let html = `
        <div class="info-section">
            <h3>Inventaire des Radios</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-bottom: 20px;">
                <div style="text-align: center; padding: 10px; background: #2c3e50; border-radius: 5px;">
                    <div style="font-size: 1.5em; font-weight: bold; color: #3498db;">${stats.total}</div>
                    <div style="font-size: 0.9em; color: #bdc3c7;">Total</div>
                </div>
                <div style="text-align: center; padding: 10px; background: #27ae60; border-radius: 5px;">
                    <div style="font-size: 1.5em; font-weight: bold; color: white;">${stats.disponible}</div>
                    <div style="font-size: 0.9em; color: white;">Disponibles</div>
                </div>
                <div style="text-align: center; padding: 10px; background: #f39c12; border-radius: 5px;">
                    <div style="font-size: 1.5em; font-weight: bold; color: white;">${stats.attribuee}</div>
                    <div style="font-size: 0.9em; color: white;">Attribuées</div>
                </div>
                <div style="text-align: center; padding: 10px; background: #e74c3c; border-radius: 5px;">
                    <div style="font-size: 1.5em; font-weight: bold; color: white;">${stats.hs + stats.reparation}</div>
                    <div style="font-size: 0.9em; color: white;">Indisponibles</div>
                </div>
            </div>
            <input type="text" id="searchRadio" placeholder="Rechercher radio ou modèle..." 
                   style="width:100%; padding:10px; margin-bottom:15px; border-radius:5px; border:none;"
                   onkeyup="filterRadios()">
            <table class="classement-table">
                <thead>
                    <tr>
                        <th>ID Radio</th>
                        <th>Modèle</th>
                        <th>Statut</th>
                        <th>Attribuée à</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${radios.map(radio => {
                        let statusColor = '#7f8c8d';
                        switch(radio.statut) {
                            case 'DISPONIBLE': statusColor = '#27ae60'; break;
                            case 'ATTRIBUÉE': statusColor = '#f39c12'; break;
                            case 'HS': statusColor = '#e74c3c'; break;
                            case 'RÉPARATION': statusColor = '#e67e22'; break;
                        }
                        const attributedTo = radio.attributed_to ? agents.find(a => a.code === radio.attributed_to) : null;
                        return `
                            <tr>
                                <td><strong>${radio.id}</strong></td>
                                <td>${radio.modele}</td>
                                <td><span style="background-color:${statusColor}; color:white; padding:2px 8px; border-radius:3px;">${radio.statut}</span></td>
                                <td>${attributedTo ? `${attributedTo.nom} ${attributedTo.prenom}<br><small>${radio.attributed_to}</small>` : '---'}</td>
                                <td style="white-space:nowrap;">
                                    ${radio.statut === 'DISPONIBLE' ? 
                                        `<button class="action-btn small green" onclick="showAssignRadioForm('${radio.id}')">📲</button>` : 
                                        radio.statut === 'ATTRIBUÉE' ?
                                        `<button class="action-btn small blue" onclick="showReturnRadioForm('${radio.id}')">🔄</button>` : ''}
                                    <button class="action-btn small blue" onclick="showEditRadioForm('${radio.id}')">✏️</button>
                                    <button class="action-btn small red" onclick="deleteRadio('${radio.id}')">🗑️</button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    openPopup("📻 Gestion des Radios", html, `
        <button class="popup-button green" onclick="showAddRadioForm()">➕ Ajouter</button>
        <button class="popup-button blue" onclick="showRadiosStatus()">📊 Statut</button>
        <button class="popup-button gray" onclick="displayRadiosMenu()">Retour</button>
    `);
}

function showAddRadioForm() {
    let html = `
        <div class="info-section">
            <h3>Ajouter une Radio</h3>
            <div class="form-group">
                <label>ID Radio *</label>
                <input type="text" id="radioId" class="form-input" required placeholder="Ex: RAD001" maxlength="20">
                <small style="color:#7f8c8d;">Identifiant unique de la radio</small>
            </div>
            <div class="form-group">
                <label>Modèle *</label>
                <input type="text" id="radioModele" class="form-input" required placeholder="Ex: Motorola XPR 7550">
            </div>
            <div class="form-group">
                <label>Numéro de série</label>
                <input type="text" id="radioSerial" class="form-input" placeholder="Ex: SN123456789">
            </div>
            <div class="form-group">
                <label>Statut *</label>
                <select id="radioStatut" class="form-input" required>
                    <option value="DISPONIBLE">Disponible</option>
                    <option value="ATTRIBUÉE">Attribuée</option>
                    <option value="HS">Hors Service (HS)</option>
                    <option value="RÉPARATION">En réparation</option>
                </select>
            </div>
            <div id="attributionSection" style="display:none;">
                <div class="form-group">
                    <label>Attribuer à l'agent</label>
                    <select id="radioAgent" class="form-input">
                        <option value="">Non attribuée</option>
                        ${agents.filter(a => a.statut === 'actif').map(a => 
                            `<option value="${a.code}">${a.nom} ${a.prenom} (${a.code})</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Date d'attribution</label>
                    <input type="date" id="radioAttributionDate" class="form-input" value="${new Date().toISOString().split('T')[0]}">
                </div>
            </div>
            <div class="form-group">
                <label>Commentaire</label>
                <textarea id="radioComment" class="form-input" rows="3" placeholder="État, accessoires, remarques..."></textarea>
            </div>
            <div class="form-group">
                <label>Date d'acquisition</label>
                <input type="date" id="radioAcquisitionDate" class="form-input" value="${new Date().toISOString().split('T')[0]}">
            </div>
        </div>
    `;
    
    openPopup("➕ Ajouter Radio", html, `
        <button class="popup-button green" onclick="saveRadio()">💾 Enregistrer</button>
        <button class="popup-button gray" onclick="showRadiosList()">Annuler</button>
    `);
    
    document.getElementById('radioStatut').addEventListener('change', function() {
        const statut = this.value;
        document.getElementById('attributionSection').style.display = statut === 'ATTRIBUÉE' ? 'block' : 'none';
    });
}

function saveRadio() {
    const id = document.getElementById('radioId').value.toUpperCase();
    const modele = document.getElementById('radioModele').value;
    const serial = document.getElementById('radioSerial').value;
    const statut = document.getElementById('radioStatut').value;
    const comment = document.getElementById('radioComment').value;
    const acquisitionDate = document.getElementById('radioAcquisitionDate').value;
    
    if (!id || !modele || !statut) {
        showSnackbar("⚠️ Veuillez remplir les champs obligatoires");
        return;
    }
    
    const existingIndex = radios.findIndex(r => r.id === id);
    const radio = {
        id: id,
        modele: modele,
        serial: serial,
        statut: statut,
        comment: comment,
        acquisition_date: acquisitionDate,
        created_at: new Date().toISOString()
    };
    
    if (statut === 'ATTRIBUÉE') {
        const agentCode = document.getElementById('radioAgent').value;
        const attributionDate = document.getElementById('radioAttributionDate').value;
        if (agentCode) {
            radio.attributed_to = agentCode;
            radio.attribution_date = attributionDate;
        }
    }
    
    if (existingIndex !== -1) {
        radios[existingIndex] = radio;
        showSnackbar(`✅ Radio ${id} mise à jour`);
    } else {
        radios.push(radio);
        showSnackbar(`✅ Radio ${id} ajoutée`);
    }
    
    saveData();
    showRadiosList();
}

// Fonctions placeholder pour les options du menu
function showEditRadioList() {
    showSnackbar("✏️ Modifier Radio - Bientôt disponible");
}

function showEditRadioForm(radioId) {
    showSnackbar(`✏️ Modifier radio ${radioId} - Bientôt disponible`);
}

function showAssignRadioForm(radioId) {
    showSnackbar(`📲 Attribuer radio ${radioId} - Bientôt disponible`);
}

function showReturnRadioForm(radioId) {
    showSnackbar(`🔄 Retour radio ${radioId} - Bientôt disponible`);
}

function showRadiosStatus() {
    showSnackbar("📊 Statut Radios - Bientôt disponible");
}

function showRadiosHistory() {
    showSnackbar("📋 Historique Radios - Bientôt disponible");
}

function deleteRadio(radioId) {
    if (confirm(`Supprimer la radio ${radioId} ?`)) {
        const index = radios.findIndex(r => r.id === radioId);
        if (index !== -1) {
            radios.splice(index, 1);
            saveData();
            showSnackbar(`✅ Radio ${radioId} supprimée`);
            showRadiosList();
        }
    }
}

function filterRadios() {
    const val = document.getElementById('searchRadio').value.toLowerCase();
    const filtered = radios.filter(r => 
        r.id.toLowerCase().includes(val) || 
        r.modele.toLowerCase().includes(val) ||
        r.statut.toLowerCase().includes(val)
    );
    
    let html = filtered.length === 0 ? 
        '<p style="text-align:center; color:#7f8c8d;">Aucune radio trouvée</p>' :
        `
        <table class="classement-table">
            <thead>
                <tr>
                    <th>ID Radio</th>
                    <th>Modèle</th>
                    <th>Statut</th>
                    <th>Attribuée à</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${filtered.map(radio => {
                    let statusColor = '#7f8c8d';
                    switch(radio.statut) {
                        case 'DISPONIBLE': statusColor = '#27ae60'; break;
                        case 'ATTRIBUÉE': statusColor = '#f39c12'; break;
                        case 'HS': statusColor = '#e74c3c'; break;
                        case 'RÉPARATION': statusColor = '#e67e22'; break;
                    }
                    const attributedTo = radio.attributed_to ? agents.find(a => a.code === radio.attributed_to) : null;
                    return `
                        <tr>
                            <td><strong>${radio.id}</strong></td>
                            <td>${radio.modele}</td>
                            <td><span style="background-color:${statusColor}; color:white; padding:2px 8px; border-radius:3px;">${radio.statut}</span></td>
                            <td>${attributedTo ? `${attributedTo.nom} ${attributedTo.prenom}<br><small>${radio.attributed_to}</small>` : '---'}</td>
                            <td style="white-space:nowrap;">
                                ${radio.statut === 'DISPONIBLE' ? 
                                    `<button class="action-btn small green" onclick="showAssignRadioForm('${radio.id}')">📲</button>` : 
                                    radio.statut === 'ATTRIBUÉE' ?
                                    `<button class="action-btn small blue" onclick="showReturnRadioForm('${radio.id}')">🔄</button>` : ''}
                                <button class="action-btn small blue" onclick="showEditRadioForm('${radio.id}')">✏️</button>
                                <button class="action-btn small red" onclick="deleteRadio('${radio.id}')">🗑️</button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
        `;
    
    document.querySelector('.popup-body').innerHTML = `
        <div class="info-section">
            <h3>Inventaire des Radios</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-bottom: 20px;">
                <div style="text-align: center; padding: 10px; background: #2c3e50; border-radius: 5px;">
                    <div style="font-size: 1.5em; font-weight: bold; color: #3498db;">${filtered.length}</div>
                    <div style="font-size: 0.9em; color: #bdc3c7;">Total</div>
                </div>
            </div>
            <input type="text" id="searchRadio" placeholder="Rechercher radio ou modèle..." 
                   style="width:100%; padding:10px; margin-bottom:15px; border-radius:5px; border:none;"
                   onkeyup="filterRadios()" value="${val}">
            ${html}
        </div>
    `;
}