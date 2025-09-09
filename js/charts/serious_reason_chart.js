function renderSeriousReasonChart(containerId, reasonCounts) {
    const chartData = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1]);
    const total = chartData.reduce((sum, [, count]) => sum + count, 0);

    let tableRows = '';
    chartData.forEach(([reason, count]) => {
        const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
        tableRows += `
            <tr>
                <td>${reason}</td>
                <td>${count}</td>
                <td>${percentage}%</td>
            </tr>
        `;
    });

    tableRows += `
        <tr class="total-row">
            <td>Total</td>
            <td>${total}</td>
            <td>100.0%</td>
        </tr>
    `;

    const containerHTML = `
        <div class="chart-header">
            <h3 class="chart-title">Distribution of Reasons for Serious Events</h3>
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
                        <th>Reason</th>
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
        type: 'bar',
        data: {
            labels: chartData.map(item => item[0]),
            datasets: [{
                label: 'Number of Cases',
                data: chartData.map(item => item[1]),
                backgroundColor: getChartColors(chartData.length),
                borderColor: '#ffffff',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
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
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    };

    createChart(containerId, 'Distribution of Reasons for Serious Events', chartConfig.type, chartConfig.data, chartConfig.options, containerHTML);
}
