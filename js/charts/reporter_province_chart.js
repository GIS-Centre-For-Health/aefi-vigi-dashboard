function renderReporterProvinceDistribution(containerId, data) {
    const provinces = countField(data, 'Reporter state or province');
    const sortedProvinces = Object.entries(provinces).sort((a, b) => b[1] - a[1]);
    const total = sortedProvinces.reduce((sum, p) => sum + p[1], 0);

    let tableRows = '';
    sortedProvinces.forEach(([province, count]) => {
        const percentage = total > 0 ? ((count / total) * 100).toFixed(2) : 0;
        tableRows += `
            <tr>
                <td>${province}</td>
                <td>${count}</td>
                <td>${percentage}%</td>
            </tr>
        `;
    });
    tableRows += `
        <tr class="total-row">
            <td>Total</td>
            <td>${total}</td>
            <td>100.00%</td>
        </tr>
    `;

    const containerHTML = `
        <div class="chart-header">
            <h3 class="chart-title">Reporter State or Province</h3>
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
                        <th>Province</th>
                        <th>Number of Cases</th>
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
            labels: sortedProvinces.map(p => p[0]),
            datasets: [{
                label: 'Cases by Reporter Province',
                data: sortedProvinces.map(p => p[1]),
                backgroundColor: '#2C4A7C',
            }]
        },
        options: {
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
        }
    };

    createChart(containerId, 'Reporter State or Province', chartConfig.type, chartConfig.data, chartConfig.options, containerHTML);
}
