/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Lets another machine on the same network reach the dev server without Next
  // rejecting the request as a foreign origin. Replace with your own LAN
  // address, or drop the line if you only ever open it on localhost.
  allowedDevOrigins: ['192.168.0.124'],
  turbopack: {
    // Pin the workspace root so Turbopack's dev workers resolve node_modules
    // (e.g. the PostCSS plugin) from this project rather than an inferred path.
    root: import.meta.dirname,
  },
};

export default nextConfig;
