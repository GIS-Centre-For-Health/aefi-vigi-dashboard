/**
 * Chart Module: Patient Province Distribution
 * 
 * This module handles the creation of the patient province distribution chart and table.
 */

/**
 * Renders the entire patient province distribution section including chart and table.
 * @param {string} containerId - The ID of the container element.
 * @param {Array} data - The dataset from the AEFI dashboard.
 */
function renderPatientProvinceDistribution(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with id ${containerId} not found.`);
        return;
    }

    // Clear previous content
    container.innerHTML = '';

    // Create header with toggle
    const header = document.createElement('div');
    header.className = 'chart-header';
    header.innerHTML = `
        <h3 class="chart-title">Patient State or Province</h3>
        <div class="chart-toggle">
            <button class="toggle-btn active" data-view="chart"><i class="fas fa-chart-bar"></i></button>
            <button class="toggle-btn" data-view="table"><i class="fas fa-table"></i></button>
        </div>
    `;
    container.appendChild(header);

    // Create content area
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'chart-content-wrapper';
    container.appendChild(contentWrapper);

    // Create chart and table containers
    const chartContent = document.createElement('div');
    chartContent.className = 'chart-content active';
    chartContent.innerHTML = '<canvas id="patientProvincesChart"></canvas>';
    contentWrapper.appendChild(chartContent);

    const tableContent = document.createElement('div');
    tableContent.className = 'table-content';
    contentWrapper.appendChild(tableContent);

    // Process data
    const provinces = countField(data, 'Patient state or province');
    const sortedProvinces = Object.entries(provinces).sort((a, b) => b[1] - a[1]);

    // Render chart
    renderPatientProvinceChart(sortedProvinces);

    // Render table
    renderPatientProvinceTable(tableContent, sortedProvinces);

    // Add toggle functionality
    const toggleButtons = header.querySelectorAll('.toggle-btn');
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.getAttribute('data-view');
            
            if (btn.classList.contains('active')) {
                return;
            }

            toggleButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            chartContent.classList.toggle('active', view === 'chart');
            tableContent.classList.toggle('active', view === 'table');
        });
    });
}

/**
 * Renders the Patient Province Distribution bar chart.
 * @param {Array} sortedProvinces - Sorted array of [province, count] pairs.
 */
function renderPatientProvinceChart(sortedProvinces) {
    const config = {
        type: 'bar',
        data: {
            labels: sortedProvinces.map(p => p[0]),
            datasets: [{
                label: 'Cases by Patient Province',
                data: sortedProvinces.map(p => p[1]),
                backgroundColor: '#2C4A7C',
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Cases: ${context.raw}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    };

    createChartEnhanced('patientProvincesChart', config.type, config.data, config.options);
}

/**
 * Renders the data table for patient province distribution.
 * @param {HTMLElement} tableContainer - The container to render the table in.
 * @param {Array} sortedProvinces - Sorted array of [province, count] pairs.
 */
function renderPatientProvinceTable(tableContainer, sortedProvinces) {
    const total = sortedProvinces.reduce((sum, p) => sum + p[1], 0);

    let tableHTML = `
        <div class="data-table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Province</th>
                        <th>Number of Cases</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>
    `;

    sortedProvinces.forEach(([province, count]) => {
        const percentage = total > 0 ? ((count / total) * 100).toFixed(2) : 0;
        tableHTML += `
            <tr>
                <td>${province}</td>
                <td>${count}</td>
                <td>${percentage}%</td>
            </tr>
        `;
    });

    tableHTML += `
                </tbody>
            </table>
        </div>
    `;

    tableContainer.innerHTML = tableHTML;
}