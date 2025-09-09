function renderSeriousReasonChart(containerId, reasonCounts) {
    // 1. Unique Data Processing
    const chartData = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1]);

    // 2. Prepare Chart.js Configuration
    const chartConfigData = {
        labels: chartData.map(item => item[0]),
        datasets: [{
            label: 'Number of Cases',
            data: chartData.map(item => item[1]),
            backgroundColor: '#2C4A7C',
            borderColor: '#ffffff',
            borderWidth: 1
        }]
    };

    const chartOptions = {
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
                    stepSize: 1
                }
            }
        }
    };

    // 3. Prepare data for the utility function's table
    const tableHeaders = ['Reason', 'Count', 'Percentage'];
    const tableData = chartData.map(([reason, count]) => [reason, count]);

    // 4. Call the reusable utility function
    createBarChart(
        containerId,
        'Distribution of Reasons for Serious Events',
        chartConfigData,
        chartOptions,
        tableData,
        tableHeaders
    );
}
