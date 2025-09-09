/**
 * Renders a chart displaying the number of adverse events per vaccine.
 *
 * @param {string} containerId - The ID of the HTML element where the chart will be rendered.
 * @param {Array<Object>} data - The dataset containing AEFI records.
 */
function renderVaccineAdverseEventsChart(containerId, data) {
    try {
        // 1. Data Processing
        const adverseEventsByVaccine = {};
        data.forEach(row => {
            const vaccineField = row['Vaccine'];
            const adverseEventField = row['Adverse event'];

            if (vaccineField && typeof vaccineField === 'string' && adverseEventField && typeof adverseEventField === 'string') {
                const vaccines = vaccineField.split(/[\n,]+/);
                const adverseEvents = adverseEventField.split(/[\n,]+/);

                vaccines.forEach(vaccine => {
                    const trimmedVaccine = vaccine.trim();
                    if (trimmedVaccine) {
                        if (!adverseEventsByVaccine[trimmedVaccine]) {
                            adverseEventsByVaccine[trimmedVaccine] = 0;
                        }
                        adverseEventsByVaccine[trimmedVaccine] += adverseEvents.length;
                    }
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
                backgroundColor: getChartColors(),
                borderColor: getChartColors().map(color => color.replace('0.6', '1')),
                borderWidth: 1
            }]
        };

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
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
    }
}