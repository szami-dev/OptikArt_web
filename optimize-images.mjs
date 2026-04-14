import imagemin from 'imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';
import { promises as fs } from 'fs';
import path from 'path';

// KONFIGURÁCIÓ
const INPUT_BASE = 'public/gallery';        // Innen indul az olvasás
const OUTPUT_BASE = 'public/gallery'; // Ide menti a struktúrát
async function processDirectory(relativeDir = '') {
  const currentInputDir = path.join(INPUT_BASE, relativeDir);
  const currentOutputDir = path.join(OUTPUT_BASE, relativeDir);

  // Alkönyvtárak és fájlok listázása
  const entries = await fs.readdir(currentInputDir, { withFileTypes: true });

  // 1. Fájlok optimalizálása ebben a mappában
  const filesInDir = entries
    .filter(e => e.isFile() && /\.(jpe?g|png)$/i.test(e.name))
    .map(e => path.join(currentInputDir, e.name).replace(/\\/g, '/'));

  if (filesInDir.length > 0) {
    console.log(`Processing: ${currentInputDir} -> ${currentOutputDir}`);
    await imagemin(filesInDir, {
      destination: currentOutputDir,
      plugins: [
        imageminMozjpeg({ quality: 60, progressive: true }),
        imageminPngquant({ quality: [0.6, 0.8] })
      ]
    });
  }

  // 2. Végigmegyünk az alkönyvtárakon (Rekurzió)
  const subDirs = entries.filter(e => e.isDirectory());
  for (const dir of subDirs) {
    await processDirectory(path.join(relativeDir, dir.name));
  }
}

const run = async () => {
  try {
    // Ellenőrizzük, létezik-e a forrás
    await fs.access(INPUT_BASE);
    
    console.log('--- Optimalizálás indítása ---');
    await processDirectory();
    console.log('--- KÉSZ! ---');
    console.log(`Az optimalizált fájlok itt vannak: ${OUTPUT_BASE}`);
  } catch (error) {
    console.error('Hiba történt:', error.message);
  }
};

run();