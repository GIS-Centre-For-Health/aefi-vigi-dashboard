/**
 * Renders a chart displaying the distribution of vaccines administered.
 *
 * @param {string} containerId - The ID of the HTML element where the chart will be rendered.
 * @param {Array<Object>} data - The dataset containing AEFI records.
 */
function renderVaccineDistributionChart(containerId, data) {
    try {
        // 1. Data Processing
        const vaccineCounts = {};
        data.forEach(row => {
            const vaccineField = row['Vaccine'];
            if (vaccineField && typeof vaccineField === 'string') {
                const vaccines = vaccineField.split(/[\n,]+/);
                vaccines.forEach(vaccine => {
                    const trimmedVaccine = vaccine.trim();
                    if (trimmedVaccine) {
                        vaccineCounts[trimmedVaccine] = (vaccineCounts[trimmedVaccine] || 0) + 1;
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
            labels: Object.keys(vaccineCounts),
            datasets: [{
                label: 'Number of Doses',
                data: Object.values(vaccineCounts),
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
                    text: 'Distribution of Vaccines Administered'
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