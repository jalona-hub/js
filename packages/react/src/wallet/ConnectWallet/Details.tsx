/* eslint-disable @next/next/no-img-element */
import { ChainIcon } from "../../components/ChainIcon";
import { Modal } from "../../components/Modal";
import { Skeleton } from "../../components/Skeleton";
import { Spacer } from "../../components/Spacer";
import { IconButton } from "../../components/buttons";
import {
  fontSize,
  iconSize,
  radius,
  shadow,
  spacing,
  Theme,
} from "../../design-system";
import { shortenString } from "../../evm/utils/addresses";
import { isMobile } from "../../evm/utils/isMobile";
import { useInstalledWallets } from "../hooks/useInstalledWallets";
import { NetworkSelector } from "./NetworkSelector";
import { CoinbaseWalletIcon } from "./icons/CoinbaseWalletIcon";
import { DeviceWalletIcon } from "./icons/DeviceWalletIcon";
import { ExitIcon } from "./icons/ExitIcon";
import { MetamaskIcon } from "./icons/MetamaskIcon";
import { WalletConnectIcon } from "./icons/WalletConnectIcon";
import { IconFC } from "./icons/types";
import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { GearIcon } from "@radix-ui/react-icons";
import { defaultChains } from "@thirdweb-dev/chains";
import {
  SupportedWallet,
  useActiveChainId,
  useActiveWallet,
  useAddress,
  useBalance,
  useDisconnect,
  useNetworkMismatch,
  useSupportedChains,
} from "@thirdweb-dev/react-core";
import { useMemo, useState } from "react";

const walletIcons: Record<SupportedWallet["id"], IconFC> = {
  metamask: MetamaskIcon,
  deviceWallet: DeviceWalletIcon,
  coinbaseWallet: CoinbaseWalletIcon,
  walletConnect: WalletConnectIcon,
  walletConnectV1: WalletConnectIcon,
};

export type DropDownPosition = {
  side: "top" | "bottom" | "left" | "right";
  align: "start" | "center" | "end";
};

export const ConnectedWalletDetails: React.FC<{
  dropdownPosition?: DropDownPosition;
}> = (props) => {
  const disconnect = useDisconnect();
  const chains = useSupportedChains();
  const activeChainId = useActiveChainId();
  const address = useAddress();
  const balanceQuery = useBalance();
  const activeWallet = useActiveWallet();

  const chain = useMemo(() => {
    return chains.find((_chain) => _chain.chainId === activeChainId);
  }, [activeChainId, chains]);

  const unknownChain = useMemo(() => {
    if (!chain) {
      return defaultChains.find((c) => c.chainId === activeChainId);
    }
  }, [activeChainId, chain]);

  const WalletIcon = activeWallet
    ? walletIcons[activeWallet.walletId as SupportedWallet["id"]]
    : null;

  const [showNetworkSelector, setShowNetworkSelector] = useState(false);
  const [open, setOpen] = useState(false);
  const supportedChains = useSupportedChains();
  const networkMismatch = useNetworkMismatch();

  const installedWallets = useInstalledWallets();

  // can not switch network if
  // * no wallet is connected
  // * only one supported network and connected to that network
  // * wallet is walletConnectV1, walletConnectV2, or deviceWallet
  // * wallet is non-injected metamask
  const disableNetworkSwitching =
    !activeWallet ||
    (supportedChains.length === 1 && !networkMismatch) ||
    activeWallet.walletId === "walletConnectV1" ||
    activeWallet.walletId === "walletConnectV2" ||
    activeWallet.walletId === "deviceWallet" ||
    (activeWallet.walletId === "metamask" && !installedWallets.metamask);

  const trigger = (
    <WalletInfoButton type="button">
      <ChainIcon chain={chain} size={iconSize.lg} />

      <ColFlex>
        {!balanceQuery.isLoading ? (
          <WalletBalance>
            {balanceQuery.data?.displayValue.slice(0, 5)}{" "}
            {balanceQuery.data?.symbol}
          </WalletBalance>
        ) : (
          <Skeleton height={fontSize.md} />
        )}
        <WalletAddress>{shortenString(address || "")}</WalletAddress>
      </ColFlex>

      {WalletIcon && <WalletIcon size={iconSize.lg} />}
    </WalletInfoButton>
  );

  const content = (
    <div>
      {/* Balance and Account Address */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: spacing.md,
        }}
      >
        {WalletIcon && <WalletIcon size={iconSize.xl} />}

        <ColFlex>
          <AccountAddress> {shortenString(address || "")}</AccountAddress>
          <AccountBalance>
            {" "}
            {balanceQuery.data?.displayValue.slice(0, 5)}{" "}
            {balanceQuery.data?.symbol}{" "}
          </AccountBalance>
        </ColFlex>

        <DisconnectIconButton
          type="button"
          variant="secondary"
          onClick={() => {
            disconnect();
          }}
        >
          <ExitIcon size={iconSize.md} />
        </DisconnectIconButton>
      </div>

      <Spacer y="xl" />

      {/* Network Switcher */}
      <div>
        <PrimaryLabel htmlFor="current-network">Current Network</PrimaryLabel>
        <Spacer y="sm" />
        <MenuButton
          id="current-network"
          type="button"
          disabled={disableNetworkSwitching}
          onClick={() => {
            setOpen(false);
            setShowNetworkSelector(true);
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              position: "relative",
            }}
          >
            <ChainIcon
              chain={chain || unknownChain}
              size={iconSize.lg}
              active
            />
          </div>
          {chain?.name || unknownChain?.name || "Unknown Chain"}
          <StyledGearIcon
            style={{
              flexShrink: 0,
              marginLeft: "auto",
              width: "20px",
              height: "20px",
            }}
          />
        </MenuButton>
      </div>

      <Spacer y="md" />
    </div>
  );

  return (
    <>
      {isMobile() ? (
        <Modal
          trigger={trigger}
          open={open}
          setOpen={setOpen}
          hideCloseIcon={true}
        >
          <div
            style={{
              minHeight: "200px",
            }}
          >
            {content}
          </div>
        </Modal>
      ) : (
        <DropdownMenu.Root open={open} onOpenChange={setOpen}>
          <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropDownContent
              asChild
              side={props.dropdownPosition?.side || "bottom"}
              align={props.dropdownPosition?.align || "end"}
              sideOffset={10}
            >
              {content}
            </DropDownContent>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      )}

      {showNetworkSelector && (
        <NetworkSelector
          open={showNetworkSelector}
          setOpen={setShowNetworkSelector}
        />
      )}
    </>
  );
};

const slideUpAndFade = keyframes`
    from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const DropDownContent = styled(DropdownMenu.Content)<{ theme?: Theme }>`
  width: 360px;
  max-width: 100%;
  border-radius: ${radius.lg};
  padding: ${spacing.lg};
  box-shadow: ${shadow.lg};
  animation: ${slideUpAndFade} 400ms cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
  border: 1px solid ${(props) => props.theme.bg.highlighted};
  background-color: ${(props) => props.theme.bg.base};
`;

const WalletInfoButton = styled.button<{ theme?: Theme }>`
  all: unset;
  background: ${(props) => props.theme.bg.base};
  border: 1px solid ${(props) => props.theme.bg.highlighted};
  padding: ${spacing.xs} ${spacing.md};
  border-radius: ${radius.lg};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  box-shadow: ${shadow.sm};
  min-width: 200px;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    transition: background 250ms ease;
    background: ${(props) => props.theme.bg.baseHover};
    border-color: ${(props) => props.theme.bg.highlighted};
  }
`;

const WalletAddress = styled.span<{ theme?: Theme }>`
  color: ${(props) => props.theme.text.secondary};
  font-size: ${fontSize.xs};
  font-weight: 500;
`;

const ColFlex = styled.div<{ theme?: Theme }>`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const WalletBalance = styled.span<{ theme?: Theme }>`
  color: ${(props) => props.theme.text.neutral};
  font-size: ${fontSize.sm};
  font-weight: 500;
`;

const AccountAddress = styled.span<{ theme?: Theme }>`
  font-size: ${fontSize.md};
  color: ${(props) => props.theme.text.neutral};
  font-weight: 500;
`;

const AccountBalance = styled.span<{ theme?: Theme }>`
  font-size: ${fontSize.sm};
  color: ${(props) => props.theme.text.secondary};
  font-weight: 500;
`;

const PrimaryLabel = styled.label<{ theme?: Theme }>`
  font-size: ${fontSize.sm};
  color: ${(props) => props.theme.text.neutral};
  font-weight: 500;
`;

const MenuButton = styled.button<{ theme?: Theme }>`
  all: unset;
  padding: ${spacing.sm} ${spacing.md};
  border-radius: ${radius.md};
  border: 1px solid ${(props) => props.theme.bg.highlighted};
  box-sizing: border-box;
  display: flex;
  align-items: center;
  width: 100%;
  cursor: pointer;
  font-size: ${fontSize.md};
  font-weight: 500;
  color: ${(props) => props.theme.text.neutral};
  gap: ${spacing.sm};
  -webkit-tap-highlight-color: transparent;

  &:not([disabled]):hover {
    transition: background 150ms ease;
    background: ${(props) => props.theme.bg.baseHover};
  }

  &[disabled] {
    cursor: not-allowed;
    svg {
      display: none;
    }
  }
`;

export const DropdownMenuItem = styled(DropdownMenu.Item)<{ theme?: Theme }>`
  outline: none;
`;

export const StyledGearIcon = styled(GearIcon)<{ theme?: Theme }>`
  color: ${(props) => props.theme.text.secondary};
`;

const DisconnectIconButton = styled(IconButton)<{ theme?: Theme }>`
  margin-right: -${spacing.xxs};
  margin-left: auto;
  padding: ${spacing.xxs};
  color: ${(props) => props.theme.icon.danger};
  &:hover {
    color: ${(props) => props.theme.icon.danger};
    background: ${(props) => props.theme.bg.danger};
  }
`;
