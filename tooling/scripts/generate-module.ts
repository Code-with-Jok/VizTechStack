#!/usr/bin/env tsx
/**
 * Generate new backend module with hexagonal architecture
 * 
 * Usage: pnpm generate:module <module-name>
 */

import { promises as fs } from 'fs'
import path from 'path'

const MODULES_BASE_PATH = 'apps/api/src/modules'

const HEXAGONAL_STRUCTURE = [
    'application/commands',
    'application/queries',
    'application/services',
    'application/ports',
    'domain/entities',
    'domain/errors',
    'domain/policies',
    'infrastructure/adapters',
    'transport/graphql/resolvers',
    'transport/graphql/schemas',
    'transport/graphql/mappers',
    'transport/graphql/filters',
]

async function generateModule(moduleName: string) {
    console.log(`🚀 Generating module: ${moduleName}`)

    const modulePath = path.join(MODULES_BASE_PATH, moduleName)

    // Check if module already exists
    try {
        await fs.access(modulePath)
        console.error(`❌ Module "${moduleName}" already exists at ${modulePath}`)
        process.exit(1)
    } catch {
        // Module doesn't exist, continue
    }

    // Create directory structure
    for (const dir of HEXAGONAL_STRUCTURE) {
        const dirPath = path.join(modulePath, dir)
        await fs.mkdir(dirPath, { recursive: true })
        console.log(`  ✓ Created ${dir}`)
    }

    // Create module file
    const moduleFileContent = `import { Module } from '@nestjs/common'

@Module({
  imports: [],
  providers: [],
  exports: [],
})
export class ${toPascalCase(moduleName)}Module {}
`

    await fs.writeFile(
        path.join(modulePath, `${moduleName}.module.ts`),
        moduleFileContent
    )
    console.log(`  ✓ Created ${moduleName}.module.ts`)

    // Create README
    const readmeContent = `# ${toPascalCase(moduleName)} Module

## Overview

This module follows hexagonal architecture with clear layer separation.

## Structure

- \`application/\` - Application layer (commands, queries, services, ports)
- \`domain/\` - Domain layer (entities, errors, policies)
- \`infrastructure/\` - Infrastructure layer (adapters)
- \`transport/\` - Transport layer (GraphQL resolvers, schemas, mappers)

## Usage

Import this module in \`app.module.ts\`:

\`\`\`typescript
import { ${toPascalCase(moduleName)}Module } from './modules/${moduleName}/${moduleName}.module'

@Module({
  imports: [
    // ...
    ${toPascalCase(moduleName)}Module,
  ],
})
export class AppModule {}
\`\`\`
`

    await fs.writeFile(path.join(modulePath, 'README.md'), readmeContent)
    console.log(`  ✓ Created README.md`)

    console.log(`\n✅ Module "${moduleName}" generated successfully!`)
    console.log(`\n📝 Next steps:`)
    console.log(`  1. Add ${toPascalCase(moduleName)}Module to app.module.ts`)
    console.log(`  2. Create domain entities in domain/entities/`)
    console.log(`  3. Create repository interface in application/ports/`)
    console.log(`  4. Implement repository in infrastructure/adapters/`)
    console.log(`  5. Create commands/queries in application/`)
    console.log(`  6. Create GraphQL schema in transport/graphql/schemas/`)
    console.log(`  7. Create resolver in transport/graphql/resolvers/`)
}

function toPascalCase(str: string): string {
    return str
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('')
}

async function main() {
    const moduleName = process.argv[2]

    if (!moduleName) {
        console.error('❌ Error: Module name is required')
        console.log('\nUsage: pnpm generate:module <module-name>')
        console.log('Example: pnpm generate:module user-profile')
        process.exit(1)
    }

    // Validate module name (kebab-case)
    if (!/^[a-z]+(-[a-z]+)*$/.test(moduleName)) {
        console.error('❌ Error: Module name must be in kebab-case (e.g., user-profile)')
        process.exit(1)
    }

    await generateModule(moduleName)
}

main().catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
})
