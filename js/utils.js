///////////////////////////////////////////////////////////
// Utility Functions
///////////////////////////////////////////////////////////

/**
 * Defines and returns the application's consistent color palette for charts.
 * @param {number} [count] - The number of colors to return.
 * @returns {string|string[]} A single color or an array of colors.
 */
function getChartColors(count) {
    // Colors aligned with the new CSS variables from Init.md
    const colors = [
        '#2C4A7C', // --primary-dark
        '#6B8CAE', // --primary-light
        '#B08FA3', // --severity-mild (Purple)
        '#4A90E2', // --accent
        '#A8C0D8', // --primary-lighter
        '#4A2C47', // --severity-serious (Dark Purple)
        '#E5E5E5', // --severity-unknown (Gray)
        '#3D2841', // --severity-fatal
    ];

    if (count) {
        return colors.slice(0, count);
    }
    return colors;
}

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

function parseDate(value, fieldName, uniqueId) {
    if (!value) return null;
    if (value instanceof Date && !isNaN(value)) return new Date(value);

    let dateString = String(value).trim();

    // Reject ambiguous dates like YYYY or YYYYMM
    if (/^\d{4}$/.test(dateString) || /^\d{6}$/.test(dateString)) {
        console.warn(`Ambiguous date format "${dateString}" for field "${fieldName}" in record ${uniqueId}. Skipping.`);
        return null;
    }
    
    // Handle numeric YYYYMMDD format (from number or string)
    if (/^\d{8}$/.test(dateString)) {
        const year = parseInt(dateString.substring(0, 4), 10);
        const month = parseInt(dateString.substring(4, 6), 10) - 1;
        const day = parseInt(dateString.substring(6, 8), 10);
        const d = new Date(year, month, day);
        if (d.getFullYear() === year && d.getMonth() === month && d.getDate() === day) {
            return d;
        }
    }
    
    // Handle Excel date serial number
    if (typeof value === 'number' && value > 1000 && value < 100000) {
        try {
            const excelEpoch = new Date(Date.UTC(1899, 11, 30));
            const d = new Date(excelEpoch.getTime() + (value * 86400000));
            if (!isNaN(d.getTime())) return d;
        } catch (e) { console.warn("Failed to parse Excel date:", value); }
    }
    
    // Handle various string formats
    if (typeof value === 'string') {
        let d = new Date(dateString);
        if (!isNaN(d.getTime())) return d;

        const parts = dateString.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
        if (parts) {
            const p1 = parseInt(parts[1], 10);
            const p2 = parseInt(parts[2], 10);
            const p3 = parseInt(parts[3], 10);
            d = new Date(p3, p2 - 1, p1);
            if (d.getFullYear() === p3 && d.getMonth() === p2 - 1 && d.getDate() === p1) return d;
            d = new Date(p3, p1 - 1, p2);
            if (d.getFullYear() === p3 && d.getMonth() === p1 - 1 && d.getDate() === p2) return d;
        }
    }
    
    console.warn(`Could not parse date "${value}" for field "${fieldName}" in record ${uniqueId}.`);
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
    showToast(message, 'error');
}

function showSuccess(message) {
    showToast(message, 'success');
}

function showDataErrors(errors) {
    if (errors.length === 0) return;

    const message = `
        <strong>Data Quality Warning:</strong> ${errors.length} issue(s) found.
        <br>Record ID ${errors[0].id}: Invalid date "${errors[0].value}" in field "${errors[0].field}".
        ${errors.length > 1 ? `<br>...and ${errors.length - 1} more issues.` : ''}
        <br>Check the console for a full report.
    `;
    showToast(message, 'error', 10000); // Show for 10 seconds

    console.warn("Full list of data quality issues:", errors);
}

function showToast(message, type = 'info', duration = 5000) {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = message;

    toastContainer.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    // Animate out and remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 500);
    }, duration);
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

/**
 * Creates a Chart.js chart with enhanced features and error handling.
 * @param {string} canvasId - The ID of the canvas element.
 * @param {string} type - The chart type (e.g., 'bar', 'pie').
 * @param {object} data - The chart data object.
 * @param {object} options - The chart options object.
 */
function createChartEnhanced(canvasId, type, data, options = {}) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) {
        console.error(`Canvas with id ${canvasId} not found.`);
        return;
    }

    if (activeCharts[canvasId]) {
        activeCharts[canvasId].destroy();
    }

    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                enabled: true,
                mode: 'index',
                intersect: false,
            }
        },
    };

    activeCharts[canvasId] = new Chart(ctx, {
        type: type,
        data: data,
        options: { ...defaultOptions, ...options },
    });
}