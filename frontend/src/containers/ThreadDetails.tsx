import { useWeb3React } from '@web3-react/core';
import { BigNumber, ContractTransaction, ethers } from 'ethers';
import React, {useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Address, Bee, PostageBatch } from '@ethersphere/bee-js';
import { AppContext } from '../state/context';
import { addThreadIds, addComment, addCommentTransaction, getAndAddThreadById, getPaginatedThreadIds, sendComment, sendVote } from '../state/actionCreators';
import {Comment, IBaseThread, ICommentTransaction, Status, Thread, VoteType} from '../state/state'
import CommentItem from './CommentItem';
import makeBlockie from 'ethereum-blockies-base64';

export default function ThreadDetails() {
  const { state, dispatch } = useContext(AppContext);
  const {imageboard, threads, threadIds } = state
  const { account, library  } = useWeb3React()

  const params = useParams();

  const [localThread, setLocalThread] = useState<Thread>();
  const [localCommentTxs, setLocalCommentTxs] = useState<ICommentTransaction[]>([]);


  useEffect(() => {
    if(!imageboard) return
    if(!params.threadId) return
    dispatch( getAndAddThreadById(params.threadId) )
  }, [imageboard, params.bzzhash])


  
  useEffect(() => {
    if(!params.threadId) return
    const thread = threads.find(thread => thread.id === params.threadId)
    if(!thread) return
    setLocalThread(thread)
  }, [threads])


  const [imgSrc, setImgSrc] = useState<string | undefined>();
  useEffect(()=>{
    if(!window) return
    if(!localThread) return
    const { swarm } = window
    setImgSrc(
      swarm.bzzLink.bzzProtocolToFakeUrl(`bzz://${localThread.bzzhash.replace('0x', "")}`)
    )
  },[window, localThread])


  
  const [newComment, setNewComment] = useState('');
  
  const startUpload = async () =>{
    if (!account) return false
    if(!localThread) return false
    if(localThread.id === undefined) return false
    setNewComment('')
    dispatch( sendComment(account, library, localThread.id, newComment) )
  }


  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startUpload()
  }


  const handleUpVote = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    if(!account) return false
    if(!localThread) return false
    dispatch(sendVote(account,library, localThread.id, VoteType.Up))
  };

  const handleDownVote = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    if(!account) return false
    if(!localThread) return false
    dispatch(sendVote(account,library, localThread.id, VoteType.Down))
  };

  
  return(
    <div className='grid grid-cols-6'>
      <div className="col-start-0 col-span-6 md:col-start-2 md:col-span-4">

        {localThread && 
          <>

            <div className='bg-slate-100 flex'>
              <img className='flex-1' src={imgSrc} />
            </div>

            <div className='grid grid-cols-2 '>
                <div className='col-span-1'>
                  <Link to={`/`}>
                    <div className=' w-20 bg-fuchsia-600 grid justify-center'>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                      </svg>
                    </div>
                  </Link>
                </div>

                <div className='col-span-1 grid justify-items-end'>
                  <Link to={`/`}>
                    <div className='w-20 bg-fuchsia-600 grid justify-center'>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </Link>
                </div>
            </div>


            <div className='grid grid-cols-2 m-5'>
              <div className="flex items-center">
                <div>
                  <button type="button" className="flex" onClick={handleUpVote} disabled={false}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 stroke-zinc-900 dark:stroke-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <button type="button" className="flex" onClick={handleDownVote}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 stroke-zinc-900 dark:stroke-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
                <p className="text-7xl px-4 text-zinc-900 dark:text-zinc-400">{localThread.rating}</p>
              </div>
              <div className='flex justify-end'>
                {localThread.timestamp && <p className="text-sm text-zinc-500 truncate mr-5">{new Date(localThread.timestamp*1000).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</p>}
                {localThread.owner && <img className='h-6 w-6 ' alt={localThread.owner} src={makeBlockie(localThread.owner)} title={localThread.owner} /> }
              </div>
            </div>


            <div className=''>
              <form onSubmit={submitForm} className='m-4'>
                <label className="block">
                  <textarea 
                    className="mt-1 block w-full mb-2 dark:bg-zinc-900 dark:text-slate-100 focus:border-fuchsia-600" 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={'write a comment'}
                  />
                  <button type="submit" className='px-3 py-2 bg-fuchsia-600 dark:text-indigo-50' >
                    Save Comment
                  </button>
                </label>
              </form>

              

              
              {localThread.commentIds && 
                <ul role="list" className="divide-y divide-zinc-300 dark:divide-zinc-800 m-5">
                  {localThread.commentIds.length}
                  {localThread.commentIds.map((commentId: string) => (
                    <CommentItem commentId={commentId} key={commentId}/>
                  ))}
                </ul>
              }


            </div>
          </>
        }
      </div>
    </div>
  )
}