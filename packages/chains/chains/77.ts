import type { Chain } from "../src/types";
export default {
  "name": "POA Network Sokol",
  "chain": "POA",
  "rpc": [],
  "faucets": [
    "https://faucet.poa.network"
  ],
  "nativeCurrency": {
    "name": "POA Sokol Ether",
    "symbol": "SPOA",
    "decimals": 18
  },
  "infoURL": "https://poa.network",
  "shortName": "spoa",
  "chainId": 77,
  "networkId": 77,
  "explorers": [
    {
      "name": "blockscout",
      "url": "https://blockscout.com/poa/sokol",
      "standard": "none"
    }
  ],
  "testnet": false,
  "slug": "poa-network-sokol"
} as const satisfies Chain;