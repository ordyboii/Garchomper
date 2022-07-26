import { env } from "./src/server/env.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ["en"],
    defaultLocale: "en"
  },
  experimental: {
    newNextLinkBehavior: true
  }
};

export default nextConfig;
