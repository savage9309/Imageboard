import { useWeb3React } from '@web3-react/core';
import { BigNumber, ContractTransaction, ethers } from 'ethers';
import React, {useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Address, Bee, PostageBatch } from '@ethersphere/bee-js';
import { AppContext } from '../state/context';
import { addCommentTransaction, addThread, getComment, sendComment, sendVote, updateComment, updateThreadByIndex } from '../state/actionCreators';
import {IPostStruct, Comment, Status, VoteType, ICommentTransaction} from '../state/state'
import makeBlockie from 'ethereum-blockies-base64';

interface CommentItemProps {
  commentId: string
}

export default function CommentItem({ commentId }: CommentItemProps) {
  const {swarm} = window
  const { account, library  } = useWeb3React()
  const { state, dispatch } = useContext(AppContext);
  const {comments} = state

  useEffect(()=>{
    if(!commentId) return
    dispatch(getComment(commentId))
  }, [commentId])
  

  const [ bee, setBee ] = useState<Bee>()
  useEffect(()=>{
    if(!swarm) return
    const { web2Helper } = swarm
    const beeApi = web2Helper.fakeBeeApiAddress()
    const bee = new Bee(beeApi);
    setBee(bee)
  },[swarm])

  const [localComment, setLocalComment] = useState<Comment>();
  const findComment = async () =>{
    if(!comments) return false
    if(!commentId) return false
    const comment = comments.find(comment => comment.id === commentId )
    setLocalComment(comment)
  }
  useEffect(() => {
    findComment()
  }, [comments])


  const [commentText, setCommentText ] = useState('')
  const downloadData = useCallback(async () => {
    if(!localComment) return false
    if(!bee) return false
    try {
      const retrievedData = await bee.downloadData(localComment.bzzhash.replace('0x', ""))
      setCommentText(retrievedData.text())
    } catch (error) {
      console.log(error)
    }
  }, [bee, localComment])
  
  useEffect(() => {
    downloadData()
  }, [localComment])


  const handleUpVote = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    if(!account) return false
    if(!localComment) return false
    dispatch(sendVote(account,library, localComment.id, VoteType.Up))
  };

  const handleDownVote = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    if(!account) return false
    if(!localComment) return false
    dispatch(sendVote(account,library, localComment.id, VoteType.Down))
  };

  const [replyOpen, setReplyOpen ] = useState(false)
  const toggleReply = () => {
    setReplyOpen(replyOpen ? false : true)
  };
  const handleToggleReply = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    toggleReply()
  };
  
  const [newComment, setNewComment] = useState('');
  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startUpload()
    setReplyOpen(false)
  }

  const startUpload = async () =>{
    if (!account) return false
    if(!localComment) return false
    if(localComment.id === undefined) return false
    setNewComment('')
    dispatch( sendComment(account, library, localComment.id, newComment) )
  }

  return(
    <li className="flex py-4 px-4 mt-2 ">

      {localComment && 
        <>
          <div className="">
            <button type="button" className="flex" onClick={handleUpVote} >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 stroke-zinc-900 dark:stroke-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button type="button" className="flex" onClick={handleDownVote}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 stroke-zinc-900 dark:stroke-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>

          <div className="ml-3 overflow-hidden">
            <p className='text-sm font-medium text-gray-900 dark:text-zinc-100 whitespace-pre-wrap mb-3'>{commentText}</p>
            <div className='flex'>
              <p className="text-sm mr-2 text-zinc-900 dark:text-zinc-100">{localComment.rating} Points</p>
              {localComment.owner && 
                <img className='h-4 w-4 mr-1' alt={localComment.owner} src={makeBlockie(localComment.owner)} title={localComment.owner} /> 
              }
              {localComment.timestamp && 
                <p className="text-sm text-gray-500 truncate mr-2">
                  {new Date(localComment.timestamp*1000).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
                </p>
              }


              <p className="text-sm mr-2 text-zinc-900 dark:text-zinc-100 underline" onClick={handleToggleReply}>reply</p>
              </div>

              <div className=''>
                {replyOpen &&
                  <form onSubmit={submitForm} className='m-4 block'>
                    <label className="block">
                      <textarea 
                        className="mt-1 block w-full mb-2 dark:bg-zinc-900 dark:text-slate-100 focus:border-pink-600" 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={'write a comment'}
                      />
                      <button type="submit" className='px-3 py-2 bg-pink-600 dark:text-indigo-50' >
                        Save Comment
                      </button>
                    </label>
                  </form>
                }
                
                <ul role="list" className="divide-y divide-zinc-300 dark:divide-zinc-800 m-5">
                    {localComment.commentIds.map((commentId: string) => (
                      <CommentItem commentId={commentId} key={commentId}/>
                    ))}
                </ul>
            </div>
          </div>

        </>
      }


      
    </li>
  )
}
