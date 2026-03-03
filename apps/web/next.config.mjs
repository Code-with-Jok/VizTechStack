/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@viztechstack/types",
    "@viztechstack/utils",
    "@viztechstack/api-client",
  ],
};

export default nextConfig;
