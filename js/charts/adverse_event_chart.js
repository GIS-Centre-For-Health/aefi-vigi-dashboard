function renderAdverseEventChart(containerId, events) {
    // 1. Unique Data Processing for this chart
    const topEvents = Object.entries(events).sort((a, b) => b[1] - a[1]);
    const totalEvents = topEvents.reduce((sum, [, count]) => sum + count, 0);

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
            intersect: true,
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
                        const count = context.raw;
                        const percentage = totalEvents > 0 ? ((count / totalEvents) * 100).toFixed(1) : 0;
                        return `Cases: ${count} (${percentage}%)`;
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
        'Adverse Events',
        chartData,
        chartOptions,
        tableData,
        tableHeaders,
        true
    );
}