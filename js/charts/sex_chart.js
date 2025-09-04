/**
 * Chart Module: Sex Distribution
 * 
 * This module handles the creation and updating of the sex distribution pie chart.
 */

/**
 * Creates the configuration for the Sex Distribution chart.
 * @param {Array} data - The dataset from the AEFI dashboard.
 * @returns {object} A Chart.js configuration object.
 */
function createSexChartConfig(data) {
    // Use utility function to aggregate by category
    const sexCounts = countField(data, 'Sex');
    
    // Ensure all categories exist with zero counts if missing for consistent colors
    const maleCount = sexCounts.Male || 0;
    const femaleCount = sexCounts.Female || 0;
    const unknownCount = sexCounts.Unknown || 0;

    return {
        type: 'pie',
        data: {
            labels: ['Male', 'Female', 'Unknown'],
            datasets: [{
                label: 'Sex Distribution',
                data: [maleCount, femaleCount, unknownCount],
                backgroundColor: [
                    '#2C4A7C', // --primary-dark
                    '#6B8CAE', // --primary-light
                    '#95a5a6'  // --severity-unknown
                ],
                borderColor: '#FFFFFF', // --bg-secondary
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        // Generate custom labels to include counts
                        generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                return data.labels.map((label, i) => {
                                    const meta = chart.getDatasetMeta(0);
                                    const ds = data.datasets[0];
                                    const arc = meta.data[i];
                                    const value = ds.data[i];
                                    return {
                                        text: `${label}: ${value}`,
                                        fillStyle: ds.backgroundColor[i],
                                        strokeStyle: ds.borderColor[i],
                                        lineWidth: ds.borderWidth,
                                        hidden: isNaN(ds.data[i]) || meta.data[i].hidden,
                                        index: i
                                    };
                                });
                            }
                            return [];
                        }
                    }
                },
                title: {
                    display: false, // Title is in the card header
                    text: 'Sex Distribution'
                }
            }
        }
    };
}

/**
 * Creates or updates the Sex Distribution chart.
 * @param {Array} data - The dataset from the AEFI dashboard.
 */
function updateSexChart(data) {
    if (!Array.isArray(data)) {
        console.log('No data provided for sex chart update.');
        return;
    }
    
    // Destroy existing chart if it exists
    if (activeCharts && activeCharts['sexChart']) {
        activeCharts['sexChart'].destroy();
        delete activeCharts['sexChart'];
    }
    
    const config = createSexChartConfig(data);
    
    // Use the new architecture's createChart method
    const ctx = document.getElementById('sexChart').getContext('2d');
    if (typeof activeCharts !== 'undefined') {
        activeCharts['sexChart'] = new Chart(ctx, config);
    } else {
        // Fallback for standalone usage
        new Chart(ctx, config);
    }
    
    console.log(`Sex chart updated with ${data.length} records`);
}

/**
 * Initializes an empty sex chart on page load.
 */
function initializeSexChart() {
    const emptyData = [];
    const config = createSexChartConfig(emptyData);
    createChart('sexChart', config);
}
