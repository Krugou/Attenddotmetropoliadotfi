const fs = require('fs');
const path = require('path');
const semver = require('semver');

// List of directories containing package.json files
const packageDirs = ['./', './frontend', './backend'];

// Function to bump the version
const bumpVersion = (version, releaseType) => {
  return semver.inc(version, releaseType);
};

// Function to update package.json
const updatePackageJson = (dir, releaseType) => {
  const packageJsonPath = path.join(dir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  const oldVersion = packageJson.version;
  const newVersion = bumpVersion(oldVersion, releaseType);

  packageJson.version = newVersion;

  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2) + '\n',
  );
  console.log(`Updated ${packageJsonPath} from ${oldVersion} to ${newVersion}`);
};

// Main function to iterate over directories and update versions
const main = (releaseType) => {
  packageDirs.forEach((dir) => {
    updatePackageJson(dir, releaseType);
  });
};

// Get the release type from command line arguments (patch, minor, major)
const releaseType = process.argv[2] || 'patch';

main(releaseType);
