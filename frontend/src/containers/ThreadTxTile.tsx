import {IThreadTransaction} from '../state/state'


interface ThreadTileProps {
  threadTx: IThreadTransaction
}

export default function ThreadTxTile({ threadTx }: ThreadTileProps) {
  
  return(
    <div className='h-40 w-40 bg-gray-50 animate-pulse'>
      <img is="swarm-img" src={`bzz://${threadTx.bzzhash.replace('0x', "")}`} className='h-40 w-40 object-cover'/>

    </div>
  )
}