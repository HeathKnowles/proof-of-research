import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  bsc,
  bscTestnet
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'RainbowKit demo',
  projectId: 'YOUR_PROJECT_ID',
  chains: [
    bscTestnet,
    bsc,
    
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [bscTestnet] : []),
  ],
  ssr: true,
})