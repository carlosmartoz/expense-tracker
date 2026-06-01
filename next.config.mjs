/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Permite que el móvil (u otros equipos de la LAN) accedan al dev server
  // sin que Next bloquee la petición por ser un origen distinto a localhost.
  allowedDevOrigins: ['192.168.0.124'],
  turbopack: {
    // Pin the workspace root so Turbopack's dev workers resolve node_modules
    // (e.g. the PostCSS plugin) from this project rather than an inferred path.
    root: import.meta.dirname,
  },
};

export default nextConfig;
