// MODULE EXPORTATIONS

function exportAgentsCSV() {
    if (agents.length === 0) {
        showSnackbar("ℹ️ Aucun agent à exporter");
        return;
    }
    
    let csvContent = "Liste des Agents\n\n";
    csvContent += "Code;Nom;Prénom;Groupe;Matricule;CIN;Téléphone;Poste;Date Entrée;Date Sortie;Statut\n";
    
    agents.forEach(agent => {
        csvContent += `${agent.code};${agent.nom};${agent.prenom};${agent.groupe};`;
        csvContent += `${agent.matricule || ''};${agent.cin || ''};${agent.tel || ''};${agent.poste || ''};`;
        csvContent += `${agent.date_entree || ''};${agent.date_sortie || ''};${agent.statut}\n`;
    });
    
    downloadCSV(csvContent, `Agents_${new Date().toISOString().split('T')[0]}.csv`);
    showSnackbar(`✅ Liste des agents téléchargée`);
}

function exportLeavesPDF() {
    showSnackbar("📋 Export des congés en PDF - Bientôt disponible");
}

function exportFullReport() {
    showSnackbar("📊 Export du rapport complet - Bientôt disponible");
}

function backupAllData() {
    const backupData = {
        agents: agents,
        planningData: planningData,
        holidays: holidays,
        panicCodes: panicCodes,
        radios: radios,
        uniforms: uniforms,
        warnings: warnings,
        leaves: leaves,
        radioHistory: radioHistory,
        auditLog: auditLog,
        backup_date: new Date().toISOString(),
        version: "1.0"
    };
    
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `SGA_Backup_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showSnackbar(`✅ Sauvegarde complète téléchargée`);
}