import type { Chain } from "../src/types";
export default {
  "name": "Star Social Testnet",
  "chain": "SNS",
  "rpc": [],
  "faucets": [],
  "nativeCurrency": {
    "name": "Social",
    "symbol": "SNS",
    "decimals": 18
  },
  "infoURL": "https://info.avastar.cc",
  "shortName": "SNS",
  "chainId": 700,
  "networkId": 700,
  "explorers": [
    {
      "name": "starscan",
      "url": "https://avastar.info",
      "standard": "EIP3091"
    }
  ],
  "testnet": true,
  "slug": "star-social-testnet"
} as const satisfies Chain;