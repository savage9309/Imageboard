import {serializeError} from 'eth-rpc-errors';
import {BigNumber, BigNumberish, Contract, ContractTransaction, ethers} from 'ethers';
import {IERC20, Imageboard} from '../hardhat/typechain';
import {Web3Provider} from '@ethersproject/providers';
import { SerializedEthereumRpcError } from 'eth-rpc-errors/dist/classes';
import { Bee, BeeDebug, FileUploadOptions, Tag } from '@ethersphere/bee-js';
import { BytesLike, defaultAbiCoder, formatBytes32String, hexStripZeros, keccak256, parseUnits } from 'ethers/lib/utils';
import {
  ActionType,
  AddThreadIds,
  AddComment,
  AddCommentTransaction,
  AddEthRpcError,
  AddThread,
  AddThreadTransaction,
  AppAction,
  RemoveThreadByIndex,
  ResetThreadIds,
  ResetThreads,
  SetCurrentPage,
  SetTotalThreads,
  ThreadListDidMount,
  UpdateComment,
  UpdateCommentByBzzhash,
  UpdateThreadByBzzhash,
  UpdateThreadByIndex,
  UpdateThreadByTxHash,
  RemoveThreadTransaction,
  SetBzzDeployment,
  SetImageboardDeployment,
  SetImageboardContract,
  SetBzzContract,
  SetBzzBalance,
  SetBzzAllowance,
  SetPostageBatchId,
} from './actions';
import {AppState, DeploymentLite, ICommentTransaction, IPostStruct, Thread, Comment, IThreadTransaction, VoteType} from './state';

import localhostImageboardDeployment from '../hardhat/deployments/localhost/Imageboard.json';
import localhostBzzDeployment from '../hardhat/deployments/localhost/BZZ.json';

import xdaiBzzDeployment from '../hardhat/deployments/xdai/BZZ.json';
import toast from 'react-hot-toast';

const bee = new Bee("http://localhost:1633")
const beeDebug = new BeeDebug("http://localhost:1635")

export const getDeployments = (library: Web3Provider, chainId: number) => async (dispatch: React.Dispatch<AppAction>, state: AppState) => {
    if (!library) return false;
    switch (chainId) {
      case 100: // xdai main
        //dispatch(setImageboardDeployment(xdaiImageboardDeployment));
        dispatch(setBzzDeployment(xdaiBzzDeployment));
        break;
      case 31337: // localhost
        dispatch(setImageboardDeployment(localhostImageboardDeployment));
        dispatch(setBzzDeployment(localhostBzzDeployment));
        break;
      default:
        toast.error(`chainId: ${chainId} unknown`)
        break;
    }
};

export const setImageboardDeployment = (imageboardDeployment: DeploymentLite): SetImageboardDeployment => ({
  type: ActionType.SetImageboardDeployment,
  payload: {imageboardDeployment},
});

export const setBzzDeployment = (bzzDeployment: DeploymentLite): SetBzzDeployment => ({
  type: ActionType.SetBzzDeployment,
  payload: {bzzDeployment},
});




export const getImageboardContract = (library: Web3Provider) => async (dispatch: React.Dispatch<AppAction>, state: AppState) => {
  const {imageboardDeployment} = state;
  if (!imageboardDeployment) return false;
  const contract = new ethers.Contract(imageboardDeployment.address, imageboardDeployment.abi, library) as Imageboard;
  dispatch(setImageboardContract(contract));
};

export const setImageboardContract = (imageboard: Imageboard): SetImageboardContract => ({
  type: ActionType.SetImageboardContract,
  payload: {imageboard},
});


export const getBzzContract = (library: Web3Provider) => async (dispatch: React.Dispatch<AppAction>, state: AppState) => {
  const {bzzDeployment} = state;
  if (!bzzDeployment) return false;
  const bzzContract = new ethers.Contract(bzzDeployment.address, bzzDeployment.abi, library) as IERC20;
  dispatch(setBzzContract(bzzContract));
};

export const setBzzContract = (bzz: IERC20): SetBzzContract => ({
  type: ActionType.SetBzzContract,
  payload: {bzz},
});




export const getBzzBalance = (address: string) => async (dispatch: React.Dispatch<AppAction>, state: AppState) => {
  const {bzz} = state;
  if (!bzz) return false;
  const bzzBalance: BigNumber = await bzz.balanceOf(address)
  console.log('bzz')
  dispatch(setBzzBalance(bzzBalance));
};

export const setBzzBalance = (bzzBalance: BigNumber): SetBzzBalance => ({
  type: ActionType.SetBzzBalance,
  payload: {bzzBalance},
});


export const getBzzAllowance = (owner: string) => async (dispatch: React.Dispatch<AppAction>, state: AppState) => {
  const {bzz, imageboardDeployment} = state;
  if(!imageboardDeployment) return false
  if (!bzz) return false;
  const spender = imageboardDeployment.address
  const bzzAllowance: BigNumber = await bzz.allowance(owner, spender)
  dispatch(setBzzAllowance(bzzAllowance));
};

export const setBzzAllowance = (bzzAllowance: BigNumber): SetBzzAllowance => ({
  type: ActionType.SetBzzAllowance,
  payload: {bzzAllowance},
});


export const sendBzzApprove = (account: string, library: Web3Provider, amount: BigNumberish) => async (dispatch: React.Dispatch<AppAction>, state: AppState) => {
  const {bzz, imageboardDeployment} = state;
  if(!imageboardDeployment) return false
  if (!bzz) return false;
  try {
    const signer = library.getSigner(account)
    const tx: ContractTransaction = await bzz.connect(signer).approve(imageboardDeployment.address, amount)
    await tx.wait()
  } catch (error) {
    console.error(error)
  }
};

export const getAllPostageBatch = () => async (dispatch: React.Dispatch<AppAction>, state: AppState) => {
  if(!beeDebug) return false
  try {
    const resonse = await beeDebug.getAllPostageBatch()
    console.log(resonse)
  } catch (error) {
    console.error(error)
  }
};

export const setPostageBatchId = (postageBatchId: string): SetPostageBatchId => ({
  type: ActionType.SetPostageBatchId,
  payload: {postageBatchId},
});





export const setCurrentPage = (currentPage: number): SetCurrentPage => ({
  type: ActionType.SetCurrentPage,
  payload: {currentPage},
});

export const setThreadListDidMount = (): ThreadListDidMount => ({
  type: ActionType.ThreadListDidMount,
});

export const getTotalThreads = () => async (dispatch: React.Dispatch<AppAction>, state: AppState) => {
  const {imageboard} = state;
  if (!imageboard) return false;
  try {
    const totalThreads = await imageboard.getTotalThreads();
    dispatch(setTotalThreads(totalThreads));
  } catch (error) {
    const ethRpcError: SerializedEthereumRpcError = serializeError(error);
    dispatch(addEthRpcError(ethRpcError));
  }
};

export const setTotalThreads = (totalThreads: BigNumber): SetTotalThreads => ({
  type: ActionType.SetTotalThreads,
  payload: {totalThreads},
});

export const addEthRpcError = (ethRpcError: SerializedEthereumRpcError): AddEthRpcError => ({
  type: ActionType.AddEthRpcError,
  payload: {ethRpcError},
});

export const getPaginatedThreadIds =
  (currentPage: number, hashesPerPage: number, endOfList: boolean = false) =>
  async (dispatch: React.Dispatch<AppAction>, state: AppState) => {
    const {imageboard} = state;
    if (!imageboard) return false;
    try {
      const bzzHashesWithHashZeros: string[] = await imageboard.getPaginatedThreadIds(currentPage, hashesPerPage);
      const bzzHashes = bzzHashesWithHashZeros.filter((bzzHash) => bzzHash !== ethers.constants.HashZero);
      dispatch(addThreadIds(bzzHashes.reverse(), endOfList));
    } catch (error) {
      const ethRpcError: SerializedEthereumRpcError = serializeError(error);
      dispatch(addEthRpcError(ethRpcError));
    }
  };

export const addThreadIds = (threadIds: string[], endOfList: boolean = false): AddThreadIds => ({
  type: ActionType.AddThreadIds,
  payload: {threadIds, endOfList},
});

export const resetThreadIds = (): ResetThreadIds => ({
  type: ActionType.ResetThreadIds,
});

export const getAndAddThreadById = (id: string) => async (dispatch: React.Dispatch<AppAction>, state: AppState) => {
  const {imageboard} = state;
  if (!imageboard) return false;
  try {
    const postStruct: IPostStruct = await imageboard.getThread(id);
    const thread = new Thread(postStruct);
    dispatch(addThread(thread));
  } catch (error) {
    const ethRpcError: SerializedEthereumRpcError = serializeError(error);
    dispatch(addEthRpcError(ethRpcError));
  }
};

export const getAndUpdateThreadById = (id: string) => async (dispatch: React.Dispatch<AppAction>, state: AppState) => {
  const {imageboard} = state;
  if (!imageboard) return false;
  try {
    const postStruct: IPostStruct = await imageboard.getThread(id);
    const thread = new Thread(postStruct);
    const findThreadByBzzhash = state.threads.find((t: Thread) => t.bzzhash === thread.bzzhash);
    if (findThreadByBzzhash) {
      dispatch(updateThreadByBzzhash(thread));
    }
  } catch (error) {
    const ethRpcError: SerializedEthereumRpcError = serializeError(error);
    dispatch(addEthRpcError(ethRpcError));
  }
};


export const sendThread = (account: string, library: Web3Provider, bzzhash: string) => async (dispatch: React.Dispatch<AppAction>, state: AppState) => {
  const {imageboard} = state;
  if (!imageboard) return false;
  try {
    const signer = library.getSigner(account)
    const tx: ContractTransaction = await imageboard.connect(signer).createThread('0x'+ bzzhash);
    const threadTransaction: IThreadTransaction = {
      bzzhash,
      txHash: tx.hash,
      owner: `${account}`
    }
    dispatch(addThreadTransaction(threadTransaction))
    await tx.wait()
  } catch (error) {
    console.error(error)
  }
}


export const addThreadTransaction = (threadTransaction: IThreadTransaction): AddThreadTransaction => ({
  type: ActionType.AddThreadTransaction,
  payload: {threadTransaction},
});


export const removeThreadTransaction = (txHash: string): RemoveThreadTransaction => ({
  type: ActionType.RemoveThreadTransaction,
  payload: {txHash},
});

export const addThread = (thread: Thread, endOfList: boolean = false): AddThread => ({
  type: ActionType.AddThread,
  payload: {thread, endOfList},
});

export const resetThreads = (): ResetThreads => ({
  type: ActionType.ResetThreads,
});

export const updateThreadByTxHash = (thread: Thread): UpdateThreadByTxHash => ({
  type: ActionType.UpdateThreadByTxHash,
  payload: {thread},
});

export const updateThreadByIndex = (thread: Thread): UpdateThreadByIndex => ({
  type: ActionType.UpdateThreadByIndex,
  payload: {thread},
});

export const updateThreadByBzzhash = (thread: Thread): UpdateThreadByBzzhash => ({
  type: ActionType.UpdateThreadByBzzhash,
  payload: {thread},
});

export const removeThreadByIndex = (thread: Thread): RemoveThreadByIndex => ({
  type: ActionType.RemoveThreadByIndex,
  payload: {thread},
});





export const getComment = (id: string) => async (dispatch: React.Dispatch<AppAction>, state: AppState) => {
  const {imageboard} = state;
  if (!imageboard) return false;
  try {
    const postStruct: IPostStruct = await imageboard.getComment(id);
    const post = new Comment(postStruct);
    dispatch(addComment(post));
  } catch (error) {
    const ethRpcError: SerializedEthereumRpcError = serializeError(error);
    dispatch(addEthRpcError(ethRpcError));
  }
};

export const sendComment = (account: string, library: Web3Provider, postId: string, newComment: string) => async (dispatch: React.Dispatch<AppAction>, state: AppState) => {
  const {imageboard, postageBatchId} = state;
  if (!postageBatchId) return false
  if (!imageboard) return false;
  try {
    const { reference } = await bee.uploadData(postageBatchId, newComment)
    const signer = library.getSigner(account)
    const tx: ContractTransaction = await imageboard.connect(signer).createComment(postId,`0x${reference}`);
    await tx.wait()
    const commentTransaction: ICommentTransaction = {
      txHash: tx.hash, 
      bzzhash: reference, 
      owner: `${account}` 
    }
    dispatch( addCommentTransaction(commentTransaction) )
  } catch (e) {
    console.log(e)
  }
}

export const addCommentTransaction = (commentTransaction: ICommentTransaction): AddCommentTransaction => ({
  type: ActionType.AddCommentTransaction,
  payload: {commentTransaction},
});

export const addComment = (comment: Comment, endOfList: boolean = false): AddComment => ({
  type: ActionType.AddComment,
  payload: {comment, endOfList},
});

export const updateComment = (comment: Comment): UpdateComment => ({
  type: ActionType.UpdateComment,
  payload: {comment},
});

export const updateCommentByBzzhash = (comment: Comment): UpdateCommentByBzzhash => ({
  type: ActionType.UpdateCommentByBzzhash,
  payload: {comment},
});




export const sendVote = (account: string, library: Web3Provider, postId: string, voteType: VoteType) => async (dispatch: React.Dispatch<AppAction>, state: AppState) => {
    const {imageboard} = state;
    if (!imageboard) return false
    console.log(voteType)
    try {
      // const personalSocialScore = 52
      // const personalFee = personalSocialScore * parseUnits('0.01', 16)
      // const globalFee = parseUnits('0.05', 16)

      // try {
      //   const allowance = await bzz.allowance(account, imageboard.address)
      //   const balance = await bzz.balanceOf(account)
      //   console.log(balance.toNumber())
      // } catch (error) {
      //   console.log('errorerrorerror, ', error)
      // }
      
      const signer = library.getSigner(account)

      let tx: ContractTransaction
      switch(voteType) {
        case VoteType.Up:

          tx = await imageboard.connect(signer).voteUp(postId, parseUnits('0.01', 16))
          break;
        case VoteType.Down:
          tx = await imageboard.connect(signer).voteDown(postId)
          break;
        default:
          // code block
      }
    } catch (e) {
      console.log(e)
    }
  }