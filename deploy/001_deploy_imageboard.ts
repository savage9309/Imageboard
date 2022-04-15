import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployer} = await hre.getNamedAccounts();
  const {deploy} = hre.deployments;
  const useProxy = !hre.network.live;

  const xBzzContractAddress = '0xdbf3ea6f5bee45c02255b2c26a16f300502f68da';

  // proxy only in non-live network (localhost and hardhat network) enabling HCR (Hot Contract Replacement)
  // in live network, proxy is disabled and constructor is invoked
  await deploy('Imageboard', {
    from: deployer,
    args: [xBzzContractAddress],
    proxy: useProxy && 'postUpgrade',
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  });

  return !useProxy; // when live network, record the script as executed to prevent rexecution
};
export default func;
func.id = 'deploy_imageboard'; // id required to prevent reexecution
func.tags = ['Imageboard'];
