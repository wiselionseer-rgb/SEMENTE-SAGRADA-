const fs = require('fs');
const path = require('path');

const gifsDir = path.join(__dirname, 'public', 'gifs');
const imagesDir = path.join(__dirname, 'public', 'images');
const srcDir = path.join(__dirname, 'src');

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

const files = fs.readdirSync(gifsDir);
const imageExts = ['.jpg', '.jpeg', '.png'];

const movedFiles = [];

files.forEach(file => {
  const ext = path.extname(file).toLowerCase();
  if (imageExts.includes(ext)) {
    fs.renameSync(path.join(gifsDir, file), path.join(imagesDir, file));
    movedFiles.push(file);
  }
});

function readFilesRecursively(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(readFilesRecursively(file));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const sourceFiles = readFilesRecursively(srcDir);

sourceFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  movedFiles.forEach(movedFile => {
    const regex = new RegExp(`/gifs/${movedFile.replace(/\./g, '\\.')}`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, `/images/${movedFile}`);
      changed = true;
    }
    
    // special cases for floating references
    if (['wilian-1.jpg', 'suporte-juridico-compressed.jpg', 'whisk_compressed.jpg'].includes(movedFile)) {
       const directRegex = new RegExp(`"/${movedFile.replace(/\./g, '\\.')}"`, 'g');
       if (directRegex.test(content)) {
          content = content.replace(directRegex, `"/images/${movedFile}"`);
          changed = true;
       }
    }
  });
  
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated references in ${file}`);
  }
});

console.log('Moved files:', movedFiles.length);
