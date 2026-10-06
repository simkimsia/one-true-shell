// Reads Playwright's JSON report and updates features.json.
// Exit code 0 = every feature passes, 3 = some still failing.
import fs from 'node:fs';

const [reportPath = 'conformance/results.json', featuresPath = 'features.json'] = process.argv.slice(2);
const features = JSON.parse(fs.readFileSync(featuresPath, 'utf8'));
const results = {};

if (fs.existsSync(reportPath)) {
  const walk = (suite) => {
    for (const spec of suite.specs || []) {
      const id = spec.title.split(' ')[0];
      results[id] = spec.ok === true;
    }
    for (const child of suite.suites || []) walk(child);
  };
  walk(JSON.parse(fs.readFileSync(reportPath, 'utf8')));
}

for (const f of features) f.passes = results[f.id] === true;
fs.writeFileSync(featuresPath, JSON.stringify(features, null, 2) + '\n');

const passing = features.filter((f) => f.passes).length;
const failing = features.filter((f) => !f.passes).map((f) => f.id);
console.log(`conformance: ${passing}/${features.length} passing` + (failing.length ? ` | failing: ${failing.join(' ')}` : ''));
process.exit(failing.length === 0 ? 0 : 3);
