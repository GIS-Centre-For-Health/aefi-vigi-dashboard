/**
 * Renders a chart displaying the distribution of vaccines administered.
 *
 * @param {string} containerId - The ID of the HTML element where the chart will be rendered.
 * @param {Array<Object>} data - The dataset containing AEFI records.
 */
function renderVaccineDistributionChart(containerId, data) {
    try {
        // 1. Data Processing using the new parser
        const vaccineCounts = {};
        data.forEach(row => {
            const vaccineField = row['Vaccine'];
            const vaccines = parseVaccineField(vaccineField); // Use the new parser
            vaccines.forEach(vaccine => {
                vaccineCounts[vaccine] = (vaccineCounts[vaccine] || 0) + 1;
            });
        });

        // 2. Chart Rendering
        const chartContainer = document.getElementById(containerId);
        if (!chartContainer) {
            return;
        }
        chartContainer.innerHTML = '<canvas></canvas>';
        const ctx = chartContainer.querySelector('canvas').getContext('2d');

        const chartData = {
            labels: Object.keys(vaccineCounts),
            datasets: [{
                label: 'Number of Cases',
                data: Object.values(vaccineCounts),
                backgroundColor: '#2C4A7C', // Single primary color
                borderColor: '#2C4A7C',
                borderWidth: 1
            }]
        };

        const chartOptions = {
            indexAxis: 'y', // Flip the bar chart
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false, // Hide legend as it's not needed for a single series
                },
                title: {
                    display: true,
                    text: 'AEFI cases by vaccine' // New title
                }
            }
        };

        if (activeCharts[containerId]) {
            activeCharts[containerId].destroy();
        }
        activeCharts[containerId] = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: chartOptions
        });

    } catch (error) {
        console.error(`Failed to render chart in ${containerId}:`, error);
    }
}