/**
 * PDF Export Configuration Module
 *
 * This module contains all configuration objects for the PDF export system.
 * Modify these settings to control how charts appear in exported PDFs
 * without affecting the on-screen display.
 */

/**
 * Global PDF export configuration
 * All dimensions in millimeters unless otherwise specified
 */
const PDF_GLOBAL_CONFIG = {
    // Page format: 16:9 landscape
    page: {
        format: [297, 167],  // Custom: 297mm x 167mm (16:9 ratio)
        orientation: 'landscape',
        unit: 'mm',
        margins: {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10
        }
    },

    // Content area dimensions (after margins)
    contentArea: {
        width: 277,   // 297 - 10 - 10
        height: 147   // 167 - 10 - 10
    },

    // Side-by-side layout proportions
    sideBySide: {
        chartWidthRatio: 0.55,    // Chart takes 55% of content width
        tableWidthRatio: 0.42,    // Table takes 42%
        gapWidth: 8,              // Gap between chart and table in mm
        titleHeight: 15,          // Height reserved for title
        contentStartY: 25         // Y position where content starts
    },

    // Typography
    fonts: {
        title: { family: 'helvetica', style: 'bold', size: 14 },
        subtitle: { family: 'helvetica', style: 'normal', size: 11 },
        categoryTitle: { family: 'helvetica', style: 'bold', size: 24 },
        tableHeader: { family: 'helvetica', style: 'bold', size: 9 },
        tableBody: { family: 'helvetica', style: 'normal', size: 8 },
        footer: { family: 'helvetica', style: 'italic', size: 7 }
    },

    // Colors (RGB arrays for jsPDF)
    colors: {
        primary: [44, 74, 124],         // #2C4A7C - Main brand color
        primaryLight: [107, 140, 174],  // #6B8CAE
        text: [44, 62, 80],             // #2C3E50 - Primary text
        textSecondary: [108, 117, 125], // #6C757D - Secondary text
        background: [255, 255, 255],    // White
        backgroundAlt: [248, 249, 250], // #F8F9FA - Alternate rows
        tableHeaderBg: [232, 234, 237], // #E8EAED
        tableBorder: [222, 226, 230],   // #DEE2E6
        categoryHeaderBg: [245, 248, 250], // Light blue-gray
        coverBg: [240, 245, 250]        // Cover page background
    },

    // Image quality settings
    imageQuality: {
        chartScale: 2,           // Scale factor for chart canvas (2x for retina)
        tableScale: 2,           // Scale factor for html2canvas
        imageFormat: 'PNG',
        compression: 'FAST'
    },

    // Table rendering settings
    table: {
        defaultMaxRows: 25,      // Maximum rows before pagination
        rowHeight: 8,            // Approximate row height in mm
        headerHeight: 10,        // Header row height in mm
        cellPadding: 3           // Cell padding in mm
    }
};

/**
 * Category-level configuration
 * Controls category header pages and grouping
 */
const PDF_CATEGORY_CONFIG = {
    demographics: {
        displayName: 'Demographics',
        headerColor: [44, 74, 124],      // Blue
        description: 'Population characteristics of AEFI cases including sex, age distribution, and temporal trends'
    },
    geographic: {
        displayName: 'Geographic Distribution',
        headerColor: [76, 141, 95],      // Green
        description: 'Spatial distribution of cases by patient location, health facility, and reporter location'
    },
    clinical: {
        displayName: 'Clinical Analysis',
        headerColor: [156, 89, 89],      // Red-brown
        description: 'Adverse event types, severity classification, and reasons for serious events'
    },
    temporal: {
        displayName: 'Performance Indicators',
        headerColor: [128, 100, 162],    // Purple
        description: 'Timeline analysis measuring reporting efficiency from identification to notification'
    },
    vaccine: {
        displayName: 'Vaccine Analysis',
        headerColor: [74, 144, 226],     // Light blue
        description: 'Vaccine-specific AEFI distribution and adverse event associations'
    }
};

/**
 * Chart-specific PDF export configurations
 * Each chart can override global settings for customized PDF appearance
 *
 * Configuration options:
 * - title: Display title in PDF
 * - chartType: 'pie' | 'bar' | 'line' | 'doughnut'
 * - pdfLayout: 'sideBySide' | 'chartOnly' | 'tableOnly' | 'stacked'
 * - chartOptions: Chart.js options specific to PDF rendering
 * - tableConfig: Table rendering configuration
 * - dimensions: Override sideBySide proportions
 */
const PDF_CHART_CONFIG = {
    // ==========================================
    // DEMOGRAPHICS CHARTS
    // ==========================================

    sexChartContainer: {
        title: 'Distribution of Cases by Sex',
        chartType: 'pie',
        pdfLayout: 'sideBySide',
        chartOptions: {
            aspectRatio: 1.2,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { font: { size: 11 }, padding: 15 }
                }
            }
        },
        tableConfig: {
            headers: ['Sex', 'Count', 'Percentage'],
            columnWidths: [0.4, 0.3, 0.3],
            showTotal: true
        },
        dimensions: {
            chartWidthRatio: 0.50,
            tableWidthRatio: 0.47
        }
    },

    ageDistributionChartContainer: {
        title: 'Age Distribution of Cases',
        chartType: 'bar',
        pdfLayout: 'sideBySide',
        chartOptions: {
            indexAxis: 'y',
            aspectRatio: 0.9,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { title: { display: true, text: 'Number of Cases' } },
                y: { title: { display: true, text: 'Age Group' } }
            }
        },
        tableConfig: {
            headers: ['Age Group', 'Count', 'Percentage'],
            columnWidths: [0.5, 0.25, 0.25],
            showTotal: true
        }
    },

    casesByYearChartContainer: {
        title: 'Cases by Year',
        chartType: 'bar',
        pdfLayout: 'sideBySide',
        chartOptions: {
            aspectRatio: 1.4,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { title: { display: true, text: 'Year' } },
                y: { title: { display: true, text: 'Number of Cases' } }
            }
        },
        tableConfig: {
            headers: ['Year', 'Count', 'Percentage'],
            columnWidths: [0.4, 0.3, 0.3],
            showTotal: true
        }
    },

    // ==========================================
    // GEOGRAPHIC CHARTS
    // ==========================================

    patientProvinceChartContainer: {
        title: 'Patient Distribution by Province',
        chartType: 'bar',
        pdfLayout: 'sideBySide',
        chartOptions: {
            indexAxis: 'y',
            aspectRatio: 0.7,
            plugins: {
                legend: { display: false }
            }
        },
        tableConfig: {
            headers: ['Province', 'Cases', 'Percentage'],
            columnWidths: [0.5, 0.25, 0.25],
            showTotal: true,
            maxRows: 20
        }
    },

    healthFacilityProvinceChartContainer: {
        title: 'Health Facility Distribution by Province',
        chartType: 'bar',
        pdfLayout: 'sideBySide',
        chartOptions: {
            indexAxis: 'y',
            aspectRatio: 0.7,
            plugins: {
                legend: { display: false }
            }
        },
        tableConfig: {
            headers: ['Province', 'Cases', 'Percentage'],
            columnWidths: [0.5, 0.25, 0.25],
            showTotal: true,
            maxRows: 20
        }
    },

    districtDistributionChartContainer: {
        title: 'District Distribution',
        chartType: 'bar',
        pdfLayout: 'sideBySide',
        chartOptions: {
            indexAxis: 'y',
            aspectRatio: 0.5,
            plugins: {
                legend: { display: false }
            }
        },
        tableConfig: {
            headers: ['District', 'Cases', 'Percentage'],
            columnWidths: [0.5, 0.25, 0.25],
            showTotal: true,
            maxRows: 25
        }
    },

    reporterProvinceChartContainer: {
        title: 'Reporter Distribution by Province',
        chartType: 'bar',
        pdfLayout: 'sideBySide',
        chartOptions: {
            indexAxis: 'y',
            aspectRatio: 0.7,
            plugins: {
                legend: { display: false }
            }
        },
        tableConfig: {
            headers: ['Province', 'Cases', 'Percentage'],
            columnWidths: [0.5, 0.25, 0.25],
            showTotal: true,
            maxRows: 20
        }
    },

    // ==========================================
    // CLINICAL CHARTS
    // ==========================================

    adverseEventsChart: {
        title: 'Adverse Events Distribution',
        chartType: 'bar',
        pdfLayout: 'sideBySide',
        chartOptions: {
            indexAxis: 'y',
            aspectRatio: 0.4,
            plugins: {
                legend: { display: false }
            }
        },
        tableConfig: {
            headers: ['Adverse Event', 'Count', 'Percentage'],
            columnWidths: [0.6, 0.2, 0.2],
            showTotal: true,
            maxRows: 30
        },
        dimensions: {
            chartWidthRatio: 0.50,
            tableWidthRatio: 0.47
        }
    },

    seriousnessChart: {
        title: 'Seriousness Distribution',
        chartType: 'pie',
        pdfLayout: 'sideBySide',
        chartOptions: {
            aspectRatio: 1.2,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { font: { size: 11 }, padding: 15 }
                }
            }
        },
        tableConfig: {
            headers: ['Seriousness', 'Count', 'Percentage'],
            columnWidths: [0.4, 0.3, 0.3],
            showTotal: true
        },
        dimensions: {
            chartWidthRatio: 0.50,
            tableWidthRatio: 0.47
        }
    },

    seriousReasonChart: {
        title: 'Reasons for Serious Events',
        chartType: 'bar',
        pdfLayout: 'sideBySide',
        chartOptions: {
            indexAxis: 'y',
            aspectRatio: 0.8,
            plugins: {
                legend: { display: false }
            }
        },
        tableConfig: {
            headers: ['Reason', 'Count', 'Percentage'],
            columnWidths: [0.5, 0.25, 0.25],
            showTotal: true
        }
    },

    // ==========================================
    // TEMPORAL / PERFORMANCE INDICATOR CHARTS
    // ==========================================

    seriousIdentificationChartContainer: {
        title: 'Serious AEFIs - Identification to Notification',
        chartType: 'bar',
        pdfLayout: 'sideBySide',
        chartOptions: {
            aspectRatio: 1.2,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { title: { display: true, text: 'Time Range (Days)' } },
                y: { title: { display: true, text: 'Number of Cases' } }
            }
        },
        tableConfig: {
            headers: ['Time Range', 'Count', 'Percentage'],
            columnWidths: [0.5, 0.25, 0.25],
            showTotal: true
        }
    },

    seriousReportingChartContainer: {
        title: 'Serious AEFIs - Notification to Reporting',
        chartType: 'bar',
        pdfLayout: 'sideBySide',
        chartOptions: {
            aspectRatio: 1.2,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { title: { display: true, text: 'Time Range (Days)' } },
                y: { title: { display: true, text: 'Number of Cases' } }
            }
        },
        tableConfig: {
            headers: ['Time Range', 'Count', 'Percentage'],
            columnWidths: [0.5, 0.25, 0.25],
            showTotal: true
        }
    },

    nonSeriousIdentificationChartContainer: {
        title: 'Non-Serious AEFIs - Identification to Notification',
        chartType: 'bar',
        pdfLayout: 'sideBySide',
        chartOptions: {
            aspectRatio: 1.2,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { title: { display: true, text: 'Time Range (Days)' } },
                y: { title: { display: true, text: 'Number of Cases' } }
            }
        },
        tableConfig: {
            headers: ['Time Range', 'Count', 'Percentage'],
            columnWidths: [0.5, 0.25, 0.25],
            showTotal: true
        }
    },

    nonSeriousReportingChartContainer: {
        title: 'Non-Serious AEFIs - Notification to Reporting',
        chartType: 'bar',
        pdfLayout: 'sideBySide',
        chartOptions: {
            aspectRatio: 1.2,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { title: { display: true, text: 'Time Range (Days)' } },
                y: { title: { display: true, text: 'Number of Cases' } }
            }
        },
        tableConfig: {
            headers: ['Time Range', 'Count', 'Percentage'],
            columnWidths: [0.5, 0.25, 0.25],
            showTotal: true
        }
    },

    // ==========================================
    // VACCINE CHARTS
    // ==========================================

    vaccineDistributionChartContainer: {
        title: 'Vaccine Distribution',
        chartType: 'bar',
        pdfLayout: 'sideBySide',
        chartOptions: {
            indexAxis: 'y',
            aspectRatio: 0.5,
            plugins: {
                legend: { display: false }
            }
        },
        tableConfig: {
            headers: ['Vaccine', 'Cases', 'Percentage'],
            columnWidths: [0.5, 0.25, 0.25],
            showTotal: true,
            maxRows: 25
        }
    },

    vaccineAdverseEventsChartContainer: {
        title: 'Vaccine-Specific Adverse Events',
        chartType: 'bar',
        pdfLayout: 'sideBySide',
        chartOptions: {
            indexAxis: 'y',
            aspectRatio: 0.5,
            plugins: {
                legend: { display: true, position: 'top' }
            }
        },
        tableConfig: {
            headers: ['Vaccine / Event', 'Count', 'Percentage'],
            columnWidths: [0.5, 0.25, 0.25],
            showTotal: true,
            maxRows: 25
        }
    }
};

/**
 * Get merged configuration for a specific chart
 * Combines global defaults with chart-specific overrides
 *
 * @param {string} containerId - Chart container ID
 * @returns {Object} Merged configuration with global defaults
 */
function getPDFChartConfig(containerId) {
    const chartConfig = PDF_CHART_CONFIG[containerId] || {};
    const globalSideBySide = PDF_GLOBAL_CONFIG.sideBySide;

    return {
        title: chartConfig.title || containerId,
        chartType: chartConfig.chartType || 'bar',
        pdfLayout: chartConfig.pdfLayout || 'sideBySide',
        chartOptions: chartConfig.chartOptions || {},
        tableConfig: {
            headers: ['Label', 'Count', 'Percentage'],
            columnWidths: [0.5, 0.25, 0.25],
            showTotal: true,
            maxRows: PDF_GLOBAL_CONFIG.table.defaultMaxRows,
            ...(chartConfig.tableConfig || {})
        },
        dimensions: {
            chartWidthRatio: globalSideBySide.chartWidthRatio,
            tableWidthRatio: globalSideBySide.tableWidthRatio,
            gapWidth: globalSideBySide.gapWidth,
            titleHeight: globalSideBySide.titleHeight,
            contentStartY: globalSideBySide.contentStartY,
            ...(chartConfig.dimensions || {})
        }
    };
}

/**
 * Get category configuration
 *
 * @param {string} categoryKey - Category key (demographics, geographic, etc.)
 * @returns {Object} Category configuration
 */
function getPDFCategoryConfig(categoryKey) {
    return PDF_CATEGORY_CONFIG[categoryKey] || {
        displayName: categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1),
        headerColor: PDF_GLOBAL_CONFIG.colors.primary,
        description: ''
    };
}

/**
 * Update a chart's PDF configuration at runtime
 * Use this to dynamically adjust PDF appearance
 *
 * @param {string} containerId - Chart container ID
 * @param {Object} newConfig - Configuration overrides
 */
function updatePDFChartConfig(containerId, newConfig) {
    if (!PDF_CHART_CONFIG[containerId]) {
        PDF_CHART_CONFIG[containerId] = {};
    }
    Object.assign(PDF_CHART_CONFIG[containerId], newConfig);
}

/**
 * Reset a chart's PDF configuration to defaults
 *
 * @param {string} containerId - Chart container ID
 */
function resetPDFChartConfig(containerId) {
    delete PDF_CHART_CONFIG[containerId];
}
