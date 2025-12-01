/**
 * Event Identification to Notification Chart
 * Analyzes timeline from vaccination to notification for AEFI cases
 * Supports filtering by serious vs non-serious cases
 */

function renderEventIdentificationChart(containerId, data, isSerious) {
    // Filter data by serious flag
    const filteredData = filterBySerious(data, isSerious);

    // Calculate gaps for both intervals
    const vaccToOnsetGaps = calculateVaccToOnsetGaps(filteredData);
    const onsetToNotificationGaps = calculateOnsetToNotificationGaps(filteredData);

    // Group gaps into time buckets
    const vaccToOnsetCounts = groupGapsIntoTimeBuckets(vaccToOnsetGaps);
    const onsetToNotificationCounts = groupGapsIntoTimeBuckets(onsetToNotificationGaps);

    // Determine chart title and colors based on serious flag
    const chartTitle = isSerious
        ? 'Serious AEFI: Time interval - Identification to Notification'
        : 'Non-Serious AEFI - Identification to Notification';

    // Use same colors as Cases by Sex chart: #2C4A7C, #6B8CAE
    const colors = {
        vacc: '#2C4A7C',    // Primary dark navy blue (from sex chart)
        onset: '#6B8CAE'    // Steel blue (from sex chart)
    };

    // Prepare datasets
    const datasets = [
        {
            label: 'Vaccination → Onset',
            data: vaccToOnsetCounts,
            backgroundColor: colors.vacc,
            borderColor: '#FFFFFF',
            borderWidth: 2
        },
        {
            label: 'Onset → Notification',
            data: onsetToNotificationCounts,
            backgroundColor: colors.onset,
            borderColor: '#FFFFFF',
            borderWidth: 2
        }
    ];

    // Chart configuration
    const chartData = {
        labels: ['0-2 Days', '3-7 Days', '8-30 Days', '31-90 Days', '91+ Days'],
        datasets: datasets
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 12,
                    padding: 15,
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.dataset.label || '';
                        const value = context.parsed.y || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return `${label}: ${value} cases (${percentage}%)`;
                    }
                }
            },
            title: {
                display: false
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 11
                    }
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    font: {
                        size: 11
                    }
                },
                title: {
                    display: true,
                    text: 'Number of Cases',
                    font: {
                        size: 12,
                        weight: 'bold'
                    }
                }
            }
        }
    };

    // Create custom dual-dataset table (not using createBarChart as it's for single dataset)
    const container = document.getElementById(containerId);

    const containerHTML = `
        <div class="chart-header">
            <h3 class="chart-title">${chartTitle}</h3>
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
                        <th>Time Interval</th>
                        <th>Vaccination → Onset</th>
                        <th>%</th>
                        <th>Onset → Notification</th>
                        <th>%</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
    `;

    container.innerHTML = containerHTML;

    // Create Chart.js instance
    const canvas = container.querySelector('canvas');
    const chart = new Chart(canvas, {
        type: 'bar',
        data: chartData,
        options: chartOptions
    });

    activeCharts[containerId] = chart;

    // Populate table with data
    const tableBody = container.querySelector('tbody');
    const labels = ['0-2 Days', '3-7 Days', '8-30 Days', '31-90 Days', '91+ Days'];

    const totalVacc = vaccToOnsetCounts.reduce((a, b) => a + b, 0);
    const totalOnset = onsetToNotificationCounts.reduce((a, b) => a + b, 0);

    labels.forEach((label, index) => {
        const tr = document.createElement('tr');

        const tdInterval = document.createElement('td');
        tdInterval.textContent = label;
        tr.appendChild(tdInterval);

        const tdVaccCount = document.createElement('td');
        tdVaccCount.textContent = vaccToOnsetCounts[index];
        tr.appendChild(tdVaccCount);

        const tdVaccPct = document.createElement('td');
        const vaccPct = totalVacc > 0 ? ((vaccToOnsetCounts[index] / totalVacc) * 100).toFixed(2) : '0.00';
        tdVaccPct.textContent = `${vaccPct}%`;
        tr.appendChild(tdVaccPct);

        const tdOnsetCount = document.createElement('td');
        tdOnsetCount.textContent = onsetToNotificationCounts[index];
        tr.appendChild(tdOnsetCount);

        const tdOnsetPct = document.createElement('td');
        const onsetPct = totalOnset > 0 ? ((onsetToNotificationCounts[index] / totalOnset) * 100).toFixed(2) : '0.00';
        tdOnsetPct.textContent = `${onsetPct}%`;
        tr.appendChild(tdOnsetPct);

        tableBody.appendChild(tr);
    });

    // Add total row
    const totalRow = document.createElement('tr');
    totalRow.className = 'total-row';

    const tdTotalLabel = document.createElement('td');
    tdTotalLabel.textContent = 'Total';
    totalRow.appendChild(tdTotalLabel);

    const tdTotalVacc = document.createElement('td');
    tdTotalVacc.textContent = totalVacc;
    totalRow.appendChild(tdTotalVacc);

    const tdTotalVaccPct = document.createElement('td');
    tdTotalVaccPct.textContent = '100.00%';
    totalRow.appendChild(tdTotalVaccPct);

    const tdTotalOnset = document.createElement('td');
    tdTotalOnset.textContent = totalOnset;
    totalRow.appendChild(tdTotalOnset);

    const tdTotalOnsetPct = document.createElement('td');
    tdTotalOnsetPct.textContent = '100.00%';
    totalRow.appendChild(tdTotalOnsetPct);

    tableBody.appendChild(totalRow);

    // Set up tab switching
    const tabs = container.querySelectorAll('.chart-container-tab');
    const chartContent = container.querySelector('.chart-content');
    const tableContent = container.querySelector('.table-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            if (tab.dataset.view === 'chart') {
                chartContent.classList.add('active');
                tableContent.classList.remove('active');
            } else {
                chartContent.classList.remove('active');
                tableContent.classList.add('active');
            }
        });
    });
}

/**
 * Helper Functions
 */

// Filter data by serious flag
// Handles multi-line "Serious" field (e.g., "Yes\nNo\nYes" when one patient has multiple AEFIs)
function filterBySerious(data, isSerious) {
    if (isSerious) {
        // Include row if it contains AT LEAST ONE "Yes" (any serious AEFI)
        return data.filter(row => {
            const seriousField = row['Serious'];
            if (!seriousField) return false;
            // Convert to string and check if it contains "Yes"
            return String(seriousField).includes('Yes');
        });
    } else {
        // Include row ONLY if it has NO "Yes" at all (purely non-serious)
        return data.filter(row => {
            const seriousField = row['Serious'];
            if (!seriousField) return true; // Empty/null = non-serious
            // Convert to string and check if it does NOT contain "Yes"
            return !String(seriousField).includes('Yes');
        });
    }
}

// Calculate vaccination to onset gaps in days
function calculateVaccToOnsetGaps(data) {
    const gaps = [];
    data.forEach(row => {
        const vaccDate = parseDate(row['Date of vaccination']);
        const onsetDate = getEarliestOnsetDate(row);
        if (vaccDate && onsetDate) {
            const diffTime = Math.abs(onsetDate - vaccDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            gaps.push(diffDays);
        }
    });
    return gaps;
}

// Calculate onset to notification gaps in days
function calculateOnsetToNotificationGaps(data) {
    const gaps = [];
    data.forEach(row => {
        const onsetDate = getEarliestOnsetDate(row);
        const notifDate = parseDate(row['Date of notification']);
        if (onsetDate && notifDate) {
            const diffTime = Math.abs(notifDate - onsetDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            gaps.push(diffDays);
        }
    });
    return gaps;
}

// Group gaps into 5 time buckets (NEW: 0-2, 3-7, 8-30, 31-90, 91+)
function groupGapsIntoTimeBuckets(gaps) {
    const groups = [0, 0, 0, 0, 0]; // 0-2, 3-7, 8-30, 31-90, 91+
    gaps.forEach(gap => {
        if (gap <= 2) groups[0]++;           // 0-2 days
        else if (gap <= 7) groups[1]++;      // 3-7 days
        else if (gap <= 30) groups[2]++;     // 8-30 days
        else if (gap <= 90) groups[3]++;     // 31-90 days
        else groups[4]++;                     // 91+ days
    });
    return groups;
}
