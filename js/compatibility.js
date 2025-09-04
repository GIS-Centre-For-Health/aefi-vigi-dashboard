/**
 * Compatibility Bridge
 * 
 * This file ensures seamless integration between the original utility functions
 * and the new enhanced architecture.
 */

// Bridge functions to ensure both architectures work together
(function() {
    'use strict';
    
    // Ensure global variables exist
    if (typeof rawData === 'undefined') {
        window.rawData = [];
    }
    if (typeof filteredData === 'undefined') {
        window.filteredData = [];
    }
    if (typeof activeCharts === 'undefined') {
        window.activeCharts = {};
    }
    
    // Utility function compatibility
    if (typeof aggregateByCategory === 'undefined' && typeof countField !== 'undefined') {
        window.aggregateByCategory = function(data, field) {
            return countField(data, field);
        };
    }
    
    if (typeof extractUniqueValues === 'undefined' && typeof getUniqueValues !== 'undefined') {
        window.extractUniqueValues = function(data, field) {
            const values = getUniqueValues(data, field);
            const counts = countField(data, field);
            return values.map(value => ({
                value: value,
                count: counts[value] || 0
            })).sort((a, b) => b.count - a.count);
        };
    }
    
    // Original createChart function compatibility
    if (typeof createChart === 'undefined') {
        window.createChart = function(canvasId, config) {
            // Destroy existing chart if it exists
            if (activeCharts && activeCharts[canvasId]) {
                activeCharts[canvasId].destroy();
                delete activeCharts[canvasId];
            }
            
            const ctx = document.getElementById(canvasId);
            if (!ctx) {
                console.warn(`Canvas element ${canvasId} not found`);
                return null;
            }
            
            const chartContext = ctx.getContext('2d');
            const chart = new Chart(chartContext, config);
            
            // Store in global activeCharts
            activeCharts[canvasId] = chart;
            return chart;
        };
    }
    
    // Enhanced chart creation that works with both architectures
    window.createChartEnhanced = function(canvasId, type, chartData, options) {
        const config = {
            type: type,
            data: chartData,
            options: options || {
                responsive: true,
                maintainAspectRatio: false
            }
        };
        
        return createChart(canvasId, config);
    };
    
    // Notification system compatibility
    if (typeof showNotification === 'undefined' && typeof showSuccess !== 'undefined') {
        window.showNotification = function(message, type) {
            switch (type) {
                case 'success':
                    showSuccess(message);
                    break;
                case 'error':
                    showError(message);
                    break;
                default:
                    console.log(`[${type.toUpperCase()}] ${message}`);
            }
        };
    }
    
    // Loading system compatibility
    if (typeof showLoading === 'undefined') {
        window.showLoading = function(message) {
            const loading = document.getElementById('loading');
            if (loading) {
                const loadingMessage = document.getElementById('loading-message');
                if (loadingMessage) {
                    loadingMessage.textContent = message || 'Processing...';
                }
                loading.classList.add('active');
            }
        };
    }
    
    if (typeof hideLoading === 'undefined') {
        window.hideLoading = function() {
            const loading = document.getElementById('loading');
            if (loading) {
                loading.classList.remove('active');
            }
        };
    }
    
    // Data processing compatibility
    if (typeof normalizeAge === 'undefined') {
        window.normalizeAge = function(age, unit) {
            if (!age || isNaN(age) || age < 0) return null;
            
            const ageValue = parseFloat(age);
            const unitLower = String(unit || '').toLowerCase().trim();
            
            if (unitLower.startsWith('year')) {
                return ageValue;
            }
            if (unitLower.startsWith('month')) {
                return ageValue / 12;
            }
            if (unitLower.startsWith('week')) {
                return ageValue / 52;
            }
            if (unitLower.startsWith('day')) {
                return ageValue / 365;
            }
            
            return null;
        };
    }
    
    // Enhanced data processing that works with both systems
    window.processAEFIData = function(data) {
        if (!Array.isArray(data)) return [];
        
        return data.map(row => {
            const processed = { ...row };
            
            // Normalize age if not already done
            if (row.Age && row['Age unit'] && !row.NormalizedAge) {
                processed.NormalizedAge = normalizeAge(row.Age, row['Age unit']);
            }
            
            // Ensure Sex is normalized
            if (row.Sex && typeof row.Sex === 'string') {
                const sexLower = row.Sex.toLowerCase().trim();
                if (sexLower.startsWith('m')) processed.Sex = 'Male';
                else if (sexLower.startsWith('f')) processed.Sex = 'Female';
                else processed.Sex = 'Unknown';
            }
            
            return processed;
        });
    };
    
    console.log('Compatibility bridge loaded successfully');
})();