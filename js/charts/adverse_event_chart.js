/**
 * Chart Module: Adverse Event Distribution
 * 
 * This module handles the creation of the adverse event distribution component,
 * including a horizontal bar chart and a data table.
 */

/**
 * Renders the complete adverse event distribution chart component.
 * @param {string} containerId - The ID of the container element.
 * @param {Array} data - The dataset for visualization.
 */
function renderAdverseEventChart(containerId, events) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with id ${containerId} not found.`);
        return;
    }

    const topEvents = Object.entries(events).sort((a, b) => b[1] - a[1]).slice(0, 20);
    const totalEvents = Object.values(events).reduce((sum, count) => sum + count, 0);

    let tableRows = '';
    topEvents.forEach(([event, count]) => {
        const percentage = totalEvents > 0 ? ((count / totalEvents) * 100).toFixed(1) : 0;
        tableRows += `
            <tr>
                <td>${event}</td>
                <td>${count}</td>
                <td>${percentage}%</td>
            </tr>
        `;
    });

    container.innerHTML = `
        <div class="chart-header">
            <h3 class="chart-title">AEFI Adverse Events</h3>
            <div class="chart-container-tabs">
                <button class="chart-container-tab active" data-view="chart">Chart</button>
                <button class="chart-container-tab" data-view="table">Table</button>
            </div>
        </div>
        <div class="chart-content active">
            <canvas id="adverseEventsChartCanvas"></canvas>
        </div>
        <div class="table-content">
            <table>
                <thead>
                    <tr>
                        <th>Adverse Event</th>
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
            labels: topEvents.map(e => e[0]),
            datasets: [{
                label: 'Adverse Events',
                data: topEvents.map(e => e[1]),
                backgroundColor: getChartColors()[0] // Use the primary color from the new utility
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
                    beginAtZero: true
                }
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

    const ctx = document.getElementById('adverseEventsChartCanvas').getContext('2d');
    if (activeCharts['adverseEventsChart']) {
        activeCharts['adverseEventsChart'].destroy();
    }
    activeCharts['adverseEventsChart'] = new Chart(ctx, chartConfig);

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
