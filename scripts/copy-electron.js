const fs = require('fs-extra');
const path = require('path');

const sourcePath = path.resolve(__dirname, '../electron/main.js');
const destinationPath = path.resolve(__dirname, '../build/electron.js');

console.log(`Attempting to copy from ${sourcePath} to ${destinationPath}`);

fs.copy(sourcePath, destinationPath)
  .then(() => console.log('electron/main.js copied to build/electron.js successfully!'))
  .catch(err => {
    console.error('Error copying electron/main.js:', err);
    process.exit(1); // কপি করতে ব্যর্থ হলে এরর কোড সহ বন্ধ করুন
  });