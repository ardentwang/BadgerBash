import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    //could consider some console.logs to stay in production such as error or other things :)
    removeConsole: 
      process.env.NODE_ENV === 'production'
  }
};

export default nextConfig;
