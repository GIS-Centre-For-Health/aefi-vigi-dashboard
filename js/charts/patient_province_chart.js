
function renderPatientProvinceDistribution(containerId, data) {
    // 1. Unique Data Processing
    const provinces = countField(data, 'Patient state or province');
    const sortedProvinces = Object.entries(provinces).sort((a, b) => b[1] - a[1]);

    // 2. Prepare Chart.js Configuration
    const chartData = {
        labels: sortedProvinces.map(p => p[0]),
        datasets: [{
            label: 'Patient\'s State / Province',
            data: sortedProvinces.map(p => p[1]),
            backgroundColor: '#2C4A7C',
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
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
                grid: {
                    display: false
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            }
        }
    };

    // 3. Prepare data for the utility function's table
    const tableHeaders = ['Province', 'Number of Cases', 'Percentage'];
    const tableData = sortedProvinces.map(([province, count]) => [province, count]);

    // 4. Call the reusable utility function
    createBarChart(
        containerId,
        'Patient\'s State / Province',
        chartData,
        chartOptions,
        tableData,
        tableHeaders
    );
}
