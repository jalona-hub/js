import type { Chain } from "../src/types";
export default {
  "name": "Liveplex OracleEVM",
  "chain": "Liveplex OracleEVM Network",
  "rpc": [],
  "faucets": [],
  "nativeCurrency": {
    "name": "Ether",
    "symbol": "ETH",
    "decimals": 18
  },
  "infoURL": "",
  "shortName": "LOE",
  "chainId": 50001,
  "networkId": 50001,
  "explorers": [],
  "testnet": false,
  "slug": "liveplex-oracleevm"
} as const satisfies Chain;