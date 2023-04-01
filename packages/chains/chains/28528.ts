import type { Chain } from "../src/types";
export default {
  "name": "Optimism Bedrock (Goerli Alpha Testnet)",
  "chain": "ETH",
  "rpc": [],
  "faucets": [],
  "nativeCurrency": {
    "name": "Goerli Ether",
    "symbol": "ETH",
    "decimals": 18
  },
  "infoURL": "https://community.optimism.io/docs/developers/bedrock",
  "shortName": "obgor",
  "chainId": 28528,
  "networkId": 28528,
  "explorers": [
    {
      "name": "blockscout",
      "url": "https://blockscout.com/optimism/bedrock-alpha",
      "standard": "EIP3091"
    }
  ],
  "testnet": true,
  "slug": "optimism-bedrock-goerli-alpha-testnet"
} as const satisfies Chain;