function renderAdverseEventChart(containerId, events) {
    // 1. Unique Data Processing for this chart
    const topEvents = Object.entries(events).sort((a, b) => b[1] - a[1]).slice(0, 20);

    // 2. Prepare Chart.js Configuration
    const chartData = {
        labels: topEvents.map(e => e[0]),
        datasets: [{
            label: 'Adverse Events',
            data: topEvents.map(e => e[1]),
            backgroundColor: '#2C4A7C'
        }]
    };

    const chartOptions = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        scales: {
            x: {
                beginAtZero: true
            }
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `Cases: ${context.raw}`;
                    }
                }
            }
        }
    };

    // 3. Prepare data for the utility function's table
    const tableHeaders = ['Adverse Event', 'Count', 'Percentage'];
    const tableData = topEvents.map(([event, count]) => [event, count]);

    // 4. Call the reusable utility function
    createBarChart(
        containerId,
        'AEFI Adverse Events (Top 20)',
        chartData,
        chartOptions,
        tableData,
        tableHeaders
    );
}
