import { useMemo } from 'react';
import { ethers } from 'ethers';
import abi from '../abis/AxurriStaking.json';

const useStakingContract = (stakingAddress) => {
  const provider = useMemo(() => new ethers.BrowserProvider(window.ethereum), []);
  const [signer, setSigner] = React.useState(null);

  React.useEffect(() => {
    provider.getSigner().then(setSigner);
  }, [provider]);

  return useMemo(() => {
    if (!stakingAddress || !signer) return null;
    return new ethers.Contract(stakingAddress, abi, signer);
  }, [stakingAddress, signer]);
};

export default useStakingContract;