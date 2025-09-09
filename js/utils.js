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

/**
 * Parses a date string from various formats into a JavaScript Date object.
 *
 * @param {string|number} dateStr - The date string or Excel serial number.
 * @param {string} fieldName - The name of the field being parsed.
 * @param {string} recordId - The unique identifier for the record.
 * @returns {Date|null} - The parsed Date object or null if parsing fails.
 */
function parseDate(dateStr, fieldName, recordId) {
    if (dateStr === null || dateStr === undefined || dateStr === '') {
        return null;
    }

    let date = null;

    // Handle Excel serial numbers
    if (typeof dateStr === 'number' && dateStr > 0) {
        // Excel's epoch starts on 1900-01-01, but it incorrectly thinks 1900 is a leap year.
        // JavaScript's epoch is 1970-01-01.
        // The offset is 25569 days (from 1900-01-01 to 1970-01-01), minus 1 for the leap year bug.
        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
        date = new Date(excelEpoch.getTime() + dateStr * 86400000);
    } else {
        const str = String(dateStr).trim();

        // Format: YYYY-MM-DD or YYYY/MM/DD
        if (/^\d{4}[-\/]\d{1,2}[-\/]\d{1,2}$/.test(str)) {
            date = new Date(str);
        }
        // Format: DD-MM-YYYY or DD/MM/YYYY
        else if (/^\d{1,2}[-\/]\d{1,2}[-\/]\d{4}$/.test(str)) {
            const parts = str.split(/[-\/]/);
            date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
        // Format: YYYYMMDD
        else if (/^\d{8}$/.test(str)) {
            date = new Date(str.substring(0, 4), str.substring(4, 6) - 1, str.substring(6, 8));
        }
        // Attempt to parse with the native Date constructor as a fallback
        else {
            date = new Date(str);
        }
    }

    // Check for invalid date
    if (date instanceof Date && !isNaN(date)) {
        return date;
    }

    return null;
}

/**
 * Extracts unique, non-empty values from a specific field in the dataset.
 *
 * @param {Array<Object>} data - The dataset.
 * @param {string} field - The field to extract unique values from.
 * @returns {Array<string>} - An array of unique values.
 */
function getUniqueValues(data, field) {
    const valueSet = new Set();
    data.forEach(row => {
        if (row[field] && typeof row[field] === 'string') {
            const values = row[field].split(/[\,\n]+/);
            values.forEach(value => {
                const trimmedValue = value.trim();
                if (trimmedValue) {
                    valueSet.add(trimmedValue);
                }
            });
        }
    });
    return Array.from(valueSet).sort();
}

/**
 * Clears all options from a select element.
 *
 * @param {HTMLElement} selectElement - The select element to clear.
 * @param {boolean} keepDefault - Whether to keep the first option (the default).
 */
function clearSelectOptions(selectElement, keepDefault = false) {
    const start = keepDefault ? 1 : 0;
    while (selectElement.options.length > start) {
        selectElement.remove(start);
    }
}

/**
 * Generates an array of consistent chart colors.
 *
 * @returns {Array<string>} - An array of RGBA color strings.
 */
function getChartColors() {
    return [
        'rgba(44, 62, 80, 0.6)',
        'rgba(60, 77, 94, 0.6)',
        'rgba(75, 91, 106, 0.6)',
        'rgba(89, 104, 117, 0.6)',
        'rgba(102, 116, 128, 0.6)',
        'rgba(114, 127, 138, 0.6)',
        'rgba(125, 137, 147, 0.6)',
        'rgba(135, 146, 155, 0.6)',
        'rgba(144, 154, 163, 0.6)'
    ];
}

/**
 * Displays a loading overlay with a message.
 *
 * @param {string} message - The message to display.
 */
function showLoading(message) {
    document.getElementById('loading-message').textContent = message;
    document.getElementById('loading').style.display = 'flex';
}

/**
 * Hides the loading overlay.
 */
function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

/**
 * Shows a toast notification with a message.
 *
 * @param {string} message - The message to display.
 * @param {string} type - The type of notification ('success', 'error', 'info').
 */
function showToast(message, type = 'info') {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = `status ${type}`;
    status.style.display = 'block';
    setTimeout(() => {
        status.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    showToast(message, 'success');
}

function showError(message) {
    showToast(message, 'error');
}

function showDataErrors(errors) {
    if (errors.length > 0) {
        const errorMessage = `Found ${errors.length} ambiguous or invalid date entries. Check console for details.`;
        showError(errorMessage);
        console.warn('Data Quality Issues Detected:');
        errors.forEach(error => {
            console.log(`- Record ID: ${error.id}, Field: "${error.field}", Value: "${error.value}"`);
        });
    }
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


function createChart(containerId, title, type, data, options = {}, containerHTML = null) {
    const container = document.getElementById(containerId);
    if (!container) {
        return;
    }

    // Clear previous content
    container.innerHTML = '';

    if (containerHTML) {
        container.innerHTML = containerHTML;
    } else {
        // Create header
        const header = document.createElement('div');
        header.className = 'chart-header';
        header.innerHTML = `<h3 class="chart-title">${title}</h3>`;
        container.appendChild(header);

        // Create content div
        const content = document.createElement('div');
        content.className = 'chart-content active';
        container.appendChild(content);

        // Create canvas
        const canvas = document.createElement('canvas');
        content.appendChild(canvas);
    }

    const canvas = container.querySelector('canvas');
    if (!canvas) {
        return;
    }

    if (activeCharts[containerId]) {
        activeCharts[containerId].destroy();
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

    activeCharts[containerId] = new Chart(canvas, {
        type: type,
        data: data,
        options: { ...defaultOptions, ...options },
    });

    // Tab switching logic for both chart/table views
    const tabs = container.querySelectorAll('.chart-container-tab, .toggle-btn');
    if (tabs.length > 0) {
        const chartContent = container.querySelector('.chart-content');
        const tableContent = container.querySelector('.table-content');

        if (chartContent && tableContent) {
            tabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    e.preventDefault();
                    tabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    const view = tab.getAttribute('data-view');
                    chartContent.classList.toggle('active', view === 'chart');
                    tableContent.classList.toggle('active', view === 'table');
                });
            });
        }
    }
}

function createBarChart(containerId, title, chartData, chartOptions, tableData, tableHeaders) {
    const total = tableData.reduce((sum, row) => sum + row[1], 0);

    let tableRows = '';
    tableData.forEach(row => {
        const percentage = total > 0 ? ((row[1] / total) * 100).toFixed(2) : 0;
        tableRows += `
            <tr>
                <td>${row[0]}</td>
                <td>${row[1]}</td>
                <td>${percentage}%</td>
            </tr>
        `;
    });
    tableRows += `
        <tr class="total-row">
            <td>Total</td>
            <td>${total}</td>
            <td>100.00%</td>
        </tr>
    `;

    const containerHTML = `
        <div class="chart-header">
            <h3 class="chart-title">${title}</h3>
            <div class="chart-container-tabs">
                <button class="chart-container-tab active" data-view="chart">Chart</button>
                <button class="chart-container-tab" data-view="table">Table</button>
            </div>
        </div>
        <div class="chart-content active">
            <canvas></canvas>
        </div>
        <div class="table-content">
            <table>
                <thead>
                    <tr>
                        ${tableHeaders.map(header => `<th>${header}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
    `;

    const container = document.getElementById(containerId);
    container.innerHTML = containerHTML;

    const canvas = container.querySelector('canvas');
    const chart = new Chart(canvas, {
        type: 'bar',
        data: chartData,
        options: chartOptions
    });

    const tabs = container.querySelectorAll('.chart-container-tab');
    const chartContent = container.querySelector('.chart-content');
    const tableContent = container.querySelector('.table-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const view = tab.dataset.view;
            chartContent.classList.toggle('active', view === 'chart');
            tableContent.classList.toggle('active', view === 'table');
        });
    });

    return chart;
}
