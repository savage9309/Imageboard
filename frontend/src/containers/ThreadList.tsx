import React, {useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppContext } from '../state/context';
import { Thread, Status, IBaseThread, IPostStruct, IThreadTransaction } from '../state/state';
import { addThread, setThreadListDidMount, resetThreads, addThreadIds, getTotalThreads, getPaginatedThreadIds, setCurrentPage, resetThreadIds } from '../state/actionCreators';
import ThreadTile from './ThreadTile';
import ThreadTxTile from './ThreadTxTile';

export default function PostList() {
  const { state, dispatch } = useContext(AppContext);

  const {imageboard, totalThreads, threads, threadIds, currentPage, threadTransactions} = state
  const [allPostsLoaded, setAllPostsLoaded] = useState(false)
  const [isIntersecting, setIntersecting] = useState(false)

  useEffect(()=>{
    if(!imageboard) return 
    dispatch(getTotalThreads())
  }, [imageboard])


  useEffect(() => {
    if(state.status !== Status.NotStarted) return
    const threadsLength: number = threads.length
    dispatch(setThreadListDidMount())
    if(threadsLength >= 1){
      console.log('resetThreadIds')
      dispatch(resetThreadIds())
    }
  }, [])


  const useOnScreen = (ref: any) => {
    const observer = new IntersectionObserver(([entry]) => {
        setIntersecting(entry.isIntersecting)
    })
    useEffect(() => {
      observer.observe(ref.current)
      return () => { observer.disconnect() }
    }, [])
    return isIntersecting
  }


  const [hashesPerPage, setHashesPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState<number|undefined>();
  useEffect(() => {
    if(!totalThreads) return
    const _totalPages = Math.ceil(totalThreads.toNumber()/hashesPerPage)
    setTotalPages(_totalPages);
    if(!currentPage){
      dispatch(setCurrentPage(_totalPages))
    }
  }, [hashesPerPage, totalThreads]);

  const [delayed, setDelayed] = useState(false)

  useEffect(() => {
    const load = () => {
      if(allPostsLoaded) return false
      if(delayed) return false
      if(!totalPages) return false
      if(currentPage === undefined) return false
      if(!isIntersecting) return false
      if(!totalThreads) return false
      if(currentPage >= 1){
        setDelayed(true)
        setInterval(() => { setDelayed(false) }, 500);
        dispatch(getPaginatedThreadIds(currentPage, hashesPerPage, true))
        const previousPage = currentPage-1
        dispatch(setCurrentPage(previousPage))
      }else{
        setAllPostsLoaded(true)
      }
    }
    load()
  }, [delayed, currentPage, totalPages, isIntersecting, dispatch, totalThreads])






  const InfinityLoader = () => {
    const ref = useRef<HTMLDivElement>(null);
    const isVisible = useOnScreen(ref)
    return <div ref={ref}>{isVisible && `Loading more...`}</div>
  }

  return (
      <>
        <div className="grid gap-4 
          grid-cols-3
          sm:grid-cols-4
          md:grid-cols-5
          lg:grid-cols-6
          xl:grid-cols-8
          2xl:grid-cols-12
          m-4
        ">
          
          {threadTransactions.map((threadTx: IThreadTransaction) => (
            <ThreadTxTile threadTx={threadTx} key={threadTx.bzzhash} />
          ))}

          {threadIds.map((threadId: string) => (
            <ThreadTile threadId={threadId} key={threadId} />
          ))}

          {!allPostsLoaded && <InfinityLoader/>}  
        </div>


      </>
  );
}
