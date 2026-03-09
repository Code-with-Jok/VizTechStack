#!/usr/bin/env tsx
/**
 * Analyze bundle size and dependencies
 *
 * Usage: pnpm analyze:bundle
 */

import { promises as fs } from "fs";
import path from "path";
import { glob } from "glob";

interface BundleStats {
  totalSize: number;
  fileCount: number;
  largestFiles: Array<{ path: string; size: number }>;
  byExtension: Record<string, { count: number; size: number }>;
}

async function getFileSize(filePath: string): Promise<number> {
  const stats = await fs.stat(filePath);
  return stats.size;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

async function analyzeBuildOutput(buildPath: string): Promise<BundleStats> {
  const stats: BundleStats = {
    totalSize: 0,
    fileCount: 0,
    largestFiles: [],
    byExtension: {},
  };

  // Find all files in build output
  const files = await glob(`${buildPath}/**/*`, {
    nodir: true,
    ignore: ["**/node_modules/**", "**/.next/cache/**"],
  });

  const fileSizes: Array<{ path: string; size: number }> = [];

  for (const file of files) {
    const size = await getFileSize(file);
    const ext = path.extname(file) || "no-extension";

    stats.totalSize += size;
    stats.fileCount++;

    fileSizes.push({ path: file, size });

    if (!stats.byExtension[ext]) {
      stats.byExtension[ext] = { count: 0, size: 0 };
    }

    stats.byExtension[ext].count++;
    stats.byExtension[ext].size += size;
  }

  // Sort and get largest files
  fileSizes.sort((a, b) => b.size - a.size);
  stats.largestFiles = fileSizes.slice(0, 10);

  return stats;
}

async function analyzePackageDependencies(): Promise<{
  total: number;
  production: number;
  development: number;
}> {
  const packageJsonPath = path.join(process.cwd(), "package.json");
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));

  const prodDeps = Object.keys(packageJson.dependencies || {}).length;
  const devDeps = Object.keys(packageJson.devDependencies || {}).length;

  return {
    total: prodDeps + devDeps,
    production: prodDeps,
    development: devDeps,
  };
}

async function main() {
  console.log("📊 Analyzing bundle and dependencies...\n");

  // Analyze dependencies
  console.log("📦 Package Dependencies:");
  const deps = await analyzePackageDependencies();
  console.log(`  Total: ${deps.total}`);
  console.log(`  Production: ${deps.production}`);
  console.log(`  Development: ${deps.development}`);
  console.log();

  // Analyze web build
  const webBuildPath = "apps/web/.next";
  try {
    await fs.access(webBuildPath);
    console.log("🌐 Web App Build Analysis:");
    const webStats = await analyzeBuildOutput(webBuildPath);

    console.log(`  Total Size: ${formatBytes(webStats.totalSize)}`);
    console.log(`  File Count: ${webStats.fileCount}`);
    console.log();

    console.log("  By File Type:");
    const sortedExtensions = Object.entries(webStats.byExtension).sort(
      ([, a], [, b]) => b.size - a.size,
    );

    for (const [ext, data] of sortedExtensions.slice(0, 10)) {
      console.log(
        `    ${ext.padEnd(15)} ${data.count.toString().padStart(5)} files  ${formatBytes(data.size)}`,
      );
    }
    console.log();

    console.log("  Largest Files:");
    for (const file of webStats.largestFiles.slice(0, 5)) {
      const relativePath = path.relative(process.cwd(), file.path);
      console.log(
        `    ${formatBytes(file.size).padStart(10)}  ${relativePath}`,
      );
    }
    console.log();
  } catch {
    console.log(
      "⚠️  Web build not found. Run `pnpm build --filter @viztechstack/web` first.",
    );
    console.log();
  }

  // Analyze API build
  const apiBuildPath = "apps/api/dist";
  try {
    await fs.access(apiBuildPath);
    console.log("🔧 API Build Analysis:");
    const apiStats = await analyzeBuildOutput(apiBuildPath);

    console.log(`  Total Size: ${formatBytes(apiStats.totalSize)}`);
    console.log(`  File Count: ${apiStats.fileCount}`);
    console.log();

    console.log("  By File Type:");
    const sortedExtensions = Object.entries(apiStats.byExtension).sort(
      ([, a], [, b]) => b.size - a.size,
    );

    for (const [ext, data] of sortedExtensions) {
      console.log(
        `    ${ext.padEnd(15)} ${data.count.toString().padStart(5)} files  ${formatBytes(data.size)}`,
      );
    }
    console.log();
  } catch {
    console.log(
      "⚠️  API build not found. Run `pnpm build --filter @viztechstack/api` first.",
    );
    console.log();
  }

  console.log("✅ Analysis complete!");
  console.log("\n💡 Tips:");
  console.log("  - Run builds before analyzing: pnpm build");
  console.log("  - Check for large dependencies that could be optimized");
  console.log("  - Consider code splitting for large frontend bundles");
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
