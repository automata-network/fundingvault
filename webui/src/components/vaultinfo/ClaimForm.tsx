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
import exportIcon from "../../assets/imgs/export.png";
import { Alert } from "../alert/Alert";

interface IGrantDetails {
  claimInterval: bigint;
  claimLimit: bigint;
  claimTime: bigint;
  dustBalance: bigint;
}

const ClaimForm = (props: {
  grantId: number;
  displayMoreInfo: boolean;
  onMoreInfoDisplay: () => void;
}): React.ReactElement => {
  const { address, chain } = useAccount();
  const chainConfig = ConfigForChainId(chain!.id)!;
  const [claimAmount, setClaimAmount] = useState("10");
  const [claimTarget, setClaimTarget] = useState("");
  const [claimAll] = useState<boolean>(false);
  const [claimTargetCustom] = useState<boolean>(true);

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
    <>
      <div className="ata-more-info">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            props.onMoreInfoDisplay();
          }}
        >
          More details
          <img className="ata-export-icon" src={exportIcon} alt="export" />
        </a>
      </div>
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
        <div className="ata-claim-form-fields">
          <div className="ata-claim-form-field ata-claim-form-field-amount">
            <div className="ata-form-label">
              Amount ({chainConfig.TokenName})
            </div>
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
          <div className="ata-claim-form-field">
            <div className="ata-form-label">Target Wallet</div>
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
                  alt="fork"
                  onClick={() => {
                    setClaimTarget("");
                  }}
                />
              ) : null}
            </div>
          </div>
        </div>

        {claimRequest.isPending && (claimRequest.data as any) ? (
          <Alert
            className="ata-claim-notification"
            type="loading"
            title="Claim transaction pending..."
            message={
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
              </>
            }
          />
        ) : null}

        {claimRequest.isError ? (
          <Alert
            className="ata-claim-notification"
            type="error"
            title="Claim failed."
            message={
              <>
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
              </>
            }
          />
        ) : null}

        {claimRequest.isSuccess ? (
          <Alert
            className="ata-claim-notification"
            type="success"
            title="Claim TX."
            message={
              <>
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
              </>
            }
          />
        ) : null}

        <GlassButton
          className="ata-claim-button"
          onClick={(evt) => requestFunds(evt.target as HTMLButtonElement)}
          disabled={claimRequest.isPending}
        >
          <img
            className="ata-currency-dollar-icon"
            alt="currency-dollar"
            src={currencyDollarIcon}
          />
          Request Funds
        </GlassButton>
      </div>
    </>
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
