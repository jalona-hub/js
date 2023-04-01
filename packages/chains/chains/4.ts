import type { Chain } from "../src/types";
export default {
  "name": "Rinkeby",
  "title": "Ethereum Testnet Rinkeby",
  "chain": "ETH",
  "rpc": [],
  "faucets": [
    "http://fauceth.komputing.org?chain=4&address=${ADDRESS}",
    "https://faucet.rinkeby.io"
  ],
  "nativeCurrency": {
    "name": "Rinkeby Ether",
    "symbol": "ETH",
    "decimals": 18
  },
  "infoURL": "https://www.rinkeby.io",
  "shortName": "rin",
  "chainId": 4,
  "networkId": 4,
  "ens": {
    "registry": "0xe7410170f87102df0055eb195163a03b7f2bff4a"
  },
  "explorers": [
    {
      "name": "etherscan-rinkeby",
      "url": "https://rinkeby.etherscan.io",
      "standard": "EIP3091"
    }
  ],
  "testnet": true,
  "slug": "rinkeby"
} as const satisfies Chain;