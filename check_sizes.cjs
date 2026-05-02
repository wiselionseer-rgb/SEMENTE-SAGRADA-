const fs = require('fs');
const path = require('path');

function checkSizes(dir, maxSizeMB) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      checkSizes(fullPath, maxSizeMB);
    } else {
      const sizeMB = stat.size / (1024 * 1024);
      if (sizeMB > maxSizeMB) {
        console.log(`LARGE FILE: ${fullPath} (${sizeMB.toFixed(2)} MB)`);
      }
    }
  }
}

checkSizes('./public', 1); // Check for files larger than 1MB
console.log('Checked for large files.');
