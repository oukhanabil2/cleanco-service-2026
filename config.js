// MODULE CONFIGURATION

function showSettings() {
    let html = `
        <div class="info-section">
            <h3>⚙️ Paramètres de l'Application</h3>
            <div class="form-group">
                <label>Nom de l'entreprise</label>
                <input type="text" id="companyName" class="form-input" value="Société de Sécurité" placeholder="Nom de votre société">
            </div>
            <div class="form-group">
                <label>Adresse</label>
                <input type="text" id="companyAddress" class="form-input" placeholder="Adresse de l'entreprise">
            </div>
            <div class="form-group">
                <label>Téléphone</label>
                <input type="tel" id="companyPhone" class="form-input" placeholder="Téléphone de contact">
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="companyEmail" class="form-input" placeholder="Email de contact">
            </div>
            <div class="form-group">
                <label>Nom du responsable</label>
                <input type="text" id="managerName" class="form-input" placeholder="Nom du responsable">
            </div>
            <div class="form-group">
                <label>Heure de début matin</label>
                <input type="time" id="morningStart" class="form-input" value="08:00">
            </div>
            <div class="form-group">
                <label>Heure de fin matin</label>
                <input type="time" id="morningEnd" class="form-input" value="16:00">
            </div>
            <div class="form-group">
                <label>Heure de début après-midi</label>
                <input type="time" id="afternoonStart" class="form-input" value="16:00">
            </div>
            <div class="form-group">
                <label>Heure de fin après-midi</label>
                <input type="time" id="afternoonEnd" class="form-input" value="00:00">
            </div>
            <div class="form-group">
                <label>Heure de début nuit</label>
                <input type="time" id="nightStart" class="form-input" value="00:00">
            </div>
            <div class="form-group">
                <label>Heure de fin nuit</label>
                <input type="time" id="nightEnd" class="form-input" value="08:00">
            </div>
            <div class="form-group">
                <label>Durée maximale des congés (jours)</label>
                <input type="number" id="maxLeaveDays" class="form-input" value="30" min="1" max="365">
            </div>
            <div class="form-group">
                <label>Durée de renouvellement habillement (mois)</label>
                <input type="number" id="uniformRenewalMonths" class="form-input" value="24" min="1" max="60">
            </div>
        </div>
    `;
    
    openPopup("⚙️ Paramètres", html, `
        <button class="popup-button green" onclick="saveSettings()">💾 Enregistrer</button>
        <button class="popup-button gray" onclick="displayConfigMenu()">Annuler</button>
    `);
}

function saveSettings() {
    showSnackbar("✅ Paramètres enregistrés");
    closePopup();
}

function showDatabaseManagement() {
    showSnackbar("🗃️ Gestion Base de Données - Bientôt disponible");
}

function showBackupOptions() {
    let html = `
        <div class="info-section">
            <h3>💾 Options de Sauvegarde</h3>
            <div style="margin-bottom: 20px;">
                <h4>Sauvegarde manuelle</h4>
                <p style="color:#7f8c8d;">Créez une copie de sécurité de toutes vos données.</p>
                <button class="popup-button blue" onclick="backupAllData()">📥 Télécharger sauvegarde</button>
            </div>
            <div style="margin-bottom: 20px;">
                <h4>Sauvegarde automatique</h4>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="autoBackup"> Activer la sauvegarde automatique
                    </label>
                </div>
                <div class="form-group">
                    <label>Fréquence</label>
                    <select id="backupFrequency" class="form-input">
                        <option value="daily">Quotidienne</option>
                        <option value="weekly">Hebdomadaire</option>
                        <option value="monthly">Mensuelle</option>
                    </select>
                </div>
            </div>
            <div>
                <h4>Statistiques de stockage</h4>
                <div style="padding: 15px; background: #2c3e50; border-radius: 5px;">
                    <p><strong>Espace utilisé:</strong> ${calculateStorageSize()} KB</p>
                    <p><strong>Dernière sauvegarde:</strong> ${localStorage.getItem('last_backup') || 'Jamais'}</p>
                </div>
            </div>
        </div>
    `;
    
    openPopup("💾 Sauvegarde", html, `
        <button class="popup-button green" onclick="saveBackupSettings()">💾 Enregistrer</button>
        <button class="popup-button gray" onclick="displayConfigMenu()">Retour</button>
    `);
}

function calculateStorageSize() {
    let total = 0;
    for(let key in localStorage) {
        if(localStorage.hasOwnProperty(key)) {
            total += localStorage[key].length;
        }
    }
    return Math.round(total / 1024);
}

function saveBackupSettings() {
    const autoBackup = document.getElementById('autoBackup').checked;
    const frequency = document.getElementById('backupFrequency').value;
    
    localStorage.setItem('auto_backup', autoBackup);
    localStorage.setItem('backup_frequency', frequency);
    
    showSnackbar("✅ Paramètres de sauvegarde enregistrés");
    closePopup();
}

function showRestoreOptions() {
    let html = `
        <div class="info-section">
            <h3>📤 Restauration des Données</h3>
            <div style="margin-bottom: 20px;">
                <h4>Restaurer depuis un fichier</h4>
                <p style="color:#e74c3c; font-size:0.9em;">⚠️ Attention: La restauration écrasera toutes les données actuelles.</p>
                <input type="file" id="restoreFile" class="form-input" accept=".json">
                <button class="popup-button orange" onclick="restoreFromFile()" style="margin-top:10px;">🔄 Restaurer</button>
            </div>
            <div>
                <h4>Restaurer depuis la sauvegarde locale</h4>
                <p style="color:#7f8c8d;">Utilisez la dernière sauvegarde automatique.</p>
                <button class="popup-button blue" onclick="restoreFromLocalBackup()">📂 Restaurer sauvegarde locale</button>
            </div>
        </div>
    `;
    
    openPopup("📤 Restauration", html, `
        <button class="popup-button gray" onclick="displayConfigMenu()">Annuler</button>
    `);
}

function restoreFromFile() {
    const fileInput = document.getElementById('restoreFile');
    if (!fileInput.files[0]) {
        showSnackbar("⚠️ Veuillez sélectionner un fichier");
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backupData = JSON.parse(e.target.result);
            
            if (confirm(`Êtes-vous sûr de vouloir restaurer les données ?\n\nCette action écrasera toutes les données actuelles.\n\nDate de sauvegarde: ${backupData.backup_date || 'Inconnue'}`)) {
                // Restaurer toutes les données
                agents = backupData.agents || [];
                planningData = backupData.planningData || {};
                holidays = backupData.holidays || [];
                panicCodes = backupData.panicCodes || [];
                radios = backupData.radios || [];
                uniforms = backupData.uniforms || [];
                warnings = backupData.warnings || [];
                leaves = backupData.leaves || [];
                radioHistory = backupData.radioHistory || [];
                auditLog = backupData.auditLog || [];
                
                saveData();
                showSnackbar("✅ Données restaurées avec succès");
                setTimeout(() => {
                    location.reload();
                }, 1000);
            }
        } catch (error) {
            showSnackbar("❌ Erreur lors de la restauration: fichier invalide");
        }
    };
    reader.readAsText(fileInput.files[0]);
}

function restoreFromLocalBackup() {
    if (confirm("Restaurer depuis la dernière sauvegarde locale ?\n\nCette action écrasera toutes les données actuelles.")) {
        // Cette fonction nécessiterait d'avoir une sauvegarde locale stockée
        showSnackbar("ℹ️ Fonctionnalité en développement");
    }
}

function showClearDataConfirm() {
    if (confirm(`Êtes-vous ABSOLUMENT sûr de vouloir effacer TOUTES les données ?\n\n⚠️ Cette action est IRREVERSIBLE !\n\nTous les agents, plannings, congés, avertissements, etc. seront définitivement supprimés.`)) {
        clearAllData();
    }
}

function clearAllData() {
    // Effacer le localStorage
    localStorage.clear();
    
    // Réinitialiser les variables globales
    agents = [];
    planningData = {};
    holidays = [];
    panicCodes = [];
    radios = [];
    uniforms = [];
    warnings = [];
    leaves = [];
    radioHistory = [];
    auditLog = [];
    
    showSnackbar("✅ Toutes les données ont été effacées");
    setTimeout(() => {
        location.reload();
    }, 1500);
}

function showResetConfirm() {
    if (confirm(`Réinitialiser l'application aux paramètres d'usine ?\n\nCela effacera toutes les données et réinitialisera les paramètres.`)) {
        resetToFactory();
    }
}

function resetToFactory() {
    localStorage.clear();
    
    // Réinitialiser avec les données de test
    initializeTestData();
    
    showSnackbar("✅ Application réinitialisée aux paramètres d'usine");
    setTimeout(() => {
        location.reload();
    }, 1500);
}

function showAbout() {
    let html = `
        <div class="info-section">
            <h3>ℹ️ À propos du SGA</h3>
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 3em; margin-bottom: 10px;">📋</div>
                <h2>Système de Gestion des Agents</h2>
                <p style="color: #3498db; font-weight: bold;">Version 1.0</p>
            </div>
            <div style="padding: 15px; background: #2c3e50; border-radius: 5px; margin-bottom: 20px;">
                <h4 style="margin-top: 0;">📊 Fonctionnalités</h4>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Gestion complète des agents</li>
                    <li>Planning des shifts</li>
                    <li>Gestion des congés et absences</li>
                    <li>Codes panique</li>
                    <li>Gestion du parc radio</li>
                    <li>Habillement et équipement</li>
                    <li>Avertissements disciplinaires</li>
                    <li>Jours fériés</li>
                    <li>Exportations multiples</li>
                </ul>
            </div>
            <div style="padding: 15px; background: #34495e; border-radius: 5px;">
                <h4 style="margin-top: 0;">🛠️ Informations techniques</h4>
                <p><strong>Technologies:</strong> HTML5, CSS3, JavaScript (ES6+)</p>
                <p><strong>Stockage:</strong> LocalStorage</p>
                <p><strong>Compatibilité:</strong> Tous les navigateurs modernes</p>
                <p><strong>Développé par:</strong> Équipe SGA</p>
                <p><strong>Contact:</strong> support@sga.com</p>
            </div>
        </div>
    `;
    
    openPopup("ℹ️ À propos", html, `
        <button class="popup-button gray" onclick="closePopup()">Fermer</button>
    `);
}