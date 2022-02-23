import { useEffect, useState } from 'react';
import {IThreadTransaction} from '../state/state'


interface ThreadTileProps {
  threadTx: IThreadTransaction
}

export default function ThreadTxTile({ threadTx }: ThreadTileProps) {
  const { swarm } = window

  const [imgSrc, setImgSrc] = useState<string | undefined>();
  useEffect(()=>{
    if(!swarm) return
    if(!threadTx) return
    setImgSrc(
      swarm.bzzLink.bzzProtocolToFakeUrl(`bzz://${threadTx.bzzhash.replace('0x', "")}`)
    )
  },[window, threadTx])

  return(
    <div className='h-40 w-40 bg-gray-50 animate-pulse'>
      <img
        src={imgSrc}
        className='h-40 w-40 object-cover'
      />
    </div>
  )
}