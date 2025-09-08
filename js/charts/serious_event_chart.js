/**
 * Chart Module: Serious Event Distribution
 * 
 * This module handles the creation of the serious event distribution pie chart.
 */

/**
 * Renders the complete serious event distribution chart component.
 * @param {string} containerId - The ID of the container element.
 * @param {object} seriousCounts - An object with counts of serious vs. non-serious cases.
 */
function renderSeriousEventChart(containerId, seriousCounts) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with id ${containerId} not found.`);
        return;
    }

    container.innerHTML = `
        <div class="chart-header">
            <h3 class="chart-title">Serious vs. Non-Serious Events</h3>
        </div>
        <div class="chart-content active">
            <canvas id="seriousnessChartCanvas"></canvas>
        </div>
    `;

    // Map labels to the new color scheme
    const colorMap = {
        'Serious': '#4A2C47',     // --severity-serious
        'Not Serious': '#B08FA3', // --severity-mild
        'Unknown': '#E5E5E5'      // --severity-unknown
    };

    const labels = Object.keys(seriousCounts);
    const backgroundColors = labels.map(label => colorMap[label] || '#E5E5E5');

    const chartConfig = {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: Object.values(seriousCounts),
                backgroundColor: backgroundColors,
                borderColor: '#ffffff',
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
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw;
                            const total = context.chart.getDatasetMeta(0).total;
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${value} cases (${percentage}%)`;
                        }
                    }
                }
            }
        }
    };

    const ctx = document.getElementById('seriousnessChartCanvas').getContext('2d');
    if (activeCharts['seriousnessChart']) {
        activeCharts['seriousnessChart'].destroy();
    }
    activeCharts['seriousnessChart'] = new Chart(ctx, chartConfig);
}
