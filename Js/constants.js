// CONSTANTES ET CONFIGURATIONS GLOBALES - Version sécurisée

// === Configuration de base ===
const APP_CONFIG = {
    JOURS_FRANCAIS: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
    
    SHIFT_LABELS: {
        '1': 'Matin',
        '2': 'Après-midi', 
        '3': 'Nuit',
        'R': 'Repos',
        'C': 'Congé',
        'M': 'Maladie',
        'A': 'Autre absence',
        '-': 'Non défini'
    },
    
    SHIFT_COLORS: {
        '1': '#3498db',  // Bleu pour Matin
        '2': '#e74c3c',  // Rouge pour Après-midi
        '3': '#9b59b6',  // Violet pour Nuit
        'R': '#2ecc71',  // Vert pour Repos
        'C': '#f39c12',  // Orange pour Congé
        'M': '#e67e22',  // Orange foncé pour Maladie
        'A': '#95a5a6',  // Gris pour Autre absence
        '-': '#7f8c8d'   // Gris foncé pour Non défini
    },
    
    DATE_AFFECTATION_BASE: new Date('2025-11-01'),
    
    WARNING_TYPES: {
        ORAL: { 
            label: 'Avertissement Oral', 
            color: '#f39c12', 
            severity: 1,
            points: 1
        },
        ECRIT: { 
            label: 'Avertissement Écrit', 
            color: '#e74c3c', 
            severity: 2,
            points: 2
        },
        MISE_A_PIED: { 
            label: 'Mise à pied', 
            color: '#c0392b', 
            severity: 3,
            points: 3
        }
    },
    
    // Niveaux d'accès
    ACCESS_LEVELS: {
        AGENT: 1,
        SUPERVISOR: 2,
        MANAGER: 3,
        ADMIN: 4
    },
    
    // Codes panique par défaut
    DEFAULT_PANIC_CODES: [
        { code: 'RED', label: 'Urgence médicale', color: '#e74c3c' },
        { code: 'BLUE', label: 'Incident sécurité', color: '#3498db' },
        { code: 'YELLOW', label: 'Équipement défectueux', color: '#f1c40f' },
        { code: 'GREEN', label: 'Situation normale', color: '#2ecc71' }
    ],
    
    // Types de congés
    LEAVE_TYPES: {
        ANNUAL: 'Congés annuels',
        SICK: 'Congés maladie',
        MATERNITY: 'Congés maternité',
        PATERNITY: 'Congés paternité',
        OTHER: 'Autres'
    },
    
    // Statuts des agents
    AGENT_STATUS: {
        ACTIVE: 'Actif',
        INACTIVE: 'Inactif',
        ON_LEAVE: 'En congé',
        SUSPENDED: 'Suspendu'
    }
};

// === Gestionnaires de données (isolés dans un objet) ===
const APP_DATA = {
    // Initialisation avec valeurs par défaut
    agents: [],
    planningData: {},
    holidays: [],
    panicCodes: [],
    radios: [],
    uniforms: [],
    warnings: [],
    leaves: [],
    radioHistory: [],
    auditLog: [],
    
    // Méthodes d'accès sécurisées
    getAgents() {
        return [...this.agents]; // Retourne une copie
    },
    
    setAgents(newAgents) {
        if (Array.isArray(newAgents)) {
            this.agents = newAgents;
            this.logDataChange('agents', newAgents.length);
        }
    },
    
    getPlanningData() {
        return { ...this.planningData }; // Retourne une copie
    },
    
    setPlanningData(newData) {
        if (typeof newData === 'object' && newData !== null) {
            this.planningData = newData;
        }
    },
    
    // Journalisation des changements
    logDataChange(dataType, size) {
        this.auditLog.push({
            timestamp: new Date().toISOString(),
            type: dataType,
            action: 'update',
            size: size,
            user: 'system'
        });
        
        // Limite à 1000 entrées maximum
        if (this.auditLog.length > 1000) {
            this.auditLog = this.auditLog.slice(-1000);
        }
    },
    
    // Initialisation depuis localStorage
    initFromStorage() {
        try {
            const savedData = localStorage.getItem('cleanco_app_data');
            if (savedData) {
                const parsed = JSON.parse(savedData);
                
                // Fusionner avec les données par défaut
                Object.keys(parsed).forEach(key => {
                    if (this.hasOwnProperty(key)) {
                        this[key] = parsed[key];
                    }
                });
                
                console.log('📦 Données chargées depuis localStorage');
                return true;
            }
        } catch (error) {
            console.error('❌ Erreur chargement localStorage:', error);
            this.initDefaultData();
        }
        return false;
    },
    
    // Initialisation avec données par défaut
    initDefaultData() {
        this.panicCodes = APP_CONFIG.DEFAULT_PANIC_CODES;
        this.holidays = this.generateDefaultHolidays();
        this.uniforms = this.generateDefaultUniforms();
        console.log('📦 Données par défaut initialisées');
    },
    
    // Générer les jours fériés pour 2025-2026
    generateDefaultHolidays() {
        const holidays = [];
        const baseYear = 2025;
        
        const frenchHolidays = [
            { name: 'Jour de l\'an', date: `${baseYear}-01-01` },
            { name: 'Lundi de Pâques', date: `${baseYear}-04-06` },
            { name: 'Fête du Travail', date: `${baseYear}-05-01` },
            { name: 'Victoire 1945', date: `${baseYear}-05-08` },
            { name: 'Ascension', date: `${baseYear}-05-14` },
            { name: 'Lundi de Pentecôte', date: `${baseYear}-05-25` },
            { name: 'Fête Nationale', date: `${baseYear}-07-14` },
            { name: 'Assomption', date: `${baseYear}-08-15` },
            { name: 'Toussaint', date: `${baseYear}-11-01` },
            { name: 'Armistice', date: `${baseYear}-11-11` },
            { name: 'Noël', date: `${baseYear}-12-25` }
        ];
        
        // Ajouter les années suivantes
        for (let year = baseYear; year <= 2026; year++) {
            frenchHolidays.forEach(holiday => {
                const dateStr = holiday.date.replace(baseYear.toString(), year.toString());
                holidays.push({
                    name: holiday.name,
                    date: dateStr,
                    year: year
                });
            });
        }
        
        return holidays;
    },
    
    // Générer l'inventaire uniforme par défaut
    generateDefaultUniforms() {
        return [
            { id: 1, type: 'T-shirt', size: 'M', color: 'Blanc', quantity: 50, minStock: 20 },
            { id: 2, type: 'Pantalon', size: 'M', color: 'Noir', quantity: 40, minStock: 15 },
            { id: 3, type: 'Veste', size: 'M', color: 'Noir', quantity: 30, minStock: 10 },
            { id: 4, type: 'Chaussures', size: '42', color: 'Noir', quantity: 25, minStock: 10 },
            { id: 5, type: 'Gants', size: 'Unique', color: 'Gris', quantity: 100, minStock: 50 }
        ];
    },
    
    // Sauvegarde dans localStorage
    saveToStorage() {
        try {
            const dataToSave = {
                agents: this.agents,
                planningData: this.planningData,
                holidays: this.holidays,
                panicCodes: this.panicCodes,
                radios: this.radios,
                uniforms: this.uniforms,
                warnings: this.warnings,
                leaves: this.leaves,
                radioHistory: this.radioHistory.slice(-100), // Garde seulement 100 dernières entrées
                auditLog: this.auditLog.slice(-500) // Garde seulement 500 dernières entrées
            };
            
            localStorage.setItem('cleanco_app_data', JSON.stringify(dataToSave));
            console.log('💾 Données sauvegardées');
            return true;
        } catch (error) {
            console.error('❌ Erreur sauvegarde localStorage:', error);
            return false;
        }
    },
    
    // Auto-sauvegarde toutes les 30 secondes
    startAutoSave() {
        setInterval(() => {
            if (this.autoSaveEnabled) {
                this.saveToStorage();
            }
        }, 30000); // 30 secondes
    }
};

// === Utilitaires globaux ===
const APP_UTILS = {
    // Formater une date
    formatDate(date, includeTime = false) {
        if (!date) return 'N/A';
        
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Date invalide';
        
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        
        let formatted = `${day}/${month}/${year}`;
        
        if (includeTime) {
            const hours = d.getHours().toString().padStart(2, '0');
            const minutes = d.getMinutes().toString().padStart(2, '0');
            formatted += ` ${hours}:${minutes}`;
        }
        
        return formatted;
    },
    
    // Obtenir le jour de la semaine
    getDayName(date) {
        const d = new Date(date);
        return APP_CONFIG.JOURS_FRANCAIS[d.getDay()];
    },
    
    // Calculer la différence en jours
    getDaysDiff(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },
    
    // Valider un email
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    // Valider un téléphone français
    isValidPhone(phone) {
        const re = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
        return re.test(phone);
    },
    
    // Générer un ID unique
    generateId(prefix = '') {
        return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // Copier dans le presse-papier
    copyToClipboard(text) {
        return navigator.clipboard.writeText(text).then(
            () => true,
            () => false
        );
    },
    
    // Télécharger un fichier
    downloadFile(content, fileName, type = 'text/plain') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};

// === Initialisation sécurisée ===
// Exposer les objets globalement avec une vérification
(function() {
    // Vérifier si les noms existent déjà
    if (window.APP_CONFIG) {
        console.warn('⚠️ APP_CONFIG existe déjà, fusion des configurations');
        Object.assign(window.APP_CONFIG, APP_CONFIG);
    } else {
        window.APP_CONFIG = APP_CONFIG;
    }
    
    if (window.APP_DATA) {
        console.warn('⚠️ APP_DATA existe déjà, remplacement');
    }
    window.APP_DATA = APP_DATA;
    
    if (window.APP_UTILS) {
        console.warn('⚠️ APP_UTILS existe déjà, fusion');
        Object.assign(window.APP_UTILS, APP_UTILS);
    } else {
        window.APP_UTILS = APP_UTILS;
    }
    
    // Initialiser les données
    document.addEventListener('DOMContentLoaded', function() {
        APP_DATA.initFromStorage();
        
        // Démarrer l'auto-sauvegarde si l'app est active
        setTimeout(() => {
            APP_DATA.startAutoSave();
        }, 5000);
    });
    
    // Sauvegarder avant de quitter
    window.addEventListener('beforeunload', function() {
        APP_DATA.saveToStorage();
    });
    
    console.log('✅ Constantes et données initialisées');
})();

// Export pour modules (si utilisé)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        APP_CONFIG,
        APP_DATA,
        APP_UTILS
    };
}
