#!/usr/bin/env node

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🔍 Starting Next.js Build Performance Monitor...\n");

const startTime = Date.now();

// Create analyze directory
const analyzeDir = path.join(__dirname, "../analyze");
if (!fs.existsSync(analyzeDir)) {
  fs.mkdirSync(analyzeDir, { recursive: true });
}

try {
  // Run build with detailed timing
  console.log("⏱️  Running build with timing analysis...");

  const buildOutput = execSync("ANALYZE=true pnpm run build", {
    encoding: "utf8",
    stdio: "pipe",
  });

  const buildTime = Date.now() - startTime;

  console.log("\n📊 Build Performance Report:");
  console.log("=".repeat(50));
  console.log(`Total Build Time: ${(buildTime / 1000).toFixed(2)}s`);

  // Parse build output for file sizes
  const lines = buildOutput.split("\n");
  const routeLines = lines.filter(
    (line) => line.includes("Route (") || line.includes("├") || line.includes("└"),
  );

  console.log("\n📁 Route Analysis:");
  routeLines.forEach((line) => {
    if (line.trim()) {
      console.log(line);
    }
  });

  // Check for large chunks
  const largeChunkLines = lines.filter((line) => {
    const match = line.match(/(\d+(?:\.\d+)?)\s*kB/);
    if (match) {
      const size = Number.parseFloat(match[1]);
      return size > 100; // Files larger than 100KB
    }
    return false;
  });

  if (largeChunkLines.length > 0) {
    console.log("\n⚠️  Large Files (>100KB):");
    largeChunkLines.forEach((line) => console.log(`  ${line.trim()}`));
  }

  // Generate build report
  const report = {
    timestamp: new Date().toISOString(),
    buildTime: buildTime,
    buildTimeSeconds: (buildTime / 1000).toFixed(2),
    largeFiles: largeChunkLines,
    success: true,
  };

  fs.writeFileSync(path.join(analyzeDir, "build-report.json"), JSON.stringify(report, null, 2));

  console.log("\n✅ Build completed successfully!");
  console.log("📄 Report saved to: analyze/build-report.json");

  if (fs.existsSync(path.join(analyzeDir, "client.html"))) {
    console.log("📊 Bundle analysis: analyze/client.html");
  }
} catch (error) {
  console.error("\n❌ Build failed:");
  console.error(error.message);

  const errorReport = {
    timestamp: new Date().toISOString(),
    buildTime: Date.now() - startTime,
    error: error.message,
    success: false,
  };

  fs.writeFileSync(path.join(analyzeDir, "build-error.json"), JSON.stringify(errorReport, null, 2));

  process.exit(1);
}
