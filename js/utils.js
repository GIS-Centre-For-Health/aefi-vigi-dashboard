///////////////////////////////////////////////////////////
// Utility Functions
///////////////////////////////////////////////////////////

/**
 * Defines and returns the application's consistent color palette for charts.
 * @param {number} [count] - The number of colors to return.
 * @returns {string|string[]} A single color or an array of colors.
 */
// function getChartColors(count) {
//     // Colors aligned with the new CSS variables from Init.md
//     const colors = [
//         '#2C4A7C', // --primary-dark
//         '#6B8CAE', // --primary-light
//         '#B08FA3', // --severity-mild (Purple)
//         '#4A90E2', // --accent
//         '#A8C0D8', // --primary-lighter
//         '#4A2C47', // --severity-serious (Dark Purple)
//         '#E5E5E5', // --severity-unknown (Gray)
//         '#3D2841', // --severity-fatal
//     ];

//     if (count) {
//         return colors.slice(0, count);
//     }
//     return colors;
// }                                                                                                                                                                                         

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
 * Parses a date string from various formats into a JavaScript Date object, ignoring timezones.
 *
 * @param {string|number} dateStr - The date string or Excel serial number.
 * @returns {Date|null} - The parsed Date object or null if parsing fails.
 */
function parseDate(dateStr) {
    if (dateStr === null || dateStr === undefined || dateStr === '') {
        return null;
    }

    let date = null;

    // Handle Excel serial numbers
    if (typeof dateStr === 'number' && dateStr > 0) {
        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
        date = new Date(excelEpoch.getTime() + dateStr * 86400000);
    } else {
        const str = String(dateStr).trim();
        let year, month, day;

        // YYYY-MM-DD or YYYY/MM/DD
        if (/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/.test(str)) {
            const parts = str.split(/[-\/]/);
            year = parseInt(parts[0], 10);
            month = parseInt(parts[1], 10) - 1;
            day = parseInt(parts[2], 10);
            date = new Date(Date.UTC(year, month, day));
        }
        // DD-MM-YYYY or DD/MM/YYYY
        else if (/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/.test(str)) {
            const parts = str.split(/[-\/]/);
            day = parseInt(parts[0], 10);
            month = parseInt(parts[1], 10) - 1;
            year = parseInt(parts[2], 10);
            date = new Date(Date.UTC(year, month, day));
        }
        // YYYYMMDD
        else if (/^(\d{8})$/.test(str)) {
            year = parseInt(str.substring(0, 4), 10);
            month = parseInt(str.substring(4, 6), 10) - 1;
            day = parseInt(str.substring(6, 8), 10);
            date = new Date(Date.UTC(year, month, day));
        }
        // Fallback for other ISO-like formats that JS can handle
        else {
            const tempDate = new Date(str);
            if (tempDate instanceof Date && !isNaN(tempDate)) {
                date = new Date(Date.UTC(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate()));
            }
        }
    }

    if (date instanceof Date && !isNaN(date)) {
        return date;
    }

    return null;
}

/**
 * Extracts the earliest onset date from a case that may have multiple onset dates.
 * Follows the pattern established in temporal_analysis_chart.js to ensure consistency.
 *
 * @param {Object} row - A data row from the dataset.
 * @returns {Date|null} - The earliest onset date or null if no valid dates found.
 */
function getEarliestOnsetDate(row) {
    const onsetDates = String(row['Date of onset'] || '')
        .split('\n')
        .map(parseDate)
        .filter(d => d instanceof Date && !isNaN(d));
    return onsetDates.length > 0 ? new Date(Math.min.apply(null, onsetDates)) : null;
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
    const totalSeriousEvents = patientIds.reduce((acc, id) => acc + patients[id].seriousEventCount, 0);

    const reportingProvinces = getUniqueValues(data, 'Patient state or province').length;
    
    // const ages = data.map(r => r.NormalizedAge).filter(age => age !== null && age !== undefined);
    // let averageAgeFormatted = 'N/A';
    // if (ages.length > 0) {
    //     const averageAge = ages.reduce((a, b) => a + b, 0) / ages.length;
    //     const years = Math.floor(averageAge);
    //     const months = Math.round((averageAge - years) * 12);
    //     averageAgeFormatted = `${years} Years, ${months} Months`;
    // }

    const stats = [
        { title: 'Total Reports', value: totalRecords.toLocaleString() },
        { title: 'Total Serious Events', value: totalSeriousEvents.toLocaleString() },
        { title: 'Reporting Provinces', value: reportingProvinces.toLocaleString() },
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

function createBarChart(containerId, title, chartData, chartOptions, tableData, tableHeaders, scrollable = false, barHeight = 30) {
    const total = tableData.reduce((sum, row) => sum + row[1], 0);

    const chartContentHTML = scrollable
        ? `<div class="chart-scroll-container"><div class="chart-canvas-wrapper"><canvas></canvas></div></div>`
        : `<canvas></canvas>`;

    const containerHTML = `
        <div class="chart-header">
            <h3 class="chart-title">${title}</h3>
            <div class="chart-container-tabs">
                <button class="chart-container-tab active" data-view="chart">Chart</button>
                <button class="chart-container-tab" data-view="table">Table</button>
            </div>
        </div>
        <div class="chart-content active">
            ${chartContentHTML}
        </div>
        <div class="table-content">
            <table>
                <thead>
                    <tr>
                        ${tableHeaders.map(header => `<th>${header}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
        </div>
    `;

    const container = document.getElementById(containerId);
    container.innerHTML = containerHTML;

    // **XSS Fix: Safely create and append table rows**
    const tableBody = container.querySelector('tbody');
    if (tableBody) {
        tableData.forEach(row => {
            const tr = document.createElement('tr');

            const cell1 = document.createElement('td');
            cell1.textContent = row[0];
            tr.appendChild(cell1);

            const cell2 = document.createElement('td');
            cell2.textContent = row[1];
            tr.appendChild(cell2);

            const percentage = total > 0 ? ((row[1] / total) * 100).toFixed(2) : 0;
            const cell3 = document.createElement('td');
            cell3.textContent = `${percentage}%`;
            tr.appendChild(cell3);

            tableBody.appendChild(tr);
        });

        // Add total row
        const totalRow = document.createElement('tr');
        totalRow.className = 'total-row';

        const totalCell1 = document.createElement('td');
        totalCell1.textContent = 'Total';
        totalRow.appendChild(totalCell1);

        const totalCell2 = document.createElement('td');
        totalCell2.textContent = total;
        totalRow.appendChild(totalCell2);

        const totalCell3 = document.createElement('td');
        totalCell3.textContent = '100.00%';
        totalRow.appendChild(totalCell3);

        tableBody.appendChild(totalRow);
    }

    const canvas = container.querySelector('canvas');
    if (scrollable) {
        const canvasWrapper = container.querySelector('.chart-canvas-wrapper');
        if (canvasWrapper) {
            // Use the custom barHeight parameter (default 30px if not specified)
            const chartHeight = chartData.labels.length * barHeight;
            canvasWrapper.style.height = `${chartHeight}px`;
        }
    }

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
