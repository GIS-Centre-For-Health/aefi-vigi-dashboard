///////////////////////////////////////////////////////////
// Global variables and initialization
///////////////////////////////////////////////////////////
let rawData = [];
let filteredData = [];
let activeCharts = {};
let minDate, maxDate;
// Safely initialize the dictionary, checking if the function exists first.
let vaccineDictionary = typeof getVaccineDictionary === 'function' ? getVaccineDictionary() : new Set();

const chartRegistry = {
    demographics: [
        { func: generateSexDistribution, container: 'sexChartContainer' },
        { func: generateAgeDistribution, container: 'ageDistributionChartContainer' },
    ],
    geographic: [
        { func: generatePatientProvincesDistribution, container: 'patientProvinceChartContainer' },
        { func: generateHealthFacilityProvincesDistribution, container: 'healthFacilityProvinceChartContainer' },
        { func: generateDistrictDistribution, container: 'districtDistributionChartContainer' },
        { func: generateReporterProvincesDistribution, container: 'reporterProvinceChartContainer' },
    ],
    clinical: [
        { func: generateAdverseEventsDistribution, container: 'adverseEventsChart' },
        { func: generateSeriousEventDistribution, container: 'seriousnessChart' },
        { func: generateSeriousReasonDistribution, container: 'seriousReasonChart' },
    ],
    temporal: [
        { func: generateTemporalAnalysis, container: 'temporalAnalysisChartContainer' },
    ],
    vaccine: [
        { func: generateVaccineDistributionChart, container: 'vaccineDistributionChartContainer' },
        { func: generateVaccineAdverseEventsChart, container: 'vaccineAdverseEventsChartContainer' },
    ],
};

// Set up event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('upload').addEventListener('change', handleFileUpload);
    document.getElementById('apply-filters').addEventListener('click', applyFilters);
    document.getElementById('reset-filters').addEventListener('click', resetFilters);
    document.getElementById('export-data').addEventListener('click', toggleExportOptions);
    document.getElementById('clear-data-button').addEventListener('click', resetUI);
    
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            switchTab(targetSection);
        });
    });
    
    // Export options
    document.querySelectorAll('.export-option').forEach(option => {
        option.addEventListener('click', function() {
            const exportType = this.getAttribute('data-type');
            exportData(exportType);
            document.getElementById('export-options').classList.remove('active');
        });
    });
});

///////////////////////////////////////////////////////////
// File handling and data processing
///////////////////////////////////////////////////////////
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    showLoading('Reading file...');
    
    const fileInfo = document.getElementById('file-info');
    fileInfo.textContent = `File: ${file.name}`;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            showLoading('Processing data...');
            
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array', cellDates: true });
            
            const aefiSheetName = findAefiSheet(workbook.SheetNames);
            if (!aefiSheetName) {
                showError("Could not find AEFI line listing sheet.");
                hideLoading();
                return;
            }
            
            const worksheet = workbook.Sheets[aefiSheetName];
            rawData = XLSX.utils.sheet_to_json(worksheet, { raw: true, defval: null });
            
            if (rawData.length === 0) {
                showError("No data found in the Excel file.");
                hideLoading();
                return;
            }
            
            processData(rawData);
        } catch (error) {
            showError(`Error processing file: ${error.message}`);
            hideLoading();
        }
    };
    
    reader.onerror = function() {
        showError("Failed to read the file.");
        hideLoading();
    };
    
    reader.readAsArrayBuffer(file);
}

function findAefiSheet(sheetNames) {
    for (const name of sheetNames) {
        if (name.toLowerCase().includes('aefi') && name.toLowerCase().includes('line')) {
            return name;
        }
    }
    return sheetNames.length > 0 ? sheetNames[0] : null;
}

function processData(data) {
    showLoading('Analyzing and normalizing data...');
    
    const dataErrors = [];
    const dateFields = [
        'Date of birth', 'Date of vaccination', 'Date of onset',
        'Date of notification', 'Date of report'
    ];

    // Pre-process and validate dates
    data.forEach(row => {
        const uniqueId = row['Worldwide unique id'] || 'Unknown';
        dateFields.forEach(field => {
            const originalValue = row[field];
            if (originalValue) {
                // Handle multiple dates in the same field, separated by newline or space
                const dateEntries = String(originalValue).split(new RegExp('[\n\s]+'));
                const parsedDates = dateEntries.map(dateStr => {
                    const parsed = parseDate(dateStr, field, uniqueId);
                    if (!parsed && dateStr.trim()) {
                        dataErrors.push({ id: uniqueId, field: field, value: dateStr });
                    }
                    return parsed;
                }).filter(d => d); // Filter out nulls

                // Join valid dates back with a newline for consistency
                row[field] = parsedDates.length > 0 ? parsedDates.map(d => d.toISOString().split('T')[0]).join('\n') : null;
            }
        });
    });

    // Use the compatibility bridge to process data
    const processedData = processAEFIData(data);
    
    // Train the vaccine dictionary
    if (typeof trainVaccineDictionary === 'function') {
        vaccineDictionary = trainVaccineDictionary(processedData, vaccineDictionary);
    }

    filteredData = [...processedData];
    rawData = [...processedData];
    
    // Generate UI components with the processed data
    generateSummaryStats(filteredData);
    populateFilterOptions(filteredData);
    generateAllCharts(filteredData);
    
    // Show the main content sections
    document.getElementById('filter-section').style.display = 'flex';
    document.getElementById('summary-section').style.display = 'block';
    document.getElementById('visualization-container').style.display = 'block';
    
    // Update UI to show file info and clear button
    document.getElementById('file-input-section').style.display = 'none';
    document.getElementById('file-display-section').style.display = 'block';


    showDataErrors(dataErrors);
    if (dataErrors.length === 0) {
        showSuccess(`Successfully processed ${data.length} records.`);
    }
    hideLoading();
}

function resetUI() {
    // Clear data arrays
    rawData = [];
    filteredData = [];

    // Destroy all active charts
    Object.values(activeCharts).forEach(chart => chart.destroy());
    activeCharts = {};

    // Clear all chart containers
    document.querySelectorAll('.chart-container').forEach(container => {
        container.innerHTML = '';
    });

    // Clear summary stats
    document.getElementById('summary-stats').innerHTML = '';

    // Hide the main content sections
    document.getElementById('filter-section').style.display = 'none';
    document.getElementById('summary-section').style.display = 'none';
    document.getElementById('visualization-container').style.display = 'none';

    // Reset file input
    const uploadInput = document.getElementById('upload');
    uploadInput.value = ''; // Clear the selected file

    // Switch back to the file input view
    document.getElementById('file-input-section').style.display = 'block';
    document.getElementById('file-display-section').style.display = 'none';
    document.getElementById('file-info').textContent = '';

    // Reset status message
    showSuccess('Cleared data. Ready to upload a new file.');
}


function preprocessDates(data) {
    const dateFields = [
        'Date of birth', 'Date of vaccination', 'Date of onset',
        'Date of notification', 'Date of report'
    ];
    
    data.forEach(record => {
        dateFields.forEach(field => {
            if (record[field]) {
                record[field] = parseDate(record[field]);
            }
        });
    });
}

function populateFilterOptions(data) {
    const regionSelect = document.getElementById('region-filter');
    clearSelectOptions(regionSelect, true);
    const regions = getUniqueValues(data, 'Created by organisation level 3');
    regions.forEach(region => {
        if (region) {
            const option = document.createElement('option');
            option.value = region;
            option.textContent = region;
            regionSelect.appendChild(option);
        }
    });
    
    const vaccineSelect = document.getElementById('vaccine-filter');
    clearSelectOptions(vaccineSelect, true);
    
    // Correctly parse vaccines using the vaccine_parser.js logic
    const vaccineSet = new Set();
    data.forEach(row => {
        const vaccineField = row['Vaccine'];
        if (vaccineField && typeof vaccineField === 'string') {
            const vaccines = parseVaccineField(vaccineField);
            vaccines.forEach(vaccine => {
                if (vaccine) {
                    vaccineSet.add(vaccine);
                }
            });
        }
    });

    const sortedVaccines = Array.from(vaccineSet).sort();
    sortedVaccines.forEach(vaccine => {
        const option = document.createElement('option');
        option.value = vaccine;
        option.textContent = vaccine;
        vaccineSelect.appendChild(option);
    });

    // Set date range defaults
    const reportDates = data.map(row => parseDate(row['Date of report'])).filter(date => date);
    if (reportDates.length > 0) {
        minDate = new Date(Math.min.apply(null, reportDates));
        maxDate = new Date(Math.max.apply(null, reportDates));
        
        document.getElementById('date-from-filter').value = minDate.toISOString().split('T')[0];
        document.getElementById('date-to-filter').value = maxDate.toISOString().split('T')[0];
    }
}

///////////////////////////////////////////////////////////
// UI Interaction Functions
///////////////////////////////////////////////////////////

function switchTab(targetSection) {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.toggle('active', tab.getAttribute('data-section') === targetSection);
    });
    document.querySelectorAll('.chart-section').forEach(section => {
        section.classList.toggle('active', section.id === `${targetSection}-section`);
    });

    // Generate charts for the active tab
    if (chartRegistry[targetSection]) {
        chartRegistry[targetSection].forEach(chart => {
            chart.func(filteredData);
        });
    }
}

function toggleExportOptions(event) {
    event.stopPropagation();
    document.getElementById('export-options').classList.toggle('active');
}

function applyFilters() {
      showLoading('Applying filters...');

      const regionFilter = document.getElementById('region-filter').value;
      const dateFromFilter = document.getElementById('date-from-filter').value;
      const dateToFilter = document.getElementById('date-to-filter').value;
      const vaccineSelect = document.getElementById('vaccine-filter');
      const selectedVaccines = Array.from(vaccineSelect.selectedOptions).map(option => option.value);
      const seriousnessFilter = document.getElementById('seriousness-filter').value;

      let tempFilteredData = [...rawData];

      if (regionFilter !== 'all') {
          tempFilteredData = tempFilteredData.filter(row => row['Created by organisation level 3'] === regionFilter);
      }
      if (selectedVaccines.length > 0 && !selectedVaccines.includes('all')) {
          tempFilteredData = tempFilteredData.filter(row => {
              const vaccineField = row['Vaccine'];
              if (vaccineField && typeof vaccineField === 'string') {
                  const vaccines = parseVaccineField(vaccineField);
                  // Return true if ANY of the row's vaccines match ANY of the selected vaccines
                  return vaccines.some(vaccine => selectedVaccines.includes(vaccine));
              }
              return false;
          });
      }
      if (seriousnessFilter === 'serious') {
          tempFilteredData = tempFilteredData.filter(row => {
              const seriousField = row['Serious'];
              if (seriousField && typeof seriousField === 'string') {
                  return seriousField.split(/\r?\n/).some(val => val.trim().toLowerCase() === 'yes');
              }
              return false;
          });
      }

      const startDate = dateFromFilter ? new Date(dateFromFilter) : null;
      const endDate = dateToFilter ? new Date(dateToFilter) : null;

      // For the end date, set it to the end of the day to make the range inclusive.
      if (endDate) {
          endDate.setUTCHours(23, 59, 59, 999);
      }
       if (startDate) {
        startDate.setUTCHours(0, 0, 0, 0);
    }

      if (startDate || endDate) {
          tempFilteredData = tempFilteredData.filter(row => {
              const reportDateStr = row['Date of report'];
              if (!reportDateStr) {
                // Keep rows with no report date if no date filter is applied
                // Or decide on a specific logic, e.g., include them by default
                return true; 
            }
              const reportDate = parseDate(reportDateStr);
              if (!reportDate) return true;

              if (startDate && reportDate < startDate) {
                  return false;
              }
              if (endDate && reportDate > endDate) {
                  return false;
              }
              return true;
          });
      }

      filteredData = tempFilteredData;
      generateAllCharts(filteredData);
      generateSummaryStats(filteredData);

    showSuccess(`Applied filters: ${filteredData.length} records matching.`);
      hideLoading();
  }

function resetFilters() {
    showLoading('Resetting filters...');

    document.getElementById('region-filter').value = 'all';

    // Clear multi-select vaccine filter
    const vaccineSelect = document.getElementById('vaccine-filter');
    Array.from(vaccineSelect.options).forEach(option => {
        option.selected = option.value === 'all';
    });

    document.getElementById('seriousness-filter').value = 'all';

    if (minDate && maxDate) {
        document.getElementById('date-from-filter').value = minDate.toISOString().split('T')[0];
        document.getElementById('date-to-filter').value = maxDate.toISOString().split('T')[0];
    } else {
        document.getElementById('date-from-filter').value = '';
        document.getElementById('date-to-filter').value = '';
    }

    filteredData = [...rawData];

    generateAllCharts(filteredData);
    generateSummaryStats(filteredData);

    showSuccess('Filters reset.');
    hideLoading();
}


function exportData(type) {
    showLoading(`Preparing ${type.toUpperCase()} export...`);
    setTimeout(() => {
        switch (type) {
            case 'pdf': exportToPDF(); break;
            case 'csv': exportToCSV(); break;
            case 'png': exportAllChartsToPNG(); break;
        }
        hideLoading();
    }, 100);
}

///////////////////////////////////////////////////////////
// Chart Generation Functions
///////////////////////////////////////////////////////////

function generateAllCharts(data) {
    Object.values(activeCharts).forEach(chart => chart.destroy());
    activeCharts = {};

    for (const tab in chartRegistry) {
        chartRegistry[tab].forEach(chart => {
            if (typeof chart.func === 'function') {
                chart.func(data);
            } else {
                console.error(`Chart function for container #${chart.container} is not defined.`);
            }
        });
    }
}

// Specific Chart Functions
function generateSexDistribution(data) {
    renderSexChart('sexChartContainer', data);
}

function generateAgeDistribution(data) {
    renderAgeDistributionChart('ageDistributionChartContainer', data);
}

function generatePatientProvincesDistribution(data) {
    renderPatientProvinceDistribution('patientProvinceChartContainer', data);
}

function generateHealthFacilityProvincesDistribution(data) {
    createHealthFacilityProvinceChart(data);
}

function generateDistrictDistribution(data) {
    createDistrictDistributionChart(data);
}

function generateReporterProvincesDistribution(data) {
    renderReporterProvinceDistribution('reporterProvinceChartContainer', data);
}

function generateAdverseEventsDistribution(data) {
    const events = {};
    data.forEach(row => {
        const eventField = row['Adverse event'];
        if (eventField && typeof eventField === 'string') {
            const splitEvents = eventField.split(/\r?\n/);
            splitEvents.forEach(event => {
                const trimmedEvent = event.trim();
                if (trimmedEvent) {
                    events[trimmedEvent] = (events[trimmedEvent] || 0) + 1;
                }
            });
        }
    });
    renderAdverseEventChart('adverseEventsChart', events);
}

function generateSeriousEventDistribution(data) {
    const seriousCounts = { 'Serious': 0, 'Not Serious': 0, 'Unknown': 0 };

    data.forEach(row => {
        const seriousField = row['Serious'];
        if (seriousField && typeof seriousField === 'string') {
            const splitValues = seriousField.split(/\r?\n/);
            
            // If any value is 'yes', the entire case is serious.
            const isSerious = splitValues.some(val => val.trim().toLowerCase() === 'yes');
            
            if (isSerious) {
                seriousCounts['Serious']++;
            } else {
                // If it's not serious, check if it's explicitly 'no'.
                const isNotSerious = splitValues.some(val => val.trim().toLowerCase() === 'no');
                if (isNotSerious) {
                    seriousCounts['Not Serious']++;
                } else {
                    seriousCounts['Unknown']++;
                }
            }
        } else {
            // If the field is empty or not a string, it's Unknown.
            seriousCounts['Unknown']++;
        }
    });

    renderSeriousEventChart('seriousnessChart', seriousCounts);
}

function generateSeriousReasonDistribution(data) {
    const reasonCounts = {
        'Death': 0,
        'Life threatening': 0,
        'Caused / prolonged hospitalisation': 0,
        'Disabling or incapacitating': 0,
        'Congenital anomaly or birth defect': 0,
        'Other medically important condition': 0
    };

    const seriousData = data.filter(row => {
        const seriousField = row['Serious'];
        if (seriousField && typeof seriousField === 'string') {
            return seriousField.split(/\r?\n/).some(val => val.trim().toLowerCase() === 'yes');
        }
        return false;
    });

    seriousData.forEach(row => {
        const reasonField = row['Reason for serious'];
        if (reasonField && typeof reasonField === 'string') {
            const reasons = reasonField.split(/\r?\n|,/);
            reasons.forEach(reason => {
                const lowerReason = reason.trim().toLowerCase();
                if (lowerReason.includes('death')) {
                    reasonCounts['Death']++;
                } else if (lowerReason.includes('life threatening')) {
                    reasonCounts['Life threatening']++;
                } else if (lowerReason.includes('hospitalis') || lowerReason.includes('hospitaliz')) {
                    reasonCounts['Caused / prolonged hospitalisation']++;
                } else if (lowerReason.includes('disabling') || lowerReason.includes('incapacitating')) {
                    reasonCounts['Disabling or incapacitating']++;
                } else if (lowerReason.includes('congenital') || lowerReason.includes('birth defect')) {
                    reasonCounts['Congenital anomaly or birth defect']++;
                } else if (lowerReason.includes('other medically important')) {
                    reasonCounts['Other medically important condition']++;
                }
            });
        }
    });

    renderSeriousReasonChart('seriousReasonChart', reasonCounts);
}

function generateTemporalAnalysis(data) {
    renderTemporalAnalysisChart('temporalAnalysisChartContainer', data);
}

function generateVaccineDistributionChart(data) {
    renderVaccineDistributionChart('vaccineDistributionChartContainer', data);
}

function generateVaccineAdverseEventsChart(data) {
    renderVaccineAdverseEventsChart('vaccineAdverseEventsChartContainer', data);
}
