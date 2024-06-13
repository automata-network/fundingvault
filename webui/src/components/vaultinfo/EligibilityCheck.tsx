import {
	useAccount,
  useReadContract,
} from "wagmi";
import { ConfigForChainId } from "../../utils/chaincfg";

import VaultTokenAbi from "../../abi/VaultToken.json";
import ClaimForm from "./ClaimForm";

const EligibilityCheck = (): React.ReactElement => {
  const { address, chain } = useAccount();
  let chainConfig = ConfigForChainId(chain!.id)!;

  const tokenBalance = useReadContract({
		address: chainConfig.TokenContractAddr,
		abi: VaultTokenAbi,
		chainId: chainConfig.Chain.id,
		functionName: "balanceOf",
		args: [ address ],
	});
  const firstTokenId = useReadContract({
		address: chainConfig.TokenContractAddr,
		abi: VaultTokenAbi,
		chainId: chainConfig.Chain.id,
		functionName: "tokenOfOwnerByIndex",
		args: [ address, 0 ],
	});

  if(tokenBalance.isLoading || firstTokenId.isLoading) {
    return (
      <Loading text="Loading eligibility...">
      </Loading>
    )
  }
  if(tokenBalance.isError) {
    return (
      <div className="alert alert-danger">Failed checking eligibility: {tokenBalance.error.message}</div>
    )
  }
  if(tokenBalance.data == 0) {
    return (
      <div>
        Sorry, your wallet ({address}) is not authorized to request funds from the FundingVault. Have you <a href="https://github.com/ethpandaops/fundingvault/blob/master/README.md#applying-for-a-grant">applied for a grant</a> already? 
      </div>
    )
  }
  if(firstTokenId.isError) {
    return (
      <div className="alert alert-danger">Failed checking eligibility: {firstTokenId.error.message}</div>
    )
  }
  
  return <ClaimForm grantId={firstTokenId.data as number} />;
}

const Loading = (props: {text: string}) => {
	return (
		<div className="p-4">
			{props.text}
		</div>
	)
}

export default EligibilityCheck;
