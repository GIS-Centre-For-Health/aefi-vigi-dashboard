function renderCasesByYearChart(containerId, data, viewState = null) {
    // Determine which view to render
    if (viewState && viewState.view === 'monthly' && viewState.selectedYear) {
        renderMonthlyView(containerId, data, viewState.selectedYear);
    } else {
        renderYearlyView(containerId, data);
    }
}

// Render yearly view (default)
function renderYearlyView(containerId, data) {
    // 1. Aggregate cases by year using earliest onset date
    const yearCounts = {};

    data.forEach(row => {
        const earliestOnsetDate = getEarliestOnsetDate(row);

        if (!earliestOnsetDate) return;

        const year = earliestOnsetDate.getFullYear();
        yearCounts[year] = (yearCounts[year] || 0) + 1;
    });

    const totalCases = data.length;

    // 2. Sort years chronologically
    const sortedYears = Object.keys(yearCounts).sort((a, b) => a - b);
    const counts = sortedYears.map(year => yearCounts[year]);

    // 3. Prepare Chart.js configuration
    const chartData = {
        labels: sortedYears,
        datasets: [{
            label: 'Total Cases',
            data: counts,
            backgroundColor: '#2C4A7C'
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Year'
                },
                maxBarThickness: 80
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Number of Cases'
                },
                ticks: {
                    stepSize: 1
                }
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
                    },
                    afterLabel: function() {
                        return 'Click to see monthly breakdown';
                    }
                }
            }
        },
        layout: {
            padding: { top: 20 }
        },
        // Add onClick handler for drill-down
        onClick: (event, elements) => {
            if (elements.length > 0) {
                const index = elements[0].index;
                const year = parseInt(chartData.labels[index]);
                drillDownToMonth(year);
            }
        },
        // Add hover cursor
        onHover: (event, elements) => {
            event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
        }
    };

    // 4. Prepare data for the utility function's table
    const tableHeaders = ['Year', 'Count', 'Percentage'];
    const tableData = sortedYears.map(year => [year, yearCounts[year]]);

    // 5. Call the reusable utility function
    createBarChart(
        containerId,
        'Total Cases by Year',
        chartData,
        chartOptions,
        tableData,
        tableHeaders,
        false  // Not scrollable
    );
}

// Render monthly view for a specific year
function renderMonthlyView(containerId, data, selectedYear) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // 1. Aggregate cases by month for selected year
    const monthCounts = {};

    data.forEach(row => {
        const earliestOnsetDate = getEarliestOnsetDate(row);

        if (!earliestOnsetDate) return;

        const year = earliestOnsetDate.getFullYear();
        if (year !== selectedYear) return;

        const month = earliestOnsetDate.getMonth(); // 0-11
        const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

        if (!monthCounts[monthKey]) {
            monthCounts[monthKey] = {
                count: 0,
                displayLabel: `${monthNames[month]} ${year}`,
                sortOrder: month
            };
        }
        monthCounts[monthKey].count++;
    });

    // 2. Sort months chronologically
    const sortedMonthKeys = Object.keys(monthCounts).sort();
    const sortedLabels = sortedMonthKeys.map(key => monthCounts[key].displayLabel);
    const counts = sortedMonthKeys.map(key => monthCounts[key].count);

    const totalCases = counts.reduce((sum, count) => sum + count, 0);

    // 3. Prepare Chart.js configuration
    const chartData = {
        labels: sortedLabels,
        datasets: [{
            label: 'Total Cases',
            data: counts,
            backgroundColor: '#2C4A7C'
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Month'
                },
                maxBarThickness: 80
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Number of Cases'
                },
                ticks: {
                    stepSize: 1
                }
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

    // 4. Prepare custom HTML with back button
    const containerHTML = `
        <div class="chart-header">
            <h3 class="chart-title">Total Cases by Month - ${selectedYear}</h3>
            <div class="chart-container-tabs">
                <button class="chart-back-btn" title="Return to yearly view">← Back to Years</button>
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
                        <th>Month</th>
                        <th>Count</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
        </div>
    `;

    const container = document.getElementById(containerId);
    container.innerHTML = containerHTML;

    // Add event listener to back button
    const backBtn = container.querySelector('.chart-back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            returnToYearlyView();
        });
    }

    // 5. Populate table using XSS-safe DOM manipulation
    const tableBody = container.querySelector('tbody');
    if (tableBody) {
        sortedMonthKeys.forEach(key => {
            const monthData = monthCounts[key];
            const tr = document.createElement('tr');

            const cell1 = document.createElement('td');
            cell1.textContent = monthData.displayLabel;
            tr.appendChild(cell1);

            const cell2 = document.createElement('td');
            cell2.textContent = monthData.count;
            tr.appendChild(cell2);

            const percentage = totalCases > 0 ? ((monthData.count / totalCases) * 100).toFixed(2) : 0;
            const cell3 = document.createElement('td');
            cell3.textContent = `${percentage}%`;
            tr.appendChild(cell3);

            tableBody.appendChild(tr);
        });

        // Add total row
        const totalRow = document.createElement('tr');
        totalRow.className = 'total-row';

        const totalCell1 = document.createElement('td');
        totalCell1.textContent = 'Total';
        totalRow.appendChild(totalCell1);

        const totalCell2 = document.createElement('td');
        totalCell2.textContent = totalCases;
        totalRow.appendChild(totalCell2);

        const totalCell3 = document.createElement('td');
        totalCell3.textContent = '100.00%';
        totalRow.appendChild(totalCell3);

        tableBody.appendChild(totalRow);
    }

    // 6. Create the chart
    const canvas = container.querySelector('canvas');
    const chart = new Chart(canvas, {
        type: 'bar',
        data: chartData,
        options: chartOptions
    });

    // Store in activeCharts for cleanup
    if (typeof activeCharts !== 'undefined') {
        if (activeCharts[containerId]) {
            activeCharts[containerId].destroy();
        }
        activeCharts[containerId] = chart;
    }

    // 7. Set up tab switching
    const tabs = container.querySelectorAll('.chart-container-tab');
    const chartContent = container.querySelector('.chart-content');
    const tableContent = container.querySelector('.table-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const view = tab.dataset.view;
            chartContent.classList.toggle('active', view === 'chart');
            tableContent.classList.toggle('active', view === 'table');
        });
    });
}
