import type { Chain } from "../src/types";
export default {
  "name": "Localhost",
  "chain": "ETH",
  "rpc": [],
  "faucets": [],
  "nativeCurrency": {
    "name": "Ether",
    "symbol": "ETH",
    "decimals": 18
  },
  "icon": {
    "url": "ipfs://QmcxZHpyJa8T4i63xqjPYrZ6tKrt55tZJpbXcjSDKuKaf9/ethereum/512.png",
    "height": 512,
    "width": 512,
    "format": "png"
  },
  "shortName": "local",
  "chainId": 1337,
  "networkId": 1337,
  "testnet": true,
  "slug": "localhost"
} as const satisfies Chain;