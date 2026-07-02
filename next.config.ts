import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_ADMIN_DISCORD_USERNAMES:
      process.env.NEXT_PUBLIC_ADMIN_DISCORD_USERNAMES ??
      process.env.ADMIN_DISCORD_USERNAMES ??
      "louisplot",
  },
};

export default nextConfig;
