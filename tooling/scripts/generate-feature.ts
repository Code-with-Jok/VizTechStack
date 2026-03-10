#!/usr/bin/env tsx
/**
 * Generate new frontend feature with components/hooks/types structure
 *
 * Usage: pnpm generate:feature <feature-name>
 */

import { promises as fs } from "fs";
import path from "path";

const FEATURES_BASE_PATH = "apps/web/src/features";

const FEATURE_STRUCTURE = ["components", "hooks", "types"];

async function generateFeature(featureName: string) {
  console.log(`🚀 Generating feature: ${featureName}`);

  const featurePath = path.join(FEATURES_BASE_PATH, featureName);

  // Check if feature already exists
  try {
    await fs.access(featurePath);
    console.error(
      `❌ Feature "${featureName}" already exists at ${featurePath}`,
    );
    process.exit(1);
  } catch {
    // Feature doesn't exist, continue
  }

  // Create directory structure
  for (const dir of FEATURE_STRUCTURE) {
    const dirPath = path.join(featurePath, dir);
    await fs.mkdir(dirPath, { recursive: true });
    console.log(`  ✓ Created ${dir}/`);
  }

  // Create barrel export (index.ts)
  const indexContent = `// Export all components
export * from './components'

// Export all hooks
export * from './hooks'

// Export all types
export * from './types'
`;

  await fs.writeFile(path.join(featurePath, "index.ts"), indexContent);
  console.log(`  ✓ Created index.ts`);

  // Create components/index.ts
  const componentsIndexContent = `// Export components here
// Example: export { MyComponent } from './MyComponent'
`;

  await fs.writeFile(
    path.join(featurePath, "components", "index.ts"),
    componentsIndexContent,
  );
  console.log(`  ✓ Created components/index.ts`);

  // Create hooks/index.ts
  const hooksIndexContent = `// Export hooks here
// Example: export { useMyHook } from './useMyHook'
`;

  await fs.writeFile(
    path.join(featurePath, "hooks", "index.ts"),
    hooksIndexContent,
  );
  console.log(`  ✓ Created hooks/index.ts`);

  // Create types file
  const typesContent = `// Define feature-specific types here

export interface ${toPascalCase(featureName)}Props {
  // Add props here
}

export type ${toPascalCase(featureName)}State = {
  // Add state here
}
`;

  await fs.writeFile(
    path.join(featurePath, "types", `${featureName}.types.ts`),
    typesContent,
  );
  console.log(`  ✓ Created types/${featureName}.types.ts`);

  // Create types/index.ts
  const typesIndexContent = `export * from './${featureName}.types'
`;

  await fs.writeFile(
    path.join(featurePath, "types", "index.ts"),
    typesIndexContent,
  );
  console.log(`  ✓ Created types/index.ts`);

  // Create README
  const readmeContent = `# ${toPascalCase(featureName)} Feature

## Overview

This feature follows the feature-based structure with clear separation of concerns.

## Structure

- \`components/\` - React components for this feature
- \`hooks/\` - Custom React hooks for this feature
- \`types/\` - TypeScript types and interfaces for this feature

## Usage

Import components, hooks, or types from this feature:

\`\`\`typescript
import { MyComponent, useMyHook, MyType } from '@/features/${featureName}'
\`\`\`

## Guidelines

1. Keep components focused and single-purpose
2. Extract reusable logic into custom hooks
3. Define shared types in the types directory
4. Use barrel exports (index.ts) for clean imports
5. Co-locate related components, hooks, and types
`;

  await fs.writeFile(path.join(featurePath, "README.md"), readmeContent);
  console.log(`  ✓ Created README.md`);

  console.log(`\n✅ Feature "${featureName}" generated successfully!`);
  console.log(`\n📝 Next steps:`);
  console.log(`  1. Create components in components/`);
  console.log(`  2. Create custom hooks in hooks/`);
  console.log(`  3. Define types in types/${featureName}.types.ts`);
  console.log(
    `  4. Export components/hooks from their respective index.ts files`,
  );
  console.log(`  5. Import from '@/features/${featureName}' in your pages`);
}

function toPascalCase(str: string): string {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

async function main() {
  const featureName = process.argv[2];

  if (!featureName) {
    console.error("❌ Error: Feature name is required");
    console.log("\nUsage: pnpm generate:feature <feature-name>");
    console.log("Example: pnpm generate:feature user-profile");
    process.exit(1);
  }

  // Validate feature name (kebab-case)
  if (!/^[a-z]+(-[a-z]+)*$/.test(featureName)) {
    console.error(
      "❌ Error: Feature name must be in kebab-case (e.g., user-profile)",
    );
    process.exit(1);
  }

  await generateFeature(featureName);
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
