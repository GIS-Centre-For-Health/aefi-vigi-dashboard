# AEFI Dashboard

A zero-dependency, client-side data visualization tool for analyzing Adverse Events Following Immunization (AEFI) data. Runs entirely in the browser with no server required.

## Quick Start

```bash
# Option 1: Direct browser access
1. Download or clone the repository
2. Open index.html directly in your browser
3. Start using the dashboard

# Option 2: Local testing with simple server (optional, for CORS issues)
# Any static server works - these are just examples:
python -m http.server 8000         # If Python installed
npx serve                           # If Node.js installed
# Or use VS Code Live Server extension
```

## Feature Roadmap

Based on the available VigiFlow data structure, the following visualization components are implemented:

### 1. Demographics Analysis

* **Sex Distribution Chart** (Pie/Donut): Visual breakdown of cases by `Sex` (Male/Female/Unknown)
* **Age Group Analysis** (Stacked Bar): Cases categorized by age groups derived from `Age` and `Age unit`
* **Geographic Mapping** (Choropleth/Bar): Distribution by `Patient state or province`

### 2. Immunization Insights

* **Vaccine Type Frequency** (Horizontal Bar): Top 10 vaccines by adverse event count from `Vaccine` field
* **Dose Number Analysis** (Column Chart): Events correlated with `Dose number` (1st/2nd/3rd/Booster)
* **Batch Number Tracking** (Scatter/Table): Identify problematic batches via `Vaccine batch number`

### 3. Adverse Event Analysis

* **Event Type Distribution** (Treemap/Bar): Most common `Adverse event` descriptions
* **Time-to-Onset Analysis** (Histogram): Days between `Date of vaccination` and `Date of onset`
* **Seriousness Breakdown** (Pie): Distribution of `Serious` (Yes/No/Unknown) cases
* **Outcome Categories** (Donut): `Outcome` distribution (Recovered/Recovering/Not recovered/Fatal/Unknown)
* **Serious Reason Analysis** (Bar): When Serious=Yes, breakdown by `Reason for serious`

### 4. Reporting & Temporal Trends

* **Reporter Type Chart** (Pie): Cases by `Reported by` categories
* **Reporting Timeline** (Line): Temporal trends from `Date of vaccination` to `Date of report`
* **Processing Pipeline** (Gantt-like): Time analysis through notification, investigation, and classification dates

## Project Overview

### Components

1. **Main AEFI Dashboard** (`index.html`) - Single-page application for AEFI data visualization
2. **VEGG ADR Tool** (`veggtoolformeds/index.html`) - Comprehensive ADR visualization toolkit with 17 chart types

### Key Features

* 📊 Multiple visualization types (bar, pie, line, scatter, treemap charts)
* 📁 Excel file upload and processing (.xlsx, .xls)
* 🎨 Customizable chart appearances and color schemes
* 📥 Export functionality (PDF, PNG, Excel)
* 🔒 100% client-side processing (no data leaves your browser)
* 📱 Responsive design for all screen sizes
* 🚀 No installation or server required
* 🔍 Advanced filtering and drill-down capabilities
* ⚡ Real-time chart updates on filter changes

## Technology Stack

```
Core: Pure HTML5, CSS3, JavaScript (ES6+)
Libraries: All loaded via CDN - no local dependencies
- Chart.js 3.9.1 (visualization)
- XLSX.js 0.18.5 (Excel processing)
- jsPDF 2.5.1 (PDF export)
- html2canvas 1.4.1 (image export)
- Font Awesome 6.4.0 (icons)
Hosting: Any static file host or local file system
```

## Project Structure

```
aefi-dashboard/
│
├── index.html                    # Main dashboard - open this file
├── README.md                     # Public documentation
├── Init.md                       # This file - developer guide
│
├── css/
│   └── style.css                # Main stylesheet with CSS variables
│
├── js/
│   ├── main.js                  # Core application logic
│   ├── utils.js                 # Utility functions
│   └── charts/                  # Individual chart modules
│       ├── sex_chart.js         # Gender distribution chart
│       ├── age_chart.js         # Age group analysis
│       ├── vaccine_chart.js     # Vaccine type breakdown
│       ├── timeline_chart.js    # Temporal trends
│       ├── severity_chart.js    # Seriousness distribution
│       ├── outcome_chart.js     # Outcome analysis
│       ├── dose_chart.js        # Dose number correlation
│       ├── geo_chart.js         # Geographic distribution
│       └── reporter_chart.js    # Reporter type breakdown
│
├── veggtoolformeds/             # VEGG ADR Tool
│   ├── index.html              # Open this for VEGG tool
│   ├── styles.css              # Tool-specific styles
│   └── script.js               # Tool functionality
│
└── data/                        # Sample data files (optional)
    ├── sample_aefi.xlsx        # Example AEFI dataset
    └── test_data.xlsx          # Test dataset for development
```

## Data Schema

The dashboard processes `.xlsx` files following the WHO VigiFlow AEFI standard format (44 columns).
Primary data source: `VigiFlow_AEFILinelisting_[date].xlsx`

### Core Patient & Event Columns

| Column Header                 | Data Type | Description                    | Required |
| ----------------------------- | --------- | ------------------------------ | -------- |
| `Case id`                   | String    | Unique identifier for the case | ✓       |
| `Worldwide unique id`       | String    | Globally unique identifier     | ✓       |
| `Initials`                  | String    | Patient's initials             |          |
| `Patient state or province` | String    | Geographic location of patient |          |
| `Sex`                       | String    | M/F/Male/Female/Unknown        | ✓       |
| `Date of birth`             | Date      | Patient's DOB (DD/MM/YYYY)     |          |
| `Age`                       | Number    | Patient's age value            | ✓       |
| `Age unit`                  | String    | Years/Months/Days/Weeks        | ✓       |
| `Pregnant`                  | String    | Yes/No/Unknown                 |          |
| `Lactating`                 | String    | Yes/No/Unknown                 |          |

### Vaccine Information Columns

| Column Header                      | Data Type     | Description                       | Required |
| ---------------------------------- | ------------- | --------------------------------- | -------- |
| `Vaccine`                        | String        | Name/type of vaccine administered | ✓       |
| `Marketing Authorisation Holder` | String        | Manufacturer/MAH                  |          |
| `Date of vaccination`            | Date          | When vaccine was given            | ✓       |
| `Dose number`                    | String/Number | 1st/2nd/3rd/Booster               |          |
| `Vaccine batch number`           | String        | Lot/batch identifier              |          |
| `Diluent name`                   | String        | Name of diluent if used           |          |
| `Diluent batch number`           | String        | Diluent batch/lot                 |          |
| `Route of administration`        | String        | IM/SC/Oral/ID/etc.                |          |
| `Site of administration`         | String        | Arm/Thigh/Abdomen/etc.            |          |
| `Vaccination session`            | String        | Campaign/Routine/Other            |          |

### Adverse Event Details

| Column Header          | Data Type | Description                                                                | Required |
| ---------------------- | --------- | -------------------------------------------------------------------------- | -------- |
| `Adverse event`      | String    | Description of the event                                                   | ✓       |
| `Date of onset`      | Date      | When AE started                                                            | ✓       |
| `Serious`            | String    | Yes/No/Unknown                                                             | ✓       |
| `Reason for serious` | String    | Death/Hospitalization/Disability/Life-threatening/Congenital anomaly/Other |          |
| `Outcome`            | String    | Recovered/Recovering/Not recovered/Fatal/Unknown                           | ✓       |
| `Autopsy`            | String    | Yes/No (if Fatal outcome)                                                  |          |

### Reporting & Administrative Columns

| Column Header                         | Data Type | Description                            | Required |
| ------------------------------------- | --------- | -------------------------------------- | -------- |
| `Reported by`                       | String    | Healthcare worker/Patient/Parent/Other |          |
| `Reporter state or province`        | String    | Reporter's location                    |          |
| `Date of notification`              | Date      | When first notified                    |          |
| `Date of report`                    | Date      | Report generation date                 |          |
| `Health facility name`              | String    | Reporting facility                     |          |
| `Health facility locality`          | String    | Facility area/suburb                   |          |
| `Health facility district`          | String    | District name                          |          |
| `Health facility state or province` | String    | Facility state/province                |          |

### Investigation & System Columns

| Column Header                              | Data Type | Description                | Required |
| ------------------------------------------ | --------- | -------------------------- | -------- |
| `Seen at first decision making level on` | Date      | First review date          |          |
| `Investigation planned`                  | String    | Yes/No                     |          |
| `Date investigation planned`             | Date      | Planned investigation date |          |
| `Date investigation done`                | Date      | Investigation completion   |          |
| `Date report received at national level` | Date      | National receipt date      |          |
| `Date final classification done`         | Date      | Classification completion  |          |
| `Delegated to organisation`              | String    | Assigned organization      |          |
| `Created by organisation level 2`        | String    | Org hierarchy level 2      |          |
| `Created by organisation level 3`        | String    | Org hierarchy level 3      |          |
| `VigiFlow creation date`                 | Date      | System timestamp           |          |

### Data Validation Rules

The system performs automatic validation and normalization:

* **Date formats** : Accepts DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD, DD-MMM-YYYY
* **Age normalization** : Converts Days (÷365.25), Weeks (÷52.18), Months (÷12) to Years
* **Sex values** : Normalizes M→Male, F→Female, maintains Unknown
* **Missing data** : Handles empty cells gracefully with "Unknown" category
* **Case sensitivity** : All column matching is case-insensitive

### Sheet Detection Priority

The system automatically detects the correct data sheet by:

1. Looking for sheets containing "Case id" or "Worldwide unique id" columns
2. Checking sheets named "Data", "AEFI", "Events", "Report", "VigiFlow"
3. Selecting sheet with most matching column headers (minimum 10 matches)
4. Defaulting to first sheet with >100 rows if no criteria met

## Architecture & Design Patterns

### Global State Management

```javascript
// Core global variables (main.js)
window.aefiDashboard = {
    rawData: [],              // Original uploaded data
    filteredData: [],         // Currently filtered dataset
    normalizedData: [],       // Data with normalized ages/dates
    activeCharts: {},         // Chart.js instances for cleanup
    currentFilters: {         // Active filter states
        sex: 'all',
        ageGroup: 'all',
        vaccine: 'all',
        serious: 'all',
        dateRange: { start: null, end: null }
    },
    config: {                 // User preferences
        dateFormat: 'DD/MM/YYYY',
        chartAnimations: true,
        exportQuality: 'high',
        colorScheme: 'default'
    },
    metadata: {              // Data statistics
        totalRecords: 0,
        dateRange: {},
        uniqueVaccines: [],
        columns: []
    }
};
```

### Chart Lifecycle Management

```javascript
// Pattern for chart creation/destruction
function createChart(canvasId, config) {
    // Destroy existing chart to prevent memory leaks
    if (activeCharts[canvasId]) {
        activeCharts[canvasId].destroy();
        delete activeCharts[canvasId];
    }
  
    // Create new chart with error handling
    try {
        const ctx = document.getElementById(canvasId).getContext('2d');
        activeCharts[canvasId] = new Chart(ctx, config);
        return activeCharts[canvasId];
    } catch (error) {
        console.error(`Failed to create chart ${canvasId}:`, error);
        showNotification('Chart creation failed', 'error');
        return null;
    }
}
```

### Data Processing Pipeline

```javascript
// Data processing workflow
async function processUploadedFile(file) {
    // 1. Parse Excel file
    const rawData = await parseExcelFile(file);
  
    // 2. Validate columns
    const validation = validateColumns(rawData);
    if (!validation.isValid) {
        throw new Error(`Missing columns: ${validation.missing.join(', ')}`);
    }
  
    // 3. Normalize data
    const normalizedData = normalizeData(rawData);
  
    // 4. Calculate metadata
    const metadata = calculateMetadata(normalizedData);
  
    // 5. Store in global state
    window.aefiDashboard.rawData = rawData;
    window.aefiDashboard.normalizedData = normalizedData;
    window.aefiDashboard.metadata = metadata;
  
    // 6. Update UI
    updateCharts(normalizedData);
    updateFilters(metadata);
  
    return normalizedData;
}
```

### CDN Resources Loading

```html
<!-- All dependencies loaded from CDN - no local packages -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@3.9.1"></script>
<script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
```

## API Reference

### Main Functions (main.js)

```javascript
// Initialize dashboard on page load
initializeDashboard()
// Sets up event listeners, checks CDN availability

// Process uploaded Excel file with VigiFlow format
async handleFileUpload(file)
// Returns: Promise<Array> - Normalized data array
// Throws: Error if invalid format or missing columns

// Column mapping for VigiFlow data
mapVigiFlowColumns(data)
// Maps various column name variations to standard names

// Update all charts with data
updateCharts(data, options = {})
// Parameters: 
//   data: Array of normalized data objects
//   options: { animate: boolean, chartTypes: Array }

// Apply filters to dataset
applyFilters(filters)
// Parameters: Object with filter criteria
// Returns: Filtered data array

// Export functions
exportToPDF(chartIds)       // Array of canvas IDs to include
exportToExcel(data)         // Export filtered dataset
exportChartAsImage(chartId) // Single chart as PNG
```

### Utility Functions (utils.js)

```javascript
// VigiFlow Date Handling
parseVigiFlowDate(dateString)     // Parse various date formats
formatDate(date, format)          // Format date for display
calculateDaysBetween(date1, date2) // Time-to-onset calculation
getDateRange(dateArray)           // Find min/max dates

// Age Normalization
normalizeAge(age, ageUnit)        // Convert to years
// Years: as-is, Months: ÷12, Weeks: ÷52.18, Days: ÷365.25
getAgeGroup(normalizedAge)        // Categorize into standard groups
// 0-1, 2-5, 6-11, 12-17, 18-44, 45-64, 65+

// Data Processing
aggregateByCategory(data, field)  // Group and count by field
calculateStatistics(data, field)  // Min, max, mean, median, mode
detectDateFormat(samples)         // Auto-detect date format
extractUniqueValues(data, field)  // Get distinct values

// VigiFlow Specific Processing
processSeriousness(data)          // Analyze serious events
extractVaccineTypes(data)         // Get unique vaccines with counts
parseAdverseEvents(data)          // Categorize AE descriptions
analyzeOutcomes(data)            // Statistics by outcome type
identifyBatchClusters(data)      // Find problematic batches

// Validation
validateColumns(data)             // Check required columns exist
validateDateRange(start, end)    // Ensure valid date range
sanitizeData(data)               // Remove/fix invalid entries

// UI Helpers
showLoading(element)             // Display loading spinner
hideLoading(element)             // Remove loading spinner
showNotification(message, type)  // Toast notifications
updateProgressBar(percent)       // File processing progress
```

### Chart Module Functions (charts/*.js)

```javascript
// Each chart module exports:
export function createChartName(canvasId, data, options) {
    // Process data for specific visualization
    // Return Chart.js configuration object
}

export function updateChartName(chart, newData) {
    // Update existing chart with new data
}

export function getChartNameConfig(data) {
    // Return chart configuration without creating
}
```

## Styling Guide

### CSS Custom Properties

```css
:root {
    /* Primary palette - Medical/Healthcare theme */
    --primary-dark: #2C4A7C;      /* Navy blue - primary bars/sections */
    --primary-light: #6B8CAE;     /* Steel blue - secondary elements */
    --primary-lighter: #A8C0D8;   /* Light blue - tertiary elements */
    --accent: #4A90E2;            /* Bright blue - CTAs/highlights */
    --accent-hover: #357ABD;      /* Darker blue - hover states */
  
    /* Semantic colors for AEFI severity */
    --severity-mild: #28A745;     /* Green - non-serious events */
    --severity-serious: #FFC107;  /* Amber - serious events */
    --severity-fatal: #DC3545;    /* Red - fatal outcomes */
    --severity-unknown: #6C757D;  /* Gray - unknown/unreported */
  
    /* Backgrounds */
    --bg-primary: #F5F6F8;        /* Main background */
    --bg-secondary: #FFFFFF;      /* Card backgrounds */
    --bg-tertiary: #E8EAED;       /* Subtle dividers */
    --bg-hover: #F0F0F0;          /* Hover state background */
  
    /* Text hierarchy */
    --text-primary: #2C3E50;      /* Main text */
    --text-secondary: #6C757D;    /* Secondary labels */
    --text-muted: #8A8D91;        /* Disabled/hint text */
    --text-inverse: #FFFFFF;      /* Text on dark backgrounds */
  
    /* Borders and shadows */
    --border-color: #DEE2E6;      /* Default border */
    --shadow-sm: 0 2px 4px rgba(0,0,0,0.1);
    --shadow-md: 0 4px 8px rgba(0,0,0,0.15);
    --shadow-lg: 0 8px 16px rgba(0,0,0,0.2);
  
    /* Chart-specific colors */
    --chart-grid: rgba(0,0,0,0.05);
    --chart-axis: #6C757D;
    --chart-tooltip-bg: rgba(0,0,0,0.8);
}
```

## Usage Guide

### Running Locally

1. **Direct File Access** (Simplest)
   ```
   - Download/extract the project folder
   - Double-click index.html
   - Works immediately in any modern browser
   - Note: Some export features may be limited due to CORS
   ```
2. **Via Static Server** (Recommended for full features)
   ```
   - VS Code: Right-click index.html → "Open with Live Server"
   - Python: python -m http.server 8000
   - Node.js: npx serve
   - Access at: http://localhost:[port]
   ```

### Workflow Example

```javascript
// Typical user workflow
1. Open index.html in browser
2. Click "Upload AEFI Data" button
3. Select your VigiFlow export file (.xlsx)
4. System automatically:
   - Detects correct data sheet
   - Validates column structure
   - Normalizes ages and dates
   - Generates all visualizations
5. Use filters to explore data:
   - Filter by sex, age group, vaccine type
   - Select date ranges
   - Toggle serious/non-serious events
6. Export results:
   - Download filtered data as Excel
   - Save charts as PNG/PDF
   - Print dashboard view
```

### Testing Checklist

* [ ] File upload accepts .xlsx and .xls formats
* [ ] System correctly identifies VigiFlow data sheet
* [ ] All 44 columns are recognized (if present)
* [ ] Age normalization works for all units
* [ ] Date parsing handles multiple formats
* [ ] Charts render with sample data
* [ ] Filters update all charts simultaneously
* [ ] Export functions generate valid files
* [ ] Responsive design works on mobile/tablet
* [ ] No console errors during operation
* [ ] CDN resources load successfully
* [ ] Performance acceptable with 10,000+ rows

## Common Issues & Solutions

| Issue                   | Solution                                                                                 |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| Charts not rendering    | Check internet (CDN access), verify browser console, ensure Canvas elements exist        |
| Excel upload fails      | Verify file extension (.xlsx/.xls), check for VigiFlow column headers, ensure file <10MB |
| "Missing columns" error | Ensure Excel has required columns: Case id, Sex, Age, Vaccine, Adverse event             |
| Date parsing errors     | Check date format consistency, system handles DD/MM/YYYY, MM/DD/YYYY, ISO format         |
| Export not working      | Check popup blocker, ensure browser supports downloads, verify sufficient memory         |
| Slow performance        | Limit to <10,000 rows, disable animations, use Chrome/Firefox, close other tabs          |
| Age calculation wrong   | Verify "Age unit" column has valid values (Years/Months/Days/Weeks)                      |
| Filters not working     | Clear browser cache, refresh page, check console for JavaScript errors                   |

## Deployment Options

### 1. GitHub Pages (Recommended - Free)

```bash
git init
git add .
git commit -m "Initial deployment"
git remote add origin https://github.com/[username]/[repo].git
git push -u origin main
# Settings → Pages → Source: main branch → Save
# Available at: https://[username].github.io/[repo]
```

### 2. Netlify Drop (Instant - Free)

```
1. Visit https://app.netlify.com/drop
2. Drag entire project folder to browser
3. Instant deployment with custom URL
4. Optional: Connect to Git for auto-updates
```

### 3. Local Network (Internal Use)

```
1. Copy folder to network drive
2. Share link: \\server\share\aefi-dashboard\index.html
3. Users with network access can open directly
4. No internet required if CDN resources cached
```

### 4. USB Distribution (Offline)

```
1. Download CDN resources to libs/ folder
2. Update index.html with local paths
3. Copy entire folder to USB
4. Runs completely offline
```

## Performance Guidelines

### Recommended Limits

| Metric            | Minimum  | Recommended  | Maximum |
| ----------------- | -------- | ------------ | ------- |
| File size         | 100KB    | 1-5MB        | 10MB    |
| Data rows         | 100      | 1,000-10,000 | 50,000  |
| Browser RAM       | 2GB      | 4GB          | 8GB     |
| Screen resolution | 1024x768 | 1920x1080    | Any     |

### Optimization Strategies

```javascript
// For large datasets (>10,000 rows)
config.chartAnimations = false;        // Disable animations
config.chartSampling = true;           // Sample data points
config.aggregateBeforeRender = true;   // Pre-aggregate data

// Memory management
setInterval(cleanupUnusedCharts, 60000); // Cleanup every minute
limitConcurrentCharts(5);                // Max 5 charts at once
```

## Browser Support

| Browser          | Version | Support Level | Notes                                     |
| ---------------- | ------- | ------------- | ----------------------------------------- |
| Chrome           | 88+     | ✅ Excellent  | Recommended, best performance             |
| Edge             | 88+     | ✅ Excellent  | Chromium-based                            |
| Firefox          | 85+     | ✅ Excellent  | Good alternative                          |
| Safari           | 14+     | ✅ Good       | Full features, slower with large datasets |
| Opera            | 74+     | ✅ Good       | Chromium-based                            |
| Samsung Internet | 15+     | ⚠️ Basic    | Mobile only, some features limited        |
| IE 11            | Any     | ❌ None       | Not supported                             |

## Security & Privacy

### Data Protection

* **Zero server transmission** : All processing occurs in browser memory
* **No persistence** : Data deleted when tab closes
* **No cookies** : No tracking or user identification
* **No localStorage** : No data saved between sessions
* **Isolated execution** : Each tab is sandboxed
* **HTTPS CDN** : All external resources use SSL

### Compliance

* **GDPR compliant** : No personal data collected or stored
* **HIPAA ready** : Can be deployed in healthcare environments
* **No authentication** : No user accounts or passwords
* **Audit trail** : All actions logged to browser console

## Development Best Practices

### Code Standards

```javascript
// Use modern ES6+ features
const processData = (data) => data.map(row => ({
    ...row,
    normalizedAge: normalizeAge(row.Age, row['Age unit'])
}));

// Clear function names
function validateVigiFlowColumns(data) { /* ... */ }

// Comprehensive error handling
try {
    const result = await processFile(file);
} catch (error) {
    console.error('Processing failed:', error);
    showUserNotification(error.message, 'error');
}

// JSDoc comments for documentation
/**
 * Normalizes age to years based on unit
 * @param {number} age - The age value
 * @param {string} unit - The age unit (Years/Months/Days/Weeks)
 * @returns {number} Age in years
 */
function normalizeAge(age, unit) { /* ... */ }
```

### Testing Strategy

1. **Unit testing** : Test individual functions with sample data
2. **Integration testing** : Verify chart generation with real VigiFlow files
3. **Cross-browser testing** : Test in Chrome, Firefox, Safari, Edge
4. **Performance testing** : Verify with 1K, 10K, 50K row datasets
5. **Accessibility testing** : Keyboard navigation, screen reader compatibility

## Troubleshooting Guide

### Debug Checklist

```javascript
// 1. Enable debug mode
window.DEBUG = true;

// 2. Check data loading
console.log('Loaded columns:', Object.keys(window.aefiDashboard.rawData[0]));
console.log('Total records:', window.aefiDashboard.rawData.length);

// 3. Verify normalization
console.log('Age normalization test:', normalizeAge(6, 'Months')); // Should be 0.5

// 4. Check chart instances
console.log('Active charts:', Object.keys(window.aefiDashboard.activeCharts));

// 5. Memory usage
console.log('Memory:', performance.memory.usedJSHeapSize / 1048576, 'MB');
```

### Common Error Messages

| Error                            | Cause             | Fix                                |
| -------------------------------- | ----------------- | ---------------------------------- |
| "Chart is not defined"           | CDN not loaded    | Check internet, wait for page load |
| "Cannot read property 'Case id'" | Wrong file format | Use VigiFlow export file           |
| "Maximum call stack exceeded"    | Dataset too large | Reduce to <50,000 rows             |
| "Invalid date value"             | Date format issue | Check date columns for consistency |

## Contributing Guidelines

### Contribution Process

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Make changes following code standards
4. Test with real VigiFlow data
5. Commit with clear messages (`git commit -m 'Add age group filtering'`)
6. Push to branch (`git push origin feature/AmazingFeature`)
7. Open Pull Request with description

### Requirements

* ✅ No build tools or npm packages
* ✅ Pure vanilla JavaScript/HTML/CSS
* ✅ CDN-only external dependencies
* ✅ Browser-compatible code (ES6+)
* ✅ Maintain backward compatibility
* ✅ Include inline documentation
* ✅ Test with sample VigiFlow data

## Future Enhancements

### Phase 1 (Next Release)

* [X] Core dashboard with 10 chart types
* [ ] Advanced filtering system
* [ ] Multi-file comparison
* [ ] Batch analysis improvements
* [ ] Custom date range picker

### Phase 2 (Planned)

* [ ] Progressive Web App (PWA) manifest
* [ ] Service Worker for offline mode
* [ ] IndexedDB for session persistence
* [ ] WebAssembly for faster processing
* [ ] Real-time collaboration features

### Phase 3 (Future)

* [ ] Machine learning insights
* [ ] Predictive analytics
* [ ] Natural language queries
* [ ] Custom report builder
* [ ] API integration capabilities

## License

MIT License - See LICENSE file for details

## Support & Resources

* **Documentation** : This file and README.md
* **Sample Data** : `/data/sample_aefi.xlsx` with 1000 rows
* **Issues** : GitHub Issues for bug reports
* **Wiki** : GitHub Wiki for tutorials
* **Community** : Discussions tab for Q&A

## Version History

| Version | Date    | Changes                                |
| ------- | ------- | -------------------------------------- |
| 1.0.0   | 2024-01 | Initial release with core features     |
| 1.1.0   | Planned | Add batch analysis, geographic mapping |
| 1.2.0   | Planned | PWA support, offline capabilities      |

---

 **Last updated** : January 2024

 **Current version** : 1.0.0

 **Status** : Production Ready

**Pure client-side application** - No server required, runs anywhere

*Built for WHO VigiFlow AEFI data analysis*
