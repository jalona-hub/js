import { BigNumber, PopulatedTransaction, Signer } from "ethers";
import invariant from "tiny-invariant";
import { isContractDeployed } from "./isContractDeployed";
import { ThirdwebStorage } from "@thirdweb-dev/storage";
import { extractConstructorParamsFromAbi } from "../feature-detection/extractConstructorParamsFromAbi";
import { computeDeploymentAddress } from "./computeDeploymentAddress";
import { getInitBytecodeWithSalt } from "./getInitBytecodeWithSalt";
import { fetchAndCacheDeployMetadata } from "./fetchAndCacheDeployMetadata";
import { deployCreate2Factory } from "./deployCreate2Factory";
import { convertParamValues } from "./convertParamValues";

/**
 * Direct deploy a contract at a deterministic address, using Create2 method
 * Address depends on the Create2 factory address and salt (if provided).
 *
 * @public
 *
 * @param publishMetadataUri
 * @param signer
 * @param storage
 * @param constructorArgs
 * @param saltForCreate2
 */
export async function directDeployDeterministicWithUri(
  publishMetadataUri: string,
  signer: Signer,
  storage: ThirdwebStorage,
  constructorArgs: any[],
  saltForCreate2?: string,
  gasLimit: number = 7000000,
) {
  invariant(signer.provider, "Provider is required");
  const { compilerMetadata } = await fetchAndCacheDeployMetadata(
    publishMetadataUri,
    storage,
  );

  // 1. Deploy CREATE2 factory (if not already exists)
  const create2Factory = await deployCreate2Factory(signer);

  // 2. Encode constructor params
  const constructorParamTypes = extractConstructorParamsFromAbi(
    compilerMetadata.abi,
  ).map((p) => {
    return p.type;
  });

  const encodedArgs = convertParamValues(
    constructorParamTypes,
    constructorArgs,
  );

  // 3. Construct deployment transaction
  const address = computeDeploymentAddress(
    compilerMetadata.bytecode,
    encodedArgs,
    create2Factory,
    saltForCreate2,
  );
  const contractDeployed = await isContractDeployed(address, signer.provider);

  let initBytecodeWithSalt = "";
  if (!contractDeployed) {
    console.debug(`deploying contract via create2 factory at: ${address}`);

    initBytecodeWithSalt = getInitBytecodeWithSalt(
      compilerMetadata.bytecode,
      encodedArgs,
      saltForCreate2,
    );

    let tx: PopulatedTransaction = {
      to: create2Factory,
      data: initBytecodeWithSalt,
    };

    try {
      await signer.estimateGas(tx);
    } catch (e) {
      console.debug("error estimating gas while deploying prebuilt: ", e);
      tx.gasLimit = BigNumber.from(gasLimit);
    }

    // 4. Deploy
    await (await signer.sendTransaction(tx)).wait();
  } else {
    throw new Error(`Contract already deployed at ${address}`);
  }
}

export async function predictAddressDeterministicWithUri(
  publishMetadataUri: string,
  signer: Signer,
  storage: ThirdwebStorage,
  constructorArgs: any[],
  saltForCreate2?: string,
): Promise<string> {
  invariant(signer.provider, "Provider is required");
  const { compilerMetadata } = await fetchAndCacheDeployMetadata(
    publishMetadataUri,
    storage,
  );

  // 1. Deploy CREATE2 factory (if not already exists)
  const create2Factory = await deployCreate2Factory(signer, {});

  // 2. Encode constructor params
  const constructorParamTypes = extractConstructorParamsFromAbi(
    compilerMetadata.abi,
  ).map((p) => {
    return p.type;
  });

  const encodedArgs = convertParamValues(
    constructorParamTypes,
    constructorArgs,
  );

  // 3. Construct deployment transaction
  const address = computeDeploymentAddress(
    compilerMetadata.bytecode,
    encodedArgs,
    create2Factory,
    saltForCreate2,
  );

  return address;
}
