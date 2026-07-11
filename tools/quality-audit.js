#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const root = path.resolve(__dirname, '..');
const RELEASE = '20260711-quality-gate-v100';
const results = [];

function file(name) { return path.join(root, name); }
function exists(name) { return fs.existsSync(file(name)); }
function read(name) { return fs.readFileSync(file(name), 'utf8'); }
function pass(name, details = '') { results.push({ ok: true, name, details }); }
function fail(name, details = '') { results.push({ ok: false, name, details }); }
function assertCheck(condition, name, details = '') { condition ? pass(name, details) : fail(name, details); }

function run(command, args) {
  const res = childProcess.spawnSync(command, args, { cwd: root, encoding: 'utf8' });
  if (res.status !== 0) throw new Error((res.stderr || res.stdout || `${command} failed`).trim());
}

function stripHtmlComments(s) { return s.replace(/<!--([\s\S]*?)-->/g, ''); }
function unique(arr) { return Array.from(new Set(arr)); }

function parsePngSize(filename) {
  const buf = fs.readFileSync(file(filename));
  const signature = '89504e470d0a1a0a';
  if (buf.subarray(0, 8).toString('hex') !== signature) throw new Error(`${filename} is not a PNG`);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

try { run(process.execPath, ['--check', 'script.js']); pass('script.js syntax'); }
catch (error) { fail('script.js syntax', error.message); }

try { run(process.execPath, ['--check', 'service-worker.js']); pass('service-worker.js syntax'); }
catch (error) { fail('service-worker.js syntax', error.message); }

for (const jsonFile of ['firebase.json', 'manifest.webmanifest', 'package.json']) {
  try { JSON.parse(read(jsonFile)); pass(`${jsonFile} valid JSON`); }
  catch (error) { fail(`${jsonFile} valid JSON`, error.message); }
}

for (const required of [
  'index.html', 'style.css', 'script.js', 'service-worker.js', 'firebase-config.js',
  'firebase.json', 'firestore.rules', 'manifest.webmanifest', 'favicon.png',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-192-maskable.png', 'icons/icon-512-maskable.png',
  'README.md', 'FIREBASE_AND_GITHUB_SETUP.md', 'FREE_STUDENT_ACCOUNTS_SETUP.md', 'UPLOAD_THIS_FIRST.txt'
]) {
  assertCheck(exists(required), `required file present: ${required}`);
}

const html = exists('index.html') ? read('index.html') : '';
const ids = Array.from(html.matchAll(/\bid\s*=\s*(["'])([^"']+)\1/g)).map(m => m[2]);
const duplicateIds = unique(ids.filter((id, idx) => ids.indexOf(id) !== idx));
assertCheck(duplicateIds.length === 0, 'HTML duplicate IDs', duplicateIds.join(', '));

const refs = [];
for (const m of html.matchAll(/\b(?:src|href)\s*=\s*(["'])([^"']+)\1/g)) {
  const ref = m[2].split('?')[0].split('#')[0];
  if (!ref || /^(https?:|mailto:|tel:|data:|blob:|#)/i.test(ref)) continue;
  if (ref === './') continue;
  refs.push(ref.replace(/^\.\//, ''));
}
const missingRefs = unique(refs.filter(ref => !exists(ref)));
assertCheck(missingRefs.length === 0, 'HTML local asset references exist', missingRefs.join(', '));

const css = exists('style.css') ? read('style.css') : '';
let braceBalance = 0;
let cssMinBalance = 0;
for (const ch of css) {
  if (ch === '{') braceBalance += 1;
  if (ch === '}') braceBalance -= 1;
  cssMinBalance = Math.min(cssMinBalance, braceBalance);
}
assertCheck(braceBalance === 0 && cssMinBalance >= 0, 'CSS brace balance', `balance=${braceBalance}`);
assertCheck(/@media\s*\(max-width:\s*820px\)/.test(css), 'mobile responsive rules present');
assertCheck(/prefers-reduced-motion/.test(css), 'reduced-motion CSS present');
assertCheck(/forced-colors/.test(css), 'forced-colors CSS present');

const script = exists('script.js') ? read('script.js') : '';
const functions = Array.from(script.matchAll(/(^|\n)function\s+([A-Za-z0-9_$]+)\s*\(/g)).map(m => m[2]);
const duplicateFunctions = unique(functions.filter((name, idx) => functions.indexOf(name) !== idx));
assertCheck(duplicateFunctions.length === 0, 'no duplicate function declarations', duplicateFunctions.join(', '));
assertCheck(script.includes('installQualityGateDiagnostics'), 'quality gate diagnostics installed');
assertCheck(script.includes('MCS_RUN_HEALTH_CHECK'), 'manual health check hook available');
assertCheck(script.includes('checkStoragePressure'), 'storage pressure check installed');
assertCheck(script.includes('flushStudentProjectSave'), 'student save flush function present');
assertCheck(script.includes('persistStudentProjectRecoverySnapshot'), 'local recovery snapshots present');
assertCheck(script.includes('registerPWAServiceWorker') && script.includes('updatefound'), 'PWA update detection present');

const sw = exists('service-worker.js') ? read('service-worker.js') : '';
const swAssets = Array.from(sw.matchAll(/'\.\/([^']+)'/g)).map(m => m[1]).filter(Boolean);
const missingSwAssets = unique(swAssets.filter(asset => asset !== '' && !exists(asset)));
assertCheck(missingSwAssets.length === 0, 'service worker cached assets exist', missingSwAssets.join(', '));
assertCheck(sw.includes(RELEASE), 'service worker release label matches');
assertCheck(sw.includes('Promise.allSettled'), 'service worker optional-cache hardening present');
assertCheck(sw.includes('networkFirst') && sw.includes('staleWhileRevalidate'), 'service worker caching strategies present');

const firebaseJson = exists('firebase.json') ? JSON.parse(read('firebase.json')) : {};
assertCheck(Boolean(firebaseJson.hosting && firebaseJson.firestore), 'firebase hosting and firestore configured');
assertCheck(!JSON.stringify(firebaseJson).includes('functions'), 'firebase.json stays free-only without functions');
assertCheck(JSON.stringify(firebaseJson).includes('X-Content-Type-Options'), 'Firebase hosting security headers present');

const rules = exists('firestore.rules') ? read('firestore.rules') : '';
assertCheck(rules.includes("request.auth.token.email == 'sirjr.mcsian@gmail.com'"), 'teacher email rule present');
assertCheck(rules.includes('sharedSessions'), 'collaboration rules present');
assertCheck(rules.includes('onlyOwnMemberRecordChanged'), 'collaboration member update restriction present');
assertCheck(rules.includes('studentRoster'), 'student roster rule present');
assertCheck(!rules.includes('allow read, write: if true'), 'no open Firestore write rule');

const config = exists('firebase-config.js') ? read('firebase-config.js') : '';
assertCheck(!/PASTE_|YOUR_|TODO/i.test(config), 'firebase config has no placeholder tokens');
assertCheck(config.includes('code-editor-f0f9d'), 'firebase config project id present');

try {
  const manifest = JSON.parse(read('manifest.webmanifest'));
  const icons = manifest.icons || [];
  const missingIconFiles = icons.map(icon => icon.src).filter(src => !exists(src));
  assertCheck(missingIconFiles.length === 0, 'manifest icon files exist', missingIconFiles.join(', '));
  assertCheck(icons.some(icon => String(icon.purpose).includes('maskable')), 'manifest has maskable icon');
  for (const icon of icons) {
    if (!icon.src || !exists(icon.src) || !/\.png$/i.test(icon.src)) continue;
    const size = parsePngSize(icon.src);
    const expected = Number(String(icon.sizes || '').split('x')[0]);
    if (expected) assertCheck(size.width === expected && size.height === expected, `icon size matches: ${icon.src}`, `${size.width}x${size.height}`);
  }
} catch (error) {
  fail('manifest icon audit', error.message);
}

const versionFiles = ['index.html', 'script.js', 'service-worker.js', 'README.md', 'STABILITY_AND_TEST_REPORT.md', 'VERSION.txt'].filter(exists);
const mismatched = versionFiles.filter(name => !read(name).includes(RELEASE));
assertCheck(mismatched.length === 0, 'release label consistent across core files', mismatched.join(', '));

const reportLines = results.map(item => `${item.ok ? 'PASS' : 'FAIL'} ${item.name}${item.details ? ` - ${item.details}` : ''}`);
console.log(reportLines.join('\n'));
const failed = results.filter(item => !item.ok);
if (failed.length) {
  console.error(`\nQuality audit failed: ${failed.length} issue(s).`);
  process.exit(1);
}
console.log(`\nQuality audit passed: ${results.length} checks.`);
