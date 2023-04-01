import type { Chain } from "../src/types";
export default {
  "name": "Gather Devnet Network",
  "chain": "GTH",
  "rpc": [],
  "faucets": [],
  "nativeCurrency": {
    "name": "Gather",
    "symbol": "GTH",
    "decimals": 18
  },
  "infoURL": "https://gather.network",
  "shortName": "dGTH",
  "chainId": 486217935,
  "networkId": 486217935,
  "explorers": [
    {
      "name": "Blockscout",
      "url": "https://devnet-explorer.gather.network",
      "standard": "none"
    }
  ],
  "testnet": false,
  "slug": "gather-devnet-network"
} as const satisfies Chain;