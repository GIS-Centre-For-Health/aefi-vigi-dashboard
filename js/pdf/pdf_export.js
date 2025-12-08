/**
 * PDF Export API Module
 *
 * Main interface for exporting charts to PDF.
 * Provides functions for single chart, category, and full report exports.
 */

/**
 * PDF Export API
 * Main interface for exporting charts to PDF
 */
const PDFExport = {
    /**
     * Export a single chart to PDF
     *
     * @param {string} containerId - Chart container ID
     * @param {Object} options - Export options
     * @param {boolean} [options.save=true] - Whether to save the PDF immediately
     * @param {string} [options.filename] - Custom filename (auto-generated if not provided)
     * @param {boolean} [options.includeTable=true] - Include table data
     * @param {boolean} [options.includeCover=true] - Include cover page
     * @param {Object} [options.customConfig] - Override chart configuration
     * @returns {Promise<jsPDF>} PDF document (saved if options.save is true)
     */
    async exportSingleChart(containerId, options = {}) {
        const {
            save = true,
            filename = null,
            includeTable = true,
            includeCover = true,
            customConfig = {}
        } = options;

        try {
            this._validateLibraries();
            this._validateData();

            showLoading('Preparing chart for PDF export...');

            const pdf = PDFLayout.createDocument();
            const config = this._mergeConfig(getPDFChartConfig(containerId), customConfig);

            // Add cover page if requested
            if (includeCover) {
                PDFLayout.addCoverPage(pdf, this._getMetadata());
            }

            showLoading('Rendering chart for PDF...');

            // Render chart for PDF
            const chartResult = await PDFRenderer.renderChartForPDF(containerId, config);

            // Render table if needed
            let tableResult = null;
            if (includeTable && config.pdfLayout === 'sideBySide') {
                showLoading('Rendering table data...');
                const tableData = PDFTableRenderer.extractTableData(containerId);

                if (tableData && tableData.length > 0) {
                    const tableWidthPx = this._calculateTableWidthPx(config);
                    const tableHeightPx = this._calculateTableHeightPx(config);

                    tableResult = await PDFTableRenderer.renderTableForPDF(
                        tableData,
                        config.tableConfig,
                        tableWidthPx,
                        tableHeightPx
                    );
                }
            }

            // Add content to PDF based on layout type
            showLoading('Composing PDF page...');

            if (config.pdfLayout === 'sideBySide') {
                PDFLayout.addSideBySidePage(pdf, chartResult, tableResult, config.title, config);
            } else if (config.pdfLayout === 'chartOnly') {
                PDFLayout.addChartOnlyPage(pdf, chartResult, config.title);
            } else if (config.pdfLayout === 'tableOnly' && tableResult) {
                PDFLayout.addTableOnlyPage(pdf, tableResult, config.title);
            } else {
                // Default to side-by-side
                PDFLayout.addSideBySidePage(pdf, chartResult, tableResult, config.title, config);
            }

            // Handle table overflow (pagination)
            if (tableResult && tableResult.overflow) {
                await this._addOverflowPages(pdf, tableResult.overflow, config);
            }

            // Cleanup renderer
            PDFRenderer.cleanup();
            hideLoading();

            if (save) {
                const fname = filename || this._generateFilename(config.title);
                pdf.save(fname);
                showSuccess(`Chart exported: ${fname}`);
            }

            return pdf;

        } catch (error) {
            console.error('Single chart export failed:', error);
            PDFRenderer.cleanup();
            hideLoading();
            showError(`Export failed: ${error.message}`);
            throw error;
        }
    },

    /**
     * Export all charts in a category
     *
     * @param {string} categoryName - Category key (demographics, geographic, clinical, temporal, vaccine)
     * @param {Object} options - Export options
     * @param {boolean} [options.save=true] - Whether to save the PDF immediately
     * @param {string} [options.filename] - Custom filename
     * @param {boolean} [options.includeCover=true] - Include cover page
     * @param {boolean} [options.includeCategoryHeader=true] - Include category header page
     * @returns {Promise<jsPDF>} PDF document
     */
    async exportCategory(categoryName, options = {}) {
        const {
            save = true,
            filename = null,
            includeCover = true,
            includeCategoryHeader = true
        } = options;

        try {
            this._validateLibraries();
            this._validateData();

            // Get charts for this category from the registry
            if (typeof chartRegistry === 'undefined') {
                throw new Error('Chart registry not found');
            }

            const categoryCharts = chartRegistry[categoryName];
            if (!categoryCharts || categoryCharts.length === 0) {
                throw new Error(`No charts found for category: ${categoryName}`);
            }

            const categoryConfig = getPDFCategoryConfig(categoryName);
            showLoading(`Exporting ${categoryConfig.displayName}...`);

            const pdf = PDFLayout.createDocument();

            // Add cover page
            if (includeCover) {
                PDFLayout.addCoverPage(pdf, this._getMetadata());
            }

            // Add category header
            if (includeCategoryHeader) {
                PDFLayout.addCategoryHeader(pdf, categoryName);
            }

            // Export each chart in the category
            const totalCharts = categoryCharts.length;
            for (let i = 0; i < totalCharts; i++) {
                const chartInfo = categoryCharts[i];
                const config = getPDFChartConfig(chartInfo.container);

                const progress = Math.round(((i + 1) / totalCharts) * 100);
                showLoading(`Exporting ${categoryConfig.displayName}: ${config.title} (${progress}%)`);

                // Render chart
                const chartResult = await PDFRenderer.renderChartForPDF(chartInfo.container, config);

                // Render table
                let tableResult = null;
                if (config.pdfLayout === 'sideBySide') {
                    const tableData = PDFTableRenderer.extractTableData(chartInfo.container);
                    if (tableData && tableData.length > 0) {
                        tableResult = await PDFTableRenderer.renderTableForPDF(
                            tableData,
                            config.tableConfig,
                            this._calculateTableWidthPx(config),
                            this._calculateTableHeightPx(config)
                        );
                    }
                }

                // Add page
                PDFLayout.addSideBySidePage(pdf, chartResult, tableResult, config.title, config);

                // Handle overflow
                if (tableResult && tableResult.overflow) {
                    await this._addOverflowPages(pdf, tableResult.overflow, config);
                }

                // Throttle to prevent UI freeze
                await this._throttle(50);
            }

            PDFRenderer.cleanup();
            hideLoading();

            if (save) {
                const fname = filename || this._generateFilename(categoryConfig.displayName);
                pdf.save(fname);
                showSuccess(`Category exported: ${fname}`);
            }

            return pdf;

        } catch (error) {
            console.error('Category export failed:', error);
            PDFRenderer.cleanup();
            hideLoading();
            showError(`Export failed: ${error.message}`);
            throw error;
        }
    },

    /**
     * Export full report with all categories
     *
     * @param {Object} options - Export options
     * @param {boolean} [options.save=true] - Whether to save the PDF immediately
     * @param {string} [options.filename] - Custom filename
     * @param {string[]} [options.categories] - Specific categories to include (all if not specified)
     * @param {boolean} [options.includeCover=true] - Include cover page
     * @param {boolean} [options.includeSummary=true] - Include summary statistics page
     * @param {boolean} [options.includeCategoryHeaders=true] - Include category header pages
     * @returns {Promise<jsPDF>} PDF document
     */
    async exportFullReport(options = {}) {
        const {
            save = true,
            filename = null,
            categories = null,
            includeCover = true,
            includeSummary = true,
            includeCategoryHeaders = true
        } = options;

        try {
            this._validateLibraries();
            this._validateData();

            showLoading('Generating PDF report... (0%)');

            const pdf = PDFLayout.createDocument();

            // Add cover page
            if (includeCover) {
                showLoading('Generating PDF report... (2%) - Cover page');
                PDFLayout.addCoverPage(pdf, this._getMetadata());
            }

            // Add summary page
            if (includeSummary) {
                showLoading('Generating PDF report... (5%) - Summary');
                await PDFLayout.addSummaryPage(pdf);
            }

            // Determine which categories to export
            const categoriesToExport = categories || Object.keys(chartRegistry);

            // Calculate total charts for progress tracking
            let totalCharts = 0;
            categoriesToExport.forEach(cat => {
                if (chartRegistry[cat]) {
                    totalCharts += chartRegistry[cat].length;
                }
            });

            let currentChart = 0;
            const progressBase = 10; // Start progress after cover and summary
            const progressRange = 88; // 10% to 98%

            // Export each category
            for (const categoryName of categoriesToExport) {
                const categoryCharts = chartRegistry[categoryName];
                if (!categoryCharts || categoryCharts.length === 0) {
                    continue;
                }

                const categoryConfig = getPDFCategoryConfig(categoryName);

                // Add category header page
                if (includeCategoryHeaders) {
                    PDFLayout.addCategoryHeader(pdf, categoryName);
                }

                // Export each chart in the category
                for (const chartInfo of categoryCharts) {
                    currentChart++;
                    const progress = progressBase + Math.round((currentChart / totalCharts) * progressRange);

                    const config = getPDFChartConfig(chartInfo.container);
                    showLoading(`Generating PDF report... (${progress}%) - ${config.title}`);

                    // Render chart
                    const chartResult = await PDFRenderer.renderChartForPDF(chartInfo.container, config);

                    // Render table
                    let tableResult = null;
                    if (config.pdfLayout === 'sideBySide') {
                        const tableData = PDFTableRenderer.extractTableData(chartInfo.container);
                        if (tableData && tableData.length > 0) {
                            tableResult = await PDFTableRenderer.renderTableForPDF(
                                tableData,
                                config.tableConfig,
                                this._calculateTableWidthPx(config),
                                this._calculateTableHeightPx(config)
                            );
                        }
                    }

                    // Add page
                    PDFLayout.addSideBySidePage(pdf, chartResult, tableResult, config.title, config);

                    // Handle table overflow
                    if (tableResult && tableResult.overflow) {
                        await this._addOverflowPages(pdf, tableResult.overflow, config);
                    }

                    // Throttle
                    await this._throttle(30);
                }
            }

            PDFRenderer.cleanup();
            showLoading('Saving PDF file... (99%)');

            hideLoading();

            if (save) {
                const fname = filename || `AEFI_Full_Report_${this._getDateString()}.pdf`;
                pdf.save(fname);
                showSuccess(`Report exported: ${fname}`);
            }

            return pdf;

        } catch (error) {
            console.error('Full report export failed:', error);
            PDFRenderer.cleanup();
            hideLoading();
            showError(`Export failed: ${error.message}`);
            throw error;
        }
    },

    /**
     * Get a preview of the PDF without saving
     * Returns the PDF as a blob URL for preview
     *
     * @param {string} containerId - Chart container ID (optional, exports full report if not provided)
     * @returns {Promise<string>} Blob URL for the PDF
     */
    async getPreviewURL(containerId = null) {
        let pdf;

        if (containerId) {
            pdf = await this.exportSingleChart(containerId, { save: false });
        } else {
            pdf = await this.exportFullReport({ save: false });
        }

        const blob = pdf.output('blob');
        return URL.createObjectURL(blob);
    },

    /**
     * Validate that required libraries are loaded
     * @private
     */
    _validateLibraries() {
        if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
            throw new Error('PDF export library (jsPDF) not loaded');
        }

        if (typeof html2canvas === 'undefined') {
            throw new Error('Image capture library (html2canvas) not loaded');
        }

        if (typeof Chart === 'undefined') {
            throw new Error('Chart.js library not loaded');
        }
    },

    /**
     * Validate that data is available for export
     * @private
     */
    _validateData() {
        if (typeof filteredData === 'undefined' || !filteredData || filteredData.length === 0) {
            throw new Error('No data available for export. Please upload a data file first.');
        }
    },

    /**
     * Get current report metadata
     * @private
     * @returns {Object} Metadata object
     */
    _getMetadata() {
        return {
            generatedDate: new Date().toLocaleString(),
            dateFrom: document.getElementById('date-from-filter')?.value || 'All',
            dateTo: document.getElementById('date-to-filter')?.value || 'All',
            totalRecords: typeof filteredData !== 'undefined' ? filteredData.length : 0,
            filters: {
                year: document.getElementById('year-filter')?.value || 'All',
                vaccines: document.getElementById('vaccine-filter-display')?.textContent || 'All',
                seriousness: document.getElementById('seriousness-filter')?.value || 'All'
            }
        };
    },

    /**
     * Generate filename for export
     * @private
     * @param {string} title - Base title for the file
     * @returns {string} Generated filename
     */
    _generateFilename(title) {
        const sanitized = title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
        return `AEFI_${sanitized}_${this._getDateString()}.pdf`;
    },

    /**
     * Get date string for filename
     * @private
     * @returns {string} Date in YYYY-MM-DD format
     */
    _getDateString() {
        return new Date().toISOString().split('T')[0];
    },

    /**
     * Calculate table width in pixels based on config
     * @private
     * @param {Object} config - Chart configuration
     * @returns {number} Width in pixels
     */
    _calculateTableWidthPx(config) {
        const dims = config.dimensions || PDF_GLOBAL_CONFIG.sideBySide;
        const mmToPixel = 96 / 25.4;
        const scale = PDF_GLOBAL_CONFIG.imageQuality.tableScale;
        return Math.floor(PDF_GLOBAL_CONFIG.contentArea.width * dims.tableWidthRatio * mmToPixel * scale);
    },

    /**
     * Calculate table height in pixels based on config
     * @private
     * @param {Object} config - Chart configuration
     * @returns {number} Height in pixels
     */
    _calculateTableHeightPx(config) {
        const dims = config.dimensions || PDF_GLOBAL_CONFIG.sideBySide;
        const mmToPixel = 96 / 25.4;
        const scale = PDF_GLOBAL_CONFIG.imageQuality.tableScale;
        return Math.floor((PDF_GLOBAL_CONFIG.contentArea.height - dims.titleHeight) * mmToPixel * scale);
    },

    /**
     * Merge chart config with custom overrides
     * @private
     * @param {Object} baseConfig - Base configuration
     * @param {Object} customConfig - Custom overrides
     * @returns {Object} Merged configuration
     */
    _mergeConfig(baseConfig, customConfig) {
        return {
            ...baseConfig,
            ...customConfig,
            chartOptions: {
                ...(baseConfig.chartOptions || {}),
                ...(customConfig.chartOptions || {})
            },
            tableConfig: {
                ...(baseConfig.tableConfig || {}),
                ...(customConfig.tableConfig || {})
            },
            dimensions: {
                ...(baseConfig.dimensions || {}),
                ...(customConfig.dimensions || {})
            }
        };
    },

    /**
     * Add overflow pages for long tables
     * @private
     * @param {jsPDF} pdf - PDF document
     * @param {Array} overflowData - Remaining table data
     * @param {Object} config - Chart configuration
     */
    async _addOverflowPages(pdf, overflowData, config) {
        let remainingData = overflowData;
        let pageNum = 2;

        while (remainingData && remainingData.length > 0) {
            const tableResult = await PDFTableRenderer.renderTableForPDF(
                remainingData,
                config.tableConfig,
                this._calculateTableWidthPx(config),
                this._calculateTableHeightPx(config)
            );

            if (tableResult && tableResult.tableImage) {
                PDFLayout.addTableOnlyPage(pdf, tableResult, `${config.title} - Data Table`, pageNum);
            }

            remainingData = tableResult ? tableResult.overflow : null;
            pageNum++;

            // Safety check to prevent infinite loops
            if (pageNum > 50) {
                console.warn('Table pagination exceeded 50 pages, truncating');
                break;
            }

            await this._throttle(30);
        }
    },

    /**
     * Throttle execution to prevent UI freeze
     * @private
     * @param {number} ms - Milliseconds to wait
     * @returns {Promise<void>}
     */
    _throttle(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// Make PDFExport globally available
window.PDFExport = PDFExport;
