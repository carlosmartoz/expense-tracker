/** @type {import('next').NextConfig} */

// Machines other than this one that may reach the dev server — a phone on the
// same Wi-Fi, say. Next rejects them as foreign origins otherwise. Set it in
// .env.local (gitignored) so no one's LAN address ends up in the repo:
//   DEV_ORIGINS=192.168.0.124
const devOrigins = (process.env.DEV_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: devOrigins,
  turbopack: {
    // Pin the workspace root so Turbopack's dev workers resolve node_modules
    // (e.g. the PostCSS plugin) from this project rather than an inferred path.
    root: import.meta.dirname,
  },
};

export default nextConfig;
