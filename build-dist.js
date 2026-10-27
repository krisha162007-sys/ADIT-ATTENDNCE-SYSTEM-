// build-dist.js
// Cross-platform asset synchronization for Vercel and local production builds

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = __dirname;
const distDir = path.join(rootDir, 'dist');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log('--- Starting Production Distribution Packaging ---');

// 1. Copy app-bundle.js to dist
const appBundleSrc = path.join(rootDir, 'app-bundle.js');
const appBundleDest = path.join(distDir, 'app-bundle.js');
if (fs.existsSync(appBundleSrc)) {
  fs.copyFileSync(appBundleSrc, appBundleDest);
  const stats = fs.statSync(appBundleDest);
  console.log(`✓ Copied app-bundle.js to dist (${stats.size.toLocaleString()} bytes)`);
} else {
  console.error('ERROR: app-bundle.js not found in project root!');
  process.exit(1);
}

// 2. Copy libs/ directory to dist/libs
const libsSrc = path.join(rootDir, 'libs');
const libsDest = path.join(distDir, 'libs');
if (fs.existsSync(libsSrc)) {
  copyRecursiveSync(libsSrc, libsDest);
  const libFiles = fs.readdirSync(libsDest);
  console.log(`✓ Copied libs directory to dist (${libFiles.length} files)`);
} else {
  console.error('ERROR: libs directory not found in project root!');
  process.exit(1);
}

// 3. Copy public assets (favicon.svg, icons.svg) to dist root if not already there
const publicDir = path.join(rootDir, 'public');
if (fs.existsSync(publicDir)) {
  copyRecursiveSync(publicDir, distDir);
  console.log('✓ Copied public assets to dist root');
}

// 4. Ensure cleanup_session.html is in dist
const cleanupSrc = path.join(rootDir, 'cleanup_session.html');
const cleanupDest = path.join(distDir, 'cleanup_session.html');
if (fs.existsSync(cleanupSrc)) {
  fs.copyFileSync(cleanupSrc, cleanupDest);
  console.log('✓ Copied cleanup_session.html to dist');
}

// 5. Ensure index.html in dist has correct links
const distIndex = path.join(distDir, 'index.html');
if (!fs.existsSync(distIndex)) {
  const rootIndex = path.join(rootDir, 'index.html');
  fs.copyFileSync(rootIndex, distIndex);
  console.log('✓ Copied root index.html to dist/index.html');
}

console.log('--- Production Distribution Packaging Completed Successfully ---');
