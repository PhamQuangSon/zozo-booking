// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix workspace root detection warning
  outputFileTracingRoot: '.',
  
  typescript: {
    ignoreBuildErrors: false,
    tsconfigPath: "./tsconfig.json",
  },
  
  // Configure next/image for external images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    localPatterns: [
      {
        pathname: '/**',
      },
    ],
  },
  
  // Enable build performance monitoring
  experimental: {
    // Show build timing for each webpack compilation
    webVitalsAttribution: ['CLS', 'LCP'],
  },
  
  // Configure Turbopack for Next.js 16 (empty config to silence warning)
  turbopack: {},
  
  // Enable webpack bundle analyzer in production builds (for webpack builds)
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add bundle analysis
    if (!dev && !isServer) {
      config.plugins.push(
        new webpack.DefinePlugin({
          __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
        })
      );
    }

    // Log build timing information
    if (process.env.ANALYZE === 'true') {
      // Skip bundle analyzer for now in ES modules
      console.log('Bundle analysis would be added here');
    }

    return config;
  },
};

export default nextConfig;
