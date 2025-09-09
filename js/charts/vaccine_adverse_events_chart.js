/**
 * Renders a chart displaying the number of adverse events per vaccine.
 *
 * @param {string} containerId - The ID of the HTML element where the chart will be rendered.
 * @param {Array<Object>} data - The dataset containing AEFI records.
 */
function renderVaccineAdverseEventsChart(containerId, data) {
    try {
        // 1. Data Processing using the new parser
        const adverseEventsByVaccine = {};
        data.forEach(row => {
            const vaccineField = row['Vaccine'];
            const adverseEventField = row['Adverse event'];

            if (vaccineField && typeof vaccineField === 'string' && adverseEventField && typeof adverseEventField === 'string') {
                const vaccines = parseVaccineField(vaccineField); // Use the new parser
                const adverseEvents = adverseEventField.split(/[\n,]+/);

                vaccines.forEach(vaccine => {
                    if (!adverseEventsByVaccine[vaccine]) {
                        adverseEventsByVaccine[vaccine] = 0;
                    }
                    adverseEventsByVaccine[vaccine] += adverseEvents.length;
                });
            }
        });

        // 2. Chart Rendering
        const chartContainer = document.getElementById(containerId);
        if (!chartContainer) {
            return;
        }
        chartContainer.innerHTML = '<canvas></canvas>';
        const ctx = chartContainer.querySelector('canvas').getContext('2d');

        const chartData = {
            labels: Object.keys(adverseEventsByVaccine),
            datasets: [{
                label: 'Number of Adverse Events',
                data: Object.values(adverseEventsByVaccine),
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
                    display: false,
                },
                title: {
                    display: true,
                    text: 'Adverse Events by Vaccine'
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