// js/vaccine_parser.js

const VACCINE_DICTIONARY_KEY = 'vaccineDictionary';

// A small, default list of keywords to bootstrap the learning process.
// These are keywords, not full names.
const DEFAULT_VACCINE_KEYWORDS = new Set([
    'diphtheria', 'tetanus', 'pertussis', 'hepatitis', 'haemophilus',
    'polio', 'pneumococcal', 'rotavirus', 'measles', 'mumps', 'rubella',
    'varicella', 'influenza', 'meningococcal', 'hpv', 'covid-19',
    'bcg', 'cholera', 'typhoid', 'rabies', 'yellow fever', 'japanese encephalitis'
]);

/**
 * Loads the learned vaccine dictionary from localStorage.
 * Falls back to a default set of keywords if nothing is stored.
 * @returns {Set<string>} The set of known vaccine names/keywords.
 */
function getVaccineDictionary() {
    try {
        const storedDictionary = localStorage.getItem(VACCINE_DICTIONARY_KEY);
        if (storedDictionary) {
            return new Set(JSON.parse(storedDictionary));
        }
    } catch (error) {
        console.error('Could not load vaccine dictionary from localStorage:', error);
    }
    return new Set(DEFAULT_VACCINE_KEYWORDS);
}

/**
 * Saves the vaccine dictionary to localStorage.
 * @param {Set<string>} dictionary The set of vaccine names/keywords to save.
 */
function saveVaccineDictionary(dictionary) {
    try {
        localStorage.setItem(VACCINE_DICTIONARY_KEY, JSON.stringify(Array.from(dictionary)));
    } catch (error) {
        console.error('Could not save vaccine dictionary to localStorage:', error);
    }
}

/**
 * Parses a vaccine field string into an array of distinct vaccine names.
 * Uses a high-confidence delimiter strategy first, then falls back to treating the whole string as one.
 * @param {string} vaccineField The raw string from the 'Vaccine' data field.
 * @returns {string[]} An array of cleaned, distinct vaccine names.
 */
function parseVaccineField(vaccineField) {
    if (!vaccineField || typeof vaccineField !== 'string') {
        return [];
    }

const highConfidenceSeparators = /[;\|\n]/; // Semicolon, pipe, or newline

    let vaccines = [];
    if (highConfidenceSeparators.test(vaccineField)) {
        // If we find a reliable separator, split by it.
        vaccines = vaccineField.split(highConfidenceSeparators);
    } else {
        // Otherwise, treat the whole string as one entry.
        // We avoid splitting by comma here to prevent errors with descriptive names.
        vaccines = [vaccineField];
    }

    // Always clean up the results
    return vaccines
        .map(vaccine => vaccine.trim())
        .filter(vaccine => vaccine); // Filter out any empty strings
}


/**
 * Iterates through the dataset to learn new vaccine names and grow the dictionary.
 * @param {Array<Object>} data The full dataset.
 * @param {Set<string>} dictionary The current vaccine dictionary.
 * @returns {Set<string>} The updated vaccine dictionary.
 */
function trainVaccineDictionary(data, dictionary) {
    const newDictionary = new Set(dictionary);

    data.forEach(row => {
        const vaccineField = row['Vaccine'];
        if (vaccineField && typeof vaccineField === 'string') {
            const parsedVaccines = parseVaccineField(vaccineField);
            parsedVaccines.forEach(vaccineName => {
                // A simple heuristic: if a parsed name is reasonably long and doesn't look like junk,
                // add it to the dictionary. We convert to lowercase for consistency.
                if (vaccineName.length > 3) {
                    newDictionary.add(vaccineName.toLowerCase());
                }
            });
        }
    });

    // Check if the dictionary has actually grown before saving
    if (newDictionary.size > dictionary.size) {
        saveVaccineDictionary(newDictionary);
        console.log(`Vaccine dictionary trained. New size: ${newDictionary.size}`);
    }

    return newDictionary;
}
