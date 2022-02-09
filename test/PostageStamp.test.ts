import {expect} from './chai-setup';
import {ethers, deployments, getUnnamedAccounts, getNamedAccounts} from 'hardhat';
import {setupUser, setupUsers} from './utils';
import { BigNumber, Contract, utils } from 'ethers';
import { BytesLike, concat, defaultAbiCoder, formatBytes32String, keccak256, parseUnits } from 'ethers/lib/utils';
import { IERC20 } from '../frontend/src/hardhat/typechain';

const setup = deployments.createFixture(async () => {
  await deployments.fixture('PostageStamp');
  const {alice} = await getNamedAccounts();
  const contracts = {
    PostageStamp: <Contract>await ethers.getContract('PostageStamp'),
    BZZ: <IERC20>await ethers.getContract('BZZ'),
  };
  const users = await setupUsers(await getUnnamedAccounts(), contracts);
  return {
    ...contracts,
    users,
    alice: await setupUser(alice, contracts),
  };
});

describe('PostageStamp', function () {

  it('get Batch', async function () {
    const {alice} = await setup();
    const batchId = '0x50dfe9e79d2ec456818ee1969e66ee74917cfbdbba572c165e4cf324ba2e37d7'
    const batches = await alice.PostageStamp.batches(batchId)
    expect(batches.owner).to.equal('0x4887FF01537d4524Cb61f1429a9B7365F357F424');
  });

  
  it('create Batch', async function () {
    const {users, alice, PostageStamp} = await setup();
    const aliceOldBzzBalance = await alice.BZZ.balanceOf(alice.address)
    expect(aliceOldBzzBalance).to.equal(parseUnits('0.1', 16));
    expect(await alice.BZZ.allowance(alice.address, PostageStamp.address)).to.equal(parseUnits('0.0', 16));

    const initialBalancePerChunk = 10000000
    const depth = 20
    const bucketDepth = 16
    const immutable = false
    const nonce = formatBytes32String('nonce')
    const batchId: BytesLike = keccak256(defaultAbiCoder.encode([ "address", "bytes32" ], [ alice.address, nonce ]))
    const totalAmount = initialBalancePerChunk * Math.pow(2, depth)

    await alice.BZZ.approve(PostageStamp.address, totalAmount)
    expect(await alice.BZZ.allowance(alice.address, PostageStamp.address)).to.equal(totalAmount);

    await expect(
      alice.PostageStamp.createBatch(alice.address, initialBalancePerChunk, depth, bucketDepth, nonce, immutable)
    ).to.emit(PostageStamp, 'BatchCreated') //.withArgs(batchId, totalAmount, 25696312, alice.address, depth, bucketDepth, immutable);

    const aliceNewBzzBalance = await alice.BZZ.balanceOf(alice.address)
    expect(aliceOldBzzBalance.toNumber()).to.equal(aliceNewBzzBalance.toNumber() + totalAmount);

    const batch = await alice.PostageStamp.batches(batchId)
    expect(batch.owner).to.equal(alice.address);
  });
});
