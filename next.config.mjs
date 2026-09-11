/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  async redirects() {
    return [
      { source: "/metodologia", destination: "/consultora/metodologia", permanent: true },
      { source: "/planes", destination: "/consultora/planes", permanent: true },
    ];
  },
};

export default nextConfig;
