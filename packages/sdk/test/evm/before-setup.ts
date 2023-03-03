import {
  Abi,
  ChainId,
  CONTRACTS_MAP,
  ContractType,
  DEFAULT_IPFS_GATEWAY,
  EditionDropInitializer,
  EditionInitializer,
  getNativeTokenByChainId,
  LOCAL_NODE_PKEY,
  MarketplaceInitializer,
  MultiwrapInitializer,
  NFTCollectionInitializer,
  NFTDropInitializer,
  PackInitializer,
  SignatureDropInitializer,
  SplitInitializer,
  ThirdwebSDK,
  TokenDropInitializer,
  TokenInitializer,
  VoteInitializer,
} from "../../src/evm";
import {
  Plugin,
  PluginFunction,
  PluginMetadata,
} from "../../src/evm/types/plugins";
import { MockStorage } from "./mock/MockStorage";
import weth from "./mock/WETH9.json";
import { deployContractAndUploadMetadata } from "./utils";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  ContractPublisher,
  ContractPublisher__factory,
  DropERC20__factory,
  DropERC20_V2__factory,
  Marketplace__factory,
  MockContractPublisher,
  MockContractPublisher__factory,
  Multiwrap__factory,
  Split__factory,
  TokenERC1155__factory,
  TokenERC20__factory,
  TokenERC721__factory,
  TWFactory,
  TWFactory__factory,
  TWRegistry,
  TWRegistry__factory,
  TWMultichainRegistry,
  TWMultichainRegistry__factory,
  MultichainRegistryCore,
  MultichainRegistryCore__factory,
  VoteERC20__factory,
  MarketplaceRouter__factory,
  DirectListingsLogic__factory,
  EnglishAuctionsLogic__factory,
  OffersLogic__factory,
  Permissions__factory,
  Permissions,
  MetaTx__factory,
  MetaTx,
  PermissionsEnumerable,
  PlatformFeeImpl__factory,
  PlatformFeeImpl,
  ContractMetadataImpl__factory,
  ContractMetadataImpl,
  ExtensionRegistry,
  ExtensionRegistry__factory,
  PermissionsEnumerable__factory,
  DropERC1155_V2__factory,
  DropERC1155__factory,
  DropERC721_V3__factory,
  DropERC721__factory,
  Pack__factory,
  SignatureDrop_V4__factory,
  SignatureDrop__factory,
  PermissionsEnumerableImpl__factory,
} from "@thirdweb-dev/contracts-js";
import { ThirdwebStorage } from "@thirdweb-dev/storage";
import { ContractFactory, ethers } from "ethers";
import hardhat from "hardhat";

// it's there, trust me bro
const hardhatEthers = (hardhat as any).ethers;

const RPC_URL = "http://localhost:8545";

const jsonProvider = new ethers.providers.JsonRpcProvider(RPC_URL);
const defaultProvider = hardhatEthers.provider;

let registryAddress: string;
let sdk: ThirdwebSDK;
const ipfsGatewayUrl = DEFAULT_IPFS_GATEWAY;
let signer: SignerWithAddress;
let signers: SignerWithAddress[];
let storage: ThirdwebStorage;
let implementations: { [key in ContractType]?: string };
let mock_weth_address: string;
let extensionRegistry: ExtensionRegistry;

const fastForwardTime = async (timeInSeconds: number): Promise<void> => {
  const now = Math.floor(Date.now() / 1000);
  await defaultProvider.send("evm_mine", [now + timeInSeconds]);
};

export const expectError = (e: unknown, message: string) => {
  if (e instanceof Error) {
    if (!e.message.includes(message)) {
      throw e;
    }
  } else {
    throw e;
  }
};

export const mochaHooks = {
  beforeAll: async () => {
    signers = await hardhatEthers.getSigners();
    implementations = {};

    [signer] = signers;

    const trustedForwarderAddress =
      "0xc82BbE41f2cF04e3a8efA18F7032BDD7f6d98a81";
    await jsonProvider.send("hardhat_reset", []);

    const mock_weth_deployer = new ethers.ContractFactory(
      weth.abi,
      weth.bytecode,
    )
      .connect(signer)
      .deploy();
    const mock_weth = await (await mock_weth_deployer).deployed();
    mock_weth_address = mock_weth.address;

    const pluginRegistryDeployer = (await new ethers.ContractFactory(
      ExtensionRegistry__factory.abi,
      ExtensionRegistry__factory.bytecode,
    )
      .connect(signer)
      .deploy(signer.address, [])) as ExtensionRegistry;
    extensionRegistry = await pluginRegistryDeployer.deployed();

    const registry = (await new ethers.ContractFactory(
      TWRegistry__factory.abi,
      TWRegistry__factory.bytecode,
    )
      .connect(signer)
      .deploy(trustedForwarderAddress)) as TWRegistry;
    const registryContract = await registry.deployed();

    const thirdwebFactoryDeployer = (await new ethers.ContractFactory(
      TWFactory__factory.abi,
      TWFactory__factory.bytecode,
    )
      .connect(signer)
      .deploy(trustedForwarderAddress, registry.address)) as TWFactory;

    const deployTxFactory = thirdwebFactoryDeployer.deployTransaction;
    await deployTxFactory.wait();
    const thirdwebRegistryAddress = await thirdwebFactoryDeployer.registry();
    registryAddress = thirdwebFactoryDeployer.address;

    await registryContract.grantRole(
      await registryContract.OPERATOR_ROLE(),
      thirdwebFactoryDeployer.address,
    );

    // Mock publisher for tests
    const mockPublisher = (await new ethers.ContractFactory(
      MockContractPublisher__factory.abi,
      MockContractPublisher__factory.bytecode,
    )
      .connect(signer)
      .deploy()) as MockContractPublisher;
    const contractPublisher = (await new ethers.ContractFactory(
      ContractPublisher__factory.abi,
      ContractPublisher__factory.bytecode,
    )
      .connect(signer)
      .deploy(
        trustedForwarderAddress,
        mockPublisher.address,
      )) as ContractPublisher; // TODO needs MockPublisher here
    await contractPublisher.deployed();

    async function deployContract(
      contractFactory: ethers.ContractFactory,
      contractType: ContractType,
    ): Promise<ethers.Contract> {
      switch (contractType) {
        case MarketplaceInitializer.contractType:
        case MultiwrapInitializer.contractType:
          const nativeTokenWrapperAddress = getNativeTokenByChainId(
            ChainId.Hardhat,
          ).wrapped.address;
          return await contractFactory.deploy(nativeTokenWrapperAddress);
        case PackInitializer.contractType:
          const addr = getNativeTokenByChainId(ChainId.Hardhat).wrapped.address;
          return await contractFactory.deploy(addr, trustedForwarderAddress);
        default:
          return await contractFactory.deploy();
      }
    }

    for (const contractType in CONTRACTS_MAP) {
      if (contractType === "custom" || contractType === "marketplace-v3") {
        continue;
      }
      let factories: any[] = [];
      switch (contractType) {
        case TokenInitializer.contractType:
          factories.push(TokenERC20__factory);
          break;
        case TokenDropInitializer.contractType:
          factories.push(DropERC20_V2__factory, DropERC20__factory);
          break;
        case NFTCollectionInitializer.contractType:
          factories.push(TokenERC721__factory);
          break;
        case NFTDropInitializer.contractType:
          factories.push(DropERC721_V3__factory, DropERC721__factory);
          break;
        case SignatureDropInitializer.contractType:
          factories.push(SignatureDrop_V4__factory, SignatureDrop__factory);
          break;
        case EditionInitializer.contractType:
          factories.push(TokenERC1155__factory);
          break;
        case EditionDropInitializer.contractType:
          factories.push(DropERC1155_V2__factory, DropERC1155__factory);
          break;
        case SplitInitializer.contractType:
          factories.push(Split__factory);
          break;
        case VoteInitializer.contractType:
          factories.push(VoteERC20__factory);
          break;
        case MarketplaceInitializer.contractType:
          factories.push(Marketplace__factory);
          break;
        case PackInitializer.contractType:
          factories.push(Pack__factory);
          break;
        case MultiwrapInitializer.contractType:
          factories.push(Multiwrap__factory);
          break;
        default:
          throw new Error(`No factory for contract: ${contractType}`);
      }

      for (const factory of factories) {
        const contractFactory = new ethers.ContractFactory(
          factory.abi,
          factory.bytecode,
        ).connect(signer);

        const deployedContract: ethers.Contract = await deployContract(
          contractFactory,
          contractType as ContractType,
        );

        await deployedContract.deployed();
        const tx = await thirdwebFactoryDeployer.addImplementation(
          deployedContract.address,
        );
        await tx.wait();
        implementations[contractType as ContractType] =
          deployedContract.address;
      }
    }

    // setup marketplace-v3 and add implementation to factory
    const marketplaceEntrypointAddress = await setupMarketplaceV3(
      trustedForwarderAddress,
    );
    const tx = await thirdwebFactoryDeployer.addImplementation(
      marketplaceEntrypointAddress,
    );
    await tx.wait();

    // eslint-disable-next-line turbo/no-undeclared-env-vars
    process.env.registryAddress = thirdwebRegistryAddress;
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    process.env.factoryAddress = thirdwebFactoryDeployer.address;
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    process.env.contractPublisherAddress = contractPublisher.address;
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    process.env.multiChainRegistryAddress = await setupMultichainRegistry();

    storage = MockStorage();
    sdk = new ThirdwebSDK(
      signer,
      {
        gasSettings: {
          maxPriceInGwei: 10000,
        },
      },
      storage,
    );
  },
};

const getFunctionSignature = (fnInputs: any): string => {
  return (
    "(" +
    fnInputs
      .map((i) => {
        return i.type === "tuple" ? getFunctionSignature(i.components) : i.type;
      })
      .join(",") +
    ")"
  );
};

const generatePluginFunctions = (
  pluginAddress: string,
  pluginAbi: Abi,
): PluginFunction[] => {
  const pluginInterface = new ethers.utils.Interface(pluginAbi);
  const pluginFunctions: PluginFunction[] = [];
  // TODO - filter out common functions like _msgSender(), contractType(), etc.
  for (const fnFragment of Object.values(pluginInterface.functions)) {
    const fn = pluginInterface.getFunction(fnFragment.name);
    if (fn.name.includes("_")) {
      continue;
    }
    pluginFunctions.push({
      functionSelector: pluginInterface.getSighash(fn),
      functionSignature: fn.name + getFunctionSignature(fn.inputs),
    });
  }
  return pluginFunctions;
};

async function deployPlugins(pluginInfo: any[]): Promise<any[]> {
  const plugins: Plugin[] = [];
  const pluginNames: string[] = [];

  for (const plugin of pluginInfo) {
    const pluginAddress = await deployContractAndUploadMetadata(
      plugin.factory.abi,
      plugin.factory.bytecode,
      signer,
      plugin.args,
    );
    const pluginFunctions: PluginFunction[] = generatePluginFunctions(
      pluginAddress,
      plugin.factory.abi,
    );
    const pluginMetadata: PluginMetadata = {
      name: plugin.name,
      metadataURI: "",
      implementation: pluginAddress,
    };
    plugins.push({
      metadata: pluginMetadata,
      functions: pluginFunctions,
    });
    pluginNames.push(plugin.name);
  }

  return [plugins, pluginNames];
}

// Setup multichain registry for tests
async function setupMultichainRegistry(): Promise<string> {
  const pluginInfo: any[] = [];

  pluginInfo.push({
    factory: MultichainRegistryCore__factory,
    name: "MultichainRegistryCore",
    args: [],
  });

  const [plugins, pluginNames] = await deployPlugins(pluginInfo);

  // Add plugins to plugin-registry
  await Promise.all(
    plugins.map((plugin) => {
      return extensionRegistry.addExtension(plugin);
    }),
  );

  // Add other util plugin names -- registry already has these (from marketplace-v3 setup)
  pluginNames.push("PermissionsEnumerable");
  pluginNames.push("ERC2771Context");

  const multichainRegistryRouterDeployer = (await new ethers.ContractFactory(
    TWMultichainRegistry__factory.abi,
    TWMultichainRegistry__factory.bytecode,
  )
    .connect(signer)
    .deploy(extensionRegistry.address, pluginNames)) as TWMultichainRegistry;
  const multichainRegistryRouter =
    await multichainRegistryRouterDeployer.deployed();

  return multichainRegistryRouter.address;
}

// Setup marketplace-v3 for tests
async function setupMarketplaceV3(
  trustedForwarderAddress: string,
): Promise<string> {
  const pluginInfo: any[] = [];

  pluginInfo.push({
    factory: PermissionsEnumerableImpl__factory,
    name: "PermissionsEnumerable",
    args: [],
  });

  pluginInfo.push({
    factory: PlatformFeeImpl__factory,
    name: "PlatformFee",
    args: [],
  });

  pluginInfo.push({
    factory: ContractMetadataImpl__factory,
    name: "ContractMetadata",
    args: [],
  });

  pluginInfo.push({
    factory: MetaTx__factory,
    name: "ERC2771Context",
    args: [[trustedForwarderAddress]],
  });

  pluginInfo.push({
    factory: DirectListingsLogic__factory,
    name: "DirectListingsLogic",
    args: [mock_weth_address],
  });

  pluginInfo.push({
    factory: EnglishAuctionsLogic__factory,
    name: "EnglishAuctionsLogic",
    args: [mock_weth_address],
  });

  pluginInfo.push({
    factory: OffersLogic__factory,
    name: "OffersLogic",
    args: [],
  });

  const [plugins, pluginNames] = await deployPlugins(pluginInfo);

  // Add plugins to plugin-registry
  await Promise.all(
    plugins.map((plugin) => {
      return extensionRegistry.addExtension(plugin);
    }),
  );

  // Router
  const marketplaceV3Address = await deployContractAndUploadMetadata(
    MarketplaceRouter__factory.abi,
    MarketplaceRouter__factory.bytecode,
    signer,
    [extensionRegistry.address, pluginNames],
  );
  return marketplaceV3Address;
}

export {
  ipfsGatewayUrl,
  sdk,
  signers,
  jsonProvider,
  defaultProvider,
  registryAddress,
  fastForwardTime,
  storage,
  implementations,
  hardhatEthers,
};
