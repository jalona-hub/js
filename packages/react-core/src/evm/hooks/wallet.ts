import { useThirdwebConnectedWalletContext } from "../contexts/thirdweb-wallet";
import { ContractAddress } from "../types";
import { cacheKeys } from "../utils/cache-keys";
import { useSupportedChains } from "./useSupportedChains";
import { useQuery } from "@tanstack/react-query";
import { Chain, defaultChains } from "@thirdweb-dev/chains";
import { useMemo } from "react";

/**
 * A hook to get the native or (optional) ERC20 token balance of the connected wallet.
 *
 * @param tokenAddress - the address of the token contract, if empty will use the chain's native token
 * @returns the balance of the connected wallet (native or ERC20)
 * @beta
 */
export function useBalance(tokenAddress?: ContractAddress) {
  const walletAddress = useAddress();

  const { wallet, address, chainId } = useThirdwebConnectedWalletContext();

  const cacheKey = useMemo(() => {
    return cacheKeys.wallet.balance(chainId || -1, address, tokenAddress);
  }, [chainId, tokenAddress, address]);

  return useQuery(
    cacheKey,
    () => {
      return wallet?.balance(tokenAddress);
    },
    {
      // if user is not logged in no reason to try to fetch
      enabled: !!wallet && !!walletAddress && !!chainId,
      retry: true,
      keepPreviousData: false,
    },
  );
}

/**
 * @internal
 */
export function useConnectedWallet() {
  return useThirdwebConnectedWalletContext().wallet;
}

/**
 * Hook for accessing the address of the connected wallet
 *
 * ```javascript
 * import { useAddress } from "@thirdweb-dev/react"
 * ```
 *
 *
 * @example
 * To get the address of the connected wallet, you can use the hook as follows:
 *
 * ```javascript
 * import { useAddress } from "@thirdweb-dev/react"
 *
 * const App = () => {
 *   const address = useAddress()
 *
 *   return <div>{address}</div>
 * }
 * ```
 *
 * The `address` variable will hold the address of the connected wallet if a user has connected using one of the supported wallet connection hooks.
 *
 * @see {@link https://portal.thirdweb.com/react/react.useaddress?utm_source=sdk | Documentation}
 *
 * @public
 */
export function useAddress(): string | undefined {
  return useThirdwebConnectedWalletContext().address;
}

/**
 * Hook for accessing the chain ID of the network the current wallet is connected to
 *
 * ```javascript
 * import { useChainId } from "@thirdweb-dev/react"
 * ```
 *
 * @example
 * You can get the chain ID of the connected wallet by using the hook as follows:
 * ```javascript
 * import { useChainId } from "@thirdweb-dev/react"
 *
 * const App = () => {
 *   const chainId = useChainId()
 *
 *   return <div>{chainId}</div>
 * }
 * ```
 * @see {@link https://portal.thirdweb.com/react/react.usechainid?utm_source=sdk | Documentation}
 * @public
 */
export function useChainId(): number | undefined {
  return useThirdwebConnectedWalletContext().chainId;
}

/**
 * Hook for accessing the active Chain the current wallet is connected to
 *
 * ```javascript
 * import { useChain } from "@thirdweb-dev/react-core"
 * ```
 *
 * @example
 * You can get the chain of the connected wallet by using the hook as follows:
 * ```javascript
 * import { useChain } from "@thirdweb-dev/react-core"
 *
 * const App = () => {
 *   const chain = useChain()
 *
 *   return <div>{chain.chainId}</div>
 * }
 * ```
 * @see {@link https://portal.thirdweb.com/react/react.useActiveChain?utm_source=sdk | Documentation}
 * @public
 */
export function useChain(): Chain | undefined {
  const chainId = useChainId();

  const chains = useSupportedChains();

  const chain = useMemo(() => {
    return chains.find((_chain) => _chain.chainId === chainId);
  }, [chainId, chains]);

  const unknownChain = useMemo(() => {
    if (!chain) {
      return defaultChains.find((c) => c.chainId === chainId);
    }
  }, [chainId, chain]);

  return chain || unknownChain;
}

/**
 * @deprecated
 *
 * This hook is renamed to `useChain`
 *
 * use the `useChain` hook instead
 */
export function useActiveChain() {
  return useChain();
}
