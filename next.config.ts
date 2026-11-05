import type {NextConfig} from 'next';
const nextConfig:NextConfig={devIndicators:false,async rewrites(){return{beforeFiles:[{source:'/assets/zodiac/:filename',destination:'/api/zodiac-assets/:filename'}],afterFiles:[],fallback:[]};}};
export default nextConfig;
