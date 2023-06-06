import { DetectableFeature } from "../interfaces/DetectableFeature";
import { ContractWrapper } from "./contract-wrapper";
import { FEATURE_SMART_WALLET } from "../../constants/thirdweb-features";
import { ethers } from "ethers";
import { Transaction } from "./transactions";

import type {
  IAccountCore, IAccountPermissions
} from "@thirdweb-dev/contracts-js";
import { AccessRestrictions, RoleAction, RoleRequest, SignedAccountPermissionsPayload, } from "../../types";
import { randomUUID } from "crypto";
import invariant from "tiny-invariant";
import { buildTransactionFunction } from "../../common/transactions";

export class SmartWallet<TContract extends IAccountCore> implements DetectableFeature {
    
  featureName = FEATURE_SMART_WALLET.name;
  private contractWrapper: ContractWrapper<IAccountCore>;

  constructor(contractWrapper: ContractWrapper<TContract>) {
    this.contractWrapper = contractWrapper;
  }

  getAddress(): string {
    return this.contractWrapper.readContract.address;
  }

  /*********************************
   * READ FUNCTIONS
  ********************************/

  // TODO: documentation
  public async getAccessRestrictions(signer: string): Promise<IAccountPermissions.RoleRestrictionsStruct> {
    return this.contractWrapper.readContract.getRoleRestrictionsForAccount(signer);
  }

  /*********************************
   * WRITE FUNCTIONS
  ********************************/

  private async generatePayload(signer: string, roleAction: RoleAction ): Promise<SignedAccountPermissionsPayload> {
    // Derive role for target signer.
    const role = ethers.utils.solidityKeccak256(["string"], [signer]);

    // Get role request struct.
    const payload: IAccountPermissions.RoleRequestStruct = {
      role,
      target: signer,
      action: roleAction,
      validityStartTimestamp: 0,
      validityEndTimestamp: ethers.constants.MaxUint256,
      uid: randomUUID(),
    }

    // Generate signature
    const chainId = await this.contractWrapper.getChainID();
    const connectedSigner = this.contractWrapper.getSigner();
    invariant(connectedSigner, "No signer available");

    const signature = await this.contractWrapper.signTypedData(
      connectedSigner,
      {
        name: "AccountPermissions",
        version: "1",
        chainId,
        verifyingContract: this.contractWrapper.readContract.address,
      },
      { RoleRequest },
      payload
    );

    return { payload, signature };
  }
  
  // TODO: documentation
  grantAccess = buildTransactionFunction(
    async(
      signer: string,
      restrictions: AccessRestrictions,
    ): Promise<Transaction> => {
      // Performing a multicall: [1] setting restrictions for role, [2] granting role to signer.
      const encoded: string[] = [];

      // ===== Preparing [1] `setRoleRestrictions` =====

      // Derive role for target signer.
      const role = ethers.utils.solidityKeccak256(["string"], [signer]);

      // Get role restrictions struct.
      const roleRestrictions: IAccountPermissions.RoleRestrictionsStruct = {
        role,
        approvedTargets: restrictions.approvedTargets,
        maxValuePerTransaction: restrictions.maxValuePerTransaction,
        startTimestamp: Math.floor(restrictions.startTimestamp.getTime() / 1000),
        endTimestamp: Math.floor(restrictions.expirationTimestamp.getTime() / 1000),
      }

      encoded.push(this.contractWrapper.readContract.interface.encodeFunctionData("setRoleRestrictions", [roleRestrictions]));

      // ===== Preparing [2] `changeRole` =====

      const { payload, signature } = await this.generatePayload(signer, RoleAction.GRANT);
      
      encoded.push(this.contractWrapper.readContract.interface.encodeFunctionData("changeRole", [payload, signature]));
      
      // Perform multicall
      return Transaction.fromContractWrapper({
        contractWrapper: this.contractWrapper,
        method: "multicall",
        args: [encoded],
      })
    }
  );
  
  // TODO: documentation
  revokeAccess = buildTransactionFunction(
    async(
      signer: string,
    ): Promise<Transaction> => {
      const { payload, signature } = await this.generatePayload(signer, RoleAction.REVOKE);

      return Transaction.fromContractWrapper({
        contractWrapper: this.contractWrapper,
        method: "changeRole",
        args: [payload, signature],
      })
    }
  )
}