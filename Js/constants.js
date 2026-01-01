// CONSTANTES ET CONFIGURATIONS GLOBALES

const JOURS_FRANCAIS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

const SHIFT_LABELS = {
    '1': 'Matin',
    '2': 'Après-midi',
    '3': 'Nuit',
    'R': 'Repos',
    'C': 'Congé',
    'M': 'Maladie',
    'A': 'Autre absence',
    '-': 'Non défini'
};

const SHIFT_COLORS = {
    '1': '#3498db',
    '2': '#e74c3c',
    '3': '#9b59b6',
    'R': '#2ecc71',
    'C': '#f39c12',
    'M': '#e67e22',
    'A': '#95a5a6',
    '-': '#7f8c8d'
};

const DATE_AFFECTATION_BASE = new Date('2024-01-01');

const WARNING_TYPES = {
    ORAL: { label: 'Avertissement Oral', color: '#f39c12', severity: 1 },
    ECRIT: { label: 'Avertissement Écrit', color: '#e74c3c', severity: 2 },
    MISE_A_PIED: { label: 'Mise à pied', color: '#c0392b', severity: 3 }
};

// Variables globales
let agents = [];
let planningData = {};
let holidays = [];
let panicCodes = [];
let radios = [];
let uniforms = [];
let warnings = [];
let leaves = [];
let radioHistory = [];
let auditLog = [];