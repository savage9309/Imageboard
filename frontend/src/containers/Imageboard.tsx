import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import {useContext, useEffect, useState,} from 'react';
import { AppContext } from '../state/context';
import { NoEthereumProviderError, UserRejectedRequestError as UserRejectedRequestErrorInjected } from '@web3-react/injected-connector'
import { injected } from '../connectors'
import { Routes, Route } from "react-router-dom";
import ThreadList from './ThreadList';
import ThreadDetails from './ThreadDetails';
import React from 'react';
import Nav from './Nav';
import { getBzzContract, getImageboardContract, getDeployments, getBzzBalance, getBzzAllowance, getAllPostageBatch } from '../state/actionCreators';
import { ConnectWallet, useWallet } from '@web3-ui/core';
import useEagerConnect from '../hooks/useEagerConnect';
import useInactiveListener from '../hooks/useInactiveListener';
import useThreadCreatedEvent from '../hooks/useThreadCreatedEvent';
import useThreadUpdatedEvent from '../hooks/useThreadUpdatedEvent';
import useCommentUpdatedEvent from '../hooks/useCommentUpdatedEvent';



export default function Imageboard() {
  const {swarm} = window
  const { connector, activate, error, library, chainId, account, active } = useWeb3React()
  const { state, dispatch } = useContext(AppContext);
  const { imageboardDeployment, imageboard, bzz } = state
  
  // handle logic to recognize the connector currently being activated
  const [activatingConnector, setActivatingConnector] = useState<any>()
  useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined)
    }
  }, [activatingConnector, connector])

  // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
  const triedEager = useEagerConnect()

  // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
  useInactiveListener(!triedEager || !!activatingConnector)

  useEffect(()=>{
    activate(injected)
  }, [])

  useEffect(()=>{
    if(!chainId) return
    if(!library) return
    dispatch(getDeployments(library, chainId))
  }, [chainId])

  useEffect(()=>{
    if(!library) return
    dispatch(getImageboardContract(library))
    dispatch(getBzzContract(library))
  }, [imageboardDeployment])


  useEffect(()=>{ 
    if(!account) return
    if(!bzz) return
    dispatch(getBzzBalance(account))
    dispatch(getBzzAllowance(account))
  }, [account, bzz])

  useEffect(()=>{ 
    if(!account) return
    if(!bzz) return
    dispatch(getAllPostageBatch())
  }, [account, bzz])
  

  useThreadCreatedEvent()
  useThreadUpdatedEvent()
  useCommentUpdatedEvent()
  

  const ErrorMessage = () => {
    
    if (error instanceof NoEthereumProviderError) {

      return(
        <div className='grid grid-cols-6'>
          <div className='col-start-0 col-span-6 md:col-start-2 md:col-span-4'>
            <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4">
            <p className="font-bold">Not able to connect to Ethereum</p>
              <p>Your browser is not Ethereum compatible. please install <a target="_blank" href="https://metamask.io/download.html" className='underline'>Metamask</a> or use the <a target="_blank" href="https://brave.com" className='underline'>Brave</a> Browser</p>
          </div>
           </div>
        </div>
      )

    } else if (error instanceof UnsupportedChainIdError) {

      return(
        <div className='grid grid-cols-6'>
          <div className='col-start-0 col-span-6 md:col-start-2 md:col-span-4'>
            <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4">
              <p className="font-bold">You're connected to an unsupported network.</p>
              <p>This DApp is currenly only available on <a target="_blank" href="https://www.xdaichain.com/">xDAI</a>. please go to <a target="_blank" href="https://chainlist.org" className='underline'>chainlist.org</a> and search for xDAI Chain, Click Connect Wallet, Add to Metamask, and Switch network.</p>
            </div>
           </div>
        </div>
      )

    } else if (
      error instanceof UserRejectedRequestErrorInjected
    ) {
      return(
        <div className='grid grid-cols-6'>
          <div className='col-start-0 col-span-6 md:col-start-2 md:col-span-4'>
            <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4">
              <p className="font-bold">Please authorize</p>
              <p>Please authorize this website to access your Ethereum account.</p>
            </div>
           </div>
        </div>
      )

    } else {
      return(
        <div className='grid grid-cols-6'>
          <div className='col-start-0 col-span-6 md:col-start-2 md:col-span-4'>
            <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4">
              <p className="font-bold">Error</p>
              <p>{error?.message} or check metamask</p>
            </div>
           </div>
        </div>
      )
    }
  }


  return(
    <div>
      {!!error && <ErrorMessage/>}
      {!error &&
        <>
          <Nav />
          <Routes>
            <Route path="/" element={<ThreadList/>} />
            <Route path="/post/:threadId" element={<ThreadDetails/>} />
          </Routes>
        </>
      } 
    </div>
    )
}