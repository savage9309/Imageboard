import {expect} from './chai-setup';
import {ethers, deployments, getUnnamedAccounts, getNamedAccounts} from 'hardhat';
import {IERC20} from '../frontend/src/hardhat/typechain';
import {setupUser, setupUsers} from './utils';

const setup = deployments.createFixture(async () => {
  await deployments.fixture('SimpleERC20');
  const {alice} = await getNamedAccounts();
  const contracts = {
    SimpleERC20: <IERC20>await ethers.getContract('SimpleERC20'),
  };
  const users = await setupUsers(await getUnnamedAccounts(), contracts);
  return {
    ...contracts,
    users,
    alice: await setupUser(alice, contracts),
  };
});

describe('SimpleERC20', function () {
  it('transfer fails', async function () {
    const {users} = await setup();
    await expect(users[0].SimpleERC20.transfer(users[1].address, 1)).to.be.revertedWith('NOT_ENOUGH_TOKENS');
  });

  it('transfer succeed', async function () {
    const {users, alice, SimpleERC20} = await setup();
    await alice.SimpleERC20.transfer(users[1].address, 1);

    await expect(alice.SimpleERC20.transfer(users[1].address, 1))
      .to.emit(SimpleERC20, 'Transfer')
      .withArgs(alice.address, users[1].address, 1);
  });
});
