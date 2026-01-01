// GESTION DES MENUS PRINCIPAUX ET SOUS-MENUS

{ id: 'holidays', text: '🎉 Jours Fériés', module: 'HolidaysModule' }
function displayMainMenu() {
    const mainContent = document.getElementById('main-content');
    document.getElementById('sub-title').textContent = "Menu Principal - SGA";
    mainContent.innerHTML = '';
    
    const menuContainer = document.createElement('div');
    menuContainer.className = 'menu-button-container';
    
    const options = [
        { text: "👥 GESTION DES AGENTS", handler: () => displayAgentsManagementMenu(), className: "menu-section" },
        { text: "📅 GESTION DU PLANNING", handler: () => displayPlanningMenu(), className: "menu-section" },
        { text: "📊 STATISTIQUES & CLASSEMENT", handler: () => displayStatisticsMenu(), className: "menu-section" },
        { text: "🏖️ CONGÉS & ABSENCES", handler: () => displayLeavesMenu(), className: "menu-section" },
        { text: "🚨 CODES PANIQUE", handler: () => displayPanicCodesMenu(), className: "menu-section" },
        { text: "📻 GESTION RADIOS", handler: () => displayRadiosMenu(), className: "menu-section" },
        { text: "👔 HABILLEMENT", handler: () => displayUniformMenu(), className: "menu-section" },
        { text: "⚠️ AVERTISSEMENTS", handler: () => displayWarningsMenu(), className: "menu-section" },
        { text: "🎉 JOURS FÉRIÉS", handler: () => displayHolidaysMenu(), className: "menu-section" },
        { text: "💾 EXPORTATIONS", handler: () => displayExportMenu(), className: "menu-section" },
        { text: "⚙️ CONFIGURATION", handler: () => displayConfigMenu(), className: "menu-section" },
        { text: "🚪 QUITTER", handler: () => { if(confirm("Quitter ?")) { saveData(); window.close(); } }, className: "quit-button" }
    ];
    
    options.forEach(option => {
        const btn = document.createElement('button');
        btn.textContent = option.text;
        btn.className = 'menu-button' + (option.className ? ' ' + option.className : '');
        btn.onclick = option.handler;
        menuContainer.appendChild(btn);
    });
    
    mainContent.appendChild(menuContainer);
}

function displayAgentsManagementMenu() {
    displaySubMenu("GESTION DES AGENTS", [
        { text: "📋 Liste des Agents", handler: () => displayAgentsList() },
        { text: "➕ Ajouter un Agent", handler: () => showAddAgentForm() },
        { text: "✏️ Modifier un Agent", handler: () => showEditAgentList() },
        { text: "🗑️ Supprimer un Agent", handler: () => showDeleteAgentList() },
        { text: "📁 Importer Agents (Excel)", handler: () => showImportExcelForm() },
        { text: "📥 Importer Agents (CSV)", handler: () => showImportCSVForm() },
        { text: "🔄 Agents de Test", handler: () => initializeTestDataWithConfirm() },
        { text: "📤 Exporter Agents", handler: () => exportAgentsData() },
        { text: "↩️ Retour Menu Principal", handler: () => displayMainMenu(), className: "back-button" }
    ]);
}

function displayPlanningMenu() {
    displaySubMenu("GESTION DU PLANNING", [
        { text: "📅 Planning Mensuel", handler: () => showMonthlyPlanning() },
        { text: "👥 Planning par Groupe", handler: () => showGroupPlanningSelection() },
        { text: "👤 Planning par Agent", handler: () => showAgentPlanningSelection() },
        { text: "📊 Planning Trimestriel", handler: () => showTrimestrialPlanning() },
        { text: "✏️ Modifier Shift", handler: () => showShiftModificationForm() },
        { text: "🔄 Échanger Shifts", handler: () => showShiftExchangeForm() },
        { text: "➕ Ajouter Absence", handler: () => showAbsenceForm() },
        { text: "🔄 Générer Planning", handler: () => generatePlanning() },
        { text: "↩️ Retour Menu Principal", handler: () => displayMainMenu(), className: "back-button" }
    ]);
}

function displayStatisticsMenu() {
    displaySubMenu("STATISTIQUES & CLASSEMENT", [
        { text: "📈 Statistiques Globales", handler: () => showGlobalStats() },
        { text: "👤 Statistiques par Agent", handler: () => showAgentStatsSelection() },
        { text: "🏆 Classement des Agents", handler: () => runClassement() },
        { text: "📊 Jours Travaillés", handler: () => showWorkedDaysMenu() },
        { text: "📉 Statistiques par Groupe", handler: () => showGroupStatsSelection() },
        { text: "📅 Statistiques Mensuelles", handler: () => showMonthlyStats() },
        { text: "📋 Rapport Complet", handler: () => generateFullReport() },
        { text: "↩️ Retour Menu Principal", handler: () => displayMainMenu(), className: "back-button" }
    ]);
}

function displayLeavesMenu() {
    displaySubMenu("CONGÉS & ABSENCES", [
        { text: "➕ Ajouter Congé", handler: () => showAddLeaveForm() },
        { text: "🗑️ Supprimer Congé", handler: () => showDeleteLeaveForm() },
        { text: "📋 Liste des Congés", handler: () => showLeavesList() },
        { text: "📅 Congés par Agent", handler: () => showAgentLeavesSelection() },
        { text: "📊 Congés par Groupe", handler: () => showGroupLeavesSelection() },
        { text: "⚠️ Ajouter Absence Maladie", handler: () => showSickLeaveForm() },
        { text: "🚫 Ajouter Autre Absence", handler: () => showOtherAbsenceForm() },
        { text: "↩️ Retour Menu Principal", handler: () => displayMainMenu(), className: "back-button" }
    ]);
}

function displayPanicCodesMenu() {
    displaySubMenu("CODES PANIQUE", [
        { text: "➕ Ajouter Code", handler: () => showAddPanicCodeForm() },
        { text: "✏️ Modifier Code", handler: () => showEditPanicCodeList() },
        { text: "🗑️ Supprimer Code", handler: () => showDeletePanicCodeList() },
        { text: "📋 Liste des Codes", handler: () => showPanicCodesList() },
        { text: "🔍 Rechercher Code", handler: () => showSearchPanicCode() },
        { text: "📤 Exporter Codes", handler: () => exportPanicCodes() },
        { text: "↩️ Retour Menu Principal", handler: () => displayMainMenu(), className: "back-button" }
    ]);
}

function displayRadiosMenu() {
    displaySubMenu("GESTION RADIOS", [
        { text: "➕ Ajouter Radio", handler: () => showAddRadioForm() },
        { text: "✏️ Modifier Radio", handler: () => showEditRadioList() },
        { text: "📋 Liste des Radios", handler: () => showRadiosList() },
        { text: "📲 Attribuer Radio", handler: () => showAssignRadioForm() },
        { text: "🔄 Retour Radio", handler: () => showReturnRadioForm() },
        { text: "📊 Statut Radios", handler: () => showRadiosStatus() },
        { text: "📋 Historique", handler: () => showRadiosHistory() },
        { text: "↩️ Retour Menu Principal", handler: () => displayMainMenu(), className: "back-button" }
    ]);
}

function displayUniformMenu() {
    displaySubMenu("HABILLEMENT", [
        { text: "➕ Enregistrer Habillement", handler: () => showAddUniformForm() },
        { text: "✏️ Modifier Habillement", handler: () => showEditUniformList() },
        { text: "📋 Rapport Habillement", handler: () => showUniformReport() },
        { text: "📊 Statistiques Tailles", handler: () => showUniformStats() },
        { text: "📅 Échéances", handler: () => showUniformDeadlines() },
        { text: "📤 Exporter Rapport", handler: () => exportUniformReport() },
        { text: "↩️ Retour Menu Principal", handler: () => displayMainMenu(), className: "back-button" }
    ]);
}

function displayWarningsMenu() {
    displaySubMenu("AVERTISSEMENTS DISCIPLINAIRES", [
        { text: "⚠️ Ajouter Avertissement", handler: () => showAddWarningForm() },
        { text: "📋 Liste Avertissements", handler: () => showWarningsList() },
        { text: "👤 Avertissements par Agent", handler: () => showAgentWarningsSelection() },
        { text: "📊 Statistiques", handler: () => showWarningsStats() },
        { text: "📤 Exporter Rapport", handler: () => exportWarningsReport() },
        { text: "↩️ Retour Menu Principal", handler: () => displayMainMenu(), className: "back-button" }
    ]);
}

function displayHolidaysMenu() {
    displaySubMenu("GESTION JOURS FÉRIÉS", [
        { text: "➕ Ajouter Jour Férié", handler: () => showAddHolidayForm() },
        { text: "🗑️ Supprimer Jour Férié", handler: () => showDeleteHolidayList() },
        { text: "📋 Liste Jours Fériés", handler: () => showHolidaysList() },
        { text: "🔄 Générer Annuelle", handler: () => generateYearlyHolidays() },
        { text: "📅 Voir par Année", handler: () => showHolidaysByYear() },
        { text: "↩️ Retour Menu Principal", handler: () => displayMainMenu(), className: "back-button" }
    ]);
}

function displayExportMenu() {
    displaySubMenu("EXPORTATIONS", [
        { text: "📊 Statistiques Excel", handler: () => exportStatsExcel() },
        { text: "📅 Planning Excel", handler: () => exportPlanningExcel() },
        { text: "👥 Agents CSV", handler: () => exportAgentsCSV() },
        { text: "📋 Congés PDF", handler: () => exportLeavesPDF() },
        { text: "📊 Rapport Complet", handler: () => exportFullReport() },
        { text: "💾 Sauvegarde Complète", handler: () => backupAllData() },
        { text: "↩️ Retour Menu Principal", handler: () => displayMainMenu(), className: "back-button" }
    ]);
}

function displayConfigMenu() {
    displaySubMenu("CONFIGURATION", [
        { text: "⚙️ Paramètres", handler: () => showSettings() },
        { text: "🗃️ Gestion Base de Données", handler: () => showDatabaseManagement() },
        { text: "💾 Sauvegarde", handler: () => showBackupOptions() },
        { text: "📤 Restauration", handler: () => showRestoreOptions() },
        { text: "🗑️ Effacer Données", handler: () => showClearDataConfirm() },
        { text: "🔄 Réinitialiser", handler: () => showResetConfirm() },
        { text: "ℹ️ A propos", handler: () => showAbout() },
        { text: "↩️ Retour Menu Principal", handler: () => displayMainMenu(), className: "back-button" }
    ]);
}
// Dans MENU_ITEMS
{ id: 'uniforms', text: '👕 Habillement', module: 'UniformsModule' }
function displaySubMenu(title, options) {
    const mainContent = document.getElementById('main-content');
    document.getElementById('sub-title').textContent = title;
    mainContent.innerHTML = '';
    
    const menuContainer = document.createElement('div');
    menuContainer.className = 'menu-button-container';
    
    options.forEach(option => {
        const btn = document.createElement('button');
        btn.textContent = option.text;
        btn.className = 'menu-button' + (option.className ? ' ' + option.className : '');
        btn.onclick = option.handler;
        menuContainer.appendChild(btn);
    });
    
    mainContent.appendChild(menuContainer);
}
