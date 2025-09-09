function renderSeriousEventChart(containerId, seriousCounts) {
    const colorMap = {
        'Serious': '#4A2C47',
        'Not Serious': '#B08FA3',
        'Unknown': '#E5E5E5'
    };

    const labels = Object.keys(seriousCounts);
    const backgroundColors = labels.map(label => colorMap[label] || '#E5E5E5');
    const total = Object.values(seriousCounts).reduce((sum, count) => sum + count, 0);

    let tableRows = '';
    for (const [key, value] of Object.entries(seriousCounts)) {
        const percentage = total > 0 ? (value / total * 100).toFixed(1) : 0;
        tableRows += `
            <tr>
                <td>${key}</td>
                <td>${value}</td>
                <td>${percentage}%</td>
            </tr>
        `;
    }
    tableRows += `
        <tr class="total-row">
            <td>Total</td>
            <td>${total}</td>
            <td>100.0%</td>
        </tr>
    `;

    const containerHTML = `
        <div class="chart-header">
            <h3 class="chart-title">Serious vs. Non-Serious Events</h3>
            <div class="chart-container-tabs">
                <button class="chart-container-tab active" data-view="chart">Chart</button>
                <button class="chart-container-tab" data-view="table">Table</button>
            </div>
        </div>
        <div class="chart-content active">
            <canvas></canvas>
        </div>
        <div class="table-content">
            <table>
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Count</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
    `;

    const chartConfig = {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: Object.values(seriousCounts),
                backgroundColor: backgroundColors,
                borderColor: '#ffffff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw;
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${value} cases (${percentage}%)`;
                        }
                    }
                }
            }
        }
    };

    createChart(containerId, 'Serious vs. Non-Serious Events', chartConfig.type, chartConfig.data, chartConfig.options, containerHTML);
}
