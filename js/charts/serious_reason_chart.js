/**
 * Chart Module: Reason for Serious Event Distribution
 * 
 * This module handles the creation of the distribution chart for reasons of serious events.
 */

/**
 * Renders the complete chart component for the reasons for serious events.
 * @param {string} containerId - The ID of the container element.
 * @param {object} reasonCounts - An object with counts for each serious reason category.
 */
function renderSeriousReasonChart(containerId, reasonCounts) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with id ${containerId} not found.`);
        return;
    }

    const chartData = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1]);

    container.innerHTML = `
        <div class="chart-header">
            <h3 class="chart-title">Distribution of Reasons for Serious Events</h3>
        </div>
        <div class="chart-content active">
            <canvas id="seriousReasonChartCanvas"></canvas>
        </div>
    `;

    const chartConfig = {
        type: 'bar',
        data: {
            labels: chartData.map(item => item[0]),
            datasets: [{
                label: 'Number of Cases',
                data: chartData.map(item => item[1]),
                backgroundColor: getChartColors(chartData.length),
                borderColor: '#ffffff',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
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
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1 // Ensure integer ticks for counts
                    }
                }
            }
        }
    };

    const ctx = document.getElementById('seriousReasonChartCanvas').getContext('2d');
    if (activeCharts['seriousReasonChart']) {
        activeCharts['seriousReasonChart'].destroy();
    }
    activeCharts['seriousReasonChart'] = new Chart(ctx, chartConfig);
}
