/** @type {import('next').NextConfig} */
const nextConfig = {
  // Strictly enforce Static Site Generation (SSG) export for Cloudflare Pages
  output: 'export',

  // Transpile 'three' to prevent Next.js dev server vendor-chunk SSR bundling errors
  transpilePackages: ['three'],

  // Disable server-side image optimization since Cloudflare Pages static export is 100% serverless
  images: {
    unoptimized: true,
  },

  // Clean URLs without trailing slashes for canonical consistency
  trailingSlash: false,

  // Enable strict React mode for production quality
  reactStrictMode: true,
};

export default nextConfig;
