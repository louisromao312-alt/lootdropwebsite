import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ADMIN_DISCORD_USERNAMES auch im Client-Bundle verfügbar (nur Usernamen, kein Secret)
  env: {
    NEXT_PUBLIC_ADMIN_DISCORD_USERNAMES:
      process.env.NEXT_PUBLIC_ADMIN_DISCORD_USERNAMES ??
      process.env.ADMIN_DISCORD_USERNAMES ??
      "",
  },
};

export default nextConfig;
