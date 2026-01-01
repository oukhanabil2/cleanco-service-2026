// MODULE AVERTISSEMENTS DISCIPLINAIRES

function showWarningsList() {
    if (!warnings || warnings.length === 0) {
        let html = `<div class="info-section"><h3>Avertissements</h3><p style="text-align:center; color:#7f8c8d; padding:20px;">Aucun avertissement enregistré</p></div>`;
        openPopup("⚠️ Avertissements", html, `
            <button class="popup-button green" onclick="showAddWarningForm()">⚠️ Ajouter</button>
            <button class="popup-button gray" onclick="displayWarningsMenu()">Retour</button>
        `);
        return;
    }
    
    const sortedWarnings = [...warnings].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let html = `
        <div class="info-section">
            <h3>Liste des Avertissements</h3>
            <div style="margin-bottom: 15px;">
                <select id="warningFilter" class="form-input" style="width:auto;" onchange="filterWarnings()">
                    <option value="all">Tous les types</option>
                    <option value="ORAL">Oral</option>
                    <option value="ECRIT">Écrit</option>
                    <option value="MISE_A_PIED">Mise à pied</option>
                </select>
                <select id="warningStatusFilter" class="form-input" style="width:auto; margin-left:10px;" onchange="filterWarnings()">
                    <option value="all">Tous les statuts</option>
                    <option value="active">Actif</option>
                    <option value="archived">Archivé</option>
                </select>
            </div>
            <div id="warningsListContainer">
                ${generateWarningsList(sortedWarnings)}
            </div>
        </div>
    `;
    
    openPopup("⚠️ Avertissements", html, `
        <button class="popup-button green" onclick="showAddWarningForm()">⚠️ Ajouter</button>
        <button class="popup-button blue" onclick="showWarningsStats()">📊 Statistiques</button>
        <button class="popup-button gray" onclick="displayWarningsMenu()">Retour</button>
    `);
}

function generateWarningsList(warningsList, filterType = 'all', filterStatus = 'all') {
    const filteredWarnings = warningsList.filter(warning => {
        if (filterType !== 'all' && warning.type !== filterType) return false;
        if (filterStatus !== 'all' && warning.status !== filterStatus) return false;
        return true;
    });
    
    if (filteredWarnings.length === 0) {
        return '<p style="text-align:center; color:#7f8c8d; padding:20px;">Aucun avertissement correspondant aux filtres</p>';
    }
    
    return `
        <table class="classement-table">
            <thead>
                <tr>
                    <th>Agent</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Statut</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${filteredWarnings.map(warning => {
                    const agent = agents.find(a => a.code === warning.agent_code);
                    const agentName = agent ? `${agent.nom} ${agent.prenom}` : warning.agent_code;
                    let typeColor = '#7f8c8d';
                    let typeLabel = warning.type;
                    switch(warning.type) {
                        case 'ORAL': typeColor = '#f39c12'; typeLabel = 'Oral'; break;
                        case 'ECRIT': typeColor = '#e74c3c'; typeLabel = 'Écrit'; break;
                        case 'MISE_A_PIED': typeColor = '#c0392b'; typeLabel = 'Mise à pied'; break;
                    }
                    let statusBadge = warning.status === 'active' ? 
                        '<span style="background-color:#27ae60; color:white; padding:2px 8px; border-radius:3px; font-size:0.8em;">Actif</span>' :
                        '<span style="background-color:#7f8c8d; color:white; padding:2px 8px; border-radius:3px; font-size:0.8em;">Archivé</span>';
                    return `
                        <tr>
                            <td nowrap><strong>${agentName}</strong><br><small>${warning.agent_code}</small></td>
                            <td><span style="background-color:${typeColor}; color:white; padding:2px 8px; border-radius:3px;">${typeLabel}</span></td>
                            <td>${new Date(warning.date).toLocaleDateString('fr-FR')}</td>
                            <td>${warning.description.substring(0, 50)}${warning.description.length > 50 ? '...' : ''}</td>
                            <td>${statusBadge}</td>
                            <td style="white-space:nowrap;">
                                <button class="action-btn small blue" onclick="showWarningDetails('${warning.id}')">👁️</button>
                                <button class="action-btn small ${warning.status === 'active' ? 'orange' : 'green'}" 
                                        onclick="toggleWarningStatus('${warning.id}')">
                                    ${warning.status === 'active' ? '📁' : '📂'}
                                </button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

function filterWarnings() {
    const filterType = document.getElementById('warningFilter').value;
    const filterStatus = document.getElementById('warningStatusFilter').value;
    const sortedWarnings = [...warnings].sort((a, b) => new Date(b.date) - new Date(a.date));
    document.getElementById('warningsListContainer').innerHTML = generateWarningsList(sortedWarnings, filterType, filterStatus);
}

function showAddWarningForm() {
    let html = `
        <div class="info-section">
            <h3>Enregistrer un Avertissement</h3>
            <div class="form-group">
                <label>Agent *</label>
                <select id="warningAgent" class="form-input" required>
                    <option value="">Sélectionner un agent</option>
                    ${agents.filter(a => a.statut === 'actif').map(a => 
                        `<option value="${a.code}">${a.nom} ${a.prenom} (${a.code}) - Groupe ${a.groupe}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Type d'avertissement *</label>
                <select id="warningType" class="form-input" required>
                    <option value="">Sélectionner</option>
                    <option value="ORAL">Avertissement Oral</option>
                    <option value="ECRIT">Avertissement Écrit</option>
                    <option value="MISE_A_PIED">Mise à pied</option>
                </select>
            </div>
            <div class="form-group">
                <label>Date de l'avertissement *</label>
                <input type="date" id="warningDate" class="form-input" required value="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="form-group">
                <label>Description détaillée *</label>
                <textarea id="warningDescription" class="form-input" rows="4" required placeholder="Décrire les faits, les circonstances, les preuves..."></textarea>
            </div>
            <div class="form-group">
                <label>Sanctions appliquées</label>
                <textarea id="warningSanctions" class="form-input" rows="3" placeholder="Sanctions, mesures disciplinaires prises..."></textarea>
            </div>
            <div class="form-group">
                <label>Date de fin de validité (si applicable)</label>
                <input type="date" id="warningEndDate" class="form-input">
                <small style="color:#7f8c8d;">Pour les mises à pied temporaires</small>
            </div>
            <div class="form-group">
                <label>Témoins (noms et fonctions)</label>
                <textarea id="warningWitnesses" class="form-input" rows="2" placeholder="Noms des témoins présents..."></textarea>
            </div>
            <div class="form-group">
                <label>Documents joints (justificatifs)</label>
                <input type="file" id="warningDocuments" class="form-input" multiple accept=".pdf,.jpg,.jpeg,.png">
                <small style="color:#7f8c8d;">PDF, JPG, PNG (max 10MB au total)</small>
            </div>
            <div style="padding:15px; background:#2c3e50; border-radius:5px; margin-top:20px;">
                <h4 style="margin-top:0; color:#e74c3c;">⚖️ Aspects légaux</h4>
                <p style="font-size:0.9em; margin:0;">Assurez-vous de respecter la procédure disciplinaire. L'agent doit être informé de son droit de réponse. Conservez les preuves et signatures.</p>
            </div>
        </div>
    `;
    
    openPopup("⚠️ Ajouter Avertissement", html, `
        <button class="popup-button green" onclick="saveWarning()">⚖️ Enregistrer</button>
        <button class="popup-button gray" onclick="showWarningsList()">Annuler</button>
    `);
}

function saveWarning() {
    const agentCode = document.getElementById('warningAgent').value;
    const type = document.getElementById('warningType').value;
    const date = document.getElementById('warningDate').value;
    const description = document.getElementById('warningDescription').value;
    const sanctions = document.getElementById('warningSanctions').value;
    const endDate = document.getElementById('warningEndDate').value;
    const witnesses = document.getElementById('warningWitnesses').value;
    
    if (!agentCode || !type || !date || !description) {
        showSnackbar("⚠️ Veuillez remplir les champs obligatoires");
        return;
    }
    
    const warning = {
        id: 'WARN' + Date.now(),
        agent_code: agentCode,
        type: type,
        date: date,
        description: description,
        sanctions: sanctions,
        end_date: endDate || null,
        witnesses: witnesses,
        status: 'active',
        created_at: new Date().toISOString(),
        created_by: 'Admin'
    };
    
    if (!warnings) warnings = [];
    warnings.push(warning);
    saveData();
    
    const agentWarnings = warnings.filter(w => w.agent_code === agentCode);
    if (agentWarnings.length >= 3) {
        setTimeout(() => {
            showSnackbar(`⚠️ Attention: L'agent ${agentCode} a maintenant ${agentWarnings.length} avertissements`);
        }, 1000);
    }
    
    showSnackbar(`✅ Avertissement enregistré pour ${agentCode}`);
    showWarningsList();
}

function showWarningDetails(warningId) {
    const warning = warnings.find(w => w.id === warningId);
    if (!warning) return;
    
    const agent = agents.find(a => a.code === warning.agent_code);
    const agentName = agent ? `${agent.nom} ${agent.prenom}` : warning.agent_code;
    let typeLabel = warning.type;
    let typeColor = '#7f8c8d';
    switch(warning.type) {
        case 'ORAL': typeLabel = 'Avertissement Oral'; typeColor = '#f39c12'; break;
        case 'ECRIT': typeLabel = 'Avertissement Écrit'; typeColor = '#e74c3c'; break;
        case 'MISE_A_PIED': typeLabel = 'Mise à pied'; typeColor = '#c0392b'; break;
    }
    
    let html = `
        <div class="info-section">
            <h3>Détails de l'Avertissement</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div>
                    <h4>Informations générales</h4>
                    <div class="info-item"><span class="info-label">Agent:</span><span class="info-value">${agentName} (${warning.agent_code})</span></div>
                    <div class="info-item"><span class="info-label">Type:</span><span class="info-value" style="background-color:${typeColor}; color:white; padding:2px 8px; border-radius:3px;">${typeLabel}</span></div>
                    <div class="info-item"><span class="info-label">Date:</span><span class="info-value">${new Date(warning.date).toLocaleDateString('fr-FR')}</span></div>
                    <div class="info-item"><span class="info-label">Statut:</span><span class="info-value">${warning.status === 'active' ? 'Actif' : 'Archivé'}</span></div>
                    <div class="info-item"><span class="info-label">Enregistré le:</span><span class="info-value">${new Date(warning.created_at).toLocaleDateString('fr-FR')}</span></div>
                </div>
                <div>
                    <h4>Détails additionnels</h4>
                    ${warning.end_date ? `
                        <div class="info-item"><span class="info-label">Fin de validité:</span><span class="info-value">${new Date(warning.end_date).toLocaleDateString('fr-FR')}</span></div>
                    ` : ''}
                    <div class="info-item"><span class="info-label">Témoins:</span><span class="info-value">${warning.witnesses || 'Non spécifié'}</span></div>
                    <div class="info-item"><span class="info-label">Enregistré par:</span><span class="info-value">${warning.created_by || 'Admin'}</span></div>
                </div>
            </div>
            <h4>Description des faits</h4>
            <div style="padding: 15px; background: #34495e; border-radius: 5px; margin-bottom: 20px;">
                ${warning.description.replace(/\n/g, '<br>')}
            </div>
            ${warning.sanctions ? `
                <h4>Sanctions appliquées</h4>
                <div style="padding: 15px; background: #2c3e50; border-radius: 5px; margin-bottom: 20px;">
                    ${warning.sanctions.replace(/\n/g, '<br>')}
                </div>
            ` : ''}
            <div style="margin-top: 20px;">
                <button class="popup-button orange" onclick="toggleWarningStatus('${warning.id}')">
                    ${warning.status === 'active' ? '📁 Archiver' : '📂 Réactiver'}
                </button>
            </div>
        </div>
    `;
    
    openPopup("📋 Détails Avertissement", html, `
        <button class="popup-button blue" onclick="showWarningsList()">📋 Retour liste</button>
        <button class="popup-button gray" onclick="closePopup()">Fermer</button>
    `);
}

function toggleWarningStatus(warningId) {
    const warningIndex = warnings.findIndex(w => w.id === warningId);
    if (warningIndex === -1) return;
    
    const newStatus = warnings[warningIndex].status === 'active' ? 'archived' : 'active';
    warnings[warningIndex].status = newStatus;
    warnings[warningIndex].updated_at = new Date().toISOString();
    
    saveData();
    showSnackbar(`✅ Avertissement ${newStatus === 'archived' ? 'archivé' : 'réactivé'}`);
    
    const currentPopup = document.querySelector('.popup-header h2');
    if (currentPopup && currentPopup.textContent.includes('Détails')) {
        closePopup();
        setTimeout(() => showWarningDetails(warningId), 300);
    } else {
        showWarningsList();
    }
}

function showAgentWarningsSelection() {
    let html = `
        <div class="info-section">
            <h3>Avertissements par Agent</h3>
            <div class="form-group">
                <label>Sélectionner un agent:</label>
                <select id="warningsAgentSelect" class="form-input">
                    <option value="">Tous les agents</option>
                    ${agents.filter(a => a.statut === 'actif').map(a => 
                        `<option value="${a.code}">${a.nom} ${a.prenom} (${a.code})</option>`
                    ).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Période:</label>
                <select id="warningsPeriod" class="form-input">
                    <option value="all">Toute période</option>
                    <option value="year">Cette année</option>
                    <option value="last_year">L'année dernière</option>
                    <option value="month">Ce mois</option>
                </select>
            </div>
        </div>
    `;
    
    openPopup("👤 Avertissements par Agent", html, `
        <button class="popup-button green" onclick="showSelectedAgentWarnings()">📋 Voir Avertissements</button>
        <button class="popup-button gray" onclick="displayWarningsMenu()">Annuler</button>
    `);
}

function showSelectedAgentWarnings() {
    const agentCode = document.getElementById('warningsAgentSelect').value;
    const period = document.getElementById('warningsPeriod').value;
    
    let filteredWarnings = [...warnings];
    if (agentCode) filteredWarnings = filteredWarnings.filter(w => w.agent_code === agentCode);
    if (period !== 'all') {
        const now = new Date();
        let startDate;
        switch(period) {
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            case 'last_year':
                startDate = new Date(now.getFullYear() - 1, 0, 1);
                const endDate = new Date(now.getFullYear() - 1, 11, 31);
                filteredWarnings = filteredWarnings.filter(w => 
                    new Date(w.date) >= startDate && new Date(w.date) <= endDate
                );
                startDate = null;
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
        }
        if (startDate) filteredWarnings = filteredWarnings.filter(w => new Date(w.date) >= startDate);
    }
    
    filteredWarnings.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (filteredWarnings.length === 0) {
        const message = agentCode ? 
            `Aucun avertissement trouvé pour cet agent${period !== 'all' ? ' sur la période sélectionnée' : ''}` :
            `Aucun avertissement trouvé${period !== 'all' ? ' sur la période sélectionnée' : ''}`;
        showSnackbar(`ℹ️ ${message}`);
        return;
    }
    
    let html = `
        <div class="info-section">
            <h3>Avertissements ${agentCode ? 'de ' + agentCode : ''}</h3>
            ${period !== 'all' ? `<p>Période: ${period === 'year' ? 'Cette année' : period === 'month' ? 'Ce mois' : 'L\'année dernière'}</p>` : ''}
            <table class="classement-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        ${!agentCode ? '<th>Agent</th>' : ''}
                        <th>Description</th>
                        <th>Statut</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredWarnings.map(warning => {
                        const agent = agents.find(a => a.code === warning.agent_code);
                        let typeColor = '#7f8c8d';
                        switch(warning.type) {
                            case 'ORAL': typeColor = '#f39c12'; break;
                            case 'ECRIT': typeColor = '#e74c3c'; break;
                            case 'MISE_A_PIED': typeColor = '#c0392b'; break;
                        }
                        return `
                            <tr>
                                <td>${new Date(warning.date).toLocaleDateString('fr-FR')}</td>
                                <td><span style="background-color:${typeColor}; color:white; padding:2px 8px; border-radius:3px;">${warning.type}</span></td>
                                ${!agentCode ? `
                                    <td nowrap><strong>${warning.agent_code}</strong><br><small>${agent ? agent.nom + ' ' + agent.prenom : ''}</small></td>
                                ` : ''}
                                <td>${warning.description.substring(0, 50)}${warning.description.length > 50 ? '...' : ''}</td>
                                <td>${warning.status === 'active' ? 'Actif' : 'Archivé'}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
            <div style="margin-top: 20px; padding: 15px; background: #2c3e50; border-radius: 5px;">
                <h4 style="margin-top:0;">📊 Résumé</h4>
                <div style="display: flex; gap: 20px;">
                    <div><strong>Total:</strong> ${filteredWarnings.length}</div>
                    <div><strong>Actifs:</strong> ${filteredWarnings.filter(w => w.status === 'active').length}</div>
                    <div><strong>Archivés:</strong> ${filteredWarnings.filter(w => w.status === 'archived').length}</div>
                </div>
            </div>
        </div>
    `;
    
    openPopup("📋 Avertissements", html, `
        <button class="popup-button blue" onclick="showAgentWarningsSelection()">🔍 Nouvelle recherche</button>
        <button class="popup-button gray" onclick="displayWarningsMenu()">Retour</button>
    `);
}

function showWarningsStats() {
    if (!warnings || warnings.length === 0) {
        showSnackbar("ℹ️ Aucune donnée statistique disponible");
        return;
    }
    
    const stats = {
        total: warnings.length,
        byType: { ORAL: 0, ECRIT: 0, MISE_A_PIED: 0 },
        byStatus: { active: 0, archived: 0 },
        byMonth: {},
        byAgent: {}
    };
    
    const now = new Date();
    const currentYear = now.getFullYear();
    
    warnings.forEach(warning => {
        stats.byType[warning.type] = (stats.byType[warning.type] || 0) + 1;
        stats.byStatus[warning.status] = (stats.byStatus[warning.status] || 0) + 1;
        const warningDate = new Date(warning.date);
        if (warningDate.getFullYear() === currentYear) {
            const month = warningDate.getMonth() + 1;
            stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
        }
        stats.byAgent[warning.agent_code] = (stats.byAgent[warning.agent_code] || 0) + 1;
    });
    
    let topAgent = null;
    let maxWarnings = 0;
    Object.entries(stats.byAgent).forEach(([agentCode, count]) => {
        if (count > maxWarnings) {
            maxWarnings = count;
            topAgent = agentCode;
        }
    });
    
    let html = `
        <div class="info-section">
            <h3>📊 Statistiques des Avertissements</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px;">
                <div style="text-align: center; padding: 15px; background: #2c3e50; border-radius: 5px;">
                    <div style="font-size: 2em; font-weight: bold; color: #3498db;">${stats.total}</div>
                    <div style="font-size: 0.9em; color: #bdc3c7;">Total avertissements</div>
                </div>
                <div style="text-align: center; padding: 15px; background: #f39c12; border-radius: 5px;">
                    <div style="font-size: 2em; font-weight: bold; color: white;">${stats.byType.ORAL || 0}</div>
                    <div style="font-size: 0.9em; color: white;">Avertissements oraux</div>
                </div>
                <div style="text-align: center; padding: 15px; background: #e74c3c; border-radius: 5px;">
                    <div style="font-size: 2em; font-weight: bold; color: white;">${stats.byType.ECRIT || 0}</div>
                    <div style="font-size: 0.9em; color: white;">Avertissements écrits</div>
                </div>
                <div style="text-align: center; padding: 15px; background: #c0392b; border-radius: 5px;">
                    <div style="font-size: 2em; font-weight: bold; color: white;">${stats.byType.MISE_A_PIED || 0}</div>
                    <div style="font-size: 0.9em; color: white;">Mises à pied</div>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <h4>📈 Répartition par statut</h4>
                    <div style="margin-top: 10px;">
                        <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                            <span>Actifs:</span>
                            <span style="color:#27ae60; font-weight:bold;">${stats.byStatus.active || 0}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                            <span>Archivés:</span>
                            <span style="color:#7f8c8d; font-weight:bold;">${stats.byStatus.archived || 0}</span>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h4>👤 Agents les plus concernés</h4>
                    ${topAgent ? `
                        <div style="margin-top: 10px;">
                            <div style="font-weight:bold; color:#e74c3c;">${topAgent}</div>
                            <div style="font-size:0.9em; color:#7f8c8d;">${maxWarnings} avertissement(s)</div>
                        </div>
                    ` : '<p style="color:#7f8c8d; text-align:center;">Aucune donnée</p>'}
                </div>
            </div>
            ${Object.keys(stats.byMonth).length > 0 ? `
                <div style="margin-top: 30px;">
                    <h4>📅 Avertissements par mois (${currentYear})</h4>
                    <div style="margin-top: 15px;">
                        ${Array.from({length: 12}, (_, i) => {
                            const monthNum = i + 1;
                            const monthName = new Date(2024, i, 1).toLocaleDateString('fr-FR', { month: 'short' });
                            const count = stats.byMonth[monthNum] || 0;
                            const maxCount = Math.max(...Object.values(stats.byMonth));
                            const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                            return `
                                <div style="margin: 10px 0;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                        <span>${monthName}</span>
                                        <span style="font-weight:bold;">${count}</span>
                                    </div>
                                    <div style="height: 10px; background: #34495e; border-radius: 5px; overflow: hidden;">
                                        <div style="height: 100%; width: ${percentage}%; background: #e74c3c; border-radius: 5px;"></div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    
    openPopup("📊 Statistiques Avertissements", html, `
        <button class="popup-button green" onclick="exportWarningsReport()">📤 Exporter</button>
        <button class="popup-button gray" onclick="showWarningsList()">Retour</button>
    `);
}

function exportWarningsReport() {
    if (!warnings || warnings.length === 0) {
        showSnackbar("ℹ️ Aucun avertissement à exporter");
        return;
    }
    
    let csvContent = "Rapport des Avertissements - " + new Date().toLocaleDateString('fr-FR') + "\n\n";
    csvContent += "ID;Agent;Code Agent;Type;Date;Description;Sanctions;Témoins;Statut;Créé le;Mis à jour le\n";
    
    warnings.forEach(warning => {
        const agent = agents.find(a => a.code === warning.agent_code);
        const agentName = agent ? `${agent.nom} ${agent.prenom}` : warning.agent_code;
        csvContent += `${warning.id};"${agentName}";${warning.agent_code};${warning.type};${warning.date};"${warning.description.replace(/"/g, '""')}";"${(warning.sanctions || '').replace(/"/g, '""')}";"${(warning.witnesses || '').replace(/"/g, '""')}";${warning.status};${warning.created_at};${warning.updated_at || ''}\n`;
    });
    
    downloadCSV(csvContent, `Rapport_Avertissements_${new Date().toISOString().split('T')[0]}.csv`);
    showSnackbar(`✅ Rapport des avertissements téléchargé`);
}