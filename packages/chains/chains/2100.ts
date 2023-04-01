import type { Chain } from "../src/types";
export default {
  "name": "Ecoball Mainnet",
  "chain": "ECO",
  "rpc": [],
  "faucets": [],
  "nativeCurrency": {
    "name": "Ecoball Coin",
    "symbol": "ECO",
    "decimals": 18
  },
  "infoURL": "https://ecoball.org",
  "shortName": "eco",
  "chainId": 2100,
  "networkId": 2100,
  "explorers": [
    {
      "name": "Ecoball Explorer",
      "url": "https://scan.ecoball.org",
      "standard": "EIP3091"
    }
  ],
  "testnet": false,
  "slug": "ecoball"
} as const satisfies Chain;