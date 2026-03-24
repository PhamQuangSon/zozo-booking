#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('📊 Build Performance Tracker\n');

const startTime = Date.now();
const logFile = path.join(__dirname, '../build-performance.log');

// Function to parse build time from output
function parseBuildOutput(output) {
  const lines = output.split('\n');
  const stats = {
    totalTime: 0,
    compilationTime: 0,
    typescriptTime: 0,
    pageDataTime: 0,
    staticGenTime: 0,
    finalizationTime: 0
  };

  lines.forEach(line => {
    if (line.includes('Compiled successfully')) {
      const match = line.match(/(\d+\.?\d*)s/);
      if (match) stats.compilationTime = parseFloat(match[1]) * 1000;
    }
    if (line.includes('Finished TypeScript')) {
      const match = line.match(/(\d+\.?\d*)ms/);
      if (match) stats.typescriptTime = parseFloat(match[1]);
    }
    if (line.includes('Collecting page data')) {
      const match = line.match(/(\d+\.?\d*)ms/);
      if (match) stats.pageDataTime = parseFloat(match[1]);
    }
    if (line.includes('Generating static pages')) {
      const match = line.match(/(\d+\.?\d*)ms/);
      if (match) stats.staticGenTime = parseFloat(match[1]);
    }
    if (line.includes('Finalizing page optimization')) {
      const match = line.match(/(\d+\.?\d*)ms/);
      if (match) stats.finalizationTime = parseFloat(match[1]);
    }
  });

  return stats;
}

// Function to log performance data
function logPerformance(stats) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    ...stats,
    totalTime: Date.now() - startTime
  };

  // Append to log file
  const logLine = `${timestamp},${logEntry.totalTime},${logEntry.compilationTime},${logEntry.typescriptTime},${logEntry.pageDataTime},${logEntry.staticGenTime},${logEntry.finalizationTime}\n`;
  
  // Create header if file doesn't exist
  if (!fs.existsSync(logFile)) {
    fs.writeFileSync(logFile, 'timestamp,totalTime,compilationTime,typescriptTime,pageDataTime,staticGenTime,finalizationTime\n');
  }
  
  fs.appendFileSync(logFile, logLine);
  
  return logEntry;
}

try {
  console.log('⏱️  Starting timed build...');
  
  const buildOutput = execSync('prisma generate && next build', { 
    encoding: 'utf8',
    stdio: 'pipe'
  });

  const stats = parseBuildOutput(buildOutput);
  const logEntry = logPerformance(stats);

  console.log('\n📈 Build Performance:');
  console.log('=' .repeat(40));
  console.log(`Total Time:        ${(logEntry.totalTime / 1000).toFixed(2)}s`);
  console.log(`Compilation:       ${(logEntry.compilationTime / 1000).toFixed(2)}s`);
  console.log(`TypeScript:        ${logEntry.typescriptTime.toFixed(0)}ms`);
  console.log(`Page Data:         ${logEntry.pageDataTime.toFixed(0)}ms`);
  console.log(`Static Gen:        ${logEntry.staticGenTime.toFixed(0)}ms`);
  console.log(`Finalization:      ${logEntry.finalizationTime.toFixed(0)}ms`);

  // Show trends if we have historical data
  const logContent = fs.readFileSync(logFile, 'utf8');
  const lines = logContent.trim().split('\n');
  
  if (lines.length > 2) {
    console.log('\n📊 Performance Trend (last 5 builds):');
    const recentBuilds = lines.slice(-6).slice(1); // Skip header, get last 5
    
    recentBuilds.forEach((line, index) => {
      const [timestamp, totalTime] = line.split(',');
      const date = new Date(timestamp);
      const timeStr = `${(parseFloat(totalTime) / 1000).toFixed(2)}s`;
      console.log(`  ${index + 1}. ${date.toLocaleTimeString()} - ${timeStr}`);
    });
  }

  console.log(`\n📄 Performance log: build-performance.log`);
  console.log('✅ Build tracking completed!');

} catch (error) {
  console.error('\n❌ Build failed:');
  console.error(error.message);
  process.exit(1);
}