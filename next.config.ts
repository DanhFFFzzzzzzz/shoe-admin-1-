/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tvpgriftsewiyitmmyci.supabase.co',
        pathname: '/**', // Có thể điều chỉnh theo nhu cầu
      },
      {
        protocol: 'https',
        hostname: 'alzndhssbtncurvytlqe.supabase.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  serverActions: {
    bodySizeLimit: '5mb'
  },
};

export default nextConfig;
