// POINT D'ENTRÉE PRINCIPAL

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    displayMainMenu();
    checkExpiredWarnings();
    console.log("SGA initialisé - Version Modularisée");
});

// Initialisation de l'application
function initApp() {
    loadData();
    if (agents.length === 0) {
        initializeTestData();
    }
}

// === AJOUT DES FONCTIONS PLACEHOLDER MANQUANTES ===

// Fonctions placeholder pour les modules non implémentés
function showGlobalStats() { showSnackbar("📈 Statistiques Globales - Bientôt disponible"); }
function showAgentStatsSelection() { showSnackbar("👤 Statistiques par Agent - Bientôt disponible"); }
function showWorkedDaysMenu() { showSnackbar("📊 Jours Travaillés - Bientôt disponible"); }
function showGroupStatsSelection() { showSnackbar("📉 Statistiques par Groupe - Bientôt disponible"); }
function showMonthlyStats() { showSnackbar("📅 Statistiques Mensuelles - Bientôt disponible"); }
function generateFullReport() { showSnackbar("📋 Rapport Complet - Bientôt disponible"); }
function showDeleteLeaveForm() { showSnackbar("🗑️ Supprimer Congé - Bientôt disponible"); }
function showGroupLeavesSelection() { showSnackbar("📊 Congés par Groupe - Bientôt disponible"); }
function showImportExcelForm() { showSnackbar("📁 Importer Excel - Bientôt disponible"); }
function showImportCSVForm() { showSnackbar("📥 Importer CSV - Bientôt disponible"); }
function exportAgentsData() { showSnackbar("📤 Exporter Agents - Bientôt disponible"); }
function showShiftModification(agentCode, dateStr, currentShift) { showSnackbar(`✏️ Modification de shift pour ${agentCode} - Bientôt disponible`); }
function showAbsenceFormForDate(agentCode, dateStr) { showSnackbar(`🚫 Absence pour ${agentCode} - Bientôt disponible`); }
function showAddLeaveForAgent(agentCode) { showSnackbar(`🏖️ Congé pour ${agentCode} - Bientôt disponible`); }
function showAgentPlanning(agentCode) { showSnackbar(`📅 Planning ${agentCode} - Bientôt disponible`); }
function showAgentStats(agentCode) { showSnackbar(`📊 Stats ${agentCode} - Bientôt disponible`); }
function printPlanning() { showSnackbar("🖨️ Impression - Bientôt disponible"); }
function printAgentPlanning(agentCode, month, year) { showSnackbar(`🖨️ Impression planning ${agentCode} - Bientôt disponible`); }
function previewShiftExchange() { showSnackbar("👁️ Prévisualisation échange - Bientôt disponible"); }
function showGroupStats(group, month, year) { showSnackbar(`📊 Stats groupe ${group} - Bientôt disponible`); }
function generatePlanningForGroup(group, month, year) { showSnackbar(`🔄 Génération groupe ${group} - Bientôt disponible`); }
function showTrimesterDetailed(startMonth, year) { showSnackbar("📊 Détail trimestriel - Bientôt disponible"); }
function previewLeave() { showSnackbar("👁️ Prévisualisation congé - Bientôt disponible"); }

// === AJOUT DES ANIMATIONS CSS ===
const style = document.createElement('style');
style.textContent = `
    @keyframes fadein {
        from {bottom: 0; opacity: 0;}
        to {bottom: 30px; opacity: 1;}
    }
    @keyframes fadeout {
        from {bottom: 30px; opacity: 1;}
        to {bottom: 0; opacity: 0;}
    }
    #snackbar {
        animation: fadein 0.5s;
    }
`;
document.head.appendChild(style);