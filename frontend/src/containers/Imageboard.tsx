import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import {useContext, useEffect, useState,} from 'react';
import { AppContext } from '../state/context';
import { injected } from '../connectors'
import { Routes, Route } from "react-router-dom";
import ThreadList from './ThreadList';
import ThreadDetails from './ThreadDetails';
import React from 'react';
import Nav from './Nav';
import { getBzzContract, getImageboardContract, getDeployments, getCoinBalance, getBzzBalance, getBzzAllowance, getAllPostageBatch, setChainId, getSwarmTopology, setBatchId } from '../state/actionCreators';
import useEagerConnect from '../hooks/useEagerConnect';
import useInactiveListener from '../hooks/useInactiveListener';
import useThreadCreatedEvent from '../hooks/useThreadCreatedEvent';
import useThreadUpdatedEvent from '../hooks/useThreadUpdatedEvent';
import useCommentUpdatedEvent from '../hooks/useCommentUpdatedEvent';
import Modal from './Modal';
import { BatchId } from '@ethersphere/bee-js';

export default function Imageboard() {
  const {swarm} = window
  const { connector, activate, error, library, chainId, account, active } = useWeb3React()
  const { state, dispatch } = useContext(AppContext);
  const { imageboardDeployment, imageboard, bzz, allPostageBatch } = state
  
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

  const [modalVisible, setModalVisible] = useState<boolean>(true)


  useEffect(()=>{
    activate(injected)
  }, [])

  useEffect(()=>{
    if(!chainId) return
    if(!library) return
    dispatch(setChainId(chainId))
    dispatch(getDeployments(library, chainId))
  }, [chainId])

  useEffect(()=>{
    if(!library) return
    dispatch(getImageboardContract(library))
    dispatch(getBzzContract(library))
  }, [imageboardDeployment])

  useEffect(()=>{ 
    if(!library) return
    if(!account) return
    dispatch(getCoinBalance(account, library))
  }, [account, library])

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
    dispatch(getSwarmTopology())
  }, [account, bzz])
  
  useEffect(()=>{
    if(allPostageBatch.length > 0){
      const batchId: BatchId = allPostageBatch[0].batchID
      dispatch(setBatchId(batchId))
    }
  }, [allPostageBatch])
  
  useThreadCreatedEvent()
  useThreadUpdatedEvent()
  useCommentUpdatedEvent()


  const toggleModalVisible = async (e: React.MouseEvent<HTMLElement>) => {
    setModalVisible(!modalVisible)
  }

  return(
    <div>
        <>
          { modalVisible && <Modal handleClose={toggleModalVisible} /> }
          
          <Nav />
          <Routes>
            <Route path="/" element={<ThreadList/>} />
            <Route path="/post/:threadId" element={<ThreadDetails/>} />
          </Routes>
        </>
    </div>
    )
}