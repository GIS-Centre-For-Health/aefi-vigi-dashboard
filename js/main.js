///////////////////////////////////////////////////////////
// Global variables and initialization
///////////////////////////////////////////////////////////
let rawData = [];
let filteredData = [];
let activeCharts = {};

// Set up event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('upload').addEventListener('change', handleFileUpload);
    document.getElementById('apply-filters').addEventListener('click', applyFilters);
    document.getElementById('reset-filters').addEventListener('click', resetFilters);
    document.getElementById('export-data').addEventListener('click', toggleExportOptions);
    
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            switchTab(targetSection);
        });
    });
    
    // Export options
    document.querySelectorAll('.export-option').forEach(option => {
        option.addEventListener('click', function() {
            const exportType = this.getAttribute('data-type');
            exportData(exportType);
            document.getElementById('export-options').classList.remove('active');
        });
    });
});

///////////////////////////////////////////////////////////
// File handling and data processing
///////////////////////////////////////////////////////////
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    showLoading('Reading file...');
    
    const fileInfo = document.getElementById('file-info');
    fileInfo.textContent = `File: ${file.name}`;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            showLoading('Processing data...');
            
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array', cellDates: true });
            
            const aefiSheetName = findAefiSheet(workbook.SheetNames);
            if (!aefiSheetName) {
                showError("Could not find AEFI line listing sheet.");
                hideLoading();
                return;
            }
            
            const worksheet = workbook.Sheets[aefiSheetName];
            rawData = XLSX.utils.sheet_to_json(worksheet, { raw: true, defval: null });
            
            if (rawData.length === 0) {
                showError("No data found in the Excel file.");
                hideLoading();
                return;
            }
            
            processData(rawData);
        } catch (error) {
            console.error("Error processing file:", error);
            showError(`Error processing file: ${error.message}`);
            hideLoading();
        }
    };
    
    reader.onerror = function() {
        showError("Failed to read the file.");
        hideLoading();
    };
    
    reader.readAsArrayBuffer(file);
}

function findAefiSheet(sheetNames) {
    for (const name of sheetNames) {
        if (name.toLowerCase().includes('aefi') && name.toLowerCase().includes('line')) {
            return name;
        }
    }
    return sheetNames.length > 0 ? sheetNames[0] : null;
}

function processData(data) {
    showLoading('Analyzing and normalizing data...');
    
    // Use the compatibility bridge to process data
    const processedData = processAEFIData(data);
    
    filteredData = [...processedData];
    rawData = [...processedData];
    
    // Generate UI components with the processed data
    generateSummaryStats(filteredData);
    populateFilterOptions(filteredData);
    generateAllCharts(filteredData);
    
    // Show the main content sections
    document.getElementById('filter-section').style.display = 'flex';
    document.getElementById('summary-section').style.display = 'block';
    document.getElementById('visualization-container').style.display = 'block';
    
    // Disable upload button
    const uploadInput = document.getElementById('upload');
    const uploadLabel = document.querySelector('.file-label');
    uploadInput.disabled = true;
    uploadLabel.style.cursor = 'not-allowed';
    uploadLabel.style.backgroundColor = '#e9ecef';
    document.getElementById('file-label-text').textContent = 'File Loaded Successfully';

    showSuccess(`Successfully processed ${data.length} records.`);
    hideLoading();
}

function preprocessDates(data) {
    const dateFields = [
        'Date of birth', 'Date of vaccination', 'Date of onset',
        'Date of notification', 'Date of report'
    ];
    
    data.forEach(record => {
        dateFields.forEach(field => {
            if (record[field]) {
                record[field] = parseDate(record[field]);
            }
        });
    });
}

function populateFilterOptions(data) {
    const regionSelect = document.getElementById('region-filter');
    clearSelectOptions(regionSelect, true);
    const regions = getUniqueValues(data, 'Created by organisation level 3');
    regions.forEach(region => {
        if (region) {
            const option = document.createElement('option');
            option.value = region;
            option.textContent = region;
            regionSelect.appendChild(option);
        }
    });
    
    const vaccineSelect = document.getElementById('vaccine-filter');
    clearSelectOptions(vaccineSelect, true);
    const vaccines = getUniqueValues(data, 'Vaccine');
    vaccines.forEach(vaccine => {
        if (vaccine) {
            const option = document.createElement('option');
            option.value = vaccine;
            option.textContent = vaccine;
            vaccineSelect.appendChild(option);
        }
    });
}

///////////////////////////////////////////////////////////
// UI Interaction Functions
///////////////////////////////////////////////////////////
function switchTab(targetSection) {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.toggle('active', tab.getAttribute('data-section') === targetSection);
    });
    document.querySelectorAll('.chart-section').forEach(section => {
        section.classList.toggle('active', section.id === `${targetSection}-section`);
    });
}

function toggleExportOptions(event) {
    event.stopPropagation();
    document.getElementById('export-options').classList.toggle('active');
}

function applyFilters() {
    showLoading('Applying filters...');
    
    const regionFilter = document.getElementById('region-filter').value;
    const dateRange = document.getElementById('date-range').value;
    const vaccineFilter = document.getElementById('vaccine-filter').value;
    
    filteredData = [...rawData];
    
    if (regionFilter !== 'all') {
        filteredData = filteredData.filter(row => row['Created by organisation level 3'] === regionFilter);
    }
    if (vaccineFilter !== 'all') {
        filteredData = filteredData.filter(row => row['Vaccine'] === vaccineFilter);
    }
    if (dateRange !== 'all') {
        const now = new Date();
        let startDate;
        switch (dateRange) {
            case 'last30': startDate = new Date(now.setDate(now.getDate() - 30)); break;
            case 'last90': startDate = new Date(now.setDate(now.getDate() - 90)); break;
            case 'last180': startDate = new Date(now.setDate(now.getDate() - 180)); break;
        }
        if (startDate) {
            filteredData = filteredData.filter(row => row['Date of report'] && row['Date of report'] >= startDate);
        }
    }
    
    generateAllCharts(filteredData);
    generateSummaryStats(filteredData);
    
    showSuccess(`Applied filters: ${filteredData.length} records matching.`);
    hideLoading();
}

function resetFilters() {
    // Reset filter inputs
    document.getElementById('region-filter').value = 'all';
    document.getElementById('date-range').value = 'all';
    document.getElementById('vaccine-filter').value = 'all';
    
    // Clear data
    rawData = [];
    filteredData = [];
    
    // Clear charts
    Object.values(activeCharts).forEach(chart => chart.destroy());
    activeCharts = {};
    
    // Hide dashboard sections
    document.getElementById('filter-section').style.display = 'none';
    document.getElementById('summary-section').style.display = 'none';
    document.getElementById('visualization-container').style.display = 'none';
    document.getElementById('file-info').textContent = '';

    // Re-enable upload button
    const uploadInput = document.getElementById('upload');
    const uploadLabel = document.querySelector('.file-label');
    uploadInput.disabled = false;
    uploadInput.value = ''; // Clear the file input
    uploadLabel.style.cursor = 'pointer';
    uploadLabel.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
    document.getElementById('file-label-text').textContent = 'Upload AEFI Excel File';
    
    showSuccess('Dashboard has been reset.');
}

function exportData(type) {
    showLoading(`Preparing ${type.toUpperCase()} export...`);
    setTimeout(() => {
        switch (type) {
            case 'pdf': exportToPDF(); break;
            case 'csv': exportToCSV(); break;
            case 'png': exportAllChartsToPNG(); break;
        }
        hideLoading();
    }, 100);
}

///////////////////////////////////////////////////////////
// Chart Generation Functions
///////////////////////////////////////////////////////////
function generateAllCharts(data) {
    Object.values(activeCharts).forEach(chart => chart.destroy());
    activeCharts = {};
    
    // Demographics
    generateSexDistribution(data);
    generateAgeDistribution(data);
    
    // Geographic
    generateProvincesDistribution(data);
    generateRegionDistribution(data);
    
    // Clinical
    generateAdverseEventsDistribution(data);
    generateSeriousEventDistribution(data);
    
    // Temporal
    generateVaccinationReportGap(data);
    generateReportsOverTime(data);
    
    // Vaccine
    generateVaccineDistribution(data);
    generateVaccineAdverseEvents(data);
}

function createChart(canvasId, type, chartData, options) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    activeCharts[canvasId] = new Chart(ctx, { type, data: chartData, options });
}

// Specific Chart Functions
function generateSexDistribution(data) {
    updateSexChart(data);
}

function generateAgeDistribution(data) {
    const ageGroups = { '0-1': 0, '2-5': 0, '6-11': 0, '12-17': 0, '18-44': 0, '45-64': 0, '65+': 0, 'Unknown': 0 };
    data.forEach(row => {
        const age = row.NormalizedAge;
        if (age === undefined || age === null) ageGroups['Unknown']++;
        else if (age < 2) ageGroups['0-1']++;
        else if (age < 6) ageGroups['2-5']++;
        else if (age < 12) ageGroups['6-11']++;
        else if (age < 18) ageGroups['12-17']++;
        else if (age < 45) ageGroups['18-44']++;
        else if (age < 65) ageGroups['45-64']++;
        else ageGroups['65+']++;
    });
    createChartEnhanced('ageGroupChart', 'bar', {
        labels: Object.keys(ageGroups),
        datasets: [{ label: 'Age Distribution (Years)', data: Object.values(ageGroups), backgroundColor: '#2ecc71' }]
    });
}

function generateProvincesDistribution(data) {
    const provinces = countField(data, 'Patient state or province');
    createChartEnhanced('provincesChart', 'bar', {
        labels: Object.keys(provinces),
        datasets: [{ label: 'Cases by Province', data: Object.values(provinces), backgroundColor: '#e67e22' }]
    });
}

function generateRegionDistribution(data) {
    const regions = countField(data, 'Created by organisation level 3');
    createChartEnhanced('regionChart', 'bar', {
        labels: Object.keys(regions),
        datasets: [{ label: 'Cases by Region', data: Object.values(regions), backgroundColor: '#9b59b6' }]
    });
}

function generateAdverseEventsDistribution(data) {
    const events = countField(data, 'Adverse event');
    const top15Events = Object.entries(events).sort((a, b) => b[1] - a[1]).slice(0, 15);
    createChartEnhanced('adverseEventsChart', 'bar', {
        labels: top15Events.map(e => e[0]),
        datasets: [{ label: 'Top 15 Adverse Events', data: top15Events.map(e => e[1]), backgroundColor: '#e74c3c' }]
    });
}

function generateSeriousEventDistribution(data) {
    const serious = countField(data, 'Serious');
    createChartEnhanced('seriousnessChart', 'pie', {
        labels: Object.keys(serious),
        datasets: [{ data: Object.values(serious), backgroundColor: ['#f1c40f', '#34495e', '#95a5a6'] }]
    });
}

function generateVaccinationReportGap(data) {
    const gaps = data.map(row => {
        const vaccDate = parseDate(row['Date of vaccination']);
        const reportDate = parseDate(row['Date of report']);
        if (vaccDate && reportDate) {
            return (reportDate - vaccDate) / (1000 * 60 * 60 * 24);
        }
        return null;
    }).filter(gap => gap !== null && gap >= 0);

    const gapGroups = { '0-7 Days': 0, '8-30 Days': 0, '31-90 Days': 0, '91+ Days': 0 };
    gaps.forEach(d => {
        if (d <= 7) gapGroups['0-7 Days']++;
        else if (d <= 30) gapGroups['8-30 Days']++;
        else if (d <= 90) gapGroups['31-90 Days']++;
        else gapGroups['91+ Days']++;
    });

    createChartEnhanced('timeToOnsetChart', 'bar', {
        labels: Object.keys(gapGroups),
        datasets: [{ label: 'Days from Vaccination to Report', data: Object.values(gapGroups), backgroundColor: '#1abc9c' }]
    });
}

function generateReportsOverTime(data) {
    const reports = {};
    data.forEach(row => {
        const reportDate = parseDate(row['Date of report']);
        if (reportDate) {
            const month = reportDate.toISOString().slice(0, 7);
            reports[month] = (reports[month] || 0) + 1;
        }
    });
    const sortedMonths = Object.keys(reports).sort();
    const sortedData = sortedMonths.map(month => reports[month]);

    createChartEnhanced('reportsTimeChart', 'line', {
        labels: sortedMonths,
        datasets: [{ label: 'Reports per Month', data: sortedData, borderColor: '#3498db', fill: false }]
    });
}

function generateVaccineDistribution(data) {
    const vaccines = countField(data, 'Vaccine');
    const top15Vaccines = Object.entries(vaccines).sort((a, b) => b[1] - a[1]).slice(0, 15);
    createChartEnhanced('vaccineChart', 'bar', {
        labels: top15Vaccines.map(v => v[0]),
        datasets: [{ label: 'Top 15 Vaccines', data: top15Vaccines.map(v => v[1]), backgroundColor: '#2980b9' }]
    });
}

function generateVaccineAdverseEvents(data) {
    // This is a complex chart. For now, we'll show a placeholder.
    createChartEnhanced('vaccineAdverseChart', 'bar', {
        labels: ['Placeholder'],
        datasets: [{ label: 'AEs by Vaccine (Coming Soon)', data: [100], backgroundColor: '#8e44ad' }]
    });
}