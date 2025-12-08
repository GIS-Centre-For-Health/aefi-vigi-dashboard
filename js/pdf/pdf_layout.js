/**
 * PDF Layout Engine Module
 *
 * Handles page composition and layout for 16:9 landscape PDF export.
 * Manages side-by-side chart and table placement, category headers, and cover pages.
 */

/**
 * PDF Layout Engine
 * Creates and manages PDF document structure
 */
const PDFLayout = {
    /**
     * Create a new PDF document with 16:9 landscape format
     *
     * @returns {jsPDF} Configured PDF instance
     */
    createDocument() {
        if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
            throw new Error('jsPDF library not loaded');
        }

        const jsPDFLib = window.jspdf.jsPDF;
        const pageConfig = PDF_GLOBAL_CONFIG.page;

        return new jsPDFLib({
            orientation: pageConfig.orientation,
            unit: pageConfig.unit,
            format: pageConfig.format
        });
    },

    /**
     * Add a side-by-side page with chart on left and table on right
     *
     * @param {jsPDF} pdf - PDF document instance
     * @param {Object} chartResult - Result from PDFRenderer.renderChartForPDF()
     * @param {Object} tableResult - Result from PDFTableRenderer.renderTableForPDF()
     * @param {string} title - Page title
     * @param {Object} config - Chart configuration from getPDFChartConfig()
     */
    addSideBySidePage(pdf, chartResult, tableResult, title, config) {
        pdf.addPage();

        const { margins, contentArea } = PDF_GLOBAL_CONFIG;
        const { fonts, colors } = PDF_GLOBAL_CONFIG;
        const dims = config.dimensions || PDF_GLOBAL_CONFIG.sideBySide;

        const pageWidth = pdf.internal.pageSize.width;

        // Add title
        pdf.setFont(fonts.title.family, fonts.title.style);
        pdf.setFontSize(fonts.title.size);
        pdf.setTextColor(...colors.text);
        pdf.text(title, margins.left, margins.top + 8);

        // Calculate layout positions
        const contentStartY = margins.top + dims.titleHeight;
        const chartWidth = contentArea.width * dims.chartWidthRatio;
        const tableWidth = contentArea.width * dims.tableWidthRatio;
        const tableStartX = margins.left + chartWidth + dims.gapWidth;
        const contentHeight = contentArea.height - dims.titleHeight;

        // Add chart image (left side)
        if (chartResult && chartResult.chartImage) {
            const chartDims = this._calculateFitDimensions(
                chartResult.width,
                chartResult.height,
                chartWidth - 5,
                contentHeight
            );

            // Center chart vertically within its space
            const chartY = contentStartY + (contentHeight - chartDims.height) / 2;

            pdf.addImage(
                chartResult.chartImage,
                'PNG',
                margins.left,
                chartY,
                chartDims.width,
                chartDims.height
            );
        }

        // Add table image (right side)
        if (tableResult && tableResult.tableImage) {
            const tableDims = this._calculateFitDimensions(
                tableResult.width,
                tableResult.height,
                tableWidth,
                contentHeight
            );

            // Align table to top of content area
            pdf.addImage(
                tableResult.tableImage,
                'PNG',
                tableStartX,
                contentStartY,
                tableDims.width,
                tableDims.height
            );
        }

        // Add page footer
        this._addPageFooter(pdf);
    },

    /**
     * Add a chart-only page (full width chart)
     *
     * @param {jsPDF} pdf - PDF document instance
     * @param {Object} chartResult - Result from PDFRenderer.renderChartForPDF()
     * @param {string} title - Page title
     */
    addChartOnlyPage(pdf, chartResult, title) {
        pdf.addPage();

        const { margins, contentArea, fonts, colors } = PDF_GLOBAL_CONFIG;

        // Add title
        pdf.setFont(fonts.title.family, fonts.title.style);
        pdf.setFontSize(fonts.title.size);
        pdf.setTextColor(...colors.text);
        pdf.text(title, margins.left, margins.top + 8);

        if (chartResult && chartResult.chartImage) {
            const contentStartY = margins.top + 15;
            const contentHeight = contentArea.height - 15;

            const chartDims = this._calculateFitDimensions(
                chartResult.width,
                chartResult.height,
                contentArea.width,
                contentHeight
            );

            // Center chart horizontally
            const chartX = margins.left + (contentArea.width - chartDims.width) / 2;
            const chartY = contentStartY + (contentHeight - chartDims.height) / 2;

            pdf.addImage(
                chartResult.chartImage,
                'PNG',
                chartX,
                chartY,
                chartDims.width,
                chartDims.height
            );
        }

        this._addPageFooter(pdf);
    },

    /**
     * Add a table-only page (full width table)
     *
     * @param {jsPDF} pdf - PDF document instance
     * @param {Object} tableResult - Result from PDFTableRenderer.renderTableForPDF()
     * @param {string} title - Page title
     * @param {number} pageNum - Optional page number suffix for continued tables
     */
    addTableOnlyPage(pdf, tableResult, title, pageNum = null) {
        pdf.addPage();

        const { margins, contentArea, fonts, colors } = PDF_GLOBAL_CONFIG;

        // Add title with optional continuation note
        pdf.setFont(fonts.title.family, fonts.title.style);
        pdf.setFontSize(fonts.title.size);
        pdf.setTextColor(...colors.text);

        const displayTitle = pageNum ? `${title} (continued - page ${pageNum})` : title;
        pdf.text(displayTitle, margins.left, margins.top + 8);

        if (tableResult && tableResult.tableImage) {
            const contentStartY = margins.top + 15;
            const contentHeight = contentArea.height - 15;

            const tableDims = this._calculateFitDimensions(
                tableResult.width,
                tableResult.height,
                contentArea.width,
                contentHeight
            );

            // Center table horizontally
            const tableX = margins.left + (contentArea.width - tableDims.width) / 2;

            pdf.addImage(
                tableResult.tableImage,
                'PNG',
                tableX,
                contentStartY,
                tableDims.width,
                tableDims.height
            );
        }

        this._addPageFooter(pdf);
    },

    /**
     * Add a category section header page
     * Creates a visually distinct page to introduce each category
     *
     * @param {jsPDF} pdf - PDF document instance
     * @param {string} categoryKey - Category key from PDF_CATEGORY_CONFIG
     */
    addCategoryHeader(pdf, categoryKey) {
        const categoryConfig = getPDFCategoryConfig(categoryKey);

        pdf.addPage();

        const pageWidth = pdf.internal.pageSize.width;
        const pageHeight = pdf.internal.pageSize.height;
        const { fonts, colors } = PDF_GLOBAL_CONFIG;

        // Background color
        pdf.setFillColor(...colors.categoryHeaderBg);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');

        // Decorative accent bar at top
        pdf.setFillColor(...categoryConfig.headerColor);
        pdf.rect(0, 0, pageWidth, 5, 'F');

        // Category title
        pdf.setFont(fonts.categoryTitle.family, fonts.categoryTitle.style);
        pdf.setFontSize(fonts.categoryTitle.size);
        pdf.setTextColor(...categoryConfig.headerColor);
        pdf.text(categoryConfig.displayName, pageWidth / 2, pageHeight / 2 - 15, { align: 'center' });

        // Description
        if (categoryConfig.description) {
            pdf.setFont(fonts.subtitle.family, fonts.subtitle.style);
            pdf.setFontSize(fonts.subtitle.size);
            pdf.setTextColor(...colors.textSecondary);

            // Word wrap long descriptions
            const maxWidth = pageWidth - 80;
            const lines = pdf.splitTextToSize(categoryConfig.description, maxWidth);
            pdf.text(lines, pageWidth / 2, pageHeight / 2 + 10, { align: 'center' });
        }

        // Decorative line
        pdf.setDrawColor(...categoryConfig.headerColor);
        pdf.setLineWidth(1);
        pdf.line(pageWidth / 4, pageHeight / 2 + 30, pageWidth * 3 / 4, pageHeight / 2 + 30);
    },

    /**
     * Add cover page to PDF
     *
     * @param {jsPDF} pdf - PDF document instance
     * @param {Object} metadata - Report metadata (dates, filters, record count)
     */
    addCoverPage(pdf, metadata) {
        const pageWidth = pdf.internal.pageSize.width;
        const pageHeight = pdf.internal.pageSize.height;
        const { fonts, colors } = PDF_GLOBAL_CONFIG;

        // Background
        pdf.setFillColor(...colors.coverBg);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');

        // Accent bar
        pdf.setFillColor(...colors.primary);
        pdf.rect(0, 0, pageWidth, 8, 'F');

        // Main title
        pdf.setFont(fonts.categoryTitle.family, fonts.categoryTitle.style);
        pdf.setFontSize(28);
        pdf.setTextColor(...colors.primary);
        pdf.text('AEFI Data Visualization Report', pageWidth / 2, 45, { align: 'center' });

        // Subtitle
        pdf.setFont(fonts.subtitle.family, fonts.subtitle.style);
        pdf.setFontSize(14);
        pdf.setTextColor(...colors.textSecondary);
        pdf.text('Adverse Events Following Immunization Analysis', pageWidth / 2, 58, { align: 'center' });

        // Divider line
        pdf.setDrawColor(...colors.primary);
        pdf.setLineWidth(0.5);
        pdf.line(60, 70, pageWidth - 60, 70);

        // Metadata section
        let y = 90;
        const labelX = 80;
        const valueX = 150;

        const metaItems = [
            { label: 'Generated:', value: metadata.generatedDate || new Date().toLocaleString() },
            { label: 'Date Range:', value: `${metadata.dateFrom || 'All'} to ${metadata.dateTo || 'All'}` },
            { label: 'Total Records:', value: String(metadata.totalRecords || 0) }
        ];

        // Add filter information if available
        if (metadata.filters) {
            if (metadata.filters.year && metadata.filters.year !== 'All') {
                metaItems.push({ label: 'Year Filter:', value: metadata.filters.year });
            }
            if (metadata.filters.vaccines && metadata.filters.vaccines !== 'All') {
                metaItems.push({ label: 'Vaccine Filter:', value: metadata.filters.vaccines });
            }
            if (metadata.filters.seriousness && metadata.filters.seriousness !== 'All') {
                metaItems.push({ label: 'Seriousness:', value: metadata.filters.seriousness });
            }
        }

        pdf.setFontSize(11);
        metaItems.forEach(item => {
            pdf.setFont(fonts.subtitle.family, 'bold');
            pdf.setTextColor(...colors.text);
            pdf.text(item.label, labelX, y);

            pdf.setFont(fonts.subtitle.family, 'normal');
            pdf.setTextColor(...colors.textSecondary);

            // Truncate long values
            let displayValue = item.value;
            if (displayValue.length > 50) {
                displayValue = displayValue.substring(0, 47) + '...';
            }
            pdf.text(displayValue, valueX, y);

            y += 12;
        });

        // Footer note
        pdf.setFont(fonts.footer.family, fonts.footer.style);
        pdf.setFontSize(8);
        pdf.setTextColor(...colors.textSecondary);
        pdf.text(
            'This report was generated from the AEFI Dashboard visualization tool.',
            pageWidth / 2,
            pageHeight - 15,
            { align: 'center' }
        );
    },

    /**
     * Add summary statistics page
     *
     * @param {jsPDF} pdf - PDF document instance
     * @returns {Promise<void>}
     */
    async addSummaryPage(pdf) {
        const summaryElement = document.getElementById('summary-stats');
        if (!summaryElement) {
            return;
        }

        pdf.addPage();

        const { margins, contentArea, fonts, colors } = PDF_GLOBAL_CONFIG;

        // Title
        pdf.setFont(fonts.title.family, fonts.title.style);
        pdf.setFontSize(16);
        pdf.setTextColor(...colors.text);
        pdf.text('Data Overview', margins.left, margins.top + 8);

        try {
            // Capture summary element
            const canvas = await html2canvas(summaryElement, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true
            });

            const imgData = canvas.toDataURL('image/png');
            const dims = this._calculateFitDimensions(
                canvas.width / 2,
                canvas.height / 2,
                contentArea.width,
                contentArea.height - 20
            );

            // Center horizontally
            const xOffset = margins.left + (contentArea.width - dims.width) / 2;
            pdf.addImage(imgData, 'PNG', xOffset, margins.top + 18, dims.width, dims.height);

        } catch (error) {
            console.warn('Could not capture summary stats:', error);

            // Add placeholder text
            pdf.setFont(fonts.subtitle.family, fonts.subtitle.style);
            pdf.setFontSize(11);
            pdf.setTextColor(...colors.textSecondary);
            pdf.text('Summary statistics could not be captured.', margins.left, margins.top + 25);
        }

        this._addPageFooter(pdf);
    },

    /**
     * Calculate dimensions to fit content within bounds while preserving aspect ratio
     *
     * @private
     * @param {number} srcWidth - Source width
     * @param {number} srcHeight - Source height
     * @param {number} maxWidth - Maximum allowed width
     * @param {number} maxHeight - Maximum allowed height
     * @returns {{width: number, height: number}} Fitted dimensions
     */
    _calculateFitDimensions(srcWidth, srcHeight, maxWidth, maxHeight) {
        if (!srcWidth || !srcHeight || srcWidth <= 0 || srcHeight <= 0) {
            return { width: maxWidth, height: maxHeight * 0.6 };
        }

        const srcRatio = srcWidth / srcHeight;
        const maxRatio = maxWidth / maxHeight;

        let width, height;

        if (srcRatio > maxRatio) {
            // Source is wider - constrain by width
            width = maxWidth;
            height = maxWidth / srcRatio;
        } else {
            // Source is taller - constrain by height
            height = maxHeight;
            width = maxHeight * srcRatio;
        }

        // Ensure minimum dimensions
        if (width < 30) width = 30;
        if (height < 20) height = 20;

        return { width, height };
    },

    /**
     * Add page footer with page number and branding
     *
     * @private
     * @param {jsPDF} pdf - PDF document instance
     */
    _addPageFooter(pdf) {
        const pageWidth = pdf.internal.pageSize.width;
        const pageHeight = pdf.internal.pageSize.height;
        const { fonts, colors, margins } = PDF_GLOBAL_CONFIG;

        pdf.setFont(fonts.footer.family, fonts.footer.style);
        pdf.setFontSize(fonts.footer.size);
        pdf.setTextColor(...colors.textSecondary);

        // Page number (right side)
        const pageNum = pdf.internal.getCurrentPageInfo().pageNumber;
        pdf.text(`Page ${pageNum}`, pageWidth - margins.right, pageHeight - 5, { align: 'right' });

        // Branding (left side)
        pdf.text('AEFI Dashboard Report', margins.left, pageHeight - 5);

        // Light separator line
        pdf.setDrawColor(...colors.tableBorder);
        pdf.setLineWidth(0.3);
        pdf.line(margins.left, pageHeight - 8, pageWidth - margins.right, pageHeight - 8);
    },

    /**
     * Get current page dimensions
     *
     * @param {jsPDF} pdf - PDF document instance
     * @returns {{width: number, height: number}} Page dimensions in mm
     */
    getPageDimensions(pdf) {
        return {
            width: pdf.internal.pageSize.width,
            height: pdf.internal.pageSize.height
        };
    }
};
