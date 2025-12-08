/**
 * PDF Renderer Module
 *
 * Handles off-screen rendering of charts and tables for PDF export.
 * Creates visualizations in a hidden container without affecting on-screen display.
 */

/**
 * PDF Off-Screen Chart Renderer
 * Creates Chart.js instances in a hidden container for PDF export
 */
const PDFRenderer = {
    /**
     * Hidden container for off-screen rendering
     * Created once, reused for all renders
     * @private
     */
    _container: null,

    /**
     * Initialize or get the hidden rendering container
     * @returns {HTMLElement} Hidden container element
     */
    getContainer() {
        if (!this._container) {
            this._container = document.createElement('div');
            this._container.id = 'pdf-render-container';
            this._container.style.cssText = `
                position: fixed;
                left: -10000px;
                top: -10000px;
                width: 1920px;
                height: 1080px;
                background: white;
                visibility: hidden;
                pointer-events: none;
                z-index: -9999;
            `;
            document.body.appendChild(this._container);
        }
        return this._container;
    },

    /**
     * Render a chart for PDF export (off-screen)
     * Extracts data from existing chart and renders with PDF-specific options
     *
     * @param {string} containerId - Original chart container ID
     * @param {Object} pdfConfig - PDF-specific configuration from getPDFChartConfig()
     * @returns {Promise<{chartImage: string, width: number, height: number}|null>}
     */
    async renderChartForPDF(containerId, pdfConfig = {}) {
        try {
            const container = this.getContainer();
            const config = pdfConfig.title ? pdfConfig : getPDFChartConfig(containerId);

            // Calculate canvas dimensions for PDF quality
            // Base on content area and chart width ratio
            const mmToPixel = 96 / 25.4; // 96 DPI
            const scale = PDF_GLOBAL_CONFIG.imageQuality.chartScale;

            const chartWidthMM = PDF_GLOBAL_CONFIG.contentArea.width * config.dimensions.chartWidthRatio;
            const chartHeightMM = PDF_GLOBAL_CONFIG.contentArea.height - config.dimensions.titleHeight;

            const canvasWidth = Math.floor(chartWidthMM * mmToPixel * scale);
            const canvasHeight = Math.floor(chartHeightMM * mmToPixel * scale);

            // Create chart wrapper with proper dimensions
            const chartWrapper = document.createElement('div');
            chartWrapper.style.cssText = `
                width: ${canvasWidth}px;
                height: ${canvasHeight}px;
                background: white;
                padding: 20px;
                box-sizing: border-box;
            `;

            // Create canvas
            const canvas = document.createElement('canvas');
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            canvas.style.cssText = `
                width: 100%;
                height: 100%;
            `;

            chartWrapper.appendChild(canvas);
            container.innerHTML = '';
            container.appendChild(chartWrapper);

            // Extract chart data from existing active chart
            const chartData = this._extractChartData(containerId);
            if (!chartData || !chartData.labels || chartData.labels.length === 0) {
                console.warn(`No chart data found for ${containerId}`);
                return null;
            }

            // Create PDF-optimized Chart.js options
            const pdfOptions = this._createPDFChartOptions(config, chartData);

            // Create the chart
            const chart = new Chart(canvas.getContext('2d'), {
                type: config.chartType || 'bar',
                data: chartData,
                options: pdfOptions
            });

            // Wait for rendering to complete
            await new Promise(resolve => setTimeout(resolve, 150));

            // Capture as base64
            const chartImage = chart.toBase64Image('image/png');

            // Cleanup
            chart.destroy();

            return {
                chartImage,
                width: canvasWidth / scale,
                height: canvasHeight / scale
            };

        } catch (error) {
            console.error(`Failed to render chart for PDF: ${containerId}`, error);
            return null;
        }
    },

    /**
     * Extract chart data from an existing active chart
     * Deep clones data to avoid modifying the original
     *
     * @private
     * @param {string} containerId - Chart container ID
     * @returns {Object|null} Chart.js data object or null
     */
    _extractChartData(containerId) {
        // Try to get data from active charts first
        if (typeof activeCharts !== 'undefined' && activeCharts[containerId]) {
            const chart = activeCharts[containerId];
            if (chart && chart.data) {
                // Deep clone to avoid mutation
                return JSON.parse(JSON.stringify(chart.data));
            }
        }

        // Fallback: try to extract from DOM table
        return this._extractDataFromTable(containerId);
    },

    /**
     * Extract data from the table view of a chart container
     * Fallback method when chart data isn't available
     *
     * @private
     * @param {string} containerId - Chart container ID
     * @returns {Object|null} Chart.js compatible data object
     */
    _extractDataFromTable(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const tableRows = container.querySelectorAll('.table-content tbody tr');
        if (!tableRows || tableRows.length === 0) return null;

        const labels = [];
        const data = [];

        tableRows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 2) {
                labels.push(cells[0].textContent.trim());
                // Parse number, removing commas and percentage signs
                const value = parseFloat(cells[1].textContent.replace(/[,%]/g, '')) || 0;
                data.push(value);
            }
        });

        if (labels.length === 0) return null;

        // Generate colors based on data length
        const colors = this._generateColors(labels.length);

        return {
            labels,
            datasets: [{
                label: 'Count',
                data,
                backgroundColor: colors,
                borderColor: colors.map(c => c),
                borderWidth: 1
            }]
        };
    },

    /**
     * Generate chart colors for PDF
     * Uses the primary color palette
     *
     * @private
     * @param {number} count - Number of colors needed
     * @returns {string[]} Array of color strings
     */
    _generateColors(count) {
        const baseColors = [
            'rgba(44, 74, 124, 0.8)',
            'rgba(76, 141, 95, 0.8)',
            'rgba(156, 89, 89, 0.8)',
            'rgba(128, 100, 162, 0.8)',
            'rgba(74, 144, 226, 0.8)',
            'rgba(255, 159, 64, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)'
        ];

        const colors = [];
        for (let i = 0; i < count; i++) {
            colors.push(baseColors[i % baseColors.length]);
        }
        return colors;
    },

    /**
     * Create PDF-optimized Chart.js options
     * Merges global PDF settings with chart-specific options
     *
     * @private
     * @param {Object} config - Chart configuration
     * @param {Object} chartData - Chart data
     * @returns {Object} Chart.js options object
     */
    _createPDFChartOptions(config, chartData) {
        const isPieChart = config.chartType === 'pie' || config.chartType === 'doughnut';

        // Base options for PDF rendering
        const baseOptions = {
            responsive: false,
            maintainAspectRatio: false,
            animation: false,
            devicePixelRatio: PDF_GLOBAL_CONFIG.imageQuality.chartScale,
            layout: {
                padding: {
                    top: 10,
                    right: 20,
                    bottom: 10,
                    left: 10
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: isPieChart ? 'right' : 'top',
                    labels: {
                        font: { size: 11, family: 'Helvetica' },
                        padding: 12,
                        usePointStyle: true
                    }
                },
                title: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            }
        };

        // Add scales for bar/line charts
        if (!isPieChart) {
            baseOptions.scales = {
                x: {
                    ticks: {
                        font: { size: 10, family: 'Helvetica' },
                        maxRotation: 45,
                        minRotation: 0
                    },
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                y: {
                    ticks: {
                        font: { size: 10, family: 'Helvetica' },
                        beginAtZero: true
                    },
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            };
        }

        // Deep merge with chart-specific options
        return this._deepMerge(baseOptions, config.chartOptions || {});
    },

    /**
     * Deep merge utility for nested objects
     *
     * @private
     * @param {Object} target - Target object
     * @param {Object} source - Source object to merge
     * @returns {Object} Merged object
     */
    _deepMerge(target, source) {
        const result = { ...target };
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this._deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        return result;
    },

    /**
     * Cleanup the hidden container
     * Call after export is complete to free memory
     */
    cleanup() {
        if (this._container) {
            this._container.innerHTML = '';
        }
    },

    /**
     * Destroy the renderer completely
     * Removes the hidden container from DOM
     */
    destroy() {
        if (this._container && this._container.parentNode) {
            this._container.parentNode.removeChild(this._container);
            this._container = null;
        }
    }
};


/**
 * PDF Table Renderer
 * Renders data tables as images for PDF export
 */
const PDFTableRenderer = {
    /**
     * Render table data to a PNG image for PDF inclusion
     *
     * @param {Array} tableData - Array of row data [[col1, col2, ...], ...]
     * @param {Object} tableConfig - Table configuration from chart config
     * @param {number} maxWidthPx - Maximum width in pixels
     * @param {number} maxHeightPx - Maximum height in pixels
     * @returns {Promise<{tableImage: string, width: number, height: number, overflow: Array|null}>}
     */
    async renderTableForPDF(tableData, tableConfig, maxWidthPx, maxHeightPx) {
        try {
            if (!tableData || tableData.length === 0) {
                return null;
            }

            const container = PDFRenderer.getContainer();
            const scale = PDF_GLOBAL_CONFIG.imageQuality.tableScale;

            // Check if we need to paginate
            const maxRows = tableConfig.maxRows || PDF_GLOBAL_CONFIG.table.defaultMaxRows;
            const hasOverflow = tableData.length > maxRows;
            const visibleData = hasOverflow ? tableData.slice(0, maxRows) : tableData;
            const overflowData = hasOverflow ? tableData.slice(maxRows) : null;

            // Create table HTML with styling
            const tableHTML = this._createStyledTableHTML(visibleData, tableConfig, maxWidthPx);

            // Create wrapper element
            const tableWrapper = document.createElement('div');
            tableWrapper.style.cssText = `
                width: ${maxWidthPx}px;
                max-height: ${maxHeightPx}px;
                background: white;
                overflow: hidden;
                font-family: 'Segoe UI', Arial, sans-serif;
            `;
            tableWrapper.innerHTML = tableHTML;

            container.innerHTML = '';
            container.appendChild(tableWrapper);

            // Wait for DOM to settle
            await new Promise(resolve => setTimeout(resolve, 100));

            // Capture with html2canvas
            const canvas = await html2canvas(tableWrapper, {
                scale: scale,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true,
                allowTaint: true,
                windowWidth: maxWidthPx,
                windowHeight: maxHeightPx
            });

            const tableImage = canvas.toDataURL('image/png');

            return {
                tableImage,
                width: canvas.width / scale,
                height: canvas.height / scale,
                overflow: overflowData
            };

        } catch (error) {
            console.error('Failed to render table for PDF:', error);
            return null;
        }
    },

    /**
     * Extract table data from a chart container's table view
     *
     * @param {string} containerId - Chart container ID
     * @returns {Array} Array of row data
     */
    extractTableData(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return [];

        const tableRows = container.querySelectorAll('.table-content tbody tr');
        const tableData = [];

        tableRows.forEach(row => {
            // Skip total rows
            if (row.classList.contains('total-row')) return;

            const cells = row.querySelectorAll('td');
            const rowData = Array.from(cells).map(cell => cell.textContent.trim());
            if (rowData.length > 0 && rowData.some(cell => cell !== '')) {
                tableData.push(rowData);
            }
        });

        return tableData;
    },

    /**
     * Create styled HTML table for PDF rendering
     *
     * @private
     * @param {Array} data - Table data rows
     * @param {Object} config - Table configuration
     * @param {number} maxWidth - Maximum width in pixels
     * @returns {string} HTML string for the table
     */
    _createStyledTableHTML(data, config, maxWidth) {
        const headers = config.headers || ['Label', 'Count', 'Percentage'];
        const columnWidths = config.columnWidths || headers.map(() => 1 / headers.length);
        const colors = PDF_GLOBAL_CONFIG.colors;

        // Convert RGB arrays to CSS colors
        const headerBgColor = `rgb(${colors.tableHeaderBg.join(',')})`;
        const borderColor = `rgb(${colors.tableBorder.join(',')})`;
        const textColor = `rgb(${colors.text.join(',')})`;

        let html = `
            <table style="
                width: 100%;
                border-collapse: collapse;
                font-family: 'Segoe UI', Arial, sans-serif;
                font-size: 11px;
                color: ${textColor};
            ">
                <thead>
                    <tr style="background-color: ${headerBgColor};">
        `;

        // Header row
        headers.forEach((header, i) => {
            const width = Math.floor(columnWidths[i] * 100);
            const align = i === 0 ? 'left' : 'right';
            html += `
                <th style="
                    padding: 10px 12px;
                    text-align: ${align};
                    font-weight: 600;
                    border-bottom: 2px solid ${borderColor};
                    white-space: nowrap;
                    width: ${width}%;
                ">${this._escapeHTML(header)}</th>
            `;
        });

        html += '</tr></thead><tbody>';

        // Calculate total for percentage
        const total = data.reduce((sum, row) => {
            const countVal = row[1];
            const numVal = typeof countVal === 'number' ? countVal : parseFloat(String(countVal).replace(/[,%]/g, '')) || 0;
            return sum + numVal;
        }, 0);

        // Data rows
        data.forEach((row, rowIndex) => {
            const bgColor = rowIndex % 2 === 0 ? '#FFFFFF' : '#F8F9FA';
            html += `<tr style="background-color: ${bgColor};">`;

            row.forEach((cell, colIndex) => {
                let displayValue = cell;
                const align = colIndex === 0 ? 'left' : 'right';

                // Format percentage column if needed
                if (colIndex === 2 && headers[2]?.toLowerCase().includes('percentage')) {
                    // If it's already a percentage string, use it; otherwise calculate
                    if (typeof cell === 'number') {
                        displayValue = cell.toFixed(1) + '%';
                    } else if (!String(cell).includes('%')) {
                        const count = parseFloat(String(row[1]).replace(/[,%]/g, '')) || 0;
                        displayValue = total > 0 ? ((count / total) * 100).toFixed(1) + '%' : '0.0%';
                    }
                }

                // Format numbers with commas
                if (colIndex === 1 && typeof displayValue === 'number') {
                    displayValue = displayValue.toLocaleString();
                }

                html += `
                    <td style="
                        padding: 8px 12px;
                        border-bottom: 1px solid ${borderColor};
                        text-align: ${align};
                        ${colIndex === 0 ? 'max-width: 200px; overflow: hidden; text-overflow: ellipsis;' : ''}
                    ">${this._escapeHTML(String(displayValue))}</td>
                `;
            });

            html += '</tr>';
        });

        // Total row if configured
        if (config.showTotal && data.length > 0) {
            html += `
                <tr style="background-color: ${headerBgColor}; font-weight: 600;">
                    <td style="padding: 10px 12px; border-top: 2px solid ${borderColor};">Total</td>
                    <td style="padding: 10px 12px; border-top: 2px solid ${borderColor}; text-align: right;">${total.toLocaleString()}</td>
                    <td style="padding: 10px 12px; border-top: 2px solid ${borderColor}; text-align: right;">100.0%</td>
                </tr>
            `;
        }

        html += '</tbody></table>';

        return html;
    },

    /**
     * Escape HTML special characters for XSS protection
     *
     * @private
     * @param {string} str - String to escape
     * @returns {string} Escaped string
     */
    _escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};
