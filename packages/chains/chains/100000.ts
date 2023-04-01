import type { Chain } from "../src/types";
export default {
  "name": "QuarkChain Mainnet Root",
  "chain": "QuarkChain",
  "rpc": [],
  "faucets": [],
  "nativeCurrency": {
    "name": "QKC",
    "symbol": "QKC",
    "decimals": 18
  },
  "infoURL": "https://www.quarkchain.io",
  "shortName": "qkc-r",
  "chainId": 100000,
  "networkId": 100000,
  "testnet": false,
  "slug": "quarkchain-root"
} as const satisfies Chain;