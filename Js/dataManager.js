// GESTION DES DONNÉES (LOCALSTORAGE)

function loadData() {
    const loadItem = (key, defaultValue) => {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : defaultValue;
    };
    
    agents = loadItem('sga_agents', []);
    planningData = loadItem('sga_planning', {});
    holidays = loadItem('sga_holidays', []);
    panicCodes = loadItem('sga_panic_codes', []);
    radios = loadItem('sga_radios', []);
    uniforms = loadItem('sga_uniforms', []);
    warnings = loadItem('sga_warnings', []);
    leaves = loadItem('sga_leaves', []);
    radioHistory = loadItem('sga_radio_history', []);
    auditLog = loadItem('sga_audit_log', []);
    
    if (holidays.length === 0) initializeHolidays();
}
// Gestion des jours fériés
getHolidays: function() {
    return this.getData('holidays') || [];
},

saveHolidays: function(holidays) {
    this.saveData('holidays', holidays);
},

// Vérifier si une date est un jour férié
isHoliday: function(date) {
    const holidays = this.getHolidays();
    const dateStr = date.toISOString().split('T')[0];
    return holidays.some(h => h.date === dateStr);
},

// Obtenir les jours fériés pour un mois
getHolidaysForMonth: function(year, month) {
    const holidays = this.getHolidays();
    return holidays.filter(h => {
        const [hYear, hMonth] = h.date.split('-');
        return parseInt(hYear) === year && parseInt(hMonth) === month + 1;
    });
}
function saveData() {
    const saveItem = (key, data) => {
        localStorage.setItem(key, JSON.stringify(data));
    };
    
    saveItem('sga_agents', agents);
    saveItem('sga_planning', planningData);
    saveItem('sga_holidays', holidays);
    saveItem('sga_panic_codes', panicCodes);
    saveItem('sga_radios', radios);
    saveItem('sga_uniforms', uniforms);
    saveItem('sga_warnings', warnings);
    saveItem('sga_leaves', leaves);
    saveItem('sga_radio_history', radioHistory);
    saveItem('sga_audit_log', auditLog);
}

function initializeTestData() {
    agents = [
        { code: 'A01', nom: 'Dupont', prenom: 'Alice', groupe: 'A', matricule: 'MAT001', cin: 'AA123456', tel: '0601-010101', poste: 'Agent de sécurité', date_entree: '2024-01-01', date_sortie: null, statut: 'actif' },
        { code: 'B02', nom: 'Martin', prenom: 'Bob', groupe: 'B', matricule: 'MAT002', cin: 'BB654321', tel: '0602-020202', poste: 'Superviseur', date_entree: '2024-01-01', date_sortie: null, statut: 'actif' },
        { code: 'C03', nom: 'Lefevre', prenom: 'Carole', groupe: 'C', matricule: 'MAT003', cin: 'CC789012', tel: '0603-030303', poste: 'Agent de sécurité', date_entree: '2024-01-01', date_sortie: null, statut: 'actif' },
        { code: 'D04', nom: 'Dubois', prenom: 'David', groupe: 'D', matricule: 'MAT004', cin: 'DD345678', tel: '0604-040404', poste: 'Chef d\'équipe', date_entree: '2024-01-01', date_sortie: null, statut: 'actif' },
        { code: 'E01', nom: 'Zahiri', prenom: 'Ahmed', groupe: 'E', matricule: 'MAT005', cin: 'EE901234', tel: '0605-050505', poste: 'Agent spécial', date_entree: '2024-01-01', date_sortie: null, statut: 'actif' },
        { code: 'E02', nom: 'Zarrouk', prenom: 'Benoit', groupe: 'E', matricule: 'MAT006', cin: 'FF567890', tel: '0606-060606', poste: 'Agent spécial', date_entree: '2024-01-01', date_sortie: null, statut: 'actif' }
    ];
    
    initializeHolidays();
    saveData();
}

function initializeHolidays() {
    const year = new Date().getFullYear();
    holidays = [
        { date: `${year}-01-01`, description: 'Nouvel An', type: 'fixe' },
        { date: `${year}-01-11`, description: 'Manifeste de l\'Indépendance', type: 'fixe' },
        { date: `${year}-05-01`, description: 'Fête du Travail', type: 'fixe' },
        { date: `${year}-07-30`, description: 'Fête du Trône', type: 'fixe' },
        { date: `${year}-08-14`, description: 'Allégeance Oued Eddahab', type: 'fixe' },
        { date: `${year}-08-20`, description: 'Révolution du Roi et du Peuple', type: 'fixe' },
        { date: `${year}-08-21`, description: 'Fête de la Jeunesse', type: 'fixe' },
        { date: `${year}-11-06`, description: 'Marche Verte', type: 'fixe' },
        { date: `${year}-11-18`, description: 'Fête de l\'Indépendance', type: 'fixe' }
    ];
}
// Gestion du planning
getPlanningData: function() {
    return this.getData('planning') || {};
},

savePlanningData: function(planningData) {
    this.saveData('planning', planningData);
},

// Fonctions de planning supplémentaires
getActiveAgents: function() {
    return this.getAgents().filter(a => a.statut === 'actif');
},

getAgentsByGroup: function(group) {
    return this.getAgents().filter(a => a.groupe === group && a.statut === 'actif');
},

getShiftData: function(shiftCode = null) {
    const SHIFT_DATA = {
        'M': { label: 'Matin', color: '#FFD700', hours: 8, type: 'morning' },
        'A': { label: 'Après-midi', color: '#87CEEB', hours: 8, type: 'afternoon' },
        'N': { label: 'Nuit', color: '#4169E1', hours: 12, type: 'night' },
        'R': { label: 'Repos', color: '#32CD32', hours: 0, type: 'rest' },
        'X': { label: 'Non défini', color: '#CCCCCC', hours: 0, type: 'undefined' },
        'C': { label: 'Congé', color: '#FF6347', hours: 0, type: 'leave' }
    };
    
    return shiftCode ? SHIFT_DATA[shiftCode] : SHIFT_DATA;
},

getDefaultShift: function(agent, dateStr) {
    // Logique de shift par défaut
    const date = new Date(dateStr);
    const day = date.getDay();
    
    // Exemple : repos le weekend
    if (day === 0 || day === 6) return 'R';
    
    // Logique métier à adapter
    return 'M'; // Par défaut matin
},

isAgentOnLeave: function(agentCode, dateStr) {
    // Vérifier si l'agent est en congé
    const leaves = this.getLeaves() || [];
    return leaves.some(leave => 
        leave.agentCode === agentCode && 
        leave.date === dateStr && 
        leave.status === 'approved'
    );
}
// Gestion du planning
getPlanningData: function() {
    return this.getData('planning') || {};
},
savePlanningData: function(planningData) {
    this.saveData('planning', planningData);
},
// Récupérer les agents actifs
getActiveAgents: function() {
    return this.getAgents().filter(a => a.statut === 'actif');
},

// Récupérer les agents par groupe
getAgentsByGroup: function(group) {
    return this.getAgents().filter(a => a.groupe === group && a.statut === 'actif');
},

// Données des shifts (à adapter selon vos besoins)
getShiftData: function(shiftCode = null) {
    const SHIFT_DATA = {
        'M': { 
            label: 'Matin', 
            color: '#FFD700', 
            hours: 8, 
            type: 'morning',
            class: 'shift-morning'
        },
        'A': { 
            label: 'Après-midi', 
            color: '#87CEEB', 
            hours: 8, 
            type: 'afternoon',
            class: 'shift-afternoon'
        },
        'N': { 
            label: 'Nuit', 
            color: '#4169E1', 
            hours: 12, 
            type: 'night',
            class: 'shift-night'
        },
        'R': { 
            label: 'Repos', 
            color: '#32CD32', 
            hours: 0, 
            type: 'rest',
            class: 'shift-rest'
        },
        'X': { 
            label: 'Non défini', 
            color: '#CCCCCC', 
            hours: 0, 
            type: 'undefined',
            class: 'shift-undefined'
        },
        'C': { 
            label: 'Congé', 
            color: '#FF6347', 
            hours: 0, 
            type: 'leave',
            class: 'shift-leave'
        }
    };
    
    return shiftCode ? SHIFT_DATA[shiftCode] : SHIFT_DATA;
},

// Shift par défaut pour un agent
getDefaultShift: function(agent, dateStr) {
    // Logique basique - à adapter selon vos règles métier
    const date = new Date(dateStr);
    const day = date.getDay();
    
    // Exemple : repos le weekend
    if (day === 0 || day === 6) return 'R';
    
    // Retourne un shift par défaut (à personnaliser)
    return 'M';
},

// Vérifier si un agent est en congé
isAgentOnLeave: function(agentCode, dateStr) {
    // À implémenter avec votre module congés
    return false;
},

// Vérifier si une date est un jour férié
isHoliday: function(date) {
    const holidays = this.getHolidays() || [];
    const dateStr = date.toISOString().split('T')[0];
    return holidays.some(h => h.date === dateStr);
}
// Gestion de l'habillement
getUniforms: function() {
    return this.getData('uniforms') || { uniforms: [], history: [] };
},

saveUniforms: function(uniformsData) {
    this.saveData('uniforms', uniformsData);
}