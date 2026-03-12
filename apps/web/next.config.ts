import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  transpilePackages: [
    'd3-force',
    'd3-hierarchy',
    'dagre',
    '@viztechstack/roadmap-visualization'
  ],
  experimental: {
    // esmExternals: 'loose' // Not supported in Turbopack
  },
  turbopack: {
    // Empty config to silence the warning - will add aliases when dependencies are installed
  },
  // webpack: (config, { isServer }) => {
  //   // Handle d3-force module resolution
  //   config.resolve.alias = {
  //     ...config.resolve.alias,
  //     'd3-force': require.resolve('d3-force'),
  //     'd3-hierarchy': require.resolve('d3-hierarchy'),
  //     'dagre': require.resolve('dagre')
  //   };

  //   // Ensure proper module resolution for ESM packages
  //   config.resolve.extensionAlias = {
  //     '.js': ['.js', '.ts', '.tsx'],
  //     '.mjs': ['.mjs', '.js', '.ts', '.tsx']
  //   };

  //   return config;
  // }
};

export default nextConfig;
