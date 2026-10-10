const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const assetsDir = path.join(__dirname, '..', 'public', 'assets');
const files = fs.readdirSync(assetsDir);
const imgFiles = files.filter(f => /\.(jpg|jpeg|png)$/i.test(f)).filter(f => {
  const baseName = f.substring(0, f.lastIndexOf('.'));
  return !fs.existsSync(path.join(assetsDir, `${baseName}.webp`));
});

console.log(`Found ${imgFiles.length} new images to convert to webp.`);

async function convertAll() {
  const converted = [];
  for (const file of imgFiles) {
    const inputPath = path.join(assetsDir, file);
    const baseName = file.substring(0, file.lastIndexOf('.'));
    const outputPath = path.join(assetsDir, `${baseName}.webp`);
    
    try {
      await sharp(inputPath)
        .webp({ quality: 85 })
        .toFile(outputPath);
      
      const inStat = fs.statSync(inputPath);
      const outStat = fs.statSync(outputPath);
      const saving = (((inStat.size - outStat.size) / inStat.size) * 100).toFixed(1);
      console.log(`Converted: ${file} (${(inStat.size/1024).toFixed(0)}KB) -> ${baseName}.webp (${(outStat.size/1024).toFixed(0)}KB, -${saving}%)`);
      converted.push({ oldFile: file, newFile: `${baseName}.webp`, baseName });
    } catch (err) {
      console.error(`Error converting ${file}:`, err.message);
    }
  }

  console.log(`Successfully converted ${converted.length} images.`);
  return converted;
}

convertAll().catch(console.error);
