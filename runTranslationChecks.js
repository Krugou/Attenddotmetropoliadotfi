const fs = require('fs');
const path = require('path');

// Updated function to extract translation keys from codebase
const extractTranslationKeys = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      extractTranslationKeys(filePath, fileList);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      const content = fs.readFileSync(filePath, 'utf-8');
      // Updated regex to capture namespace and key
      const regex = /t\(['"`](?:([^:'"`]+):)?([^'"`]+)['"`]\)/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        const namespace = match[1] || 'common'; // Default to 'common' if no namespace
        const key = match[2];
        fileList.push(`${namespace}:${key}`);
      }
    }
  });
  return fileList;
};

// Updated function to find missing translations
const findMissingTranslations = (keys, translations, namespace) => {
  return keys.filter((key) => {
    const [keyNamespace, keyPath] = key.split(':');
    if (keyNamespace !== namespace) return false;

    const keyParts = keyPath.split('.');
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

// Updated paths to include all namespace files
const getTranslationFiles = (lang) => ({
  common: path.join(__dirname, `./frontend/src/locales/${lang}/common.json`),
  admin: path.join(__dirname, `./frontend/src/locales/${lang}/admin.json`),
  student: path.join(__dirname, `./frontend/src/locales/${lang}/student.json`),
  teacher: path.join(__dirname, `./frontend/src/locales/${lang}/teacher.json`),
  counselor: path.join(
    __dirname,
    `./frontend/src/locales/${lang}/counselor.json`,
  ),
  noUser: path.join(__dirname, `./frontend/src/locales/${lang}/noUser.json`),
});

// Load translations for each namespace
const loadTranslations = (lang) => {
  const files = getTranslationFiles(lang);
  const translations = {};

  Object.entries(files).forEach(([namespace, filePath]) => {
    try {
      if (fs.existsSync(filePath)) {
        translations[namespace] = require(filePath);
      }
    } catch (error) {
      console.error(
        `Error loading ${lang} ${namespace} translations:`,
        error.message,
      );
    }
  });

  return translations;
};

// Extract used translation keys from codebase
const codebaseDir = path.join(__dirname, 'frontend/src');
const usedTranslationKeys = extractTranslationKeys(codebaseDir);
const uniqueUsedTranslationKeys = [...new Set(usedTranslationKeys)];

// Load all translations
const enTranslations = loadTranslations('en');
const fiTranslations = loadTranslations('fi');
const svTranslations = loadTranslations('sv');

// Check for missing translations in each namespace
const namespaces = [
  'common',
  'admin',
  'student',
  'teacher',
  'counselor',
  'noUser',
];
const results = {
  missing: {
    en: {},
    fi: {},
    sv: {},
  },
  unused: {
    en: {},
    fi: {},
    sv: {},
  },
};

namespaces.forEach((namespace) => {
  results.missing.en[namespace] = findMissingTranslations(
    uniqueUsedTranslationKeys,
    enTranslations[namespace] || {},
    namespace,
  );
  results.missing.fi[namespace] = findMissingTranslations(
    uniqueUsedTranslationKeys,
    fiTranslations[namespace] || {},
    namespace,
  );
  results.missing.sv[namespace] = findMissingTranslations(
    uniqueUsedTranslationKeys,
    svTranslations[namespace] || {},
    namespace,
  );
});

// Write results to a JavaScript file
const resultsDir = path.join(__dirname, 'translationCheckResult');
const resultsFilePath = path.join(resultsDir, 'translationResults.js');

// Ensure the directory exists
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir);
}

// Format results for output
const formattedResults = {
  missing: {
    en: Object.fromEntries(
      Object.entries(results.missing.en).filter(([_, v]) => v.length > 0),
    ),
    fi: Object.fromEntries(
      Object.entries(results.missing.fi).filter(([_, v]) => v.length > 0),
    ),
    sv: Object.fromEntries(
      Object.entries(results.missing.sv).filter(([_, v]) => v.length > 0),
    ),
  },
};

fs.writeFileSync(
  resultsFilePath,
  `module.exports = ${JSON.stringify(formattedResults, null, 2)};`,
);

console.log('Results written to translationResults.js');
