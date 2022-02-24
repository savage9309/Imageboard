import {BigNumber, Contract} from 'ethers';
import {Deployment} from 'hardhat-deploy/types';
import {Log} from '@ethersproject/abstract-provider';
import {Imageboard, IERC20} from '../hardhat/typechain';
import { BatchId } from '@ethersphere/bee-js/dist/src/types';

export enum Status {
  NotStarted = 'Not Started',
  InProgress = 'In Progress',
  Finished = 'Finished',
}

export enum VoteType {
  None = 'None',
  Up = 'Up',
  Down = 'Down',
}

export enum PostType {
  Thread = 'Thread',
  Comment = 'Comment',
}

export interface IBaseThread {
  index?: number;
  bzzhash?: string;
}

export interface IPostStruct {
  id: string;
  index: BigNumber;
  timestamp: BigNumber;
  owner: string;
  bzzhash: string;
  threadBzzhash: string;
  exists: boolean;
  commentIds: string[];
  rating: BigNumber;
  postType: number;
}

export class Thread {
  id: string;
  txHash?: string;
  index: number;
  bzzhash: string;
  owner: string;
  timestamp: number;
  rating: number;
  commentIds: string[];

  constructor(res: IPostStruct) {
    this.id = res.id;
    this.index = res.index.toNumber();
    this.bzzhash = res.bzzhash;
    this.rating = res.rating.toNumber();
    this.owner = res.owner;
    this.timestamp = res.timestamp.toNumber();
    this.commentIds = res.commentIds;
  }
}

export class Comment {
  id: string;
  bzzhash: string;
  owner: string;
  timestamp: number;
  rating: number;
  commentIds: string[];
  threadBzzhash: string;

  constructor(res: IPostStruct) {
    this.id = res.id;
    this.bzzhash = res.bzzhash;
    this.owner = res.owner;
    this.timestamp = res.timestamp.toNumber();
    this.commentIds = res.commentIds;
    this.threadBzzhash = res.threadBzzhash;
    this.rating = res.rating.toNumber();
  }
}

export interface IThreadUpdate {
  log: Log;
  bzzhash: string;
}

export interface ICommentUpdated {
  log: Log;
  bzzhash: string;
}

export interface IThreadTransaction {
  txHash: string;
  bzzhash: string;
  owner: string;
}

export interface ICommentTransaction {
  txHash: string;
  bzzhash: string;
  owner: string;
}

export interface DeploymentLite extends Omit<Deployment, 'receipt'> {} // HACK hardhat Deployment not working

export interface AppState {
  status: Status;
  currentPage?: number;
  imageboardDeployment?: DeploymentLite;
  imageboard?: Imageboard;
  bzzDeployment?: DeploymentLite;
  bzz?: IERC20;
  bzzBalance?: BigNumber;
  bzzAllowance?: BigNumber;
  batchId?: BatchId;
  totalThreads?: BigNumber;
  threads: Thread[];
  comments: Comment[];
  threadTransactions: IThreadTransaction[];
  commentTransactions: ICommentTransaction[];
  threadIds: string[];
}

export const initialAppState: AppState = {
  status: Status.NotStarted,
  threads: [],
  comments: [],
  threadTransactions: [],
  commentTransactions: [],
  threadIds: [],
};
