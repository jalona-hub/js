import type { Chain } from "../src/types";
export default {
  "name": "SJATSH",
  "chain": "ETH",
  "rpc": [],
  "faucets": [],
  "nativeCurrency": {
    "name": "Ether",
    "symbol": "ETH",
    "decimals": 18
  },
  "infoURL": "https://sjis.me",
  "shortName": "SJ",
  "chainId": 10086,
  "networkId": 10086,
  "testnet": false,
  "slug": "sjatsh"
} as const satisfies Chain;