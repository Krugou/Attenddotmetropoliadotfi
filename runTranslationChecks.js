const fs = require('fs');
const path = require('path');

// Function to extract translation keys from codebase
const extractTranslationKeys = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      extractTranslationKeys(filePath, fileList);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const regex = /t\(['"`]([^'"`]+)['"`]\)/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        fileList.push(match[1]);
      }
    }
  });
  return fileList;
};

// Function to find missing translations
const findMissingTranslations = (keys, translations) => {
  return keys.filter((key) => {
    const keyParts = key.split('.');
    let current = translations;
    for (const part of keyParts) {
      if (current[part] === undefined) {
        return true;
      }
      current = current[part];
    }
    return false;
  });
};

// Function to find unused translations
const findUnusedTranslations = (translationKeys, usedTranslationKeys) => {
  return translationKeys.filter((key) => !usedTranslationKeys.includes(key));
};

// Paths to translation files
const enTranslationFilePath = path.join(
  __dirname,
  './frontend/src/locales/en/translation.json',
);
const fiTranslationFilePath = path.join(
  __dirname,
  './frontend/src/locales/fi/translation.json',
);
const svTranslationFilePath = path.join(
  __dirname,
  './frontend/src/locales/sv/translation.json',
);

// Extract translation keys from JSON files
const extractTranslationKeysFromFile = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`Warning: Translation file not found: ${filePath}`);
      return [];
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    if (!content || content.trim() === '') {
      console.warn(`Warning: Empty translation file: ${filePath}`);
      return [];
    }

    const keys = [];
    const traverse = (obj, prefix = '') => {
      for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          traverse(obj[key], fullKey);
        } else {
          keys.push(fullKey);
        }
      }
    };

    try {
      const parsed = JSON.parse(content);
      traverse(parsed);
      return keys;
    } catch (parseError) {
      console.error(`Error parsing JSON in ${filePath}:`, parseError.message);
      return [];
    }
  } catch (error) {
    console.error(`Error reading translation file ${filePath}:`, error.message);
    return [];
  }
};

const enTranslationKeys = extractTranslationKeysFromFile(enTranslationFilePath);
const fiTranslationKeys = extractTranslationKeysFromFile(fiTranslationFilePath);
const svTranslationKeys = extractTranslationKeysFromFile(svTranslationFilePath);

// Extract used translation keys from codebase
const codebaseDir = path.join(__dirname, 'frontend/src');
const usedTranslationKeys = extractTranslationKeys(codebaseDir);
const uniqueUsedTranslationKeys = [...new Set(usedTranslationKeys)];

// Find missing translations
let enTranslation = {},
  fiTranslation = {},
  svTranslation = {};

try {
  if (fs.existsSync(enTranslationFilePath)) {
    enTranslation = require(enTranslationFilePath);
  }
  if (fs.existsSync(fiTranslationFilePath)) {
    fiTranslation = require(fiTranslationFilePath);
  }
  if (fs.existsSync(svTranslationFilePath)) {
    svTranslation = require(svTranslationFilePath);
  }
} catch (error) {
  console.error('Error loading translation files:', error.message);
}

const missingInEn = findMissingTranslations(
  uniqueUsedTranslationKeys,
  enTranslation,
);
const missingInFi = findMissingTranslations(
  uniqueUsedTranslationKeys,
  fiTranslation,
);
const missingInSv = findMissingTranslations(
  uniqueUsedTranslationKeys,
  svTranslation,
);

// Find unused translations
const unusedEnTranslationKeys = findUnusedTranslations(
  enTranslationKeys,
  uniqueUsedTranslationKeys,
);
const unusedFiTranslationKeys = findUnusedTranslations(
  fiTranslationKeys,
  uniqueUsedTranslationKeys,
);
const unusedSvTranslationKeys = findUnusedTranslations(
  svTranslationKeys,
  uniqueUsedTranslationKeys,
);

// Write results to a JavaScript file
const results = {
  missingInEn,
  missingInFi,
  missingInSv,
  unusedEnTranslationKeys,
  unusedFiTranslationKeys,
  unusedSvTranslationKeys,
};

const resultsDir = path.join(__dirname, 'translationCheckResult');
const resultsFilePath = path.join(resultsDir, 'translationResults.js');

// Ensure the directory exists
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir);
}

fs.writeFileSync(
  resultsFilePath,
  `module.exports = ${JSON.stringify(results, null, 2)};`,
);

console.log('Results written to translationResults.js');
