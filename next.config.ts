import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Allow loading the dev server from the phone over the LAN (not just localhost),
  // so client JS / HMR hydrate correctly when opened via the machine's IP.
  allowedDevOrigins: ["192.168.0.242"],
};

export default nextConfig;
