#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FRONTEND_BUILD_DIR = path.join(__dirname, '..', 'build');
const PYTHON_STATIC_DIR = path.join(__dirname, '..', '..', 'sdk', 'python', 'kfp', 'ui', 'static');

function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

function copyBuildToPython() {
  console.log('🔄 Syncing frontend build to Python package...');
  
  if (!fs.existsSync(FRONTEND_BUILD_DIR)) {
    console.error('❌ Build directory not found. Run "npm run build" first.');
    process.exit(1);
  }
  
  ensureDirectoryExists(PYTHON_STATIC_DIR);
  
  try {
    execSync(`cp -r ${FRONTEND_BUILD_DIR}/* ${PYTHON_STATIC_DIR}/`, { stdio: 'inherit' });
    console.log('✅ Frontend assets synced to Python package successfully!');
    
    const files = fs.readdirSync(PYTHON_STATIC_DIR);
    console.log(`📁 Copied files: ${files.join(', ')}`);
    
  } catch (error) {
    console.error('❌ Failed to sync assets:', error.message);
    process.exit(1);
  }
}

function buildAndSync() {
  console.log('🏗️  Building frontend...');
  try {
    execSync('npm run build', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    copyBuildToPython();
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'copy':
      copyBuildToPython();
      break;
    case 'build-and-sync':
    default:
      buildAndSync();
      break;
  }
}

module.exports = { copyBuildToPython, buildAndSync };
