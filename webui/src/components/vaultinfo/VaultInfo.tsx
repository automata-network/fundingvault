import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import EligibilityCheck from "./EligibilityCheck";
import walletIcon from "../../assets/imgs/wallet.png";
import leftArrowIcon from "../../assets/imgs/arrow-small-left.png";
import { GlassButton } from "../button/GlassButton";
import { useState } from "react";

const VaultInfo = (): React.ReactElement => {
  const { isConnected, chain } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [displayMoreInfo, setDisplayMoreInfo] = useState(false);

  return (
    <div className="page-block ata-card">
      <div className="ata-card-content">
        {!displayMoreInfo ? (
          <>
            <h1 className="ata-border-bottom">Automata Funding Vault</h1>
            <p>
              The Automata FundingVault contract provides a way to distribute
              continuous limited amounts of funds to authorized entities.
              <br />
              <br />
              The distribution is time gated and a specific limit per grant is
              enforced. Check out the{" "}
              <a
                href="https://github.com/ethpandaops/fundingvault/blob/master/README.md"
                target="_blank"
                rel="noreferrer"
              >
                FundingVault repository
              </a>{" "}
              for more details.
            </p>
            {isConnected && chain ? (
              <EligibilityCheck
                displayMoreInfo={displayMoreInfo}
                onMoreInfoDisplay={() => {
                  setDisplayMoreInfo(true);
                }}
              />
            ) : null}
            {!isConnected ? renderDisconnected() : null}
            {isConnected && !chain ? renderInvalidNetwork() : null}
          </>
        ) : (
          <>
            <h1 className="ata-border-bottom">More Details</h1>
            <p>
              Your claimable balance increases based on the earning rate (amount
              x interval).
              <br />
              <br />
              Claim within the set interval to get your full balance.
              <br />
              <br />
              If you wait too long, you’ll only get the maximum claimable
              balance. (i.e. the amount from the earning rate).
              <br />
              <br />
              If you wait longer than the interval, you can only claim the
              maximum.
              <br />
              <br />
              E.g. If the interval is 30 days, make sure to claim before 30 days
              pass to avoid losing some balance.
              <br />
              <br />
              Learn more{" "}
              <a
                href="https://github.com/ethpandaops/fundingvault/blob/master/README.md"
                target="_blank"
                rel="noreferrer"
              >
                here
              </a>
              .
            </p>
            <GlassButton
              className="ata-go-back-btn"
              onClick={() => setDisplayMoreInfo(false)}
            >
              <img className="ata-arrow-icon" src={leftArrowIcon} alt="back" />
              Go back
            </GlassButton>
          </>
        )}
      </div>
    </div>
  );

  function renderDisconnected() {
    return (
      <GlassButton
        className="connect-btn"
        onClick={() => {
          openConnectModal();
        }}
      >
        <img className="wallet-icon" src={walletIcon} alt="wallet" />
        Connect Wallet
      </GlassButton>
    );
  }

  function renderInvalidNetwork() {
    return (
      <div className="">Please switch to holesky or sepolia to continue.</div>
    );
  }
};

export default VaultInfo;
