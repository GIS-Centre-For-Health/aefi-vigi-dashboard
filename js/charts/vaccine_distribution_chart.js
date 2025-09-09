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

        const sortedVaccines = Object.entries(vaccineCounts).sort((a, b) => b[1] - a[1]);

        // 2. Prepare Chart.js Configuration
        const chartData = {
            labels: sortedVaccines.map(v => v[0]),
            datasets: [{
                label: 'Number of Cases',
                data: sortedVaccines.map(v => v[1]),
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
                    text: 'AEFI cases by vaccine'
                }
            }
        };

        // 3. Prepare data for the utility function's table
        const tableHeaders = ['Vaccine', 'Number of Cases', 'Percentage'];
        const tableData = sortedVaccines;

        // 4. Call the reusable utility function
        createBarChart(
            containerId,
            'AEFI cases by vaccine',
            chartData,
            chartOptions,
            tableData,
            tableHeaders
        );

    } catch (error) {
        console.error(`Failed to render chart in ${containerId}:`, error);
    }
}