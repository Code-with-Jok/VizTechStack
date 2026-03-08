# Getting Started

Welcome to VizTechStack! This section will help you get up and running with the project.

## Overview

VizTechStack is an interactive learning platform that helps users explore and track technology learning roadmaps. The platform visualizes learning paths as interactive graphs, allowing users to navigate through topics, track progress, and access educational content.

## Quick Start

1. **Prerequisites**
   - Node.js >= 20.11.0
   - pnpm 9.15.0
   - Git

2. **Installation**
   ```bash
   # Clone the repository
   git clone <repository-url>
   cd viztechstack

   # Install dependencies
   pnpm install
   ```

3. **Development**
   ```bash
   # Start all services
   pnpm dev

   # Or start specific services
   pnpm dev --filter @viztechstack/web    # Frontend only
   pnpm dev --filter @viztechstack/api    # Backend only
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - API: http://localhost:4000/graphql

## Contents

- [Installation Guide](./installation.md) - Detailed installation instructions
- [Development Workflow](./development.md) - Development best practices and workflows
- [Admin Setup Guide](./admin-setup.md) - Setting up admin access

## Tech Stack

- **Frontend**: Next.js 16.1.6, React 19.2.3, TypeScript 5.7, Tailwind CSS 4
- **Backend**: NestJS 11.0.1, GraphQL (Apollo Server 5.4.0)
- **Database**: Convex (serverless database)
- **Monorepo**: pnpm workspaces with Turbo 2.4.0

## Navigation

→ [Next: Architecture](../02-architecture/README.md)  
↑ [Documentation Index](../README.md)
