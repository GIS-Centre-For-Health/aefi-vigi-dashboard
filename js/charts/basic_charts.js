/**
 * Enhanced Chart Functions
 * 
 * This file contains implementations for additional chart types that integrate
 * with both the new architecture and provide fallback compatibility.
 */

// Helper function to create charts consistently
function createChartSafely(canvasId, config) {
    // Destroy existing chart if it exists
    if (typeof activeCharts !== 'undefined' && activeCharts[canvasId]) {
        activeCharts[canvasId].destroy();
        delete activeCharts[canvasId];
    }
    
    const ctx = document.getElementById(canvasId);
    if (!ctx) {
        console.warn(`Canvas element ${canvasId} not found`);
        return null;
    }
    
    const chartContext = ctx.getContext('2d');
    const chart = new Chart(chartContext, config);
    
    // Store in global activeCharts if available
    if (typeof activeCharts !== 'undefined') {
        activeCharts[canvasId] = chart;
    }
    
    return chart;
}

// Age Group Chart - Enhanced for new architecture
function updateAgeGroupChart(data) {
    if (!Array.isArray(data) || data.length === 0) return;
    
    // Use the same age grouping logic as main.js
    const ageGroups = { 'Under 1': 0, '1-4': 0, '5-14': 0, '15-24': 0, '25-44': 0, '45-64': 0, '65+': 0 };
    
    data.forEach(row => {
        if (row.Age && !isNaN(row.Age)) {
            let ageInYears = parseFloat(row.Age);
            if (row['Age unit'] === 'Months') ageInYears /= 12;
            if (row['Age unit'] === 'Days') ageInYears /= 365;
            
            if (ageInYears < 1) ageGroups['Under 1']++;
            else if (ageInYears < 5) ageGroups['1-4']++;
            else if (ageInYears < 15) ageGroups['5-14']++;
            else if (ageInYears < 25) ageGroups['15-24']++;
            else if (ageInYears < 45) ageGroups['25-44']++;
            else if (ageInYears < 65) ageGroups['45-64']++;
            else ageGroups['65+']++;
        }
    });
    
    const config = {
        type: 'bar',
        data: {
            labels: Object.keys(ageGroups),
            datasets: [{
                label: 'Age Distribution',
                data: Object.values(ageGroups),
                backgroundColor: '#2ecc71'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        }
    };
    
    createChartSafely('ageGroupChart', config);
    console.log('Age group chart updated');
}

// Vaccine Chart
function updateVaccineChart(data) {
    if (!Array.isArray(data) || data.length === 0) return;
    
    const vaccines = (typeof countField !== 'undefined') 
        ? countField(data, 'Vaccine')
        : {};
    
    const config = {
        type: 'bar',
        data: {
            labels: Object.keys(vaccines),
            datasets: [{
                label: 'Cases by Vaccine',
                data: Object.values(vaccines),
                backgroundColor: '#2980b9'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        }
    };
    
    createChartSafely('vaccineChart', config);
    console.log('Vaccine chart updated');
}

// Seriousness Chart
function updateSeriousnessChart(data) {
    if (!Array.isArray(data) || data.length === 0) return;
    
    const seriousness = (typeof countField !== 'undefined')
        ? countField(data, 'Serious')
        : {};
    
    const config = {
        type: 'pie',
        data: {
            labels: Object.keys(seriousness),
            datasets: [{
                data: Object.values(seriousness),
                backgroundColor: ['#f1c40f', '#34495e']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    };
    
    createChartSafely('seriousnessChart', config);
    console.log('Seriousness chart updated');
}

// Outcome Chart
function updateOutcomeChart(data) {
    if (!Array.isArray(data) || data.length === 0) return;
    
    const outcomes = (typeof countField !== 'undefined')
        ? countField(data, 'Outcome')
        : {};
    
    const config = {
        type: 'pie',
        data: {
            labels: Object.keys(outcomes),
            datasets: [{
                data: Object.values(outcomes),
                backgroundColor: [
                    '#2ecc71',
                    '#f39c12',
                    '#e74c3c',
                    '#6B8CAE',
                    '#95a5a6'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    };
    
    createChartSafely('outcomeChart', config);
    console.log('Outcome chart updated');
}

// Time to Onset Chart
function updateTimeToOnsetChart(data) {
    if (!Array.isArray(data) || data.length === 0) return;
    
    // Calculate vaccination to report gap (matching main.js logic)
    const gaps = data.map(row => {
        if (row['Date of vaccination'] && row['Date of report']) {
            return (row['Date of report'] - row['Date of vaccination']) / (1000 * 60 * 60 * 24);
        }
        return null;
    }).filter(gap => gap !== null);
    
    const config = {
        type: 'bar',
        data: {
            labels: ['0-7', '8-30', '31-90', '91+'],
            datasets: [{
                label: 'Days',
                data: [
                    gaps.filter(d => d <= 7).length,
                    gaps.filter(d => d > 7 && d <= 30).length,
                    gaps.filter(d => d > 30 && d <= 90).length,
                    gaps.filter(d => d > 90).length
                ],
                backgroundColor: '#1abc9c'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        }
    };
    
    createChartSafely('timeToOnsetChart', config);
    console.log('Time to onset chart updated');
}