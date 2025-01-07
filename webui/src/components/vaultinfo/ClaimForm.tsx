import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { ConfigForChainId } from "../../utils/chaincfg";

import FundingVaultAbi from "../../abi/FundingVault.json";
import { useEffect, useState } from "react";
import {
  toBigintUnit,
  toDecimalUnit,
  toReadableAmount,
  toReadableDuration,
} from "../../utils/ConvertHelpers";
import { isAddress } from "ethers";
import { GlassButton } from "../button/GlassButton";
import forkIcon from "../../assets/imgs/fork.png";
import currencyDollarIcon from "../../assets/imgs/currency-dollar.png";
import checkCircleIcon from "../../assets/imgs/check-circle.png";
import xCircleIcon from "../../assets/imgs/x-circle.png";

interface IGrantDetails {
  claimInterval: bigint;
  claimLimit: bigint;
  claimTime: bigint;
  dustBalance: bigint;
}

const ClaimForm = (props: { grantId: number }): React.ReactElement => {
  const { address, chain } = useAccount();
  let chainConfig = ConfigForChainId(chain!.id)!;
  let [claimAmount, setClaimAmount] = useState("10");
  let [claimTarget, setClaimTarget] = useState("");
  let [claimAll, setClaimAll] = useState<boolean>(false);
  let [claimTargetCustom, setClaimTargetCustom] = useState<boolean>(true);

  const grantDetails = useReadContract({
    address: chainConfig.VaultContractAddr,
    account: address,
    abi: FundingVaultAbi,
    chainId: chainConfig.Chain.id,
    functionName: "getGrant",
    args: [props.grantId],
  });
  const claimableBalance = useReadContract({
    address: chainConfig.VaultContractAddr,
    account: address,
    abi: FundingVaultAbi,
    chainId: chainConfig.Chain.id,
    functionName: "getClaimableBalance",
    args: [props.grantId],
  });
  const claimRequest = useWriteContract();

  //console.log(grantDetails.data);
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("refetch");
      claimableBalance.refetch();
    }, 15000);
    return () => {
      clearInterval(interval);
    };
  }, [claimableBalance]);

  let maxAmount = toDecimalUnit(
    claimableBalance.data as bigint,
    chain?.nativeCurrency.decimals
  );
  if (isNaN(maxAmount)) {
    maxAmount = 0;
  }
  maxAmount = Math.round(maxAmount * 1000) / 1000;

  if (parseInt(claimAmount) > maxAmount) {
    setClaimAmount(maxAmount.toString());
  } else if (parseInt(claimAmount) < 0) {
    setClaimAmount("0");
  }

  return (
    <div>
      <div className="ata-claim-info">
        <div className="ata-claim-info-section">
          <span className="ata-claim-info-label">Claimable balance:</span>
          <span className="ata-claim-info-content">
            {toReadableAmount(
              claimableBalance.data as bigint,
              chain?.nativeCurrency.decimals,
              chainConfig.TokenName,
              3
            )}
          </span>
        </div>
        <div className="ata-claim-info-section">
          <span className="ata-claim-info-label">Earning rate:</span>
          <span className="ata-claim-info-content">
            {toReadableAmount(
              (grantDetails.data as IGrantDetails)?.claimLimit,
              0,
              chainConfig.TokenName,
              0
            )}{" "}
            per{" "}
            {toReadableDuration(
              (grantDetails.data as IGrantDetails)?.claimInterval
            )}
          </span>
        </div>
      </div>
      <div className="ata-claim-form">
        <div className="row mt-2">
          <div className="col-4 ata-form-label">
            Amount ({chainConfig.TokenName})
          </div>
          <div className="col-8 ata-form-label">Target Wallet</div>
        </div>
        <div className="row">
          <div className="col-4">
            <div className="ata-input-container">
              <input
                type="number"
                className="form-control ata-input"
                placeholder={claimAll ? maxAmount.toString() : "0"}
                onChange={(evt) => setClaimAmount(evt.target.value)}
                value={claimAll ? maxAmount.toString() : claimAmount}
                disabled={claimAll}
              />
              <GlassButton
                className="ata-max-button"
                onClick={() => {
                  setClaimAmount(maxAmount.toString());
                }}
              >
                MAX.
              </GlassButton>
            </div>
          </div>
          <div className="col-8">
            <div className="ata-input-container">
              <input
                type="text"
                className="form-control ata-input"
                placeholder={claimTargetCustom ? "0x..." : address}
                onChange={(evt) => setClaimTarget(evt.target.value)}
                value={claimTarget}
                disabled={!claimTargetCustom}
              />
              {claimTarget ? (
                <img
                  className="ata-fork-icon"
                  src={forkIcon}
                  onClick={() => {
                    setClaimTarget("");
                  }}
                />
              ) : null}
            </div>
          </div>
        </div>

        {claimRequest.isPending && (claimRequest.data as any) ? (
          <div className="ata-notification pending ata-claim-notification">
            <div className="ata-notification-content">
              <div className="ata-notification-title">
                Claim transaction pending...
              </div>
              <div className="ata-notification-msg">
                TX:{" "}
                <a
                  href={
                    chainConfig.BlockExplorerUrl + "tx/" + claimRequest.data
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  {claimRequest.data}
                </a>
              </div>
            </div>
          </div>
        ) : null}

        {claimRequest.isError ? (
          <div className="ata-notification failed ata-claim-notification">
            <img className="ata-notification-icon" src={xCircleIcon} />
            <div className="ata-notification-content">
              <div className="ata-notification-title">Claim failed.</div>
              <div className="ata-notification-msg">
                {(claimRequest.data as any) ? (
                  <>
                    TX:{" "}
                    <a
                      href={
                        chainConfig.BlockExplorerUrl + "tx/" + claimRequest.data
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      {claimRequest.data}
                    </a>
                    .
                  </>
                ) : null}
                {claimRequest.error?.message}
              </div>
            </div>
          </div>
        ) : null}

        {claimRequest.isSuccess ? (
          <div className="ata-notification success ata-claim-notification">
            <img className="ata-notification-icon" src={checkCircleIcon} />
            <div className="ata-notification-content">
              <div className="ata-notification-title">Claim TX.</div>
              <div className="ata-notification-msg">
                {(claimRequest.data as any) ? (
                  <a
                    href={
                      chainConfig.BlockExplorerUrl + "tx/" + claimRequest.data
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    {claimRequest.data}
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        <div className="row mt-3">
          <div className="col-12">
            <GlassButton
              className="ata-claim-button"
              onClick={(evt) => requestFunds(evt.target as HTMLButtonElement)}
              disabled={claimRequest.isPending}
            >
              <img
                className="ata-currency-dollar-icon"
                src={currencyDollarIcon}
              />
              Request Funds
            </GlassButton>
          </div>
        </div>
      </div>
    </div>
  );

  function requestFunds(button: HTMLButtonElement) {
    button.disabled = true;

    let targetAddress = claimTarget;
    if (claimTargetCustom && !isAddress(targetAddress)) {
      alert("Provided target address '" + targetAddress + "' is invalid.");
      button.disabled = false;
      return;
    }

    let amount = parseInt(claimAmount);
    if (claimAll) {
      amount = 0;
    } else if (amount == 0 || amount > maxAmount) {
      alert("Desired amount '" + claimAmount + "' is invalid.");
      button.disabled = false;
      return;
    }
    let amountWei = toBigintUnit(amount, chain?.nativeCurrency.decimals);

    let callfn = "claim";
    let callArgs: any[] = [props.grantId, amountWei];
    if (
      claimTargetCustom &&
      targetAddress.toLowerCase() != address?.toLowerCase()
    ) {
      callfn = "claimTo";
      callArgs.push(targetAddress);
    }

    claimRequest.writeContract({
      address: chainConfig.VaultContractAddr,
      account: address,
      abi: FundingVaultAbi,
      chainId: chainConfig.Chain.id,
      functionName: callfn,
      args: callArgs,
    });
  }
};

export default ClaimForm;
