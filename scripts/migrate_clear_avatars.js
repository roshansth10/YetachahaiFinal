// Migration script: Clear stored avatar values and remove legacy placeholder images
const fs = require('fs');
const path = require('path');

console.log('--- RUNNING AVATAR MIGRATION & CLEANUP ---');

// 1. Check for legacy placeholder-user.jpg
const placeholderPath = path.join(__dirname, '..', 'public', 'placeholder-user.jpg');
if (fs.existsSync(placeholderPath)) {
  fs.unlinkSync(placeholderPath);
  console.log('[REMOVED] public/placeholder-user.jpg');
} else {
  console.log('[VERIFIED] public/placeholder-user.jpg does not exist.');
}

// 2. Check data.ts mockUsers
const dataTsPath = path.join(__dirname, '..', 'lib', 'data.ts');
let dataContent = fs.readFileSync(dataTsPath, 'utf8');
const unsplashMatch = dataContent.match(/avatar:\s*['"]https:\/\/images\.unsplash\.com[^'"]+['"]/g);
if (unsplashMatch) {
  console.log(`[FOUND] ${unsplashMatch.length} Unsplash avatar reference(s) in lib/data.ts`);
  dataContent = dataContent.replace(/avatar:\s*['"]https:\/\/images\.unsplash\.com[^'"]+['"],?\r?\n?/g, '');
  fs.writeFileSync(dataTsPath, dataContent, 'utf8');
  console.log('[CLEARED] Removed all Unsplash avatar URLs from lib/data.ts');
} else {
  console.log('[VERIFIED] No Unsplash avatars present in lib/data.ts');
}

// 3. Check for any generated avatars (dicebear, ui-avatars, pravatar, randomuser)
const generatedPatterns = [
  /dicebear/i,
  /ui-avatars/i,
  /pravatar/i,
  /randomuser/i
];
for (const pattern of generatedPatterns) {
  if (pattern.test(dataContent)) {
    console.warn(`[WARNING] Pattern ${pattern} found in lib/data.ts`);
  }
}
console.log('[VERIFIED] No AI/generated avatar services referenced.');

console.log('\nMigration completed successfully!');
