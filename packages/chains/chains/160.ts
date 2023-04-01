import type { Chain } from "../src/types";
export default {
  "name": "Armonia Eva Chain Mainnet",
  "chain": "Eva",
  "rpc": [],
  "faucets": [],
  "nativeCurrency": {
    "name": "Armonia Multichain Native Token",
    "symbol": "AMAX",
    "decimals": 18
  },
  "infoURL": "https://amax.network",
  "shortName": "eva",
  "chainId": 160,
  "networkId": 160,
  "status": "incubating",
  "testnet": false,
  "slug": "armonia-eva-chain"
} as const satisfies Chain;