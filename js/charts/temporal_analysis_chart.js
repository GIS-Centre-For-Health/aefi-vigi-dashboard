/**
 * Chart Module: Temporal Analysis
 * 
 * This module handles the creation of the temporal analysis chart, 
 * visualizing the time intervals between vaccination, onset, notification, and report dates.
 */

/**
 * Renders the temporal analysis chart.
 * @param {string} containerId - The ID of the container element.
 * @param {Array} data - The dataset from the AEFI dashboard.
 */
function renderTemporalAnalysisChart(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with id ${containerId} not found.`);
        return;
    }

    container.innerHTML = `
        <div class="chart-header">
            <h3 class="chart-title">Temporal Analysis of AEFI Reporting</h3>
        </div>
        <div class="chart-content active">
            <canvas id="temporalAnalysisChart"></canvas>
        </div>
    `;

    const { vaccToOnset, onsetToNotification, notificationToReport } = processTemporalData(data);

    const config = {
        type: 'bar',
        data: {
            labels: ['0-7 Days', '8-30 Days', '31-90 Days', '91+ Days'],
            datasets: [
                {
                    label: 'Vaccination to Onset',
                    data: vaccToOnset,
                    backgroundColor: 'rgba(44, 74, 124, 0.8)',
                },
                {
                    label: 'Onset to Notification',
                    data: onsetToNotification,
                    backgroundColor: 'rgba(44, 74, 124, 0.6)',
                },
                {
                    label: 'Notification to Report',
                    data: notificationToReport,
                    backgroundColor: 'rgba(44, 74, 124, 0.4)',
                }
            ]
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
                    position: 'bottom',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw} cases`;
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
                    title: {
                        display: true,
                        text: 'Number of Cases'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    };

    createChartEnhanced('temporalAnalysisChart', config.type, config.data, config.options);
}

/**
 * Processes the data to calculate time intervals.
 * @param {Array} data - The dataset from the AEFI dashboard.
 * @returns {object} - An object containing the processed interval data.
 */
function processTemporalData(data) {
    const vaccToOnsetGaps = [];
    const onsetToNotificationGaps = [];
    const notificationToReportGaps = [];

    data.forEach(row => {
        const vaccDates = String(row['Date of vaccination'] || '').split('\n').map(parseDate).filter(d => d instanceof Date && !isNaN(d));
        const onsetDates = String(row['Date of onset'] || '').split('\n').map(parseDate).filter(d => d instanceof Date && !isNaN(d));
        const notificationDate = parseDate(row['Date of notification']);
        const reportDate = parseDate(row['Date of report']);

        // Vaccination to Onset
        if (vaccDates.length > 0 && onsetDates.length > 0) {
            const minVaccDate = new Date(Math.min.apply(null, vaccDates));
            const minOnsetDate = new Date(Math.min.apply(null, onsetDates));
            if (minVaccDate.getTime() && minOnsetDate.getTime()) {
                const diff = (minOnsetDate - minVaccDate) / (1000 * 60 * 60 * 24);
                if (diff >= 0) vaccToOnsetGaps.push(diff);
            }
        }

        // Onset to Notification
        if (onsetDates.length > 0 && notificationDate && !isNaN(notificationDate)) {
            const minOnsetDate = new Date(Math.min.apply(null, onsetDates));
            if (minOnsetDate.getTime()) {
                const diff = (notificationDate - minOnsetDate) / (1000 * 60 * 60 * 24);
                if (diff >= 0) onsetToNotificationGaps.push(diff);
            }
        }

        // Notification to Report
        if (notificationDate && !isNaN(notificationDate) && reportDate && !isNaN(reportDate)) {
            const diff = (reportDate - notificationDate) / (1000 * 60 * 60 * 24);
            if (diff >= 0) notificationToReportGaps.push(diff);
        }
    });

    return {
        vaccToOnset: groupGaps(vaccToOnsetGaps),
        onsetToNotification: groupGaps(onsetToNotificationGaps),
        notificationToReport: groupGaps(notificationToReportGaps)
    };
}



/**
 * Groups time gaps into predefined categories.
 * @param {Array<number>} gaps - An array of time gaps in days.
 * @returns {Array<number>} - An array with the count for each category.
 */
function groupGaps(gaps) {
    const groups = [0, 0, 0, 0]; // 0-7, 8-30, 31-90, 91+
    gaps.forEach(gap => {
        if (gap <= 7) groups[0]++;
        else if (gap <= 30) groups[1]++;
        else if (gap <= 90) groups[2]++;
        else groups[3]++;
    });
    return groups;
}
