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
const adverseEvents = adverseEventField.split(/[,]+/);

                vaccines.forEach(vaccine => {
                    if (!adverseEventsByVaccine[vaccine]) {
                        adverseEventsByVaccine[vaccine] = 0;
                    }
                    adverseEventsByVaccine[vaccine] += adverseEvents.length;
                });
            }
        });

        const sortedEvents = Object.entries(adverseEventsByVaccine).sort((a, b) => b[1] - a[1]);

        // 2. Prepare Chart.js Configuration
        const chartData = {
            labels: sortedEvents.map(v => v[0]),
            datasets: [{
                label: 'Number of Adverse Events',
                data: sortedEvents.map(v => v[1]),
                backgroundColor: '#2C4A7C', // Single primary color
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

        // 3. Prepare data for the utility function's table
        const tableHeaders = ['Vaccine', 'Number of Adverse Events', 'Percentage'];
        const tableData = sortedEvents;

        // 4. Call the reusable utility function
        createBarChart(
            containerId,
            'Adverse Events by Vaccine',
            chartData,
            chartOptions,
            tableData,
            tableHeaders, 
            true
        );

    } catch (error) {
        console.error(`Failed to render chart in ${containerId}:`, error);
    }
}