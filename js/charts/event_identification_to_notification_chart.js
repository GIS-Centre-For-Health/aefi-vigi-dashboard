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
        ? 'Serious AEFI - Identification to Notification'
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

    // Prepare table data
    const tableData = [];
    const labels = ['0-2 Days', '3-7 Days', '8-30 Days', '31-90 Days', '91+ Days'];

    labels.forEach((label, index) => {
        tableData.push([
            label,
            vaccToOnsetCounts[index],
            onsetToNotificationCounts[index]
        ]);
    });

    const tableHeaders = ['Time Interval', 'Vaccination → Onset', 'Onset → Notification'];

    // Create the chart using utility function
    createBarChart(
        containerId,
        chartTitle,
        chartData,
        chartOptions,
        tableData,
        tableHeaders,
        false
    );
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
        const onsetDate = parseDate(row['Date of onset']);
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
        const onsetDate = parseDate(row['Date of onset']);
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
