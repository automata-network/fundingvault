import { useAccount, useReadContract } from "wagmi";
import { ConfigForChainId } from "../../utils/chaincfg";

import VaultTokenAbi from "../../abi/VaultToken.json";
import ClaimForm from "./ClaimForm";
import { Alert } from "../alert/Alert";

const EligibilityCheck = (props: {
  displayMoreInfo: boolean;
  onMoreInfoDisplay: () => void;
}): React.ReactElement => {
  const { address, chain } = useAccount();
  let chainConfig = ConfigForChainId(chain!.id)!;

  const tokenBalance = useReadContract({
    address: chainConfig.TokenContractAddr,
    abi: VaultTokenAbi,
    chainId: chainConfig.Chain.id,
    functionName: "balanceOf",
    args: [address],
  });
  const firstTokenId = useReadContract({
    address: chainConfig.TokenContractAddr,
    abi: VaultTokenAbi,
    chainId: chainConfig.Chain.id,
    functionName: "tokenOfOwnerByIndex",
    args: [address, 0],
  });

  if (tokenBalance.isLoading || firstTokenId.isLoading) {
    return <Loading text="Loading eligibility..."></Loading>;
  }
  if (tokenBalance.isError) {
    return (
      <Alert
        className="ata-claim-eligibility-check-error"
        type="error"
        title="Failed checking eligibility"
        message={tokenBalance.error.message}
      />
    );
  }
  if (tokenBalance.data == 0) {
    return (
      <Alert
        className="ata-claim-eligibility-check-error"
        type="error"
        title="Access not authorized"
        message="It seems like your wallet hasn’t been granted access to our vault."
      />
    );
  }
  if (firstTokenId.isError) {
    return (
      <Alert
        className="ata-claim-eligibility-check-error"
        type="error"
        title="Failed checking eligibility"
        message={firstTokenId.error.message}
      />
    );
  }

  return <ClaimForm grantId={firstTokenId.data as number} {...props} />;
};

const Loading = (props: { text: string }) => {
  return <div className="p-4">{props.text}</div>;
};

export default EligibilityCheck;
