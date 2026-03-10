#!/usr/bin/env tsx
/**
 * Validate no circular dependencies between modules
 *
 * Usage: pnpm validate:deps
 */

import { promises as fs } from "fs";
import path from "path";
import { glob } from "glob";

interface DependencyGraph {
  [module: string]: Set<string>;
}

async function extractImports(filePath: string): Promise<string[]> {
  const content = await fs.readFile(filePath, "utf-8");
  const imports: string[] = [];

  // Match import statements
  const importRegex = /from\s+['"]([^'"]+)['"]/g;
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}

function getModuleName(
  importPath: string,
  currentModule: string,
): string | null {
  // Handle relative imports within modules
  if (importPath.startsWith("../") || importPath.startsWith("./")) {
    // Extract module name from relative path
    const parts = importPath.split("/");
    const moduleIndex = parts.findIndex((p) => p === "modules");
    if (moduleIndex !== -1 && parts[moduleIndex + 1]) {
      return parts[moduleIndex + 1];
    }
    return currentModule;
  }

  // Handle absolute imports
  if (importPath.includes("/modules/")) {
    const match = importPath.match(/\/modules\/([^/]+)/);
    return match ? match[1] : null;
  }

  return null;
}

async function buildDependencyGraph(): Promise<DependencyGraph> {
  const graph: DependencyGraph = {};

  // Find all TypeScript files in modules
  const files = await glob("apps/api/src/modules/**/*.ts", {
    ignore: ["**/*.spec.ts", "**/*.test.ts", "**/node_modules/**"],
  });

  for (const file of files) {
    // Extract module name from file path
    const match = file.match(/modules\/([^/]+)/);
    if (!match) continue;

    const currentModule = match[1];

    if (!graph[currentModule]) {
      graph[currentModule] = new Set();
    }

    // Extract imports from file
    const imports = await extractImports(file);

    for (const importPath of imports) {
      const dependencyModule = getModuleName(importPath, currentModule);

      if (dependencyModule && dependencyModule !== currentModule) {
        graph[currentModule].add(dependencyModule);
      }
    }
  }

  return graph;
}

function detectCycles(graph: DependencyGraph): {
  hasCycles: boolean;
  cycles: string[][];
} {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(node: string, path: string[]): void {
    visited.add(node);
    recursionStack.add(node);
    path.push(node);

    const dependencies = graph[node] || new Set();

    for (const dep of dependencies) {
      if (!visited.has(dep)) {
        dfs(dep, [...path]);
      } else if (recursionStack.has(dep)) {
        // Cycle detected
        const cycleStart = path.indexOf(dep);
        const cycle = [...path.slice(cycleStart), dep];
        cycles.push(cycle);
      }
    }

    recursionStack.delete(node);
  }

  for (const node of Object.keys(graph)) {
    if (!visited.has(node)) {
      dfs(node, []);
    }
  }

  return {
    hasCycles: cycles.length > 0,
    cycles,
  };
}

async function main() {
  console.log("🔍 Validating module dependencies...\n");

  // Build dependency graph
  console.log("📊 Building dependency graph...");
  const graph = await buildDependencyGraph();

  const modules = Object.keys(graph);
  console.log(`  ✓ Found ${modules.length} modules\n`);

  // Print dependency graph
  console.log("📦 Module Dependencies:");
  for (const [module, deps] of Object.entries(graph)) {
    if (deps.size > 0) {
      console.log(`  ${module} → [${Array.from(deps).join(", ")}]`);
    } else {
      console.log(`  ${module} → (no dependencies)`);
    }
  }
  console.log();

  // Detect circular dependencies
  console.log("🔄 Checking for circular dependencies...");
  const { hasCycles, cycles } = detectCycles(graph);

  if (hasCycles) {
    console.error("❌ Circular dependencies detected!\n");
    console.error("Cycles found:");
    for (const cycle of cycles) {
      console.error(`  ${cycle.join(" → ")}`);
    }
    console.error("\n⚠️  Please refactor to remove circular dependencies.");
    process.exit(1);
  }

  console.log("✅ No circular dependencies found!");
  console.log("\n✨ All module dependencies are valid!");
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
