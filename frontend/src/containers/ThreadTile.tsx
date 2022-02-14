import {IBaseThread, Thread} from '../state/state'
import {Link} from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../state/context';
import { getAndAddThreadById } from '../state/actionCreators';

declare global {
  interface Window {
      swarm:any;
  }
}

interface ThreadTileProps {
  threadId: string
}

export default function ThreadTile({ threadId }: ThreadTileProps) {
  const { state, dispatch } = useContext(AppContext);
  const { threads, imageboard } = state

  const [localThread, setLocalThread] = useState<Thread>();

  useEffect(()=>{
    if(!imageboard) return 
    if(!threadId) return
    dispatch(getAndAddThreadById(threadId))
  }, [threadId])
  

  useEffect(() => {
    if(!threadId) return
    const thread = threads.find(thread => thread.id === threadId)
    setLocalThread(thread)
  }, [threads, threadId])

  const [imgSrc, setImgSrc] = useState<string | undefined>();
  useEffect(()=>{
    if(!window) return
    if(!localThread) return
    const { swarm } = window
    setImgSrc(
      swarm.bzzLink.bzzProtocolToFakeUrl(`bzz://${localThread.bzzhash.replace('0x', "")}`)
    )
  },[window, localThread])

  return(
    <div className='h-40 w-40 bg-gray-50'>

      {localThread &&
        <Link to={`/post/${localThread.id}`}>
          <img
            src={imgSrc}
            className='h-40 w-40 object-cover'
          />
        </Link>
      }
    </div>
  )
}