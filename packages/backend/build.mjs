import { build } from 'esbuild';
import { readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

// Recursively find all .ts files in src/
function findFiles(dir, ext) {
    const results = [];
    for (const file of readdirSync(dir)) {
        const fullPath = join(dir, file);
        if (statSync(fullPath).isDirectory()) {
            results.push(...findFiles(fullPath, ext));
        } else if (file.endsWith(ext)) {
            results.push(fullPath);
        }
    }
    return results;
}

const entryPoints = findFiles('src', '.ts');

await build({
    entryPoints,
    outdir: 'dist',
    platform: 'node',
    target: 'node18',
    format: 'cjs',
    sourcemap: true,
    // Keep the directory structure
    outbase: 'src',
    // Don't bundle — keep require() calls for node_modules
    bundle: false,
});

console.log(`✅ Backend built successfully (${entryPoints.length} files)`);
