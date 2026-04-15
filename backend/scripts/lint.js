#!/usr/bin/env node
// Lightweight lint: parses every .js file under the backend (excluding node_modules) and
// exits non-zero if any file fails to parse. This is intentionally cheap so the CI step is
// fast and never fails on style preferences.
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const skipDirs = new Set(["node_modules", ".git", "dist", "coverage", "prisma"]);

const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") && entry.name !== ".env.example") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (skipDirs.has(entry.name)) continue;
      walk(full);
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      files.push(full);
    }
  }
}
walk(root);

let failed = 0;
for (const file of files) {
  try {
    const src = fs.readFileSync(file, "utf8");
    // Syntax check only; do not execute the file.
    new Function(src);
  } catch (err) {
    failed += 1;
    console.error(`[lint] ${path.relative(root, file)}: ${err.message}`);
  }
}

if (failed > 0) {
  console.error(`[lint] ${failed} file(s) failed syntax check.`);
  process.exit(1);
} else {
  console.log(`[lint] OK — ${files.length} file(s) parsed cleanly.`);
}
