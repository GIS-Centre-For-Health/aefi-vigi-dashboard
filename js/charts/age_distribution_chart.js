function renderAgeDistributionChart(containerId, data) {
    // 1. Unique Data Processing
    const ageGroups = { '0-27 Days': 0, '28 days to  23 months': 0, '2 - 11 Years': 0, '12-17 Years': 0, '18-44 Years': 0, '45-64 Years': 0, '65+ Years': 0, 'Unknown': 0 };
    data.forEach(row => {
        const age = row.NormalizedAge; // This is in years
        if (age === undefined || age === null || isNaN(age)) {
            ageGroups['Unknown']++;
        } else if (age < (28 / 365.25)) {
            ageGroups['0-27 Days']++;
        } else if (age < 2) {
            ageGroups['28 days to  23 months']++;
        } else if (age < 12) {
            ageGroups['2 - 11 Years']++;
        } else if (age < 18) {
            ageGroups['12-17 Years']++;
        } else if (age < 45) {
            ageGroups['18-44 Years']++;
        } else if (age < 65) {
            ageGroups['45-64 Years']++;
        } else {
            ageGroups['65+ Years']++;
        }
    });

    const totalCases = data.length;

    // 2. Prepare Chart.js Configuration
    const chartData = {
        labels: Object.keys(ageGroups),
        datasets: [{
            label: 'Patient Age',
            data: Object.values(ageGroups),
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
                        const count = context.raw;
                        const percentage = totalCases > 0 ? ((count / totalCases) * 100).toFixed(1) : 0;
                        return `Cases: ${count} (${percentage}%)`;
                    }
                }
            }
        },
        layout: {
            padding: { top: 20 }
        }
    };

    // 3. Prepare data for the utility function's table
    const tableHeaders = ['Age Group', 'Count', 'Percentage'];
    const tableData = Object.entries(ageGroups);

    // 4. Call the reusable utility function
    createBarChart(
        containerId,
        'AEFI cases by Age',
        chartData,
        chartOptions,
        tableData,
        tableHeaders
    );
}
