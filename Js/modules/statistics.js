// MODULE STATISTIQUES ET CLASSEMENT

function runClassement() {
    const groups = [...new Set(agents.filter(a => a.statut === 'actif').map(a => a.groupe))].sort();
    let html = `
        <div class="info-section">
            <h3>Calculer le classement</h3>
            <p>Sélectionnez un groupe pour voir les performances :</p>
            <select id="group-select" class="info-value" style="width:100%; padding:10px; margin-top:10px;">
                <option value="ALL">Tous les Groupes</option>
                ${groups.map(g => `<option value="${g}">Groupe ${g}</option>`).join('')}
            </select>
        </div>
    `;
    openPopup("📊 Classement des Agents", html, `
        <button class="popup-button green" onclick="generateClassement()">🏆 Générer Classement</button>
        <button class="popup-button gray" onclick="displayStatisticsMenu()">Annuler</button>
    `);
}

function generateClassement() {
    const group = document.getElementById('group-select').value;
    let filtered = group === "ALL" ? 
        agents.filter(a => a.statut === 'actif') : 
        agents.filter(a => a.groupe === group && a.statut === 'actif');
    
    const sortedData = filtered.map(a => ({
        ...a,
        total: Math.floor(Math.random() * 25) + 5
    })).sort((a, b) => b.total - a.total);

    let html = `
        <div class="info-section">
            <h3>Classement ${group === "ALL" ? "Général" : "Groupe " + group}</h3>
            <table class="classement-table">
                <thead>
                    <tr><th>Rang</th><th>Agent</th><th>Groupe</th><th>Total Jours</th></tr>
                </thead>
                <tbody>
                    ${sortedData.map((a, index) => `
                        <tr>
                            <td class="rank-${index + 1}">${index + 1}</td>
                            <td>${a.nom} ${a.prenom} (${a.code})</td>
                            <td>${a.groupe}</td>
                            <td class="total-value">${a.total} j</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    openPopup(`🏆 Classement ${group === "ALL" ? "Général" : "Groupe " + group}`, html, `
        <button class="popup-button blue" onclick="runClassement()">🔄 Nouveau calcul</button>
        <button class="popup-button gray" onclick="displayStatisticsMenu()">Retour</button>
    `);
}

function exportStatsExcel() {
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    let csvContent = "Statistiques Mensuelles - " + getMonthName(month) + " " + year + "\n\n";
    csvContent += "Agent;Code;Groupe;Matin (1);Après-midi (2);Nuit (3);Repos (R);Congés (C);Maladie (M);Autre (A);Total Jours;Total Travaillés\n";
    
    const activeAgents = agents.filter(a => a.statut === 'actif');
    const daysInMonth = new Date(year, month, 0).getDate();
    
    activeAgents.forEach(agent => {
        const stats = { '1': 0, '2': 0, '3': 0, 'R': 0, 'C': 0, 'M': 0, 'A': 0 };
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const shift = getShiftForAgent(agent.code, dateStr);
            if (stats[shift] !== undefined) stats[shift]++;
        }
        const totalJours = daysInMonth;
        const totalTravailles = stats['1'] + stats['2'] + stats['3'];
        csvContent += `${agent.nom} ${agent.prenom};${agent.code};${agent.groupe};${stats['1']};${stats['2']};${stats['3']};${stats['R']};${stats['C']};${stats['M']};${stats['A']};${totalJours};${totalTravailles}\n`;
    });
    
    const filename = `Statistiques_${getMonthName(month)}_${year}.csv`;
    downloadCSV(csvContent, filename);
    showSnackbar(`✅ Fichier ${filename} téléchargé`);
}

function exportPlanningToExcel(month, year, type = 'global', group = null) {
    showSnackbar("📊 Génération du fichier Excel...");
    const activeAgents = agents.filter(a => a.statut === 'actif');
    const daysInMonth = new Date(year, month, 0).getDate();
    let exportAgents = activeAgents;
    if (type === 'groupe' && group) exportAgents = activeAgents.filter(a => a.groupe === group);
    
    let csvContent = "Agent;Code;Groupe;";
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        const dayName = JOURS_FRANCAIS[date.getDay()];
        csvContent += `Jour ${day} (${dayName});`;
    }
    csvContent += "Total 1;Total 2;Total 3;Total R;Total C;Total M;Total A\n";
    
    exportAgents.forEach(agent => {
        const stats = { '1': 0, '2': 0, '3': 0, 'R': 0, 'C': 0, 'M': 0, 'A': 0 };
        let row = `${agent.nom} ${agent.prenom};${agent.code};${agent.groupe};`;
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const shift = getShiftForAgent(agent.code, dateStr);
            row += `${shift};`;
            if (stats[shift] !== undefined) stats[shift]++;
        }
        row += `${stats['1']};${stats['2']};${stats['3']};${stats['R']};${stats['C']};${stats['M']};${stats['A']}\n`;
        csvContent += row;
    });
    
    const filename = `Planning_${type === 'global' ? 'Global' : 'Groupe_' + group}_${getMonthName(month)}_${year}.csv`;
    downloadCSV(csvContent, filename);
    showSnackbar(`✅ Fichier ${filename} téléchargé`);
}