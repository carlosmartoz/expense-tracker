/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    // Pin the workspace root so Turbopack's dev workers resolve node_modules
    // (e.g. the PostCSS plugin) from this project rather than an inferred path.
    root: import.meta.dirname,
  },
};

export default nextConfig;
