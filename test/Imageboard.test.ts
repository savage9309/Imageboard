import {expect} from './chai-setup';
import {ethers, getNamedAccounts, deployments, getUnnamedAccounts, network} from 'hardhat';
import {IERC20, Imageboard} from '../frontend/src/hardhat/typechain';
import {setupUsers, setupUser} from './utils';
import {IPostStruct, Thread, Comment} from '../frontend/src/state/state';
import {BytesLike, utils} from 'ethers';
const {formatBytes32String, parseUnits, formatUnits} = utils;

const setup = deployments.createFixture(async () => {
  await deployments.fixture('Imageboard');
  const timeNow = Math.floor(new Date().getTime() / 1000);
  const contracts = {
    Imageboard: <Imageboard>await ethers.getContract('Imageboard'),
    BZZ: <IERC20>await ethers.getContract('BZZ'),
  };
  const {deployer, alice, bob, carol, dave} = await getNamedAccounts();

  const unnamedAccounts = await getUnnamedAccounts();
  const users = await setupUsers(unnamedAccounts, contracts);

  const bytes32Strings: BytesLike[] = Array.from(Array(210), (_, i) => formatBytes32String(`${i}`));
  return {
    ...contracts,
    users,
    deployer: await setupUser(deployer, contracts),
    alice: await setupUser(alice, contracts),
    bob: await setupUser(bob, contracts),
    carol: await setupUser(carol, contracts),
    dave: await setupUser(dave, contracts),
    bytes32Strings,
    timeNow,
  };
});

describe('Imageboard', function () {
  it('users should have a BZZ token', async () => {
    const {users, alice, bob, carol, dave} = await setup();
    expect(await users[0].BZZ.balanceOf(alice.address)).to.equal(parseUnits('0.1', 16));
    expect(await users[0].BZZ.balanceOf(bob.address)).to.equal(parseUnits('0.2', 16));
    expect(await users[0].BZZ.balanceOf(carol.address)).to.equal(parseUnits('0.3', 16));
    expect(await users[0].BZZ.balanceOf(dave.address)).to.equal(parseUnits('0.1', 16));
  });

  it('should create a Thread', async () => {
    const {alice, users,Imageboard, bytes32Strings} = await setup();
    await alice.BZZ.approve(Imageboard.address, parseUnits('0.02', 16));

    const threadTx = alice.Imageboard.createThread(bytes32Strings[0]);
    expect(await users[2].Imageboard.totalUsers()).to.equal(1);
    expect(await users[2].Imageboard.randomUser()).to.equal(alice.address); // there is only on user 
    
    await expect(threadTx).to.emit(Imageboard, 'ThreadCreated');
    expect(await alice.Imageboard.getTotalThreads()).to.equal(1);
  });

  it('should create multible Threads', async () => {
    const {alice, users, Imageboard, bytes32Strings} = await setup();

    await alice.BZZ.approve(Imageboard.address, parseUnits('0.02', 16));
    
    const thread0Tx = await alice.Imageboard.createThread(bytes32Strings[0]);
    const thread1Tx = await alice.Imageboard.createThread(bytes32Strings[1]);
    expect(await users[3].Imageboard.getTotalThreads()).to.equal(2);
    expect(await users[2].Imageboard.totalUsers()).to.equal(1);

    const threadIds: string[] = await users[2].Imageboard.getPaginatedThreadIds(1, 2);

    const thread0 = new Thread(await users[2].Imageboard.getThread(threadIds[0]));
    expect(thread0.index).to.equal(0);

    const thread1 = new Thread(await users[2].Imageboard.getThread(threadIds[1]));
    expect(thread1.index).to.equal(1);
  });

  // it('should get Paginated ThreadIds', async () => {
  //   const {carol, Imageboard, users, bytes32Strings} = await setup();
  //   await carol.BZZ.approve(Imageboard.address, parseUnits('0.3', 16));

  //   bytes32Strings.slice(0,20).map(async (bzzhash) => await carol.Imageboard.createThread(bzzhash));
  //   expect(await users[2].Imageboard.totalUsers()).to.equal(1);
  //   expect(await users[3].Imageboard.getTotalThreads()).to.equal(100);

  //   const firstPage = await users[2].Imageboard.getPaginatedThreadIds(1, 50);
  //   expect(firstPage.length).to.equal(50);

  //   const lastPage = await users[2].Imageboard.getPaginatedThreadIds(3, 50);
  //   expect(lastPage.length).to.equal(50);
  // });

  it('should get Thread via Id', async () => {
    const {users, alice, Imageboard, timeNow, bytes32Strings} = await setup();
    await alice.BZZ.approve(Imageboard.address, parseUnits('0.02', 16));

    const blocktime = timeNow + 1 * 3600;
    await ethers.provider.send('evm_setNextBlockTimestamp', [blocktime]);
    await alice.Imageboard.createThread(bytes32Strings[0]);
    const threadIds: string[] = await users[2].Imageboard.getPaginatedThreadIds(1, 2);

    const thread = new Thread(await users[2].Imageboard.getThread(threadIds[0]));
    expect(thread.index).to.equal(0);
    expect(thread.bzzhash).to.equal(bytes32Strings[0]);
    expect(thread.owner).to.equal(alice.address);
    expect(thread.timestamp).to.equal(blocktime);
    expect(thread.commentIds).to.be.empty;
  });

  it('should create comment on thread', async () => {
    const {users, alice, bob, Imageboard, bytes32Strings} = await setup();
    await alice.BZZ.approve(Imageboard.address, parseUnits('0.02', 16));
    await bob.BZZ.approve(Imageboard.address, parseUnits('0.02', 16));

    await alice.Imageboard.createThread(bytes32Strings[0]);
    expect(await users[2].Imageboard.totalUsers()).to.equal(1);
    const threadIds: string[] = await users[2].Imageboard.getPaginatedThreadIds(1, 1);

    await bob.Imageboard.createComment(threadIds[0], bytes32Strings[1]);
    expect(await users[2].Imageboard.totalUsers()).to.equal(2);
    //expect(await users[2].Imageboard.randomUser()).to.equal(alice.address); // testing randomness works only with fixed blocknumber 

    const thread = await users[2].Imageboard.getThread(threadIds[0]);
    const commentId = thread.commentIds[0];

    const commentStruct: IPostStruct = await users[2].Imageboard.getComment(commentId);
    const comment = new Comment(commentStruct);
    expect(comment.bzzhash).to.equal(bytes32Strings[1]);
    expect(comment.owner).to.equal(bob.address);
    expect(comment.commentIds).to.be.empty;
    expect(comment.threadBzzhash).to.equal(bytes32Strings[0]);
  });

  it('should create comment on comment', async () => {
    const {users, alice, bob, Imageboard, bytes32Strings} = await setup();
    await alice.BZZ.approve(Imageboard.address, parseUnits('0.02', 16));
    await bob.BZZ.approve(Imageboard.address, parseUnits('0.02', 16));

    const threadBzzhash = bytes32Strings[0];
    const commentBzzhash = bytes32Strings[1];
    const subCommentBzzhash = bytes32Strings[2];

    // create Thread
    await alice.Imageboard.createThread(threadBzzhash);
    expect(await users[2].Imageboard.totalUsers()).to.equal(1);

    // get Thread
    const threadIds: string[] = await bob.Imageboard.getPaginatedThreadIds(1, 1);
    const threadId = threadIds[0];

    // create Comment on Thread
    await bob.Imageboard.createComment(threadId, commentBzzhash);
    expect(await users[2].Imageboard.totalUsers()).to.equal(2);

    // get Thread commentIds
    const thread = new Thread(await bob.Imageboard.getThread(threadId));
    const commentId = thread.commentIds[0];

    // create subComment on comment
    await bob.Imageboard.createComment(commentId, subCommentBzzhash);
    expect(await users[2].Imageboard.totalUsers()).to.equal(2);

    // get Comment
    const comment = new Comment(await bob.Imageboard.getComment(commentId));
    const subCommentId = comment.commentIds[0];

    // get SubComment
    const subComment = new Comment(await bob.Imageboard.getComment(subCommentId));
    expect(subComment.bzzhash).to.equal(subCommentBzzhash);
  });

  it('approve BZZ spending', async () => {
    const {alice, carol, Imageboard, bytes32Strings} = await setup();

    expect(await carol.Imageboard.getSocialScore(alice.address)).to.equal(0);
    expect(await carol.Imageboard.getSocialScore(carol.address)).to.equal(0);
    expect(await carol.BZZ.balanceOf(alice.address)).to.equal(parseUnits('0.1', 16));
    expect(await carol.BZZ.balanceOf(Imageboard.address)).to.equal(parseUnits('0.0', 16));
    expect(await carol.BZZ.allowance(alice.address, Imageboard.address)).to.equal(parseUnits('0.0', 16));

    await alice.BZZ.approve(Imageboard.address, parseUnits('0.02', 16)); // approve spending some BZZ

    expect(await carol.Imageboard.getSocialScore(alice.address)).to.equal(0);
    expect(await carol.Imageboard.getSocialScore(carol.address)).to.equal(0);
    expect(await carol.BZZ.balanceOf(alice.address)).to.equal(parseUnits('0.1', 16));
    expect(await carol.BZZ.balanceOf(Imageboard.address)).to.equal(parseUnits('0.0', 16));
    expect(await carol.BZZ.allowance(alice.address, Imageboard.address)).to.equal(parseUnits('0.02', 16));
  });

  it('getMultiplier', async () => {
    const {users} = await setup();
    expect(await users[0].Imageboard.getMultiplier(2)).to.equal(1);
    expect(await users[0].Imageboard.getMultiplier(1)).to.equal(2);
    expect(await users[0].Imageboard.getMultiplier(0)).to.equal(3);
    expect(await users[0].Imageboard.getMultiplier(-1)).to.equal(4);
    expect(await users[0].Imageboard.getMultiplier(-2)).to.equal(5);
  });

  it('getSocialScore', async () => {
    const {alice, bob, carol, users, Imageboard, bytes32Strings} = await setup();
    expect(await users[0].BZZ.balanceOf(alice.address)).to.equal(parseUnits('0.1', 16));
    expect(await users[0].BZZ.balanceOf(bob.address)).to.equal(parseUnits('0.2', 16));
    expect(await users[0].BZZ.balanceOf(carol.address)).to.equal(parseUnits('0.3', 16));

    expect(await users[0].Imageboard.getSocialScore(alice.address)).to.equal(0);
    expect(await users[0].Imageboard.getSocialScore(bob.address)).to.equal(0);
    expect(await users[0].Imageboard.getSocialScore(carol.address)).to.equal(0);

    await alice.BZZ.approve(Imageboard.address, parseUnits('0.1', 16));
    await bob.BZZ.approve(Imageboard.address, parseUnits('0.1', 16));
    await carol.BZZ.approve(Imageboard.address, parseUnits('0.1', 16));

    await carol.Imageboard.createThread(bytes32Strings[0]);

    expect(await users[0].BZZ.balanceOf(alice.address)).to.equal(parseUnits('0.1', 16));
    expect(await users[0].Imageboard.getFee(alice.address)).to.equal(parseUnits('0.003', 16));
    expect(await users[0].Imageboard.getFee(carol.address)).to.equal(parseUnits('0.003', 16));
    expect(await users[0].Imageboard.getSocialScore(carol.address)).to.equal(0);

    const threadIds: string[] = await carol.Imageboard.getPaginatedThreadIds(1, 1);

    await alice.Imageboard.upVote(threadIds[0]);
    expect(await users[0].BZZ.balanceOf(alice.address)).to.equal(parseUnits('0.097', 16));
    expect(await users[0].Imageboard.getFee(alice.address)).to.equal(parseUnits('0.003', 16));
    expect(await users[0].Imageboard.getFee(carol.address)).to.equal(parseUnits('0.002', 16));
    expect(await users[0].Imageboard.getSocialScore(carol.address)).to.equal(1);

    await alice.Imageboard.upVote(threadIds[0]);
    expect(await users[0].BZZ.balanceOf(alice.address)).to.equal(parseUnits('0.094', 16));
    expect(await users[0].Imageboard.getFee(alice.address)).to.equal(parseUnits('0.003', 16));
    expect(await users[0].Imageboard.getFee(carol.address)).to.equal(parseUnits('0.001', 16));
    expect(await users[0].Imageboard.getSocialScore(carol.address)).to.equal(2);

    await alice.Imageboard.downVote(threadIds[0]);
    expect(await users[0].BZZ.balanceOf(alice.address)).to.equal(parseUnits('0.091', 16));
    expect(await users[0].Imageboard.getFee(alice.address)).to.equal(parseUnits('0.003', 16));
    expect(await users[0].Imageboard.getFee(carol.address)).to.equal(parseUnits('0.002', 16));
    expect(await users[0].Imageboard.getSocialScore(carol.address)).to.equal(1);

    await alice.Imageboard.downVote(threadIds[0]);
    expect(await users[0].BZZ.balanceOf(alice.address)).to.equal(parseUnits('0.088', 16));
    expect(await users[0].Imageboard.getFee(alice.address)).to.equal(parseUnits('0.003', 16));
    expect(await users[0].Imageboard.getFee(carol.address)).to.equal(parseUnits('0.003', 16));
    expect(await users[0].Imageboard.getSocialScore(carol.address)).to.equal(0);

    await bob.Imageboard.downVote(threadIds[0]);
    expect(await users[0].BZZ.balanceOf(bob.address)).to.equal(parseUnits('0.197', 16));
    expect(await users[0].Imageboard.getFee(alice.address)).to.equal(parseUnits('0.003', 16));
    expect(await users[0].Imageboard.getFee(carol.address)).to.equal(parseUnits('0.004', 16));
    expect(await users[0].Imageboard.getSocialScore(carol.address)).to.equal(-1);

    await bob.Imageboard.downVote(threadIds[0]);
    expect(await users[0].BZZ.balanceOf(bob.address)).to.equal(parseUnits('0.194', 16));
    expect(await users[0].Imageboard.getFee(alice.address)).to.equal(parseUnits('0.003', 16));
    expect(await users[0].Imageboard.getFee(carol.address)).to.equal(parseUnits('0.005', 16));
    expect(await users[0].Imageboard.getSocialScore(carol.address)).to.equal(-2);
  });

  it('should get comments via address', async () => {
    const {users, alice, bob, carol, Imageboard, timeNow, bytes32Strings} = await setup();
    await alice.BZZ.approve(Imageboard.address, parseUnits('0.1', 16));
    await bob.BZZ.approve(Imageboard.address, parseUnits('0.1', 16));
    await carol.BZZ.approve(Imageboard.address, parseUnits('0.1', 16));

    expect(await users[0].BZZ.balanceOf(alice.address)).to.equal(parseUnits('0.1', 16));
    expect(await users[0].BZZ.balanceOf(bob.address)).to.equal(parseUnits('0.2', 16));
    expect(await users[0].BZZ.balanceOf(carol.address)).to.equal(parseUnits('0.3', 16));

    const blocktime = timeNow + 1 * 3600;
    await ethers.provider.send('evm_setNextBlockTimestamp', [blocktime]);
    await alice.Imageboard.createThread(bytes32Strings[0]);
    expect(await users[2].Imageboard.totalUsers()).to.equal(1);

    const threadIds: string[] = await alice.Imageboard.getPaginatedThreadIds(1, 1);
    const threadId = threadIds[0];

    await bob.Imageboard.createComment(threadId, bytes32Strings[1]);
    expect(await users[0].BZZ.balanceOf(alice.address)).to.equal(parseUnits('0.103', 16));
    expect(await users[0].BZZ.balanceOf(bob.address)).to.equal(parseUnits('0.197', 16));
    expect(await users[0].BZZ.balanceOf(carol.address)).to.equal(parseUnits('0.3', 16));


    await carol.Imageboard.createComment(threadId, bytes32Strings[2]);
    // testing randomness works only with fixed blocknumber 
    // expect(await users[0].BZZ.balanceOf(alice.address)).to.equal(parseUnits('0.106', 16)); // '0.1045'
    // expect(await users[0].BZZ.balanceOf(bob.address)).to.equal(parseUnits('0.1985', 16));
    // expect(await users[0].BZZ.balanceOf(carol.address)).to.equal(parseUnits('0.297', 16));


    await alice.Imageboard.createComment(threadId, bytes32Strings[3]);
    expect(await users[2].Imageboard.totalUsers()).to.equal(3);

    const thread = await users[1].Imageboard.getThread(threadId);
    const bobCommentIds: BytesLike[] = await users[4].Imageboard.getCommentIdsByAddress(bob.address);
    expect(bobCommentIds).lengthOf(1);
    expect(thread.commentIds).to.include.members(bobCommentIds);

    const carolCommentIds: BytesLike[] = await users[4].Imageboard.getCommentIdsByAddress(carol.address);
    expect(carolCommentIds).lengthOf(1);
    expect(thread.commentIds).to.include.members(carolCommentIds);

    const aliceCommentIds: BytesLike[] = await users[4].Imageboard.getCommentIdsByAddress(alice.address);
    expect(aliceCommentIds).lengthOf(1);
    expect(thread.commentIds).to.include.members(aliceCommentIds);

    // make comment on comment
    await alice.Imageboard.createComment(carolCommentIds[0], bytes32Strings[4]);
    expect(await users[2].Imageboard.totalUsers()).to.equal(3);
    const carolComment = await users[1].Imageboard.getComment(carolCommentIds[0]);
    expect(carolComment.commentIds).lengthOf(1);
    const alice2CommentIds: BytesLike[] = await users[4].Imageboard.getCommentIdsByAddress(alice.address);
    expect(alice2CommentIds).to.include.members(carolComment.commentIds);
  });
});
