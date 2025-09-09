function renderSeriousEventChart(containerId, seriousCounts) {
    const colorMap = {
        'Serious': '#2C4A7C',
        'Not Serious': '#6B8CAE',
        'Unknown': '#E5E5E5'
    };

    const labels = Object.keys(seriousCounts);
    const backgroundColors = labels.map(label => colorMap[label] || '#E5E5E5');
    const total = Object.values(seriousCounts).reduce((sum, count) => sum + count, 0);

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
                </tbody>
            </table>
        </div>
    `;

    // Create the chart structure first
    createChart(containerId, 'Serious vs. Non-Serious Events', 'pie', {}, {}, containerHTML);

    // **XSS Fix: Safely create and append table rows**
    const tableBody = document.querySelector(`#${containerId} tbody`);
    if (tableBody) {
        tableBody.innerHTML = ''; // Clear existing content

        for (const [key, value] of Object.entries(seriousCounts)) {
            const percentage = total > 0 ? (value / total * 100).toFixed(1) : 0;
            const row = document.createElement('tr');

            const keyCell = document.createElement('td');
            keyCell.textContent = key;
            row.appendChild(keyCell);

            const valueCell = document.createElement('td');
            valueCell.textContent = value;
            row.appendChild(valueCell);

            const percentageCell = document.createElement('td');
            percentageCell.textContent = `${percentage}%`;
            row.appendChild(percentageCell);

            tableBody.appendChild(row);
        }

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
            labels: labels,
            datasets: [{
                data: Object.values(seriousCounts),
                backgroundColor: backgroundColors,
                borderColor: '#ffffff',
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
        };
        chart.update();
    }
}
