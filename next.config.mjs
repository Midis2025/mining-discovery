/** @type {import('next').NextConfig} */
const nextConfig = {
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "acceptable-desire-0cca5bb827.media.strapiapp.com",
      pathname: "/uploads/**",
    },
  ],
},

};

export default nextConfig;
