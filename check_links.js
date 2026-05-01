
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getFiles(dir, files = []) {
  fs.readdirSync(dir).forEach(file => {
    let name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else {
      files.push(path.relative('/public', name).replace(/\\/g, '/'));
    }
  });
  return files;
}

const publicFiles = getFiles('/public');
const grepOutput = execSync('grep -rI "/gifs/" src').toString();
const refs = [...new Set(grepOutput.match(/\/gifs\/[a-zA-Z0-9._() -]+/g))];

refs.forEach(ref => {
  const filePath = ref.replace('/gifs/', 'gifs/');
  if (!publicFiles.includes(filePath)) {
    console.log(`BROKEN REFERENCE: ${ref} (looking for /public/${filePath})`);
  }
});
