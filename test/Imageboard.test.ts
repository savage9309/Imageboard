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

  it('should create a Thread', async () => {
    const {users, Imageboard, bytes32Strings} = await setup();
    const threadTx = users[1].Imageboard.createThread(bytes32Strings[0]);
    await expect(threadTx).to.emit(Imageboard, 'ThreadCreated');
    expect(await users[3].Imageboard.getTotalThreads()).to.equal(1);
  });

  it('should create multible Threads', async () => {
    const {users, Imageboard, bytes32Strings} = await setup();

    const thread0Tx = await users[1].Imageboard.createThread(bytes32Strings[0]);
    const thread1Tx = await users[1].Imageboard.createThread(bytes32Strings[1]);
    expect(await users[3].Imageboard.getTotalThreads()).to.equal(2);

    const threadIds: string[] = await users[2].Imageboard.getPaginatedThreadIds(1, 2);

    const thread0 = new Thread(await users[2].Imageboard.getThread(threadIds[0]));
    expect(thread0.index).to.equal(0);

    const thread1 = new Thread(await users[2].Imageboard.getThread(threadIds[1]));
    expect(thread1.index).to.equal(1);
  });

  it('should get Paginated ThreadIds', async () => {
    const {users, bytes32Strings} = await setup();
    bytes32Strings.map(async (bzzhash) => await users[2].Imageboard.createThread(bzzhash));
    expect(await users[3].Imageboard.getTotalThreads()).to.equal(210);

    const firstPage = await users[2].Imageboard.getPaginatedThreadIds(1, 50);
    expect(firstPage.length).to.equal(50);

    const lastPage = await users[2].Imageboard.getPaginatedThreadIds(3, 100);
    expect(lastPage.length).to.equal(100);
  });

  it('should get Thread via Id', async () => {
    const {users, Imageboard, timeNow, bytes32Strings} = await setup();
    const blocktime = timeNow + 1 * 3600;
    await ethers.provider.send('evm_setNextBlockTimestamp', [blocktime]);
    await users[1].Imageboard.createThread(bytes32Strings[0]);
    const threadIds: string[] = await users[2].Imageboard.getPaginatedThreadIds(1, 2);

    const thread = new Thread(await users[2].Imageboard.getThread(threadIds[0]));
    expect(thread.index).to.equal(0);
    expect(thread.bzzhash).to.equal(bytes32Strings[0]);
    expect(thread.owner).to.equal(users[1].address);
    expect(thread.timestamp).to.equal(blocktime);
    expect(thread.commentIds).to.be.empty;
  });

  it('should create comment on thread', async () => {
    const {users, Imageboard, bytes32Strings} = await setup();
    await users[1].Imageboard.createThread(bytes32Strings[0]);
    const threadIds: string[] = await users[2].Imageboard.getPaginatedThreadIds(1, 1);

    await users[2].Imageboard.createComment(threadIds[0], bytes32Strings[1]);

    const thread = await users[2].Imageboard.getThread(threadIds[0]);
    const commentId = thread.commentIds[0];

    const commentStruct: IPostStruct = await users[2].Imageboard.getComment(commentId);
    const comment = new Comment(commentStruct);
    expect(comment.bzzhash).to.equal(bytes32Strings[1]);
    expect(comment.owner).to.equal(users[2].address);
    expect(comment.commentIds).to.be.empty;
    expect(comment.threadBzzhash).to.equal(bytes32Strings[0]);
  });

  it('should create comment on comment', async () => {
    const {users, Imageboard, bytes32Strings} = await setup();

    const threadBzzhash = bytes32Strings[0];
    const commentBzzhash = bytes32Strings[1];
    const subCommentBzzhash = bytes32Strings[2];

    // create Thread
    await users[1].Imageboard.createThread(threadBzzhash);

    // get Thread
    const threadIds: string[] = await users[2].Imageboard.getPaginatedThreadIds(1, 1);
    const threadId = threadIds[0];

    // create Comment on Thread
    await users[2].Imageboard.createComment(threadId, commentBzzhash);

    // get Thread commentIds
    const thread = new Thread(await users[2].Imageboard.getThread(threadId));
    const commentId = thread.commentIds[0];

    // create subComment on comment
    await users[2].Imageboard.createComment(commentId, subCommentBzzhash);

    // get Comment
    const comment = new Comment(await users[2].Imageboard.getComment(commentId));
    const subCommentId = comment.commentIds[0];

    // get SubComment
    const subComment = new Comment(await users[2].Imageboard.getComment(subCommentId));
    expect(subComment.bzzhash).to.equal(subCommentBzzhash);
  });

  it('allowance and approve BZZ ', async () => {
    const { alice, carol, Imageboard, bytes32Strings} = await setup();
    expect(await carol.BZZ.balanceOf(alice.address)).to.equal(parseUnits('0.1', 16));
    expect(await carol.BZZ.balanceOf(Imageboard.address)).to.equal(parseUnits('0.0', 16));

    expect(await carol.BZZ.allowance(alice.address, Imageboard.address)).to.equal(parseUnits('0.0', 16));

    await alice.BZZ.approve(Imageboard.address, parseUnits('0.02', 16)) // approve spending some BZZ
    
    expect(await carol.BZZ.allowance(alice.address, Imageboard.address) ).to.equal(parseUnits('0.02', 16));
    expect(await carol.BZZ.balanceOf(Imageboard.address) ).to.equal(parseUnits('0.0', 16));

    await carol.Imageboard.createThread(bytes32Strings[0]);
    const threadIds: string[] = await carol.Imageboard.getPaginatedThreadIds(1, 1);
    await alice.Imageboard.voteUp(threadIds[0], parseUnits('0.02', 16))
    expect(await carol.BZZ.balanceOf(alice.address)).to.equal(parseUnits('0.08', 16));
    expect(await carol.BZZ.balanceOf(Imageboard.address) ).to.equal(parseUnits('0.02', 16));
  });

  

  // it('should get comments via address', async () => {
  //   const {users, timeNow, bytes32Strings} = await setup();

  //   const blocktime = timeNow + 1 * 3600;
  //   await ethers.provider.send('evm_setNextBlockTimestamp', [blocktime]);
  //   await users[1].Imageboard.createThread(bytes32Strings[0])
  //   await users[1].Imageboard.createComment(bytes32Strings[0], bytes32Strings[1])
  //   await users[1].Imageboard.createComment(bytes32Strings[0], bytes32Strings[2])
  //   await users[2].Imageboard.createComment(bytes32Strings[0], bytes32Strings[3])
  //   await users[3].Imageboard.createComment(bytes32Strings[3], bytes32Strings[4])

  //   const user1Commentbytes32Strings: BytesLike[] = await users[4].Imageboard.getCommentbytes32StringsByAddress(users[1].address)
  //   expect(user1Commentbytes32Strings).to.contains(bytes32Strings[1])
  //   expect(user1Commentbytes32Strings).to.contains(bytes32Strings[2])
  //   expect(user1Commentbytes32Strings).lengthOf(2)

  //   const user2Commentbytes32Strings: BytesLike[] = await users[4].Imageboard.getCommentbytes32StringsByAddress(users[2].address)
  //   expect(user2Commentbytes32Strings).to.contains(bytes32Strings[3])
  //   expect(user2Commentbytes32Strings).lengthOf(1)

  //   const user3Commentbytes32Strings: BytesLike[] = await users[4].Imageboard.getCommentbytes32StringsByAddress(users[3].address)
  //   expect(user3Commentbytes32Strings).to.contains(bytes32Strings[4])
  //   expect(user3Commentbytes32Strings).lengthOf(1)
  // });

  it('should like and dislike a Thread', async () => {
    // const {deployer, alice, Imageboard, bytes32Strings} = await setup();

    // await users[2].Imageboard.like(bytes32Strings[0])
    // expect((await users[2].Imageboard.getThreadByBzzhash(bytes32Strings[0])).rating).to.equal(1);

    // await users[1].Imageboard.like(bytes32Strings[0])
    // expect((await users[2].Imageboard.getThreadByBzzhash(bytes32Strings[0])).rating).to.equal(2);

    // await users[1].Imageboard.dislike(bytes32Strings[0])
    // expect((await users[2].Imageboard.getThreadByBzzhash(bytes32Strings[0])).rating).to.equal(1);

    // await users[1].Imageboard.dislike(bytes32Strings[0])
    // expect((await users[2].Imageboard.getThreadByBzzhash(bytes32Strings[0])).rating).to.equal(0);

    // await users[1].Imageboard.dislike(bytes32Strings[0])
    // expect((await users[2].Imageboard.getThreadByBzzhash(bytes32Strings[0])).rating).to.equal(-1);
  });
  
});
