import { IBaseThread, Thread } from '../state/state'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';

import { Link } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../state/context';
import { getAndAddThreadById } from '../state/actionCreators';
import { formatUnits } from 'ethers/lib/utils';


export default function Modal() {
    const { swarm } = window
    const { connector, activate, error, library, chainId, account, active } = useWeb3React()

    const { state, dispatch } = useContext(AppContext);
    const { coinBalance, bzzBalance, bzzAllowance } = state

    const [checkChain, setCheckChain] = useState(false)
    useEffect(() => {
        if(!chainId) return;

        if (error instanceof UnsupportedChainIdError) return;

        setCheckChain(true)

    }, [chainId])

    const [checkCoinBalance, setCheckCoinBalance] = useState(false)
    useEffect(() => {
        if (coinBalance) {
            if (coinBalance.isZero()) {
                setCheckCoinBalance(false)
            } else {
                setCheckCoinBalance(true)
            }
        }
    }, [coinBalance])

    const [checkBzzBalance, setCheckBzzBalance] = useState(false)
    useEffect(() => {
        console.log(bzzBalance)
        if (bzzBalance) {
            if (bzzBalance.isZero()) {
                setCheckBzzBalance(false)
            } else {
                setCheckBzzBalance(true)
            }
        }
    }, [bzzBalance])


    const [checkSwarm, setCheckSwarm] = useState(false)
    useEffect(() => {
        if(!swarm) return
        setCheckSwarm(true)
    }, [swarm])


    const [checkSwarmConnect, setCheckSwarmConnect] = useState(false)
    useEffect(() => {
        if (swarm) {
            setCheckSwarmConnect(true)
        }
    }, [swarm])


    const [checkPostageStamp, setCheckPostageStamp] = useState(false)
    useEffect(() => {
        if (swarm) {
            setCheckPostageStamp(true)
        }
    }, [swarm])

    
    const [checkBzzAllowance, setCheckBzzAllowance] = useState(false)
    useEffect(() => {
        if (swarm) {
            setCheckPostageStamp(true)
        }
    }, [swarm])

    

    const [checkDAppConnection, setCheckDAppConnection] = useState(false)
    useEffect(() => {
        setCheckDAppConnection(active)
    }, [active])


    const IconCheck = () : JSX.Element => {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                 <path strokeLinecap="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    }

    const IconX = () : JSX.Element => {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    }

    const ListItem = ({ msg, checked } : {msg: string, checked: boolean}) : JSX.Element => {
        return (
            <li className="px-3 py-2 border-b border-gray-200 w-full rounded-t-lg flex">
                <div className="px-1">{checked ? <IconCheck/> : <IconX/> }</div>
                {msg}
            </li>
        )
    }

    return (
        <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="fixed z-10 inset-0 overflow-y-auto">
                <div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
                    <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full">


                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">

                            <div className="sm:flex sm:items-start">

                                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>

                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">CheckList</h3>

                                    <div className="flex justify-center">
                                        <ul className="bg-white rounded-lg border border-gray-200 w-96 text-gray-900">
                                            <ListItem checked={checkChain} msg={checkChain ? 'Wallet is connected to the Gnosis Chain' : 'Wallet is not connected to the Gnosis Chain'} />
                                            <ListItem checked={checkDAppConnection} msg={checkDAppConnection ? 'Wallet is connected to dApp' : 'Wallet is not connected to dApp'} />
                                            <ListItem checked={checkCoinBalance} msg={checkCoinBalance ?  `Wallet is fundet with xDAI` : 'Wallet is not fundet with xDAI'} />
                                            <ListItem checked={checkBzzBalance} msg={checkBzzBalance ? `Wallet is fundet with xBZZ` : 'Wallet is not fundet with xBZZ'} />
                                            <ListItem checked={checkBzzAllowance} msg={checkBzzAllowance ? "dApp has allowance to spend xBZZ" : "dApp has no allowance to spend xBZZ"} />
                                            <ListItem checked={swarm} msg={swarm ? "Swarm is Installed" : "Swarm is not Installed"} />
                                            <ListItem checked={checkSwarmConnect} msg={checkSwarmConnect ? "Swarm is Connected to Swarm Desktop" : "Swarm is not Connected to Swarm Desktop"} />
                                            <ListItem checked={checkPostageStamp} msg={checkPostageStamp ? "Swarm has PostageStamp" : "no PostageStamp found"} />
                                        </ul>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">Deactivate</button>
                            <button type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}