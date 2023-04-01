import type { Chain } from "../src/types";
export default {
  "name": "BLG Testnet",
  "chain": "BLG",
  "icon": {
    "url": "ipfs://QmUN5j2cre8GHKv52JE8ag88aAnRmuHMGFxePPvKMogisC",
    "width": 512,
    "height": 512,
    "format": "svg"
  },
  "rpc": [],
  "faucets": [
    "https://faucet.blgchain.com"
  ],
  "nativeCurrency": {
    "name": "Blg",
    "symbol": "BLG",
    "decimals": 18
  },
  "infoURL": "https://blgchain.com",
  "shortName": "blgchain",
  "chainId": 12321,
  "networkId": 12321,
  "testnet": true,
  "slug": "blg-testnet"
} as const satisfies Chain;