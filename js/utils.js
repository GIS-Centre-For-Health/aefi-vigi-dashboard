///////////////////////////////////////////////////////////
// Utility Functions
///////////////////////////////////////////////////////////

/**
 * Defines and returns the application's consistent color palette for charts.
 * @param {number} [count] - The number of colors to return.
 * @returns {string|string[]} A single color or an array of colors.
 */
// function getChartColors(count) {
//     // Colors aligned with the new CSS variables from Init.md
//     const colors = [
//         '#2C4A7C', // --primary-dark
//         '#6B8CAE', // --primary-light
//         '#B08FA3', // --severity-mild (Purple)
//         '#4A90E2', // --accent
//         '#A8C0D8', // --primary-lighter
//         '#4A2C47', // --severity-serious (Dark Purple)
//         '#E5E5E5', // --severity-unknown (Gray)
//         '#3D2841', // --severity-fatal
//     ];

//     if (count) {
//         return colors.slice(0, count);
//     }
//     return colors;
// }                                                                                                                                                                                         

/**
 * Generates an array of consistent chart colors.
 *
 * @returns {Array<string>} - An array of RGBA color strings.
 */
function getChartColors() {
    return [
        'rgba(44, 62, 80, 0.6)',
        'rgba(60, 77, 94, 0.6)',
        'rgba(75, 91, 106, 0.6)',
        'rgba(89, 104, 117, 0.6)',
        'rgba(102, 116, 128, 0.6)',
        'rgba(114, 127, 138, 0.6)',
        'rgba(125, 137, 147, 0.6)',
        'rgba(135, 146, 155, 0.6)',
        'rgba(144, 154, 163, 0.6)'
    ];
}

function getUniqueValues(data, field) {
    const values = new Set();
    data.forEach(row => {
        if (row[field]) {
            values.add(row[field]);
        }
    });
    return Array.from(values).sort();
}

function clearSelectOptions(select, keepFirst) {
    const optionsToKeep = keepFirst ? 1 : 0;
    while (select.options.length > optionsToKeep) {
        select.remove(optionsToKeep);
    }
}

/**
 * Parses a date string from various formats into a JavaScript Date object, ignoring timezones.
 *
 * @param {string|number} dateStr - The date string or Excel serial number.
 * @returns {Date|null} - The parsed Date object or null if parsing fails.
 */
function parseDate(dateStr) {
    if (dateStr === null || dateStr === undefined || dateStr === '') {
        return null;
    }

    let date = null;

    // Convert to string first to handle both numbers and strings uniformly
    let str = String(dateStr);

    // SPLIT on newlines first (don't remove them) - take the first date only
    str = str.split(/[\r\n]+/)[0].trim();

    // Remove only tabs and spaces (NOT newlines since we already split)
    str = str.replace(/[\t ]/g, '');

    let year, month, day;

    // YYYYMMDD - check BEFORE Excel serial number to prevent misinterpretation
    // (e.g., 20240216 should be parsed as a date, not as day 20,240,216)
    if (/^(\d{8})$/.test(str)) {
        year = parseInt(str.substring(0, 4), 10);
        month = parseInt(str.substring(4, 6), 10) - 1;
        day = parseInt(str.substring(6, 8), 10);
        date = new Date(Date.UTC(year, month, day));
    }
    // YYYY-MM-DD or YYYY/MM/DD
    else if (/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/.test(str)) {
        const parts = str.split(/[-\/]/);
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        day = parseInt(parts[2], 10);
        date = new Date(Date.UTC(year, month, day));
    }
    // DD-MM-YYYY or DD/MM/YYYY
    else if (/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/.test(str)) {
        const parts = str.split(/[-\/]/);
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        year = parseInt(parts[2], 10);
        date = new Date(Date.UTC(year, month, day));
    }
    // Excel serial numbers (only for numbers in valid Excel date range)
    else if (typeof dateStr === 'number' && dateStr > 0 && dateStr < 2958466) {
        // 2958466 = Dec 31, 9999 in Excel serial date
        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
        date = new Date(excelEpoch.getTime() + dateStr * 86400000);
    }
    // Fallback for other ISO-like formats that JS can handle
    else {
        const tempDate = new Date(str);
        if (tempDate instanceof Date && !isNaN(tempDate)) {
            date = new Date(Date.UTC(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate()));
        }
    }

    if (date instanceof Date && !isNaN(date)) {
        return date;
    }

    return null;
}

/**
 * Extracts the earliest onset date from a case that may have multiple onset dates.
 * Follows the pattern established in temporal_analysis_chart.js to ensure consistency.
 *
 * @param {Object} row - A data row from the dataset.
 * @returns {Date|null} - The earliest onset date or null if no valid dates found.
 */
function getEarliestOnsetDate(row) {
    const rawDateStr = String(row['Date of onset'] || '');

    // Split by newlines and carriage returns, and filter out empty strings
    const dateLines = rawDateStr
        .split(/[\r\n]+/)  // Split by newline or carriage return
        .map(d => d.trim())  // Trim whitespace
        .filter(d => d !== '');  // Remove empty strings

    const onsetDates = dateLines
        .map(dateStr => {
            const parsed = parseDate(dateStr);
            if (!parsed) {
                console.warn('Failed to parse date:', dateStr);
            }
            return parsed;
        })
        .filter(d => d instanceof Date && !isNaN(d));

    return onsetDates.length > 0 ? new Date(Math.min.apply(null, onsetDates)) : null;
}

/**
 * Extracts unique, non-empty values from a specific field in the dataset.
 *
 * @param {Array<Object>} data - The dataset.
 * @param {string} field - The field to extract unique values from.
 * @returns {Array<string>} - An array of unique values.
 */
function getUniqueValues(data, field) {
    const valueSet = new Set();
    data.forEach(row => {
        if (row[field] && typeof row[field] === 'string') {
            const values = row[field].split(/[\,\n]+/);
            values.forEach(value => {
                const trimmedValue = value.trim();
                if (trimmedValue) {
                    valueSet.add(trimmedValue);
                }
            });
        }
    });
    return Array.from(valueSet).sort();
}

/**
 * Clears all options from a select element.
 *
 * @param {HTMLElement} selectElement - The select element to clear.
 * @param {boolean} keepDefault - Whether to keep the first option (the default).
 */
function clearSelectOptions(selectElement, keepDefault = false) {
    const start = keepDefault ? 1 : 0;
    while (selectElement.options.length > start) {
        selectElement.remove(start);
    }
}



/**
 * Displays a loading overlay with a message.
 *
 * @param {string} message - The message to display.
 */
function showLoading(message) {
    document.getElementById('loading-message').textContent = message;
    document.getElementById('loading').style.display = 'flex';
}

/**
 * Hides the loading overlay.
 */
function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

/**
 * Shows a toast notification with a message.
 *
 * @param {string} message - The message to display.
 * @param {string} type - The type of notification ('success', 'error', 'info').
 */
function showToast(message, type = 'info') {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = `status ${type}`;
    status.style.display = 'block';
    setTimeout(() => {
        status.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    showToast(message, 'success');
}

function showError(message) {
    showToast(message, 'error');
}

function showDataErrors(errors) {
    if (errors.length > 0) {
        const errorMessage = `Found ${errors.length} ambiguous or invalid date entries. Check console for details.`;
        showError(errorMessage);
        console.warn('Data Quality Issues Detected:');
        errors.forEach(error => {
            console.log(`- Record ID: ${error.id}, Field: "${error.field}", Value: "${error.value}"`);
        });
    }
}


function countField(data, field) {
    const counts = {};
    data.forEach(row => {
        const value = row[field] ? row[field].toString().trim() : 'Unknown';
        counts[value] = (counts[value] || 0) + 1;
    });
    return counts;
}

function generateSummaryStats(data) {
    const summaryContainer = document.getElementById('summary-stats');
    summaryContainer.innerHTML = ''; // Clear previous stats

    if (!data || data.length === 0) {
        summaryContainer.innerHTML = '<p>No data to summarize.</p>';
        return;
    }

    const totalRecords = data.length;

    // Group data by patient ID to get patient-centric stats
    const patients = {};
    data.forEach(row => {
        const patientId = row['Worldwide unique id'];
        if (!patientId) return; // Skip rows without a patient ID

        if (!patients[patientId]) {
            patients[patientId] = {
                seriousEventCount: 0,
                hasSeriousEvent: false
            };
        }

        const seriousValue = row.Serious;
        if (typeof seriousValue === 'string') {
            const yesCount = (seriousValue.match(/yes/gi) || []).length;
            if (yesCount > 0) {
                patients[patientId].seriousEventCount += yesCount;
                patients[patientId].hasSeriousEvent = true;
            }
        }
    });

    const patientIds = Object.keys(patients);
    const totalPatients = patientIds.length;
    const totalSeriousEvents = patientIds.reduce((acc, id) => acc + patients[id].seriousEventCount, 0);

    const reportingProvinces = getUniqueValues(data, 'Patient state or province').length;
    
    // const ages = data.map(r => r.NormalizedAge).filter(age => age !== null && age !== undefined);
    // let averageAgeFormatted = 'N/A';
    // if (ages.length > 0) {
    //     const averageAge = ages.reduce((a, b) => a + b, 0) / ages.length;
    //     const years = Math.floor(averageAge);
    //     const months = Math.round((averageAge - years) * 12);
    //     averageAgeFormatted = `${years} Years, ${months} Months`;
    // }

    const stats = [
        { title: 'Total Reports', value: totalRecords.toLocaleString() },
        { title: 'Total Serious Events', value: totalSeriousEvents.toLocaleString() },
        { title: 'Reporting Provinces', value: reportingProvinces.toLocaleString() },
    ];

    stats.forEach(stat => {
        const card = document.createElement('div');
        card.className = 'stat-card';
        card.innerHTML = `<div class="stat-title">${stat.title}</div><div class="stat-value">${stat.value}</div>`;
        summaryContainer.appendChild(card);
    });
}

///////////////////////////////////////////////////////////
// Status and Notification Functions
///////////////////////////////////////////////////////////
function showLoading(message) {
    const loading = document.getElementById('loading');
    const loadingMessage = document.getElementById('loading-message');
    loadingMessage.textContent = message || 'Processing...';
    loading.classList.add('active');
}

function hideLoading() {
    document.getElementById('loading').classList.remove('active');
}

function showError(message) {
    showToast(message, 'error');
}

function showSuccess(message) {
    showToast(message, 'success');
}

function showDataErrors(errors) {
    if (errors.length === 0) return;

    const message = `
        <strong>Data Quality Warning:</strong> ${errors.length} issue(s) found.
        <br>Record ID ${errors[0].id}: Invalid date "${errors[0].value}" in field "${errors[0].field}".
        ${errors.length > 1 ? `<br>...and ${errors.length - 1} more issues.` : ''}
        <br>Check the console for a full report.
    `;
    showToast(message, 'error', 10000); // Show for 10 seconds

    console.warn("Full list of data quality issues:", errors);
}

function showToast(message, type = 'info', duration = 5000) {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = message;

    toastContainer.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    // Animate out and remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 500);
    }, duration);
}

///////////////////////////////////////////////////////////
// PDF Export Helper Functions
///////////////////////////////////////////////////////////

/**
 * Captures a Chart.js chart instance as a high-quality base64 PNG image
 * @param {string} containerId - The chart container ID
 * @returns {Promise<string|null>} Base64 image data or null if capture fails
 */
async function captureChartCanvas(containerId) {
    try {
        const chart = activeCharts[containerId];
        if (!chart) {
            console.warn(`Chart not found in activeCharts: ${containerId}`);
            return null;
        }

        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Container not found: ${containerId}`);
            return null;
        }

        // Ensure chart view is active
        const chartContent = container.querySelector('.chart-content');
        const tableContent = container.querySelector('.table-content');
        if (chartContent && tableContent) {
            if (!chartContent.classList.contains('active')) {
                chartContent.classList.add('active');
                tableContent.classList.remove('active');
                // Allow DOM to update
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        // Get the canvas from the chart instance
        const canvas = chart.canvas;
        if (!canvas) {
            console.warn(`Canvas not found in chart ${containerId}`);
            return null;
        }

        // Get base64 image data
        const imgData = chart.toBase64Image('image/png');
        if (!imgData) {
            console.warn(`Failed to convert chart to base64: ${containerId}`);
            return null;
        }

        return {
            imgData: imgData,
            width: canvas.width,
            height: canvas.height,
            devicePixelRatio: window.devicePixelRatio || 1
        };
    } catch (error) {
        console.error(`Failed to capture chart ${containerId}:`, error);
        return null;
    }
}

/**
 * Captures the table view of a chart as a high-quality image using html2canvas
 * @param {string} containerId - The chart container ID
 * @returns {Promise<object|null>} Object with imgData, width, height and scale, or null if capture fails
 */
async function captureTableView(containerId) {
    try {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Container not found: ${containerId}`);
            return null;
        }

        // Switch to table view
        const chartContent = container.querySelector('.chart-content');
        const tableContent = container.querySelector('.table-content');
        if (!tableContent) {
            console.warn(`Table not found in ${containerId}`);
            return null;
        }

        chartContent.classList.remove('active');
        tableContent.classList.add('active');

        // Allow DOM to render
        await new Promise(resolve => setTimeout(resolve, 100));

        // Capture table with html2canvas at scale=2 for high quality
        const canvas = await html2canvas(tableContent, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false,
            useCORS: true,
            allowTaint: true,
            windowWidth: tableContent.scrollWidth,
            windowHeight: tableContent.scrollHeight
        });

        const imgData = canvas.toDataURL('image/png');

        // Switch back to chart view
        chartContent.classList.add('active');
        tableContent.classList.remove('active');

        // Return image data with dimensions for proper scaling
        return {
            imgData: imgData,
            width: canvas.width,
            height: canvas.height,
            scale: 2
        };
    } catch (error) {
        console.error(`Failed to capture table ${containerId}:`, error);
        return null;
    }
}

/**
 * Generates the cover page of the PDF report
 * @param {jsPDF} pdf - The PDF document instance
 * @param {Object} metadata - Report metadata
 */
function generatePDFCoverPage(pdf, metadata) {
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;

    // Background color (light blue)
    pdf.setFillColor(240, 245, 250);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    // Title
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(44, 62, 80);
    pdf.text('AEFI Data Visualization Report', pageWidth / 2, 60, { align: 'center' });

    // Divider line
    pdf.setDrawColor(100, 150, 200);
    pdf.setLineWidth(0.5);
    pdf.line(20, 75, pageWidth - 20, 75);

    // Metadata section
    let y = 100;
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(60, 60, 60);

    // Generated date
    pdf.setFont('helvetica', 'bold');
    pdf.text('Generated:', 30, y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(metadata.generatedDate, 80, y);

    y += 12;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Date Range:', 30, y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${metadata.dateFrom} to ${metadata.dateTo}`, 80, y);

    y += 12;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Total Records:', 30, y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(String(metadata.totalRecords), 80, y);

    // Applied Filters section
    y += 25;
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(44, 62, 80);
    pdf.setFontSize(12);
    pdf.text('Applied Filters:', 30, y);

    y += 12;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);
    pdf.text(`Year: ${metadata.filters.year}`, 40, y);

    y += 8;
    pdf.text(`Vaccines: ${metadata.filters.vaccines}`, 40, y);

    y += 8;
    pdf.text(`Seriousness: ${metadata.filters.seriousness}`, 40, y);
}

/**
 * Adds summary statistics page to PDF
 * @param {jsPDF} pdf - The PDF document instance
 */
async function addPDFSummaryStats(pdf) {
    try {
        const summaryElement = document.getElementById('summary-stats');
        if (!summaryElement) {
            console.warn('Summary stats element not found');
            return;
        }

        pdf.addPage();

        // Title
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(44, 62, 80);
        pdf.text('Data Overview', 15, 15);

        // Capture summary stats
        const canvas = await html2canvas(summaryElement, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false,
            useCORS: true,
            allowTaint: true
        });

        const imgData = canvas.toDataURL('image/png');

        // Use calculatePDFDimensions for proper aspect ratio scaling
        const summaryDims = calculatePDFDimensions(
            canvas.width,
            canvas.height,
            180,  // max width
            200,  // max height for summary
            2     // html2canvas scale
        );

        // Center the image
        const xOffset = (pdf.internal.pageSize.width - summaryDims.width) / 2;
        pdf.addImage(imgData, 'PNG', xOffset, 30, summaryDims.width, summaryDims.height);
    } catch (error) {
        console.error('Failed to capture summary stats:', error);
        // Continue gracefully without summary stats
    }
}

/**
 * Adds a category section header page to the PDF
 * @param {jsPDF} pdf - The PDF document instance
 * @param {string} categoryName - The category name to display
 */
function addCategorySectionHeader(pdf, categoryName) {
    pdf.addPage();

    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;

    // Background color
    pdf.setFillColor(245, 248, 250);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    // Title
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(44, 62, 80);
    pdf.text(categoryName, pageWidth / 2, pageHeight / 2 - 20, { align: 'center' });

    // Decorative line
    pdf.setDrawColor(100, 150, 200);
    pdf.setLineWidth(1);
    pdf.line(40, pageHeight / 2 + 10, pageWidth - 40, pageHeight / 2 + 10);
}

/**
 * Calculate PDF dimensions from canvas dimensions with proper aspect ratio preservation
 * Converts pixel dimensions to millimeters and scales to fit within maximum bounds
 * Handles both Chart.js canvases and html2canvas outputs
 * @param {number} canvasWidth - Canvas width in pixels (logical pixels for Chart.js, physical for html2canvas)
 * @param {number} canvasHeight - Canvas height in pixels
 * @param {number} maxWidth - Maximum width in mm (default 180)
 * @param {number} maxHeight - Maximum height in mm (default 240)
 * @param {number} scale - html2canvas scale factor (1 for Chart.js, 2 for html2canvas at 2x)
 * @returns {object} { width: mm, height: mm }
 */
function calculatePDFDimensions(canvasWidth, canvasHeight, maxWidth = 180, maxHeight = 240, scale = 1) {
    if (!canvasWidth || !canvasHeight || canvasWidth <= 0 || canvasHeight <= 0) {
        // Return default fallback dimensions
        return { width: maxWidth, height: maxHeight * 0.6 };
    }

    // For html2canvas (scale=2), canvas dimensions are doubled for high resolution
    // For Chart.js (scale=1), canvas dimensions are logical pixels
    const actualWidth = canvasWidth / scale;
    const actualHeight = canvasHeight / scale;

    // Convert logical pixels to mm
    // Standard: 96 DPI = 1 inch = 25.4mm, so 1px = 25.4/96 mm
    const MM_PER_PIXEL = 25.4 / 96;
    let widthMM = actualWidth * MM_PER_PIXEL;
    let heightMM = actualHeight * MM_PER_PIXEL;

    // Handle unreasonable dimensions (protect against extreme values)
    if (widthMM > 500 || heightMM > 500) {
        // Likely a vertical chart with many items - cap at reasonable max
        widthMM = Math.min(widthMM, maxWidth);
        heightMM = Math.min(heightMM, maxHeight);
    } else {
        // Scale down to fit max width while preserving aspect ratio
        if (widthMM > maxWidth) {
            const ratio = maxWidth / widthMM;
            widthMM = maxWidth;
            heightMM = heightMM * ratio;
        }

        // If still too tall, scale down to max height
        if (heightMM > maxHeight) {
            const ratio = maxHeight / heightMM;
            heightMM = maxHeight;
            widthMM = widthMM * ratio;
        }
    }

    // Ensure minimum dimensions for visibility
    if (widthMM < 50) widthMM = 50;
    if (heightMM < 30) heightMM = 30;

    return { width: widthMM, height: heightMM };
}

/**
 * Check if content fits on current page, add new page if needed
 * @param {object} pdf - jsPDF instance
 * @param {number} currentY - Current Y position in mm
 * @param {number} contentHeight - Height of content to add in mm
 * @param {number} margin - Bottom margin in mm (default 20)
 * @returns {number} New Y position after page break (if needed)
 */
function checkAndAddPageBreak(pdf, currentY, contentHeight, margin = 20) {
    const pageHeight = pdf.internal.pageSize.height;

    // If content doesn't fit on current page
    if (currentY + contentHeight > pageHeight - margin) {
        pdf.addPage();
        return 15;  // Return to top margin
    }

    return currentY;
}

/**
 * Adds a chart and its corresponding table data to the PDF on separate pages
 * @param {jsPDF} pdf - The PDF document instance
 * @param {string} containerId - The chart container ID
 * @param {string} chartTitle - The title to display for the chart
 */
async function addChartAndTablePages(pdf, containerId, chartTitle) {
    try {
        // Capture chart with dimensions
        const chartCapture = await captureChartCanvas(containerId);

        if (chartCapture && chartCapture.imgData) {
            // Calculate proper dimensions maintaining aspect ratio
            // Chart.js canvases are at device pixel ratio, so account for that
            const chartDims = calculatePDFDimensions(
                chartCapture.width,
                chartCapture.height,
                180,  // max width
                180,  // max height for charts
                chartCapture.devicePixelRatio || 1  // Pass device pixel ratio for Chart.js
            );

            // Add new page for chart
            pdf.addPage();

            // Add title
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(44, 62, 80);
            pdf.text(chartTitle, 15, 15);

            // Center the chart horizontally
            const xOffset = (pdf.internal.pageSize.width - chartDims.width) / 2;

            // Add chart image with calculated dimensions
            pdf.addImage(
                chartCapture.imgData,
                'PNG',
                xOffset,
                25,  // Start below title
                chartDims.width,
                chartDims.height
            );
        } else {
            console.warn(`Skipping chart page for ${containerId} - capture failed`);
        }

        // Capture table with dimensions
        const tableCapture = await captureTableView(containerId);

        if (tableCapture && tableCapture.imgData) {
            // Calculate proper dimensions for table
            const tableDims = calculatePDFDimensions(
                tableCapture.width,
                tableCapture.height,
                180,  // max width
                240,  // max height for tables (allow more vertical space)
                tableCapture.scale || 1
            );

            // Add new page for table
            pdf.addPage();

            // Add title
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(44, 62, 80);
            pdf.text(`${chartTitle} - Data Table`, 15, 15);

            // Center the table horizontally
            const xOffset = (pdf.internal.pageSize.width - tableDims.width) / 2;

            // Add table image with calculated dimensions
            pdf.addImage(
                tableCapture.imgData,
                'PNG',
                xOffset,
                25,  // Start below title
                tableDims.width,
                tableDims.height
            );
        } else {
            console.warn(`Skipping table page for ${containerId} - capture failed`);
        }

        // Ensure chart view is restored
        const container = document.getElementById(containerId);
        const chartContent = container?.querySelector('.chart-content');
        const tableContent = container?.querySelector('.table-content');
        if (chartContent && tableContent) {
            chartContent.classList.add('active');
            tableContent.classList.remove('active');
        }
    } catch (error) {
        console.error(`Failed to add chart and table pages for ${containerId}:`, error);
    }
}

///////////////////////////////////////////////////////////
// Export Functions
///////////////////////////////////////////////////////////

/**
 * @deprecated This function is deprecated. Use PDFExport.exportFullReport() instead.
 *
 * The new PDF export system in js/pdf/ provides:
 * - PDFExport.exportSingleChart(containerId) - Export a single chart
 * - PDFExport.exportCategory(categoryName) - Export all charts in a category
 * - PDFExport.exportFullReport() - Export complete report
 *
 * The new system offers 16:9 landscape pages with chart+table side-by-side,
 * per-chart configuration, and off-screen rendering that doesn't affect display.
 *
 * Exports entire dashboard as a comprehensive multi-page PDF report
 * Includes cover page, summary stats, and all charts with data tables
 */
async function exportToPDF() {
    console.warn('exportToPDF() is deprecated. Use PDFExport.exportFullReport() instead.');

    // Redirect to new system if available
    if (typeof PDFExport !== 'undefined') {
        return PDFExport.exportFullReport();
    }
    // Validate libraries
    if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
        showError('PDF export library not loaded');
        return;
    }

    if (typeof html2canvas === 'undefined') {
        showError('Image export library not loaded');
        return;
    }

    // Validate data
    if (!filteredData || filteredData.length === 0) {
        showError('No data to export');
        return;
    }

    try {
        showLoading('Generating PDF report... (5%)');

        // Initialize jsPDF
        const jsPDFLib = window.jspdf.jsPDF;
        const pdf = new jsPDFLib({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // 1. Generate Cover Page
        showLoading('Generating PDF report... (5%)');
        const metadata = {
            generatedDate: new Date().toLocaleString(),
            dateFrom: document.getElementById('date-from-filter')?.value || 'All',
            dateTo: document.getElementById('date-to-filter')?.value || 'All',
            totalRecords: filteredData.length,
            filters: {
                year: document.getElementById('year-filter')?.value || 'All',
                vaccines: document.getElementById('vaccine-filter-display')?.textContent || 'All',
                seriousness: document.getElementById('seriousness-filter')?.value || 'All'
            }
        };
        generatePDFCoverPage(pdf, metadata);

        // 2. Add Summary Stats Page
        showLoading('Generating PDF report... (10%)');
        await addPDFSummaryStats(pdf);

        // 3. Define Chart Sections with Metadata
        const sections = [
            {
                category: 'Demographics',
                charts: [
                    { id: 'sexChartContainer', title: 'Sex Distribution' },
                    { id: 'ageDistributionChartContainer', title: 'Age Distribution' },
                    { id: 'casesByYearChartContainer', title: 'Cases by Year' }
                ],
                progressStart: 15,
                progressEnd: 35
            },
            {
                category: 'Geographic Distribution',
                charts: [
                    { id: 'patientProvinceChartContainer', title: 'Patient Province Distribution' },
                    { id: 'healthFacilityProvinceChartContainer', title: 'Health Facility Province Distribution' },
                    { id: 'districtDistributionChartContainer', title: 'District Distribution' },
                    { id: 'reporterProvinceChartContainer', title: 'Reporter Province Distribution' }
                ],
                progressStart: 35,
                progressEnd: 55
            },
            {
                category: 'Clinical Analysis',
                charts: [
                    { id: 'adverseEventsChart', title: 'Adverse Events Distribution' },
                    { id: 'seriousnessChart', title: 'Seriousness Distribution' },
                    { id: 'seriousReasonChart', title: 'Serious Event Reasons' }
                ],
                progressStart: 55,
                progressEnd: 70
            },
            {
                category: 'Performance Indicators',
                charts: [
                    { id: 'seriousIdentificationChartContainer', title: 'Serious AEFIs - Identification to Notification' },
                    { id: 'seriousReportingChartContainer', title: 'Serious AEFIs - Notification to Reporting' },
                    { id: 'nonSeriousIdentificationChartContainer', title: 'Non-Serious AEFIs - Identification to Notification' },
                    { id: 'nonSeriousReportingChartContainer', title: 'Non-Serious AEFIs - Notification to Reporting' }
                ],
                progressStart: 70,
                progressEnd: 85
            },
            {
                category: 'Vaccine Analysis',
                charts: [
                    { id: 'vaccineDistributionChartContainer', title: 'Vaccine Distribution' },
                    { id: 'vaccineAdverseEventsChartContainer', title: 'Vaccine-Specific Adverse Events' }
                ],
                progressStart: 85,
                progressEnd: 95
            }
        ];

        // 4. Capture All Chart Sections
        for (const section of sections) {
            // Add category header page
            addCategorySectionHeader(pdf, section.category);
            showLoading(`Generating PDF report... (${section.progressStart}%)`);

            const chartCount = section.charts.length;
            for (let i = 0; i < chartCount; i++) {
                const chart = section.charts[i];

                // Add chart + table pages
                await addChartAndTablePages(pdf, chart.id, chart.title);

                // Update progress proportionally within section range
                const chartProgress = section.progressStart +
                    ((i + 1) / chartCount) * (section.progressEnd - section.progressStart);
                const progressPercent = Math.round(chartProgress);
                showLoading(`Generating PDF report... (${progressPercent}%)`);

                // Throttle to prevent UI freeze
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        // 5. Save PDF
        showLoading('Saving PDF file... (98%)');
        const filename = `AEFI_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(filename);

        hideLoading();
        showSuccess(`PDF report exported successfully: ${filename}`);
    } catch (error) {
        console.error('PDF export failed:', error);
        hideLoading();
        showError(`PDF export failed: ${error.message}`);
    }
}

function createChart(containerId, title, type, data, options = {}, containerHTML = null) {
    const container = document.getElementById(containerId);
    if (!container) {
        return;
    }

    // Clear previous content
    container.innerHTML = '';

    if (containerHTML) {
        container.innerHTML = containerHTML;
    } else {
        // Create header
        const header = document.createElement('div');
        header.className = 'chart-header';
        header.innerHTML = `<h3 class="chart-title">${title}</h3>`;
        container.appendChild(header);

        // Create content div
        const content = document.createElement('div');
        content.className = 'chart-content active';
        container.appendChild(content);

        // Create canvas
        const canvas = document.createElement('canvas');
        content.appendChild(canvas);
    }

    const canvas = container.querySelector('canvas');
    if (!canvas) {
        return;
    }

    if (activeCharts[containerId]) {
        activeCharts[containerId].destroy();
    }

    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                enabled: true,
                mode: 'index',
                intersect: false,
            }
        },
    };

    activeCharts[containerId] = new Chart(canvas, {
        type: type,
        data: data,
        options: { ...defaultOptions, ...options },
    });

    // Tab switching logic for both chart/table views
    const tabs = container.querySelectorAll('.chart-container-tab, .toggle-btn');
    if (tabs.length > 0) {
        const chartContent = container.querySelector('.chart-content');
        const tableContent = container.querySelector('.table-content');

        if (chartContent && tableContent) {
            tabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    e.preventDefault();
                    tabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    const view = tab.getAttribute('data-view');
                    chartContent.classList.toggle('active', view === 'chart');
                    tableContent.classList.toggle('active', view === 'table');
                });
            });
        }
    }
}

function createBarChart(containerId, title, chartData, chartOptions, tableData, tableHeaders, scrollable = false, barHeight = 30) {
    const total = tableData.reduce((sum, row) => sum + row[1], 0);

    const chartContentHTML = scrollable
        ? `<div class="chart-scroll-container"><div class="chart-canvas-wrapper"><canvas></canvas></div></div>`
        : `<canvas></canvas>`;

    const containerHTML = `
        <div class="chart-header">
            <h3 class="chart-title">${title}</h3>
            <div class="chart-container-tabs">
                <button class="chart-container-tab active" data-view="chart">Chart</button>
                <button class="chart-container-tab" data-view="table">Table</button>
            </div>
        </div>
        <div class="chart-content active">
            ${chartContentHTML}
        </div>
        <div class="table-content">
            <table>
                <thead>
                    <tr>
                        ${tableHeaders.map(header => `<th>${header}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
        </div>
    `;

    const container = document.getElementById(containerId);
    container.innerHTML = containerHTML;

    // **XSS Fix: Safely create and append table rows**
    const tableBody = container.querySelector('tbody');
    if (tableBody) {
        tableData.forEach(row => {
            const tr = document.createElement('tr');

            const cell1 = document.createElement('td');
            cell1.textContent = row[0];
            tr.appendChild(cell1);

            const cell2 = document.createElement('td');
            cell2.textContent = row[1];
            tr.appendChild(cell2);

            const percentage = total > 0 ? ((row[1] / total) * 100).toFixed(2) : 0;
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
        totalCell2.textContent = total;
        totalRow.appendChild(totalCell2);

        const totalCell3 = document.createElement('td');
        totalCell3.textContent = '100.00%';
        totalRow.appendChild(totalCell3);

        tableBody.appendChild(totalRow);
    }

    const canvas = container.querySelector('canvas');
    if (scrollable) {
        const canvasWrapper = container.querySelector('.chart-canvas-wrapper');
        if (canvasWrapper) {
            // Use the custom barHeight parameter (default 30px if not specified)
            const chartHeight = chartData.labels.length * barHeight;
            canvasWrapper.style.height = `${chartHeight}px`;
        }
    }

    const chart = new Chart(canvas, {
        type: 'bar',
        data: chartData,
        options: chartOptions
    });

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

    return chart;
}
