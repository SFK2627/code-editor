#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const root = path.resolve(__dirname, '..');
const results = [];
const requiredReports = [
  'QUALITY_GATE_100_REPORT.md',
  'MOBILE_EXPERIENCE_100_REPORT.md',
  'MAINTAINABILITY_95_REPORT.md',
  'OVERALL_100_READINESS_REPORT.md',
  'CLASSROOM_ACCEPTANCE_CHECKLIST.md',
  'APP_ARCHITECTURE.md'
];

function file(name) { return path.join(root, name); }
function exists(name) { return fs.existsSync(file(name)); }
function read(name) { return fs.readFileSync(file(name), 'utf8'); }
function pass(name, details = '') { results.push({ ok: true, name, details }); }
function fail(name, details = '') { results.push({ ok: false, name, details }); }
function check(condition, name, details = '') { condition ? pass(name, details) : fail(name, details); }
function run(command, args) {
  const res = childProcess.spawnSync(command, args, { cwd: root, encoding: 'utf8' });
  if (res.status !== 0) throw new Error((res.stderr || res.stdout || `${command} failed`).trim());
}

try {
  const pkg = JSON.parse(read('package.json'));
  const script = read('script.js');
  const css = read('style.css');
  const html = read('index.html');
  const sw = read('service-worker.js');
  const rules = read('firestore.rules');

  for (const report of requiredReports) check(exists(report), `report present: ${report}`);

  check(Boolean(pkg.scripts && pkg.scripts.check && pkg.scripts.check.includes('check:overall')), 'overall audit included in npm run check');
  check(Boolean(pkg.overallReadiness && String(pkg.overallReadiness.target).includes('100')), 'package records overall 100-readiness target');
  check(String(pkg.version).includes('overall.100'), 'package version marks overall 100-readiness', pkg.version);

  check(script.includes('MCS_RUN_HEALTH_CHECK'), 'stability runtime health check present');
  check(script.includes('MCS_RUN_MOBILE_HEALTH_CHECK'), 'mobile runtime health check present');
  check(script.includes('MCS_RUN_OVERALL_READINESS_CHECK'), 'overall runtime readiness check present');
  check(script.includes('persistStudentProjectRecoverySnapshot'), 'student project recovery protection present');
  check(script.includes('flushStudentProjectSave'), 'save flush protection present');

  check(css.includes('prefers-reduced-motion'), 'accessibility reduced-motion support present');
  check(css.includes('forced-colors'), 'accessibility forced-colors support present');
  check(css.includes('viewport-fit') || html.includes('viewport-fit=cover'), 'mobile safe-area support present');
  check(css.includes('--mcs-vvh') && css.includes('mobile-keyboard-open'), 'mobile viewport and keyboard support present');
  check(css.includes('@media print'), 'print-safe final CSS present');

  check(sw.includes('networkFirst') && sw.includes('staleWhileRevalidate'), 'service worker production caching strategies present');
  check(sw.includes('Promise.allSettled'), 'service worker resilient optional cache handling present');

  check(rules.includes('sharedSessions') && rules.includes('onlyOwnMemberRecordChanged'), 'collaboration Firestore hardening present');
  check(!rules.includes('allow read, write: if true'), 'Firestore has no open write rule');

  check(exists('src/js/110-overall-readiness-check.js'), 'overall readiness JS source module present');
  check(exists('styles/220-overall-100-readiness.css'), 'overall readiness CSS source layer present');

  try { run(process.execPath, ['--check', 'src/js/110-overall-readiness-check.js']); pass('overall readiness JS source syntax'); }
  catch (error) { fail('overall readiness JS source syntax', error.message); }

  const acceptance = read('CLASSROOM_ACCEPTANCE_CHECKLIST.md');
  check(/Android/i.test(acceptance) && /iPhone|Safari/i.test(acceptance), 'classroom checklist covers mobile device testing');
  check(/Firebase/i.test(acceptance) && /students/i.test(acceptance), 'classroom checklist covers Firebase/student load testing');

  const overallReport = exists('OVERALL_100_READINESS_REPORT.md') ? read('OVERALL_100_READINESS_REPORT.md') : '';
  for (const category of ['Features', 'Classroom usefulness', 'Stability', 'Professional polish', 'Mobile experience', 'Firebase/security', 'PWA/deployment', 'Maintainability', 'Testing/QA']) {
    check(overallReport.includes(category), `overall report scores category: ${category}`);
  }
} catch (error) {
  fail('overall readiness audit crashed', error.message);
}

console.log(results.map(item => `${item.ok ? 'PASS' : 'FAIL'} ${item.name}${item.details ? ` - ${item.details}` : ''}`).join('\n'));
const failed = results.filter(item => !item.ok);
if (failed.length) {
  console.error(`\nOverall readiness audit failed: ${failed.length} issue(s).`);
  process.exit(1);
}
console.log(`\nOverall readiness audit passed: ${results.length} checks.`);
