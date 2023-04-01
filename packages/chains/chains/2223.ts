import type { Chain } from "../src/types";
export default {
  "name": "VChain Mainnet",
  "chain": "VChain",
  "rpc": [],
  "faucets": [],
  "nativeCurrency": {
    "name": "VNDT",
    "symbol": "VNDT",
    "decimals": 18
  },
  "infoURL": "https://bo.vcex.xyz/",
  "shortName": "VChain",
  "chainId": 2223,
  "networkId": 2223,
  "explorers": [
    {
      "name": "VChain Scan",
      "url": "https://scan.vcex.xyz",
      "standard": "EIP3091"
    }
  ],
  "testnet": false,
  "slug": "vchain"
} as const satisfies Chain;