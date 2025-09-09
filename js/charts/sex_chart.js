function renderSexChart(containerId, data) {
    const sexCounts = countField(data, 'Sex');
    const maleCount = sexCounts.Male || 0;
    const femaleCount = sexCounts.Female || 0;
    const unknownCount = sexCounts.Unknown || 0;
    const total = maleCount + femaleCount + unknownCount;

    const tableRows = `
        <tr>
            <td>Male</td>
            <td>${maleCount}</td>
            <td>${((maleCount / total) * 100).toFixed(1)}%</td>
        </tr>
        <tr>
            <td>Female</td>
            <td>${femaleCount}</td>
            <td>${((femaleCount / total) * 100).toFixed(1)}%</td>
        </tr>
        <tr>
            <td>Unknown</td>
            <td>${unknownCount}</td>
            <td>${((unknownCount / total) * 100).toFixed(1)}%</td>
        </tr>
        <tr class="total-row">
            <td>Total</td>
            <td>${total}</td>
            <td>100.0%</td>
        </tr>
    `;

    const containerHTML = `
        <div class="chart-header">
            <h3 class="chart-title">AEFI cases by Sex</h3>
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
                        <th>Sex</th>
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
            labels: ['Male', 'Female', 'Unknown'],
            datasets: [{
                label: 'Sex Distribution',
                data: [maleCount, femaleCount, unknownCount],
                backgroundColor: ['#2C4A7C', '#6B8CAE', '#95a5a6'],
                borderColor: '#FFFFFF',
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
                title: {
                    display: false
                }
            }
        }
    };

    createChart(containerId, 'AEFI cases by Sex', chartConfig.type, chartConfig.data, chartConfig.options, containerHTML);
}
