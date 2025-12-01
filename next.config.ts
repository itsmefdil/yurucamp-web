import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.com',
      },
      {
        protocol: 'https',
        hostname: '*.id',
      },
      {
        protocol: 'https',
        hostname: '*.net',
      },
      {
        protocol: 'https',
        hostname: '*.org',
      },
      {
        protocol: 'https',
        hostname: '*.io',
      },
      {
        protocol: 'https',
        hostname: '*.co',
      },
      {
        protocol: 'https',
        hostname: '*.in',
      },
      {
        protocol: 'https',
        hostname: '*.us',
      },
      {
        protocol: 'https',
        hostname: '*.uk',
      },
      {
        protocol: 'https',
        hostname: '*.au',
      },
      {
        protocol: 'https',
        hostname: '*.ca',
      },
      {
        protocol: 'https',
        hostname: '*.mx',
      },
      {
        protocol: 'https',
        hostname: '*.br',
      },
      {
        protocol: 'https',
        hostname: '*.es',
      },
      {
        protocol: 'https',
        hostname: '*.fr',
      },
      {
        protocol: 'https',
        hostname: '*.de',
      },
      {
        protocol: 'https',
        hostname: '*.it',
      },
      {
        protocol: 'https',
        hostname: '*.pt',
      },
      {
        protocol: 'https',
        hostname: '*.nl',
      },
      {
        protocol: 'https',
        hostname: '*.se',
      },
      {
        protocol: 'https',
        hostname: '*.dk',
      },
      {
        protocol: 'https',
        hostname: '*.fi',
      },
      {
        protocol: 'https',
        hostname: '*.no',
      },
      {
        protocol: 'https',
        hostname: '*.ch',
      },
      {
        protocol: 'https',
        hostname: '*.at',
      },
      {
        protocol: 'https',
        hostname: '*.cz',
      },
      {
        protocol: 'https',
        hostname: '*.pl',
      },
      {
        protocol: 'https',
        hostname: '*.ru',
      },
      {
        protocol: 'https',
        hostname: '*.jp',
      },
      {
        protocol: 'https',
        hostname: '*.kr',
      },
      {
        protocol: 'https',
        hostname: '*.cn',
      },
      {
        protocol: 'https',
        hostname: '*.tw',
      },
      {
        protocol: 'https',
        hostname: '*.hk',
      },
      {
        protocol: 'https',
        hostname: '*.sg',
      },
      {
        protocol: 'https',
        hostname: '*.ae',
      },
      {
        protocol: 'https',
        hostname: '*.sa',
      },
      {
        protocol: 'https',
        hostname: '*.eg',
      },
      {
        protocol: 'https',
        hostname: '*.eg',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;

