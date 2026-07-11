#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const checkOnly = process.argv.includes('--check');

function readUtf8(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function listOrderedFiles(dir, extension) {
  const fullDir = path.join(root, dir);
  if (!fs.existsSync(fullDir)) throw new Error(`Missing source directory: ${dir}`);
  return fs.readdirSync(fullDir)
    .filter(name => name.endsWith(extension))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map(name => path.join(fullDir, name));
}

function buildFromSources(dir, extension) {
  return listOrderedFiles(dir, extension).map(readUtf8).join('');
}

function writeOrCheck(outputFile, builtContent) {
  const outputPath = path.join(root, outputFile);
  if (checkOnly) {
    const current = readUtf8(outputPath);
    if (current !== builtContent) {
      throw new Error(`${outputFile} is not in sync with source modules. Run: npm run build`);
    }
    console.log(`PASS ${outputFile} matches source modules`);
    return;
  }
  fs.writeFileSync(outputPath, builtContent, 'utf8');
  console.log(`Built ${outputFile}`);
}

try {
  writeOrCheck('script.js', buildFromSources('src/js', '.js'));
  writeOrCheck('style.css', buildFromSources('styles', '.css'));
  console.log(checkOnly ? 'Build check passed.' : 'Build complete.');
} catch (error) {
  console.error(`Build failed: ${error.message}`);
  process.exit(1);
}
