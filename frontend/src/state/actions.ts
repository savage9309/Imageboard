import {Imageboard, IERC20} from '../hardhat/typechain';

import {BigNumber, Contract} from 'ethers';
import {Thread, Comment, DeploymentLite, ICommentTransaction, IThreadTransaction} from './state';
import {SerializedEthereumRpcError} from 'eth-rpc-errors/dist/classes';


export enum ActionType {
  AddEthRpcError,
  ThreadListDidMount,
  AddCommentTransaction,
  AddComment,
  AddComments,
  UpdateComment,
  UpdateCommentByBzzhash,
  SetImageboardDeployment,
  SetImageboardContract,
  SetBzzDeployment,
  SetBzzContract,
  SetBzzBalance,
  SetBzzAllowance,
  SetPostageBatchId,
  SetCurrentPage,
  SetTotalThreads,
  ResetThreads,
  AddThreadIds,
  ResetThreadIds,
  AddThreadTransaction,
  RemoveThreadTransaction,
  AddThread,
  AddThreads,
  UpdateThreadByIndex,
  UpdateThreadByBzzhash,
  UpdateThreadByTxHash,
  RemoveThreadByIndex
}

export interface ThreadListDidMount {
  type: ActionType.ThreadListDidMount;
}

export interface SetImageboardDeployment {
  type: ActionType.SetImageboardDeployment;
  payload: {imageboardDeployment: DeploymentLite};
}

export interface SetImageboardContract {
  type: ActionType.SetImageboardContract;
  payload: {imageboard: Imageboard};
}

export interface SetBzzDeployment {
  type: ActionType.SetBzzDeployment;
  payload: {bzzDeployment: DeploymentLite};
}

export interface SetBzzContract {
  type: ActionType.SetBzzContract;
  payload: {bzz: IERC20};
}


export interface SetBzzBalance {
  type: ActionType.SetBzzBalance;
  payload: {bzzBalance: BigNumber};
}

export interface SetBzzAllowance {
  type: ActionType.SetBzzAllowance;
  payload: {bzzAllowance: BigNumber};
}

export interface SetPostageBatchId {
  type: ActionType.SetPostageBatchId;
  payload: {postageBatchId: string};
}

export interface SetTotalThreads {
  type: ActionType.SetTotalThreads;
  payload: {totalThreads: BigNumber};
}

export interface SetCurrentPage {
  type: ActionType.SetCurrentPage;
  payload: {currentPage: number};
}

export interface AddEthRpcError {
  type: ActionType.AddEthRpcError;
  payload: {ethRpcError: SerializedEthereumRpcError};
}

export interface AddThreadIds {
  type: ActionType.AddThreadIds;
  payload: {threadIds: string[]; endOfList: boolean};
}

export interface ResetThreadIds {
  type: ActionType.ResetThreadIds;
}

export interface RemoveThreadByIndex {
  type: ActionType.RemoveThreadByIndex;
  payload: {thread: Thread};
}

export interface AddThreads {
  type: ActionType.AddThreads;
  payload: {threads: Thread[]};
}

export interface AddThreadTransaction {
  type: ActionType.AddThreadTransaction;
  payload: {threadTransaction: IThreadTransaction};
}

export interface RemoveThreadTransaction {
  type: ActionType.RemoveThreadTransaction;
  payload: {txHash: string};
}


export interface AddThread {
  type: ActionType.AddThread;
  payload: {thread: Thread; endOfList: boolean};
}

export interface ResetThreads {
  type: ActionType.ResetThreads;
}

export interface UpdateThreadByTxHash {
  type: ActionType.UpdateThreadByTxHash;
  payload: {thread: Thread};
}

export interface UpdateThreadByIndex {
  type: ActionType.UpdateThreadByIndex;
  payload: {thread: Thread};
}

export interface UpdateThreadByBzzhash {
  type: ActionType.UpdateThreadByBzzhash;
  payload: {thread: Thread};
}

export interface AddComments {
  type: ActionType.AddComments;
  payload: {comments: Comment[]};
}

export interface AddCommentTransaction {
  type: ActionType.AddCommentTransaction;
  payload: {commentTransaction: ICommentTransaction};
}

export interface AddComment {
  type: ActionType.AddComment;
  payload: {comment: Comment; endOfList: boolean};
}
export interface UpdateComment {
  type: ActionType.UpdateComment;
  payload: {comment: Comment};
}
export interface UpdateCommentByBzzhash {
  type: ActionType.UpdateCommentByBzzhash;
  payload: {comment: Comment};
}

export type AppAction =
  | ThreadListDidMount
  | AddCommentTransaction
  | AddComment
  | AddComments
  | UpdateComment
  | UpdateCommentByBzzhash
  | SetImageboardDeployment
  | SetImageboardContract
  | SetBzzDeployment
  | SetBzzContract
  | SetBzzBalance
  | SetBzzAllowance
  | SetPostageBatchId
  | SetCurrentPage
  | SetTotalThreads
  | AddEthRpcError
  | RemoveThreadByIndex
  | AddThreadIds
  | ResetThreadIds
  | AddThreadTransaction
  | RemoveThreadTransaction
  | AddThread
  | AddThreads
  | ResetThreads
  | UpdateThreadByTxHash
  | UpdateThreadByBzzhash
  | UpdateThreadByIndex;
