import type { Chain } from "../src/types";
export default {
  "name": "4GoodNetwork",
  "chain": "4GN",
  "rpc": [],
  "faucets": [],
  "nativeCurrency": {
    "name": "APTA",
    "symbol": "APTA",
    "decimals": 18
  },
  "infoURL": "https://bloqs4good.com",
  "shortName": "bloqs4good",
  "chainId": 846000,
  "networkId": 846000,
  "testnet": false,
  "slug": "4goodnetwork"
} as const satisfies Chain;