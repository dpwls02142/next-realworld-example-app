module.exports = {
    trailingSlash: true,
    exportPathMap: function () {
        return {
            '/': { page: '/' }
        };
    },
    compress: true,
    poweredByHeader: false,
    generateEtags: true,
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
            },
            {
                protocol: 'https',
                hostname: 'next-realworld-example-app-drab-two.vercel.app',
            }
        ],
        formats: ['image/webp', 'image/avif'],
    },
}; 