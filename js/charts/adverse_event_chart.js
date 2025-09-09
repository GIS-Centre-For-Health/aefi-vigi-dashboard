function renderAdverseEventChart(containerId, events) {
    const totalAllEvents = Object.values(events).reduce((sum, count) => sum + count, 0);
    const topEvents = Object.entries(events).sort((a, b) => b[1] - a[1]).slice(0, 20);
    const totalTopEvents = topEvents.reduce((sum, [, count]) => sum + count, 0);

    let tableRows = '';
    topEvents.forEach(([event, count]) => {
        const percentage = totalAllEvents > 0 ? ((count / totalAllEvents) * 100).toFixed(1) : 0;
        tableRows += `
            <tr>
                <td>${event}</td>
                <td>${count}</td>
                <td>${percentage}%</td>
            </tr>
        `;
    });

    const totalPercentage = totalAllEvents > 0 ? ((totalTopEvents / totalAllEvents) * 100).toFixed(1) : 0;
    tableRows += `
        <tr class="total-row">
            <td>Total (Top 20)</td>
            <td>${totalTopEvents}</td>
            <td>${totalPercentage}%</td>
        </tr>
    `;

    const containerHTML = `
        <div class="chart-header">
            <h3 class="chart-title">AEFI Adverse Events</h3>
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
                        <th>Adverse Event</th>
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
            labels: topEvents.map(e => e[0]),
            datasets: [{
                label: 'Adverse Events',
                data: topEvents.map(e => e[1]),
                backgroundColor: '#2C4A7C'
            }]
        },
        options: {
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
                            return `Cases: ${context.raw}`;
                        }
                    }
                }
            }
        }
    };

    createChart(containerId, 'AEFI Adverse Events', 'bar', chartConfig.data, chartConfig.options, containerHTML);
}
