function createDistrictDistributionChart(data, chartInstances, chartId) {
    const districts = countField(data, 'Health facility district');
    const sortedDistricts = Object.entries(districts).sort((a, b) => b[1] - a[1]);
    
    const chartData = {
        labels: sortedDistricts.map(d => d[0]),
        datasets: [{
            label: 'Cases by District',
            data: sortedDistricts.map(d => d[1]),
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
        'districtDistributionChartContainer',
        'Cases by Health Facility Districts',
        chartData,
        chartOptions,
        sortedDistricts,
        ['District', 'Number of Cases', 'Percentage']
    );
}
