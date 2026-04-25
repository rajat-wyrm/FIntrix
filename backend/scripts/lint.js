#!/usr/bin/env node
// Lightweight lint: runs `node --check` on every .js file under the backend (excluding
// node_modules, .git, dist, coverage) and exits non-zero on the first failure. Cheap and
// reliable — no extra deps, no style preferences, just a parse check.
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

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
  const rel = path.relative(root, file);
  const res = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (res.status !== 0) {
    failed += 1;
    console.error(`[lint] ${rel}: ${(res.stderr || res.stdout || "").trim()}`);
  }
}

if (failed > 0) {
  console.error(`[lint] ${failed} file(s) failed syntax check.`);
  process.exit(1);
} else {
  console.log(`[lint] OK — ${files.length} file(s) parsed cleanly.`);
}
