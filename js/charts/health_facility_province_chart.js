function createHealthFacilityProvinceChart(data, chartInstances, chartId) {
    const provinces = countField(data, 'Health facility state or province');
    const sortedProvinces = Object.entries(provinces).sort((a, b) => b[1] - a[1]);

    const chartData = {
        labels: sortedProvinces.map(p => p[0]),
        datasets: [{
            label: 'Cases by Health Facility State or Province',
            data: sortedProvinces.map(p => p[1]),
            backgroundColor: '#2C4A7C',
        }]
    };

    const chartOptions = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                beginAtZero: true
            }
        },
        plugins: {
            legend: {
                display: false
            }
        }
    };

    return createBarChart(
        'healthFacilityProvinceChartContainer',
        'Cases by Health Facility State or Province',
        chartData,
        chartOptions,
        sortedProvinces,
        ['State or Province', 'Number of Cases', 'Percentage']
    );
}
