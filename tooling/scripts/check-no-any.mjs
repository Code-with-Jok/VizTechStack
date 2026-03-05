import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import ts from 'typescript';

const projectRoot = process.cwd();

const includeRoots = [
  'apps/api/src',
  'apps/web/src',
  'convex',
  'packages/shared/types/src',
  'tooling/env/src',
];

const ignoredDirs = new Set([
  'node_modules',
  'dist',
  '.next',
  'out',
  'coverage',
  '.turbo',
  '_generated',
]);

const issues = [];

function isTypeScriptFile(filePath) {
  return (
    (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) &&
    !filePath.endsWith('.d.ts')
  );
}

async function walkDir(relativeDir) {
  const absoluteDir = path.join(projectRoot, relativeDir);
  const entries = await readdir(absoluteDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith('.')) {
      continue;
    }

    const nextRelative = path.join(relativeDir, entry.name);

    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) {
        await walkDir(nextRelative);
      }
      continue;
    }

    if (!entry.isFile() || !isTypeScriptFile(nextRelative)) {
      continue;
    }

    await inspectFile(nextRelative);
  }
}

function findAnyKeywords(sourceFile) {
  function visit(node) {
    if (node.kind === ts.SyntaxKind.AnyKeyword) {
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(
        node.getStart(sourceFile)
      );
      issues.push({
        file: sourceFile.fileName,
        line: line + 1,
        column: character + 1,
      });
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

async function inspectFile(relativePath) {
  const absolutePath = path.join(projectRoot, relativePath);
  const content = await readFile(absolutePath, 'utf8');
  const scriptKind = relativePath.endsWith('.tsx')
    ? ts.ScriptKind.TSX
    : ts.ScriptKind.TS;

  const sourceFile = ts.createSourceFile(
    relativePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    scriptKind
  );

  findAnyKeywords(sourceFile);
}

async function main() {
  for (const root of includeRoots) {
    await walkDir(root);
  }

  if (issues.length > 0) {
    console.error('Found explicit `any` usage in the following locations:');
    for (const issue of issues) {
      console.error(`- ${issue.file}:${issue.line}:${issue.column}`);
    }
    process.exit(1);
  }

  console.log('No explicit `any` keyword usage found in guarded source directories.');
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`check-no-any failed: ${message}`);
  process.exit(1);
});