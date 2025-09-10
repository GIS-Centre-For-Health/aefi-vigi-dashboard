function renderSexChart(containerId, data) {
    const sexCounts = countField(data, 'Sex');
    const maleCount = sexCounts.Male || 0;
    const femaleCount = sexCounts.Female || 0;
    const unknownCount = sexCounts.Unknown || 0;
    const total = maleCount + femaleCount + unknownCount;

    const tableData = [
        { sex: 'Male', count: maleCount, percentage: total > 0 ? ((maleCount / total) * 100).toFixed(1) : 0 },
        { sex: 'Female', count: femaleCount, percentage: total > 0 ? ((femaleCount / total) * 100).toFixed(1) : 0 },
        { sex: 'Unknown', count: unknownCount, percentage: total > 0 ? ((unknownCount / total) * 100).toFixed(1) : 0 }
    ];

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
                </tbody>
            </table>
        </div>
    `;

    // Create the chart structure first
    createChart(containerId, 'AEFI cases by Sex', 'pie', {}, {}, containerHTML);

    // **XSS Fix: Safely create and append table rows**
    const tableBody = document.querySelector(`#${containerId} tbody`);
    if (tableBody) {
        tableBody.innerHTML = ''; // Clear existing content

        tableData.forEach(item => {
            const row = document.createElement('tr');

            const sexCell = document.createElement('td');
            sexCell.textContent = item.sex;
            row.appendChild(sexCell);

            const countCell = document.createElement('td');
            countCell.textContent = item.count;
            row.appendChild(countCell);

            const percentageCell = document.createElement('td');
            percentageCell.textContent = `${item.percentage}%`;
            row.appendChild(percentageCell);

            tableBody.appendChild(row);
        });

        const totalRow = document.createElement('tr');
        totalRow.className = 'total-row';

        const totalLabelCell = document.createElement('td');
        totalLabelCell.textContent = 'Total';
        totalRow.appendChild(totalLabelCell);

        const totalCountCell = document.createElement('td');
        totalCountCell.textContent = total;
        totalRow.appendChild(totalCountCell);

        const totalPercentageCell = document.createElement('td');
        totalPercentageCell.textContent = '100.0%';
        totalRow.appendChild(totalPercentageCell);

        tableBody.appendChild(totalRow);
    }

    // Now, update the chart with data
    const chart = activeCharts[containerId];
    if (chart) {
        chart.data = {
            labels: ['Male', 'Female', 'Unknown'],
            datasets: [{
                label: 'Sex Distribution',
                data: [maleCount, femaleCount, unknownCount],
                backgroundColor: ['#2C4A7C', '#6B8CAE', '#95a5a6'],
                borderColor: '#FFFFFF',
                borderWidth: 2
            }]
        };
        chart.options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const count = context.raw || 0;
                            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                            
                            return `${label}: ${count} cases (${percentage}% of total)`;
                        }
                    }
                }
            }
        };
        chart.update();
    }
}
