const { execSync } = require('child_process');

console.log('--- Committing & Pushing Frontend (coastline-) ---');
try {
  execSync('git add -A', { stdio: 'inherit' });
  execSync('git commit -m "feat(crm): add duplicate merge UI, searchable accounts filter, and 360 timeline enhancements"', { stdio: 'inherit' });
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('Frontend pushed successfully to origin/main.');
} catch (err) {
  console.error('Frontend commit/push error:', err.message);
  process.exit(1);
}
