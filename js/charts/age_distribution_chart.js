/**
 * Chart Module: Age Distribution
 * 
 * This module handles the creation of the age distribution component,
 * including a bar chart and a data table, with interactive tabs.
 */

/**
 * Renders the complete age distribution chart component.
 * @param {string} containerId - The ID of the container element.
 * @param {Array} data - The dataset for visualization.
 */
function renderAgeDistributionChart(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with id ${containerId} not found.`);
        return;
    }

    const ageGroups= { '0-27 Days':0, '28 days to  23 months':0, '2 - 11 Years':0, '12-17 Years':0, '18-44 Years':0,  '45-64 Years':0, '65+ Years':0, 'Unknown':0};

    data.forEach(row => {
        const age = row.NormalizedAge; // This is in years
        if (age === undefined || age === null || isNaN(age)) {
            ageGroups['Unknown']++;
        } else if (age < (28 / 365.25)) { // 0-27 days
            ageGroups['0-27 Days']++;
        } else if (age < 2) { // 28 days to 23 months (age is less than 2 years)
            ageGroups['28 days to  23 months']++;
        } else if (age < 12) { // 2-11 years
            ageGroups['2 - 11 Years']++;
        } else if (age < 18) { // 12-17 years
            ageGroups['12-17 Years']++;
        } else if (age < 45) { // 18-44 years
            ageGroups['18-44 Years']++;
        } else if (age < 65) { // 45-64 years
            ageGroups['45-64 Years']++;
        } else { // 65+ years
            ageGroups['65+ Years']++;
        }
    });

    const total = data.length;
    let tableRows = '';
    for (const [group, count] of Object.entries(ageGroups)) {
        const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
        tableRows += `
            <tr>
                <td>${group}</td>
                <td>${count}</td>
                <td>${percentage}%</td>
            </tr>
        `;
    }

    container.innerHTML = `
        <div class="chart-header">
            <h3 class="chart-title">AEFI cases by Age</h3>
            <div class="chart-container-tabs">
                <button class="chart-container-tab active" data-view="chart">Chart</button>
                <button class="chart-container-tab" data-view="table">Table</button>
            </div>
        </div>
        <div class="chart-content active">
            <canvas id="ageGroupChartCanvas"></canvas>
        </div>
        <div class="table-content">
            <table>
                <thead>
                    <tr>
                        <th>Age Group</th>
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
    const ageGroupPercentages = Object.values(ageGroups).map(count => total > 0 ? (count / total) * 100 : 0);
    const chartConfig = {
        type: 'bar',
        data: {
            labels: Object.keys(ageGroups),
            datasets: [{
                label: 'Patient Age',
                data: ageGroupPercentages,
                backgroundColor: '#2C4A7C'
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            },
            plugins: {
                legend: { display: true },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const group = context.label;
                            const count = ageGroups[group];
                            const percentage = context.raw.toFixed(1);
                            return `${group}: ${count} cases (${percentage}%)`;
                        }
                    }
                }
            },
            layout: {
                padding: { top: 20 }
            }
        }
    };

    const ctx = document.getElementById('ageGroupChartCanvas').getContext('2d');
    if (activeCharts['ageGroupChart']) {
        activeCharts['ageGroupChart'].destroy();
    }
    activeCharts['ageGroupChart'] = new Chart(ctx, chartConfig);

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
