#!/usr/bin/env node

/**
 * Script para adicionar classes dark mode automaticamente
 * Executa substituições em massa nos componentes
 */

const fs = require('fs');
const path = require('path');

const replacements = [
    // Backgrounds
    { from: /className="([^"]*?)bg-white([^"]*?)"/g, to: 'className="$1bg-white dark:bg-slate-800$2"' },
    { from: /className="([^"]*?)bg-slate-50([^"]*?)"/g, to: 'className="$1bg-slate-50 dark:bg-slate-900$2"' },
    { from: /className="([^"]*?)bg-slate-100([^"]*?)"/g, to: 'className="$1bg-slate-100 dark:bg-slate-800$2"' },

    // Text colors
    { from: /className="([^"]*?)text-slate-900([^"]*?)"/g, to: 'className="$1text-slate-900 dark:text-slate-100$2"' },
    { from: /className="([^"]*?)text-slate-700([^"]*?)"/g, to: 'className="$1text-slate-700 dark:text-slate-300$2"' },
    { from: /className="([^"]*?)text-slate-600([^"]*?)"/g, to: 'className="$1text-slate-600 dark:text-slate-400$2"' },
    { from: /className="([^"]*?)text-slate-500([^"]*?)"/g, to: 'className="$1text-slate-500 dark:text-slate-400$2"' },

    // Borders
    { from: /className="([^"]*?)border-slate-200([^"]*?)"/g, to: 'className="$1border-slate-200 dark:border-slate-700$2"' },
    { from: /className="([^"]*?)border-slate-300([^"]*?)"/g, to: 'className="$1border-slate-300 dark:border-slate-600$2"' },

    // Hover states
    { from: /className="([^"]*?)hover:bg-slate-100([^"]*?)"/g, to: 'className="$1hover:bg-slate-100 dark:hover:bg-slate-700$2"' },
    { from: /className="([^"]*?)hover:bg-slate-50([^"]*?)"/g, to: 'className="$1hover:bg-slate-50 dark:hover:bg-slate-800$2"' },
];

const componentsDir = path.join(__dirname, 'components');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Skip if already has dark: classes
    if (content.includes('dark:')) {
        console.log(`⏭️  Skipping ${path.basename(filePath)} (already has dark mode)`);
        return;
    }

    replacements.forEach(({ from, to }) => {
        const newContent = content.replace(from, to);
        if (newContent !== content) {
            content = newContent;
            modified = true;
        }
    });

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated ${path.basename(filePath)}`);
    } else {
        console.log(`⚪ No changes needed for ${path.basename(filePath)}`);
    }
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            processDirectory(filePath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            processFile(filePath);
        }
    });
}

console.log('🎨 Adding dark mode classes to components...\n');
processDirectory(componentsDir);
console.log('\n✨ Done!');
