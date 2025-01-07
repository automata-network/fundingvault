import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import EligibilityCheck from "./EligibilityCheck";
import walletIcon from "../../assets/imgs/wallet.png";
import { GlassButton } from "../button/GlassButton";

const VaultInfo = (): React.ReactElement => {
  const { isConnected, chain } = useAccount();
  const { openConnectModal } = useConnectModal();

  return (
    <div className="page-block ata-card">
      <div className="ata-card-content">
        <h1 className="ata-border-bottom">Automata Funding Vault</h1>
        <p>
          The Automata FundingVault contract provides a way to distribute
          continuous limited amounts of funds to authorized entities.
          <br />
          <br />
          The distribution is time gated and a specific limit per grant is
          enforced. Check out the{" "}
          <a href="https://github.com/ethpandaops/fundingvault/blob/master/README.md">
            FundingVault repository
          </a>{" "}
          for more details.
        </p>
        {isConnected && chain ? <EligibilityCheck /> : null}
        {!isConnected ? renderDisconnected() : null}
        {isConnected && !chain ? renderInvalidNetwork() : null}
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
        <img className="wallet-icon" src={walletIcon} />
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
