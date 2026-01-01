// FONCTIONS UTILITAIRES

function getMonthName(month) {
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return months[month - 1] || '';
}

function isHolidayDate(date) {
    const dateStr = date.toISOString().split('T')[0];
    return holidays.some(h => h.date === dateStr);
}

function getShiftForAgent(agentCode, dateStr) {
    const monthKey = dateStr.substring(0, 7);
    if (planningData[monthKey] && planningData[monthKey][agentCode] && planningData[monthKey][agentCode][dateStr]) {
        return planningData[monthKey][agentCode][dateStr].shift;
    }
    return calculateTheoreticalShift(agentCode, dateStr);
}

function calculateTheoreticalShift(agentCode, dateStr) {
    const agent = agents.find(a => a.code === agentCode);
    if (!agent || agent.statut !== 'actif') return '-';
    
    const date = new Date(dateStr);
    const group = agent.groupe;
    
    if (group === 'E') {
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) return 'R';
        const dayNum = date.getDate();
        return dayNum % 2 === 0 ? '1' : '2';
    } else {
        const daysSinceStart = Math.floor((date - DATE_AFFECTATION_BASE) / (1000 * 60 * 60 * 24));
        let groupOffset = 0;
        switch(group) {
            case 'A': groupOffset = 0; break;
            case 'B': groupOffset = 2; break;
            case 'C': groupOffset = 4; break;
            case 'D': groupOffset = 6; break;
        }
        const cycleDay = (daysSinceStart + groupOffset) % 8;
        switch(cycleDay) {
            case 0: case 1: return '1';
            case 2: case 3: return '2';
            case 4: case 5: return '3';
            case 6: case 7: return 'R';
            default: return '-';
        }
    }
}

function calculateAgentStats(agentCode, month, year) {
    const daysInMonth = new Date(year, month, 0).getDate();
    const stats = { '1': 0, '2': 0, '3': 0, 'R': 0, 'C': 0, 'M': 0, 'A': 0, '-': 0 };
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const shift = getShiftForAgent(agentCode, dateStr);
        if (stats[shift] !== undefined) stats[shift]++;
    }
    
    return [
        { label: 'Matin (1)', value: stats['1'] },
        { label: 'Après-midi (2)', value: stats['2'] },
        { label: 'Nuit (3)', value: stats['3'] },
        { label: 'Repos (R)', value: stats['R'] },
        { label: 'Congés (C)', value: stats['C'] + stats['M'] + stats['A'] },
        { label: 'Jours total', value: daysInMonth }
    ];
}

function downloadCSV(content, filename) {
    const blob = new Blob(["\uFEFF" + content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}