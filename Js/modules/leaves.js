// MODULE CONGÉS ET ABSENCES

function showAddLeaveForm() {
    let html = `
        <div class="info-section">
            <h3>Ajouter un congé ou une absence</h3>
            <div class="form-group">
                <label>Type d'absence:</label>
                <select id="leaveType" class="form-input">
                    <option value="C">Congé payé (C)</option>
                    <option value="M">Maladie (M)</option>
                    <option value="A">Autre absence (A)</option>
                    <option value="periode">Congé sur période</option>
                </select>
            </div>
            <div class="form-group">
                <label>Sélectionner l'agent:</label>
                <select id="leaveAgent" class="form-input">
                    ${agents.filter(a => a.statut === 'actif').map(a => 
                        `<option value="${a.code}">${a.nom} ${a.prenom} (${a.code}) - Groupe ${a.groupe}</option>`
                    ).join('')}
                </select>
            </div>
            <div id="singleLeaveSection">
                <div class="form-group">
                    <label>Date de l'absence:</label>
                    <input type="date" id="leaveDate" class="form-input" value="${new Date().toISOString().split('T')[0]}">
                </div>
            </div>
            <div id="periodLeaveSection" style="display:none;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div class="form-group">
                        <label>Date de début:</label>
                        <input type="date" id="leaveStartDate" class="form-input" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="form-group">
                        <label>Date de fin:</label>
                        <input type="date" id="leaveEndDate" class="form-input" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                </div>
                <div class="form-group">
                    <label>Gestion des dimanches:</label>
                    <select id="sundayHandling" class="form-input">
                        <option value="repos">Les dimanches restent en repos (R)</option>
                        <option value="conge">Les dimanches comptent comme congé (C)</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Commentaire (optionnel):</label>
                <textarea id="leaveComment" class="form-input" rows="3" placeholder="Raison du congé/absence..."></textarea>
            </div>
            <div class="form-group">
                <label>Pièce jointe (justificatif):</label>
                <input type="file" id="leaveAttachment" class="form-input" accept=".pdf,.jpg,.jpeg,.png">
                <small style="color:#7f8c8d;">Format PDF, JPG, PNG (max 5MB)</small>
            </div>
        </div>
    `;
    
    openPopup("🏖️ Ajouter Congé/Absence", html, `
        <button class="popup-button green" onclick="saveLeave()">💾 Enregistrer</button>
        <button class="popup-button blue" onclick="previewLeave()">👁️ Prévisualiser</button>
        <button class="popup-button gray" onclick="displayLeavesMenu()">Annuler</button>
    `);
    
    document.getElementById('leaveType').addEventListener('change', function() {
        const type = this.value;
        if (type === 'periode') {
            document.getElementById('singleLeaveSection').style.display = 'none';
            document.getElementById('periodLeaveSection').style.display = 'block';
        } else {
            document.getElementById('singleLeaveSection').style.display = 'block';
            document.getElementById('periodLeaveSection').style.display = 'none';
        }
    });
}

function saveLeave() {
    const leaveType = document.getElementById('leaveType').value;
    const agentCode = document.getElementById('leaveAgent').value;
    const comment = document.getElementById('leaveComment').value;
    
    if (leaveType === 'periode') {
        const startDate = document.getElementById('leaveStartDate').value;
        const endDate = document.getElementById('leaveEndDate').value;
        const sundayHandling = document.getElementById('sundayHandling').value;
        
        if (!startDate || !endDate) {
            showSnackbar("⚠️ Veuillez spécifier les dates de début et fin");
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            showSnackbar("⚠️ La date de début doit être avant la date de fin");
            return;
        }
        
        const leaveRecord = {
            id: 'L' + Date.now(),
            agent_code: agentCode,
            type: 'C',
            start_date: startDate,
            end_date: endDate,
            sunday_handling: sundayHandling,
            comment: comment,
            created_at: new Date().toISOString(),
            status: 'active'
        };
        
        if (!leaves) leaves = [];
        leaves.push(leaveRecord);
        applyPeriodLeave(agentCode, startDate, endDate, sundayHandling);
        showSnackbar(`✅ Congé sur période enregistré pour ${agentCode} du ${startDate} au ${endDate}`);
    } else {
        const leaveDate = document.getElementById('leaveDate').value;
        if (!leaveDate) {
            showSnackbar("⚠️ Veuillez spécifier une date");
            return;
        }
        
        const planningKey = leaveDate.substring(0, 7);
        if (!planningData[planningKey]) planningData[planningKey] = {};
        if (!planningData[planningKey][agentCode]) planningData[planningKey][agentCode] = {};
        
        planningData[planningKey][agentCode][leaveDate] = {
            shift: leaveType,
            type: 'absence',
            comment: comment,
            recorded_at: new Date().toISOString()
        };
        
        showSnackbar(`✅ Absence (${SHIFT_LABELS[leaveType]}) enregistrée pour ${agentCode} le ${leaveDate}`);
    }
    
    saveData();
    closePopup();
}

function applyPeriodLeave(agentCode, startDate, endDate, sundayHandling) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const current = new Date(start);
    
    while (current <= end) {
        const dateStr = current.toISOString().split('T')[0];
        const dayOfWeek = current.getDay();
        let shiftType = 'C';
        
        if (dayOfWeek === 0) {
            shiftType = sundayHandling === 'repos' ? 'R' : 'C';
        }
        
        const planningKey = dateStr.substring(0, 7);
        if (!planningData[planningKey]) planningData[planningKey] = {};
        if (!planningData[planningKey][agentCode]) planningData[planningKey][agentCode] = {};
        
        planningData[planningKey][agentCode][dateStr] = {
            shift: shiftType,
            type: 'congé_periode',
            period_id: 'L' + Date.now(),
            recorded_at: new Date().toISOString()
        };
        
        current.setDate(current.getDate() + 1);
    }
}

function showLeavesList() {
    const leavesByAgent = {};
    
    Object.keys(planningData).forEach(monthKey => {
        Object.keys(planningData[monthKey]).forEach(agentCode => {
            Object.keys(planningData[monthKey][agentCode]).forEach(dateStr => {
                const shiftRecord = planningData[monthKey][agentCode][dateStr];
                if (['C', 'M', 'A'].includes(shiftRecord.shift)) {
                    if (!leavesByAgent[agentCode]) leavesByAgent[agentCode] = [];
                    leavesByAgent[agentCode].push({
                        date: dateStr,
                        type: shiftRecord.shift,
                        comment: shiftRecord.comment || '',
                        recorded_at: shiftRecord.recorded_at
                    });
                }
            });
        });
    });
    
    if (leaves && leaves.length > 0) {
        leaves.forEach(leave => {
            if (!leavesByAgent[leave.agent_code]) leavesByAgent[leave.agent_code] = [];
            leavesByAgent[leave.agent_code].push({
                date: `${leave.start_date} au ${leave.end_date}`,
                type: 'Période',
                comment: leave.comment || '',
                recorded_at: leave.created_at,
                is_period: true
            });
        });
    }
    
    let html = `
        <div class="info-section">
            <h3>Liste des congés et absences</h3>
            <div style="margin-bottom: 15px;">
                <select id="leavesFilter" class="form-input" style="width:auto;" onchange="filterLeavesList()">
                    <option value="all">Tous les agents</option>
                    ${agents.filter(a => a.statut === 'actif').map(a => 
                        `<option value="${a.code}">${a.nom} ${a.prenom}</option>`
                    ).join('')}
                </select>
                <select id="leavesTypeFilter" class="form-input" style="width:auto; margin-left:10px;" onchange="filterLeavesList()">
                    <option value="all">Tous les types</option>
                    <option value="C">Congés</option>
                    <option value="M">Maladie</option>
                    <option value="A">Autre</option>
                    <option value="Période">Périodes</option>
                </select>
            </div>
            <div id="leavesListContainer">
                ${generateLeavesList(leavesByAgent)}
            </div>
        </div>
    `;
    
    openPopup("📋 Liste des Congés/Absences", html, `
        <button class="popup-button green" onclick="showAddLeaveForm()">➕ Ajouter</button>
        <button class="popup-button blue" onclick="exportLeavesReport()">📊 Exporter</button>
        <button class="popup-button gray" onclick="displayLeavesMenu()">Retour</button>
    `);
}

function generateLeavesList(leavesByAgent, filterAgent = 'all', filterType = 'all') {
    let html = '';
    
    Object.keys(leavesByAgent).forEach(agentCode => {
        const agent = agents.find(a => a.code === agentCode);
        if (!agent) return;
        if (filterAgent !== 'all' && agentCode !== filterAgent) return;
        
        const agentLeaves = leavesByAgent[agentCode].filter(leave => {
            if (filterType === 'all') return true;
            if (filterType === 'Période') return leave.is_period;
            return leave.type === filterType;
        });
        
        if (agentLeaves.length === 0) return;
        
        html += `
            <div style="margin-bottom: 20px; padding: 15px; background: #34495e; border-radius: 5px;">
                <h4 style="margin-top:0;">${agent.nom} ${agent.prenom} (${agent.code})</h4>
                <table class="classement-table" style="width:100%;">
                    <thead>
                        <tr>
                            <th>Date(s)</th>
                            <th>Type</th>
                            <th>Commentaire</th>
                            <th>Enregistré le</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${agentLeaves.map(leave => `
                            <tr>
                                <td>${leave.date}</td>
                                <td>
                                    <span style="background-color:${SHIFT_COLORS[leave.type] || '#7f8c8d'}; color:white; padding:2px 8px; border-radius:3px;">
                                        ${leave.type}
                                    </span>
                                </td>
                                <td>${leave.comment || '-'}</td>
                                <td>${new Date(leave.recorded_at).toLocaleDateString('fr-FR')}</td>
                                <td>
                                    ${leave.is_period ? 
                                        `<button class="action-btn small red" onclick="deletePeriodLeave('${agentCode}', '${leave.date.split(' au ')[0]}')">🗑️</button>` :
                                        `<button class="action-btn small red" onclick="deleteSingleLeave('${agentCode}', '${leave.date}')">🗑️</button>`
                                    }
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    });
    
    if (!html) return '<p style="text-align:center; color:#7f8c8d;">Aucun congé ou absence trouvé</p>';
    return html;
}

function filterLeavesList() {
    const filterAgent = document.getElementById('leavesFilter').value;
    const filterType = document.getElementById('leavesTypeFilter').value;
    
    const leavesByAgent = {};
    Object.keys(planningData).forEach(monthKey => {
        Object.keys(planningData[monthKey]).forEach(agentCode => {
            Object.keys(planningData[monthKey][agentCode]).forEach(dateStr => {
                const shiftRecord = planningData[monthKey][agentCode][dateStr];
                if (['C', 'M', 'A'].includes(shiftRecord.shift)) {
                    if (!leavesByAgent[agentCode]) leavesByAgent[agentCode] = [];
                    leavesByAgent[agentCode].push({
                        date: dateStr,
                        type: shiftRecord.shift,
                        comment: shiftRecord.comment || '',
                        recorded_at: shiftRecord.recorded_at
                    });
                }
            });
        });
    });
    
    if (leaves && leaves.length > 0) {
        leaves.forEach(leave => {
            if (!leavesByAgent[leave.agent_code]) leavesByAgent[leave.agent_code] = [];
            leavesByAgent[leave.agent_code].push({
                date: `${leave.start_date} au ${leave.end_date}`,
                type: 'Période',
                comment: leave.comment || '',
                recorded_at: leave.created_at,
                is_period: true
            });
        });
    }
    
    document.getElementById('leavesListContainer').innerHTML = generateLeavesList(leavesByAgent, filterAgent, filterType);
}

function deleteSingleLeave(agentCode, dateStr) {
    if (!confirm(`Supprimer l'absence de ${agentCode} du ${dateStr} ?`)) return;
    
    const monthKey = dateStr.substring(0, 7);
    if (planningData[monthKey] && planningData[monthKey][agentCode] && planningData[monthKey][agentCode][dateStr]) {
        delete planningData[monthKey][agentCode][dateStr];
        saveData();
        showSnackbar(`✅ Absence supprimée pour ${agentCode} le ${dateStr}`);
        showLeavesList();
    }
}

function deletePeriodLeave(agentCode, startDate) {
    if (!confirm(`Supprimer le congé sur période de ${agentCode} commençant le ${startDate} ?`)) return;
    
    if (leaves) {
        const leaveIndex = leaves.findIndex(l => l.agent_code === agentCode && l.start_date === startDate);
        if (leaveIndex !== -1) {
            const leave = leaves[leaveIndex];
            const start = new Date(leave.start_date);
            const end = new Date(leave.end_date);
            const current = new Date(start);
            
            while (current <= end) {
                const dateStr = current.toISOString().split('T')[0];
                const monthKey = dateStr.substring(0, 7);
                if (planningData[monthKey] && planningData[monthKey][agentCode] && planningData[monthKey][agentCode][dateStr]) {
                    delete planningData[monthKey][agentCode][dateStr];
                }
                current.setDate(current.getDate() + 1);
            }
            
            leaves.splice(leaveIndex, 1);
            saveData();
            showSnackbar(`✅ Congé sur période supprimé pour ${agentCode}`);
            showLeavesList();
        }
    }
}

function showAbsenceForm() {
    showAddLeaveForm();
}

function showSickLeaveForm() {
    showAddLeaveForm();
    setTimeout(() => {
        document.getElementById('leaveType').value = 'M';
    }, 100);
}

function showOtherAbsenceForm() {
    showAddLeaveForm();
    setTimeout(() => {
        document.getElementById('leaveType').value = 'A';
    }, 100);
}

function showAgentLeavesSelection() {
    let html = `
        <div class="info-section">
            <h3>Congés par Agent</h3>
            <div class="form-group">
                <label>Sélectionner un agent:</label>
                <select id="leavesAgentSelect" class="form-input">
                    ${agents.filter(a => a.statut === 'actif').map(a => 
                        `<option value="${a.code}">${a.nom} ${a.prenom} (${a.code})</option>`
                    ).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Période:</label>
                <select id="leavesPeriod" class="form-input">
                    <option value="month">Ce mois</option>
                    <option value="last_month">Mois dernier</option>
                    <option value="quarter">Ce trimestre</option>
                    <option value="year">Cette année</option>
                    <option value="all">Toute période</option>
                </select>
            </div>
        </div>
    `;
    
    openPopup("📅 Congés par Agent", html, `
        <button class="popup-button green" onclick="showSelectedAgentLeaves()">📋 Voir Congés</button>
        <button class="popup-button gray" onclick="displayLeavesMenu()">Annuler</button>
    `);
}

function showSelectedAgentLeaves() {
    const agentCode = document.getElementById('leavesAgentSelect').value;
    const period = document.getElementById('leavesPeriod').value;
    const today = new Date();
    let startDate, endDate;
    
    switch(period) {
        case 'month':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            break;
        case 'last_month':
            startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            endDate = new Date(today.getFullYear(), today.getMonth(), 0);
            break;
        case 'quarter':
            const quarter = Math.floor(today.getMonth() / 3);
            startDate = new Date(today.getFullYear(), quarter * 3, 1);
            endDate = new Date(today.getFullYear(), (quarter + 1) * 3, 0);
            break;
        case 'year':
            startDate = new Date(today.getFullYear(), 0, 1);
            endDate = new Date(today.getFullYear(), 11, 31);
            break;
        default:
            startDate = new Date(2020, 0, 1);
            endDate = new Date(2030, 11, 31);
    }
    
    const agentLeaves = [];
    Object.keys(planningData).forEach(monthKey => {
        if (planningData[monthKey][agentCode]) {
            Object.keys(planningData[monthKey][agentCode]).forEach(dateStr => {
                const record = planningData[monthKey][agentCode][dateStr];
                if (['C', 'M', 'A'].includes(record.shift)) {
                    const date = new Date(dateStr);
                    if (date >= startDate && date <= endDate) {
                        agentLeaves.push({
                            date: dateStr,
                            type: record.shift,
                            comment: record.comment || '',
                            recorded_at: record.recorded_at
                        });
                    }
                }
            });
        }
    });
    
    if (leaves) {
        leaves.filter(l => l.agent_code === agentCode).forEach(leave => {
            const leaveStart = new Date(leave.start_date);
            const leaveEnd = new Date(leave.end_date);
            if ((leaveStart >= startDate && leaveStart <= endDate) || 
                (leaveEnd >= startDate && leaveEnd <= endDate) ||
                (leaveStart <= startDate && leaveEnd >= endDate)) {
                agentLeaves.push({
                    date: `${leave.start_date} au ${leave.end_date}`,
                    type: 'Période',
                    comment: leave.comment || '',
                    recorded_at: leave.created_at,
                    is_period: true
                });
            }
        });
    }
    
    if (agentLeaves.length === 0) {
        showSnackbar(`ℹ️ Aucun congé trouvé pour cet agent sur la période sélectionnée`);
        return;
    }
    
    const agent = agents.find(a => a.code === agentCode);
    let html = `
        <div class="info-section">
            <h3>Congés de ${agent.nom} ${agent.prenom}</h3>
            <p>Période: ${period === 'all' ? 'Toute période' : startDate.toLocaleDateString('fr-FR') + ' au ' + endDate.toLocaleDateString('fr-FR')}</p>
            <table class="classement-table" style="width:100%;">
                <thead>
                    <tr>
                        <th>Date(s)</th>
                        <th>Type</th>
                        <th>Commentaire</th>
                        <th>Enregistré le</th>
                    </tr>
                </thead>
                <tbody>
                    ${agentLeaves.map(leave => `
                        <tr>
                            <td>${leave.date}</td>
                            <td>
                                <span style="background-color:${SHIFT_COLORS[leave.type] || '#7f8c8d'}; color:white; padding:2px 8px; border-radius:3px;">
                                    ${leave.type}
                                </span>
                            </td>
                            <td>${leave.comment || '-'}</td>
                            <td>${new Date(leave.recorded_at).toLocaleDateString('fr-FR')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    openPopup(`📅 Congés de ${agent.code}`, html, `
        <button class="popup-button blue" onclick="showAgentLeavesSelection()">👤 Autre Agent</button>
        <button class="popup-button gray" onclick="displayLeavesMenu()">Retour</button>
    `);
}

function exportLeavesReport() {
    let csvContent = "Rapport des Congés et Absences\n\n";
    csvContent += "Date Export;Nombre total d'absences\n";
    csvContent += `${new Date().toLocaleDateString('fr-FR')};${countTotalLeaves()}\n\n`;
    csvContent += "Agent;Code;Groupe;Date;Type;Commentaire;Enregistré le\n";
    
    agents.filter(a => a.statut === 'actif').forEach(agent => {
        const agentLeaves = [];
        Object.keys(planningData).forEach(monthKey => {
            if (planningData[monthKey][agent.code]) {
                Object.keys(planningData[monthKey][agent.code]).forEach(dateStr => {
                    const record = planningData[monthKey][agent.code][dateStr];
                    if (['C', 'M', 'A'].includes(record.shift)) {
                        agentLeaves.push({
                            date: dateStr,
                            type: record.shift,
                            comment: record.comment || '',
                            recorded_at: record.recorded_at
                        });
                    }
                });
            }
        });
        if (leaves) {
            leaves.filter(l => l.agent_code === agent.code).forEach(leave => {
                agentLeaves.push({
                    date: `${leave.start_date} au ${leave.end_date}`,
                    type: 'Période',
                    comment: leave.comment || '',
                    recorded_at: leave.created_at
                });
            });
        }
        agentLeaves.forEach(leave => {
            csvContent += `${agent.nom} ${agent.prenom};${agent.code};${agent.groupe};${leave.date};${leave.type};"${leave.comment}";${new Date(leave.recorded_at).toLocaleDateString('fr-FR')}\n`;
        });
    });
    
    const filename = `Rapport_Conges_${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csvContent, filename);
    showSnackbar(`✅ Rapport des congés téléchargé`);
}

function countTotalLeaves() {
    let count = 0;
    Object.keys(planningData).forEach(monthKey => {
        Object.keys(planningData[monthKey]).forEach(agentCode => {
            Object.keys(planningData[monthKey][agentCode]).forEach(dateStr => {
                const record = planningData[monthKey][agentCode][dateStr];
                if (['C', 'M', 'A'].includes(record.shift)) count++;
            });
        });
    });
    if (leaves) count += leaves.length;
    return count;
}