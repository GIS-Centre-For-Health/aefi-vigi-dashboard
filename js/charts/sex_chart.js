/**
 * Chart Module: Sex Distribution
 * 
 * Handles the creation of a comprehensive sex distribution component, 
 * including a pie chart and a data table, with interactive tabs.
 */

/**
 * Renders the complete sex distribution chart component.
 * @param {string} containerId - The ID of the container element.
 * @param {Array} data - The dataset for visualization.
 */
function renderSexChart(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with id ${containerId} not found.`);
        return;
    }

    // Aggregate data
    const sexCounts = countField(data, 'Sex');
    const maleCount = sexCounts.Male || 0;
    const femaleCount = sexCounts.Female || 0;
    const unknownCount = sexCounts.Unknown || 0;
    const total = maleCount + femaleCount + unknownCount;

    // Create component structure
    container.innerHTML = `
        <div class="chart-header">
            <h3 class="chart-title">AEFI cases by Sex</h3>
            <div class="chart-container-tabs">
                <button class="chart-container-tab active" data-view="chart">Chart</button>
                <button class="chart-container-tab" data-view="table">Table</button>
            </div>
        </div>
        <div class="chart-content active">
            <canvas id="sexChartCanvas"></canvas>
        </div>
        <div class="table-content">
            <table>
                <thead>
                    <tr>
                        <th>Sex</th>
                        <th>Count</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Male</td>
                        <td>${maleCount}</td>
                        <td>${((maleCount / total) * 100).toFixed(1)}%</td>
                    </tr>
                    <tr>
                        <td>Female</td>
                        <td>${femaleCount}</td>
                        <td>${((femaleCount / total) * 100).toFixed(1)}%</td>
                    </tr>
                    <tr>
                        <td>Unknown</td>
                        <td>${unknownCount}</td>
                        <td>${((unknownCount / total) * 100).toFixed(1)}%</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;

    // Chart.js configuration
    const chartConfig = {
        type: 'pie',
        data: {
            labels: ['Male', 'Female', 'Unknown'],
            datasets: [{
                label: 'Sex Distribution',
                data: [maleCount, femaleCount, unknownCount],
                backgroundColor: ['#2C4A7C', '#6B8CAE', '#95a5a6'],
                borderColor: '#FFFFFF',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: false
                }
            }
        }
    };

    // Initialize chart
    const ctx = document.getElementById('sexChartCanvas').getContext('2d');
    if (activeCharts['sexChart']) {
        activeCharts['sexChart'].destroy();
    }
    activeCharts['sexChart'] = new Chart(ctx, chartConfig);

    // Tab switching logic
    const tabs = container.querySelectorAll('.chart-container-tab');
    const chartContent = container.querySelector('.chart-content');
    const tableContent = container.querySelector('.table-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update tabs
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update content visibility
            const view = tab.getAttribute('data-view');
            if (view === 'chart') {
                chartContent.classList.add('active');
                tableContent.classList.remove('active');
            } else {
                chartContent.classList.remove('active');
                tableContent.classList.add('active');
            }
        });
    });
}
