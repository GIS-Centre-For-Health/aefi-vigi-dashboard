/**
 * Chart Module: Age Unit Distribution
 * 
 * This module handles the creation of the age unit distribution component,
 * including a bar chart and a data table, with interactive tabs.
 */

/**
 * Renders the complete age unit distribution chart component.
 * @param {string} containerId - The ID of the container element.
 * @param {Array} data - The dataset for visualization.
 */
function renderAgeUnitDistributionChart(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with id ${containerId} not found.`);
        return;
    }

    const ageUnits = {
        'Days': 0,
        'Weeks': 0,
        'Months': 0,
        'Years': 0
    };

    data.forEach(row => {
        const unit = (row['Age unit'] || '').toLowerCase().trim();
        if (unit.startsWith('day')) {
            ageUnits['Days']++;
        } else if (unit.startsWith('week')) {
            ageUnits['Weeks']++;
        } else if (unit.startsWith('month')) {
            ageUnits['Months']++;
        } else if (unit.startsWith('year')) {
            ageUnits['Years']++;
        }
    });

    const total = Object.values(ageUnits).reduce((sum, count) => sum + count, 0);
    let tableRows = '';
    for (const [unit, count] of Object.entries(ageUnits)) {
        const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
        tableRows += `
            <tr>
                <td>${unit}</td>
                <td>${count}</td>
                <td>${percentage}%</td>
            </tr>
        `;
    }

    container.innerHTML = `
        <div class="chart-header">
            <h3 class="chart-title">AEFI cases Age Units</h3>
            <div class="chart-container-tabs">
                <button class="chart-container-tab active" data-view="chart">Chart</button>
                <button class="chart-container-tab" data-view="table">Table</button>
            </div>
        </div>
        <div class="chart-content active">
            <canvas id="ageUnitChartCanvas"></canvas>
        </div>
        <div class="table-content">
            <table>
                <thead>
                    <tr>
                        <th>Age Unit</th>
                        <th>Count</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
    `;

    const chartConfig = {
        type: 'bar',
        data: {
            labels: Object.keys(ageUnits),
            datasets: [{
                label: 'AEFI Cases by Age Unit',
                data: Object.values(ageUnits),
                backgroundColor: '#3498db'
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
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Cases: ${context.raw}`;
                        }
                    }
                }
            }
        }
    };

    const ctx = document.getElementById('ageUnitChartCanvas').getContext('2d');
    if (activeCharts['ageUnitChart']) {
        activeCharts['ageUnitChart'].destroy();
    }
    activeCharts['ageUnitChart'] = new Chart(ctx, chartConfig);

    // Tab switching logic
    const tabs = container.querySelectorAll('.chart-container-tab');
    const chartContent = container.querySelector('.chart-content');
    const tableContent = container.querySelector('.table-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const view = tab.getAttribute('data-view');
            chartContent.classList.toggle('active', view === 'chart');
            tableContent.classList.toggle('active', view === 'table');
        });
    });
}
