import type { Chain } from "../src/types";
export default {
  "name": "MetaDot Mainnet",
  "chain": "MTT",
  "rpc": [],
  "faucets": [],
  "nativeCurrency": {
    "name": "MetaDot Token",
    "symbol": "MTT",
    "decimals": 18
  },
  "infoURL": "https://metadot.network",
  "shortName": "mtt",
  "chainId": 16000,
  "networkId": 16000,
  "testnet": false,
  "slug": "metadot"
} as const satisfies Chain;