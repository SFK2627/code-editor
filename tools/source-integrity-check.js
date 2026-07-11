#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const root = path.resolve(__dirname, '..');
const results = [];
function file(name) { return path.join(root, name); }
function exists(name) { return fs.existsSync(file(name)); }
function read(name) { return fs.readFileSync(file(name), 'utf8'); }
function pass(name, details = '') { results.push({ ok: true, name, details }); }
function fail(name, details = '') { results.push({ ok: false, name, details }); }
function check(condition, name, details = '') { condition ? pass(name, details) : fail(name, details); }
function list(dir, ext) {
  const full = file(dir);
  return fs.existsSync(full) ? fs.readdirSync(full).filter(name => name.endsWith(ext)).sort((a,b)=>a.localeCompare(b, undefined, { numeric: true })) : [];
}
function lineCount(text) { return text.split('\n').length - (text.endsWith('\n') ? 1 : 0); }
function run(command, args) {
  const res = childProcess.spawnSync(command, args, { cwd: root, encoding: 'utf8' });
  if (res.status !== 0) throw new Error((res.stderr || res.stdout || `${command} failed`).trim());
}

try {
  check(exists('src/module-manifest.json'), 'module manifest present');
  check(exists('src/js'), 'JavaScript source directory present');
  check(exists('styles'), 'CSS source directory present');
  check(exists('tools/build-app.js'), 'build script present');

  const jsFiles = list('src/js', '.js');
  const cssFiles = list('styles', '.css');
  check(jsFiles.length >= 16, 'JavaScript split into focused modules', `${jsFiles.length} modules`);
  check(cssFiles.length >= 22, 'CSS split into focused modules', `${cssFiles.length} modules`);

  const oversizedJs = jsFiles
    .map(name => ({ name, lines: lineCount(read(path.join('src/js', name))) }))
    .filter(item => item.lines > 1800);
  check(oversizedJs.length === 0, 'JS module size guard', oversizedJs.map(item => `${item.name}:${item.lines}`).join(', '));

  const oversizedCss = cssFiles
    .map(name => ({ name, lines: lineCount(read(path.join('styles', name))) }))
    .filter(item => item.lines > 1800);
  check(oversizedCss.length === 0, 'CSS module size guard', oversizedCss.map(item => `${item.name}:${item.lines}`).join(', '));

  for (const name of jsFiles) {
    try { run(process.execPath, ['--check', path.join('src/js', name)]); }
    catch (error) { fail(`JS source syntax: ${name}`, error.message); }
  }
  if (!results.some(item => item.name.startsWith('JS source syntax') && !item.ok)) pass('all JS source modules pass syntax check');

  const builtJs = jsFiles.map(name => read(path.join('src/js', name))).join('');
  const builtCss = cssFiles.map(name => read(path.join('styles', name))).join('');
  check(builtJs === read('script.js'), 'script.js generated from src/js');
  check(builtCss === read('style.css'), 'style.css generated from styles');

  const pkg = JSON.parse(read('package.json'));
  check(Boolean(pkg.scripts && pkg.scripts.build), 'package build script available');
  check(Boolean(pkg.scripts && pkg.scripts['build:check']), 'package build check script available');
  check(Boolean(pkg.scripts && pkg.scripts['check:source']), 'package source check script available');
  check(String(pkg.version).includes('maintainability'), 'package version marks maintainability release', pkg.version);

  check(exists('APP_ARCHITECTURE.md'), 'architecture guide present');
  check(exists('MAINTAINABILITY_95_REPORT.md'), 'maintainability report present');
  check(read('APP_ARCHITECTURE.md').includes('src/js') && read('APP_ARCHITECTURE.md').includes('styles'), 'architecture guide maps source folders');
  check(read('MAINTAINABILITY_95_REPORT.md').includes('95'), 'maintainability report records target');
  check(exists('MOBILE_EXPERIENCE_100_REPORT.md'), 'mobile experience report present');
  check(jsFiles.includes('100-mobile-experience-controller.js'), 'mobile experience JS controller present');
  check(cssFiles.includes('210-mobile-experience-100.css'), 'mobile experience CSS layer present');
  check(jsFiles.includes('110-overall-readiness-check.js'), 'overall readiness JS module present');
  check(cssFiles.includes('220-overall-100-readiness.css'), 'overall readiness CSS layer present');
  check(exists('OVERALL_100_READINESS_REPORT.md'), 'overall 100-readiness report present');
} catch (error) {
  fail('source integrity check crashed', error.message);
}

console.log(results.map(item => `${item.ok ? 'PASS' : 'FAIL'} ${item.name}${item.details ? ` - ${item.details}` : ''}`).join('\n'));
const failed = results.filter(item => !item.ok);
if (failed.length) {
  console.error(`\nSource integrity failed: ${failed.length} issue(s).`);
  process.exit(1);
}
console.log(`\nSource integrity passed: ${results.length} checks.`);
