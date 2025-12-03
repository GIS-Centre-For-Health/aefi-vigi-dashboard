function createDistrictDistributionChart(data, chartInstances, chartId) {
    const districts = countField(data, 'Health facility district');
    const sortedDistricts = Object.entries(districts).sort((a, b) => b[1] - a[1]);
    
    const chartData = {
        labels: sortedDistricts.map(d => d[0]),
        datasets: [{
            label: 'Health Facilitie\'s District',
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
                beginAtZero: true,
                ticks: {
                    font: {
                        size: 14
                    }
                }
            },
            y: {
                ticks: {
                    font: {
                        size: 14
                    }
                }
            }
        },
        plugins: {
            legend: {
                display: false
            }
        },
        layout: {
            padding: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10
            }
        }
    };

    return createBarChart(
        'districtDistributionChartContainer',
        'Health Facilitie\'s Districts',
        chartData,
        chartOptions,
        sortedDistricts,
        ['District', 'Number of Cases', 'Percentage'],
        true,
        60  // Larger bar height for better space utilization
    );
}
