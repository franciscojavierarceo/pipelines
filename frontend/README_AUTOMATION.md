# Automated UI Sync to Python Package

## Overview
The frontend build process now includes automated synchronization with the Python SDK package, eliminating the need for manual copying of assets after each build.

## Development Workflow

### Automated Sync Commands
- `npm run build:python` - Build frontend and automatically sync to Python package
- `npm run watch:python` - Start file watcher for automatic sync on source changes
- `npm run copy:python` - Copy existing build to Python package (no rebuild)

### Manual Sync Script
- `node scripts/sync-to-python.js build-and-sync` - Build and sync
- `node scripts/sync-to-python.js copy` - Copy existing build only

## Usage Examples

### Development Mode (Recommended)
```bash
# Start file watcher - automatically rebuilds and syncs on any src/ changes
npm run watch:python
```

### One-time Build and Sync
```bash
# Build frontend and sync to Python package
npm run build:python
```

### Copy Existing Build
```bash
# If you already have a build/ directory, just copy to Python package
npm run copy:python
```

## How It Works

1. **Build Process**: Uses existing `npm run build` to create optimized production assets
2. **Asset Location**: Copies from `frontend/build/` to `sdk/python/kfp/ui/static/`
3. **File Watching**: Uses chokidar-cli to monitor `src/**/*` for changes
4. **Error Handling**: Provides clear feedback and exits on build failures

## Integration with kfp ui

After running any sync command, the updated assets are immediately available:

```bash
cd sdk/python
pip install -e .
kfp ui --port 3000
```

The UI will serve the latest frontend assets without any manual intervention.

## Files Modified

- `package.json` - Added sync scripts and chokidar-cli dependency
- `scripts/sync-to-python.js` - Automation script for build and copy operations
- Assets synced to `sdk/python/kfp/ui/static/` automatically

This automation maintains full compatibility with both local execution and Kubernetes deployment modes.
