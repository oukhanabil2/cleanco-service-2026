// GESTIONNAIRE DE DONNÉES COMPLET - Version professionnelle
class DataManager {
    constructor() {
        console.log("📦 Initialisation DataManager");
        
        // Configuration
        this.STORAGE_KEYS = {
            AGENTS: 'sga_agents_v2',
            PLANNING: 'sga_planning_v2',
            HOLIDAYS: 'sga_holidays_v2',
            PANIC_CODES: 'sga_panic_codes_v2',
            RADIOS: 'sga_radios_v2',
            UNIFORMS: 'sga_uniforms_v2',
            WARNINGS: 'sga_warnings_v2',
            LEAVES: 'sga_leaves_v2',
            RADIO_HISTORY: 'sga_radio_history_v2',
            AUDIT_LOG: 'sga_audit_log_v2',
            CONFIG: 'sga_config_v2'
        };
        
        // Données en mémoire
        this.data = {
            agents: [],
            planning: {},
            holidays: [],
            panicCodes: [],
            radios: [],
            uniforms: [],
            warnings: [],
            leaves: [],
            radioHistory: [],
            auditLog: [],
            config: {}
        };
        
        // Initialiser
        this.init();
    }
    
    // === MÉTHODES DE BASE ===
    
    init() {
        this.loadAllData();
        
        // Vérifier si les données sont vides
        if (this.data.agents.length === 0) {
            console.log("📝 Aucune donnée trouvée, initialisation avec données test");
            this.initializeTestData();
        }
        
        // Démarrer l'auto-sauvegarde
        this.startAutoSave();
    }
    
    loadAllData() {
        try {
            Object.keys(this.STORAGE_KEYS).forEach(key => {
                const storageKey = this.STORAGE_KEYS[key];
                const itemKey = key.toLowerCase();
                
                const saved = localStorage.getItem(storageKey);
                if (saved) {
                    try {
                        this.data[itemKey] = JSON.parse(saved);
                        console.log(`✅ Chargé: ${itemKey} (${this.data[itemKey].length || Object.keys(this.data[itemKey]).length} items)`);
                    } catch (e) {
                        console.error(`❌ Erreur parsing ${itemKey}:`, e);
                        this.data[itemKey] = this.getDefaultValue(itemKey);
                    }
                }
            });
            
            // Vérifier les jours fériés
            if (this.data.holidays.length === 0) {
                this.initializeHolidays();
            }
            
            return true;
        } catch (error) {
            console.error("❌ Erreur chargement données:", error);
            this.initializeTestData();
            return false;
        }
    }
    
    saveAllData() {
        try {
            Object.keys(this.STORAGE_KEYS).forEach(key => {
                const storageKey = this.STORAGE_KEYS[key];
                const itemKey = key.toLowerCase();
                
                localStorage.setItem(storageKey, JSON.stringify(this.data[itemKey]));
            });
            
            this.logAudit('save_all', 'Toutes données sauvegardées');
            return true;
        } catch (error) {
            console.error("❌ Erreur sauvegarde:", error);
            return false;
        }
    }
    
    getDefaultValue(dataType) {
        const defaults = {
            agents: [],
            planning: {},
            holidays: [],
            panicCodes: [],
            radios: [],
            uniforms: [],
            warnings: [],
            leaves: [],
            radioHistory: [],
            auditLog: [],
            config: {}
        };
        return defaults[dataType] || [];
    }
    
    // === GESTION DES AGENTS ===
    
    getAgents() {
        return [...this.data.agents];
    }
    
    getAgentByCode(code) {
        return this.data.agents.find(agent => agent.code === code);
    }
    
    saveAgents(agents) {
        if (!Array.isArray(agents)) {
            throw new Error("Les agents doivent être un tableau");
        }
        
        this.data.agents = agents;
        this.saveData('agents', agents);
        this.logAudit('agents_update', `Mise à jour ${agents.length} agents`);
        return true;
    }
    
    addAgent(agent) {
        // Validation de base
        if (!agent.code || !agent.nom || !agent.prenom) {
            throw new Error("Agent invalide: code, nom et prénom requis");
        }
        
        // Vérifier si le code existe déjà
        if (this.data.agents.find(a => a.code === agent.code)) {
            throw new Error(`L'agent avec le code ${agent.code} existe déjà`);
        }
        
        // Ajouter des métadonnées
        const newAgent = {
            ...agent,
            id: Date.now(),
            date_creation: new Date().toISOString().split('T')[0],
            date_modification: new Date().toISOString().split('T')[0],
            statut: agent.statut || 'actif'
        };
        
        this.data.agents.push(newAgent);
        this.saveData('agents', this.data.agents);
        this.logAudit('agent_add', `Ajout agent ${agent.code}: ${agent.prenom} ${agent.nom}`);
        
        return newAgent;
    }
    
    updateAgent(code, updates) {
        const index = this.data.agents.findIndex(a => a.code === code);
        if (index === -1) {
            throw new Error(`Agent ${code} non trouvé`);
        }
        
        this.data.agents[index] = {
            ...this.data.agents[index],
            ...updates,
            date_modification: new Date().toISOString().split('T')[0]
        };
        
        this.saveData('agents', this.data.agents);
        this.logAudit('agent_update', `Mise à jour agent ${code}`);
        
        return this.data.agents[index];
    }
    
    deleteAgent(code) {
        const index = this.data.agents.findIndex(a => a.code === code);
        if (index === -1) {
            throw new Error(`Agent ${code} non trouvé`);
        }
        
        const agent = this.data.agents[index];
        this.data.agents.splice(index, 1);
        this.saveData('agents', this.data.agents);
        this.logAudit('agent_delete', `Suppression agent ${code}: ${agent.prenom} ${agent.nom}`);
        
        return agent;
    }
    
    getActiveAgents() {
        return this.data.agents.filter(a => a.statut === 'actif');
    }
    
    getAgentsByGroup(group) {
        return this.data.agents.filter(a => a.groupe === group && a.statut === 'actif');
    }
    
    // === GESTION DU PLANNING ===
    
    getPlanningData() {
        return { ...this.data.planning };
    }
    
    savePlanningData(planningData) {
        this.data.planning = planningData;
        this.saveData('planning', planningData);
        this.logAudit('planning_update', 'Mise à jour planning');
        return true;
    }
    
    getPlanningForDate(dateStr) {
        return this.data.planning[dateStr] || {};
    }
    
    savePlanningForDate(dateStr, shifts) {
        this.data.planning[dateStr] = shifts;
        this.saveData('planning', this.data.planning);
        this.logAudit('planning_date_update', `Planning mis à jour pour ${dateStr}`);
        return true;
    }
    
    getShiftData(shiftCode = null) {
        const SHIFT_DATA = {
            '1': { 
                label: 'Matin', 
                color: '#FFD700', 
                hours: 8, 
                type: 'morning',
                class: 'shift-morning'
            },
            '2': { 
                label: 'Après-midi', 
                color: '#87CEEB', 
                hours: 8, 
                type: 'afternoon',
                class: 'shift-afternoon'
            },
            '3': { 
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
            'C': { 
                label: 'Congé', 
                color: '#FF6347', 
                hours: 0, 
                type: 'leave',
                class: 'shift-leave'
            },
            'M': { 
                label: 'Maladie', 
                color: '#e67e22', 
                hours: 0, 
                type: 'sick',
                class: 'shift-sick'
            },
            'A': { 
                label: 'Autre absence', 
                color: '#95a5a6', 
                hours: 0, 
                type: 'other',
                class: 'shift-other'
            },
            '-': { 
                label: 'Non défini', 
                color: '#CCCCCC', 
                hours: 0, 
                type: 'undefined',
                class: 'shift-undefined'
            }
        };
        
        return shiftCode ? SHIFT_DATA[shiftCode] : SHIFT_DATA;
    }
    
    getDefaultShift(agent, dateStr) {
        // Logique de shift par défaut
        const date = new Date(dateStr);
        const day = date.getDay();
        
        // Repos le weekend (samedi=6, dimanche=0)
        if (day === 0 || day === 6) return 'R';
        
        // Exemple simple: alternance par groupe
        const group = agent.groupe;
        const dayNumber = date.getDate();
        
        switch(group) {
            case 'A': return (dayNumber % 2 === 0) ? '1' : '2';
            case 'B': return (dayNumber % 2 === 0) ? '2' : '3';
            case 'C': return (dayNumber % 2 === 0) ? '3' : '1';
            default: return '1';
        }
    }
    
    // === GESTION DES CONGÉS ===
    
    getLeaves() {
        return [...this.data.leaves];
    }
    
    saveLeaves(leaves) {
        this.data.leaves = leaves;
        this.saveData('leaves', leaves);
        return true;
    }
    
    isAgentOnLeave(agentCode, dateStr) {
        return this.data.leaves.some(leave => 
            leave.agentCode === agentCode && 
            leave.date === dateStr && 
            leave.status === 'approved'
        );
    }
    
    // === GESTION DES JOURS FÉRIÉS ===
    
    getHolidays() {
        return [...this.data.holidays];
    }
    
    saveHolidays(holidays) {
        this.data.holidays = holidays;
        this.saveData('holidays', holidays);
        return true;
    }
    
    isHoliday(date) {
        const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
        return this.data.holidays.some(h => h.date === dateStr);
    }
    
    getHolidaysForMonth(year, month) {
        return this.data.holidays.filter(h => {
            const [hYear, hMonth] = h.date.split('-');
            return parseInt(hYear) === year && parseInt(hMonth) === month + 1;
        });
    }
    
    initializeHolidays() {
        const currentYear = new Date().getFullYear();
        const holidays = [];
        
        // Jours fériés fixes
        const fixedHolidays = [
            { date: `${currentYear}-01-01`, name: 'Nouvel An', type: 'national' },
            { date: `${currentYear}-05-01`, name: 'Fête du Travail', type: 'national' },
            { date: `${currentYear}-05-08`, name: 'Victoire 1945', type: 'national' },
            { date: `${currentYear}-07-14`, name: 'Fête Nationale', type: 'national' },
            { date: `${currentYear}-08-15`, name: 'Assomption', type: 'religious' },
            { date: `${currentYear}-11-01`, name: 'Toussaint', type: 'religious' },
            { date: `${currentYear}-11-11`, name: 'Armistice 1918', type: 'national' },
            { date: `${currentYear}-12-25`, name: 'Noël', type: 'religious' }
        ];
        
        // Jours fériés variables (approximatifs)
        const easter = this.calculateEaster(currentYear);
        holidays.push({ date: this.formatDate(easter), name: 'Pâques', type: 'religious' });
        
        // Lundi de Pâques
        const easterMonday = new Date(easter);
        easterMonday.setDate(easterMonday.getDate() + 1);
        holidays.push({ date: this.formatDate(easterMonday), name: 'Lundi de Pâques', type: 'religious' });
        
        // Ascension (39 jours après Pâques)
        const ascension = new Date(easter);
        ascension.setDate(ascension.getDate() + 39);
        holidays.push({ date: this.formatDate(ascension), name: 'Ascension', type: 'religious' });
        
        // Lundi de Pentecôte (50 jours après Pâques)
        const pentecostMonday = new Date(easter);
        pentecostMonday.setDate(pentecostMonday.getDate() + 50);
        holidays.push({ date: this.formatDate(pentecostMonday), name: 'Lundi de Pentecôte', type: 'religious' });
        
        // Ajouter les jours fixes
        holidays.push(...fixedHolidays);
        
        // Ajouter pour l'année suivante aussi
        const nextYear = currentYear + 1;
        fixedHolidays.forEach(h => {
            holidays.push({
                date: h.date.replace(currentYear.toString(), nextYear.toString()),
                name: h.name,
                type: h.type
            });
        });
        
        this.data.holidays = holidays;
        this.saveData('holidays', holidays);
        
        return holidays;
    }
    
    // === GESTION DES CODES PANIQUE ===
    
    getPanicCodes() {
        return [...this.data.panicCodes];
    }
    
    savePanicCodes(codes) {
        this.data.panicCodes = codes;
        this.saveData('panicCodes', codes);
        return true;
    }
    
    // === GESTION DES RADIOS ===
    
    getRadios() {
        return [...this.data.radios];
    }
    
    saveRadios(radios) {
        this.data.radios = radios;
        this.saveData('radios', radios);
        return true;
    }
    
    getRadioHistory() {
        return [...this.data.radioHistory];
    }
    
    saveRadioHistory(history) {
        this.data.radioHistory = history;
        this.saveData('radioHistory', history);
        return true;
    }
    
    // === GESTION DE L'HABILLEMENT ===
    
    getUniforms() {
        return {
            uniforms: [...this.data.uniforms],
            history: [...this.data.uniformHistory || []]
        };
    }
    
    saveUniforms(uniformsData) {
        this.data.uniforms = uniformsData.uniforms || [];
        this.data.uniformHistory = uniformsData.history || [];
        this.saveData('uniforms', this.data.uniforms);
        return true;
    }
    
    // === GESTION DES AVERTISSEMENTS ===
    
    getWarnings() {
        return [...this.data.warnings];
    }
    
    saveWarnings(warnings) {
        this.data.warnings = warnings;
        this.saveData('warnings', warnings);
        return true;
    }
    
    // === UTILITAIRES ===
    
    formatDate(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    calculateEaster(year) {
        // Algorithme de Meeus pour calculer Pâques
        const a = year % 19;
        const b = Math.floor(year / 100);
        const c = year % 100;
        const d = Math.floor(b / 4);
        const e = b % 4;
        const f = Math.floor((b + 8) / 25);
        const g = Math.floor((b - f + 1) / 3);
        const h = (19 * a + b - d - g + 15) % 30;
        const i = Math.floor(c / 4);
        const k = c % 4;
        const l = (32 + 2 * e + 2 * i - h - k) % 7;
        const m = Math.floor((a + 11 * h + 22 * l) / 451);
        const month = Math.floor((h + l - 7 * m + 114) / 31);
        const day = ((h + l - 7 * m + 114) % 31) + 1;
        
        return new Date(year, month - 1, day);
    }
    
    // === DONNÉES DE TEST ===
    
    initializeTestData() {
        console.log("🧪 Initialisation données test");
        
        // Agents de test
        this.data.agents = [
            { 
                id: 1, code: 'A01', nom: 'Dupont', prenom: 'Alice', 
                groupe: 'A', matricule: 'MAT001', cin: 'AA123456', 
                tel: '0601-010101', poste: 'Agent de sécurité', 
                date_entree: '2024-01-01', date_sortie: null, 
                statut: 'actif', email: 'alice.dupont@example.com' 
            },
            { 
                id: 2, code: 'B02', nom: 'Martin', prenom: 'Bob', 
                groupe: 'B', matricule: 'MAT002', cin: 'BB654321', 
                tel: '0602-020202', poste: 'Superviseur', 
                date_entree: '2024-01-01', date_sortie: null, 
                statut: 'actif', email: 'bob.martin@example.com' 
            },
            { 
                id: 3, code: 'C03', nom: 'Lefevre', prenom: 'Carole', 
                groupe: 'C', matricule: 'MAT003', cin: 'CC789012', 
                tel: '0603-030303', poste: 'Agent de sécurité', 
                date_entree: '2024-01-01', date_sortie: null, 
                statut: 'actif', email: 'carole.lefevre@example.com' 
            }
        ];
        
        // Codes panique de test
        this.data.panicCodes = [
            { code: 'RED', label: 'Urgence médicale', color: '#e74c3c' },
            { code: 'BLUE', label: 'Incident sécurité', color: '#3498db' },
            { code: 'YELLOW', label: 'Équipement défectueux', color: '#f1c40f' },
            { code: 'GREEN', label: 'Situation normale', color: '#2ecc71' }
        ];
        
        // Radios de test
        this.data.radios = [
            { id: 1, numero: 'R001', modele: 'Motorola X', etat: 'disponible', batterie: 85 },
            { id: 2, numero: 'R002', modele: 'Motorola X', etat: 'assigné', batterie: 60, agent: 'A01' },
            { id: 3, numero: 'R003', modele: 'Motorola Y', etat: 'maintenance', batterie: 0 }
        ];
        
        // Uniformes de test
        this.data.uniforms = [
            { id: 1, type: 'T-shirt', size: 'M', color: 'Blanc', quantity: 50, minStock: 20 },
            { id: 2, type: 'Pantalon', size: 'M', color: 'Noir', quantity: 40, minStock: 15 },
            { id: 3, type: 'Veste', size: 'M', color: 'Noir', quantity: 30, minStock: 10 },
            { id: 4, type: 'Chaussures', size: '42', color: 'Noir', quantity: 25, minStock: 10 }
        ];
        
        // Sauvegarder tout
        this.saveAllData();
        this.logAudit('test_data_init', 'Données test initialisées');
        
        console.log("✅ Données test initialisées avec succès");
    }
    
    // === AUDIT ET LOGS ===
    
    logAudit(action, details) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            action: action,
            details: details,
            user: 'system'
        };
        
        this.data.auditLog.push(logEntry);
        
        // Garder seulement les 1000 dernières entrées
        if (this.data.auditLog.length > 1000) {
            this.data.auditLog = this.data.auditLog.slice(-1000);
        }
        
        // Sauvegarder l'audit
        this.saveData('auditLog', this.data.auditLog);
        
        return logEntry;
    }
    
    getAuditLog(limit = 50) {
        return this.data.auditLog.slice(-limit).reverse();
    }
    
    // === SAUVEGARDE AUTOMATIQUE ===
    
    startAutoSave() {
        // Sauvegarde automatique toutes les 30 secondes
        setInterval(() => {
            this.saveAllData();
        }, 30000);
        
        // Sauvegarde avant fermeture
        window.addEventListener('beforeunload', () => {
            this.saveAllData();
        });
        
        console.log("🔄 Auto-sauvegarde activée (30s)");
    }
    
    // === MÉTHODES PRIVÉES ===
    
    saveData(key, data) {
        try {
            const storageKey = this.STORAGE_KEYS[key.toUpperCase()];
            if (!storageKey) {
                console.error(`❌ Clé de stockage inconnue: ${key}`);
                return false;
            }
            
            localStorage.setItem(storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`❌ Erreur sauvegarde ${key}:`, error);
            return false;
        }
    }
}

// Exporter une instance unique
if (typeof window !== 'undefined') {
    if (!window.dataManager) {
        window.dataManager = new DataManager();
        console.log("✅ DataManager initialisé globalement");
    } else {
        console.warn("⚠️ DataManager existe déjà, réutilisation");
    }
}

// Exporter pour modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataManager;
}
