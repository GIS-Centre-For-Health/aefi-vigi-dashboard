///////////////////////////////////////////////////////////
// Utility Functions
///////////////////////////////////////////////////////////

function getUniqueValues(data, field) {
    const values = new Set();
    data.forEach(row => {
        if (row[field]) {
            values.add(row[field]);
        }
    });
    return Array.from(values).sort();
}

function clearSelectOptions(select, keepFirst) {
    const optionsToKeep = keepFirst ? 1 : 0;
    while (select.options.length > optionsToKeep) {
        select.remove(optionsToKeep);
    }
}

function parseDate(value) {
    if (!value) return null;
    if (value instanceof Date) return new Date(value);
    
    // Handle Excel date serial number
    if (typeof value === 'number' && value > 1000 && value < 100000) {
        try {
            const excelDate = XLSX.SSF.parse_date_code(value);
            if (excelDate) return new Date(excelDate.y, excelDate.m - 1, excelDate.d);
        } catch (e) { console.warn("Failed to parse Excel date:", value); }
    }
    
    // Handle string dates
    if (typeof value === 'string') {
        const d = new Date(value.trim());
        return isNaN(d.getTime()) ? null : d;
    }
    
    return null;
}

function countField(data, field) {
    const counts = {};
    data.forEach(row => {
        const value = row[field] ? row[field].toString().trim() : 'Unknown';
        counts[value] = (counts[value] || 0) + 1;
    });
    return counts;
}

function generateSummaryStats(data) {
    const summaryContainer = document.getElementById('summary-stats');
    summaryContainer.innerHTML = ''; // Clear previous stats

    if (!data || data.length === 0) {
        summaryContainer.innerHTML = '<p>No data to summarize.</p>';
        return;
    }

    const totalRecords = data.length;

    // Group data by patient ID to get patient-centric stats
    const patients = {};
    data.forEach(row => {
        const patientId = row['Worldwide unique id'];
        if (!patientId) return; // Skip rows without a patient ID

        if (!patients[patientId]) {
            patients[patientId] = {
                seriousEventCount: 0,
                hasSeriousEvent: false
            };
        }

        const seriousValue = row.Serious;
        if (typeof seriousValue === 'string') {
            const yesCount = (seriousValue.match(/yes/gi) || []).length;
            if (yesCount > 0) {
                patients[patientId].seriousEventCount += yesCount;
                patients[patientId].hasSeriousEvent = true;
            }
        }
    });

    const patientIds = Object.keys(patients);
    const totalPatients = patientIds.length;
    const patientsWithSeriousEvents = patientIds.filter(id => patients[id].hasSeriousEvent).length;
    const totalSeriousEvents = patientIds.reduce((acc, id) => acc + patients[id].seriousEventCount, 0);

    const uniqueVaccineSet = new Set();
    data.forEach(row => {
        const vaccineValue = row.Vaccine;
        if (typeof vaccineValue === 'string') {
            const vaccineArray = vaccineValue.split(',').map(v => v.trim());
            vaccineArray.forEach(vaccine => {
                if (vaccine) {
                    uniqueVaccineSet.add(vaccine);
                }
            });
        }
    });
    const uniqueVaccines = uniqueVaccineSet.size;

    const reportingProvinces = getUniqueValues(data, 'Patient state or province').length;
    
    const ages = data.map(r => r.NormalizedAge).filter(age => age !== null && age !== undefined);
    let averageAgeFormatted = 'N/A';
    if (ages.length > 0) {
        const averageAge = ages.reduce((a, b) => a + b, 0) / ages.length;
        const years = Math.floor(averageAge);
        const months = Math.round((averageAge - years) * 12);
        averageAgeFormatted = `${years} Years, ${months} Months`;
    }

    const stats = [
        { title: 'Total Reports', value: totalRecords.toLocaleString() },
        { title: 'Total Patients', value: totalPatients.toLocaleString() },
        { title: 'Patients with Serious Events', value: `${patientsWithSeriousEvents.toLocaleString()} (${(totalPatients > 0 ? (patientsWithSeriousEvents / totalPatients) * 100 : 0).toFixed(1)}%)` },
        { title: 'Total Serious Events', value: totalSeriousEvents.toLocaleString() },
        { title: 'Unique Vaccines', value: uniqueVaccines.toLocaleString() },
        { title: 'Reporting Provinces', value: reportingProvinces.toLocaleString() },
        { title: 'Average Age', value: averageAgeFormatted }
    ];

    stats.forEach(stat => {
        const card = document.createElement('div');
        card.className = 'stat-card';
        card.innerHTML = `<div class="stat-title">${stat.title}</div><div class="stat-value">${stat.value}</div>`;
        summaryContainer.appendChild(card);
    });
}

///////////////////////////////////////////////////////////
// Status and Notification Functions
///////////////////////////////////////////////////////////
function showLoading(message) {
    const loading = document.getElementById('loading');
    const loadingMessage = document.getElementById('loading-message');
    loadingMessage.textContent = message || 'Processing...';
    loading.classList.add('active');
}

function hideLoading() {
    document.getElementById('loading').classList.remove('active');
}

function showError(message) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = 'status error';
    setTimeout(() => { status.className = 'status'; }, 5000);
}

function showSuccess(message) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = 'status success';
    setTimeout(() => { status.className = 'status'; }, 3000);
}

///////////////////////////////////////////////////////////
// Export Functions
///////////////////////////////////////////////////////////
function exportToCSV() {
    const headers = Object.keys(filteredData[0] || {});
    let csvContent = headers.join(',') + '\r\n';
    filteredData.forEach(row => {
        const values = headers.map(header => {
            const value = row[header] instanceof Date ? row[header].toISOString().split('T')[0] : row[header];
            const valueStr = String(value || '');
            return valueStr.includes(',') ? `"${valueStr.replace(/"/g, '""')}"` : valueStr;
        });
        csvContent += values.join(',') + '\r\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'aefi_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showSuccess('CSV exported successfully');
}

function exportToPDF() {
    if (typeof jsPDF === 'undefined') {
        showError('PDF export library not loaded');
        return;
    }
    
    showSuccess('PDF export feature coming soon');
}

function exportAllChartsToPNG() {
    if (typeof html2canvas === 'undefined') {
        showError('Image export library not loaded');
        return;
    }
    
    showSuccess('PNG export feature coming soon');
}
