import { useWeb3React } from '@web3-react/core';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../state/context';
import { createPostageBatch, sendBzzApprove } from '../state/actionCreators';
import { parseUnits } from 'ethers/lib/utils';

interface ModalProps {
    handleClose: React.MouseEventHandler<HTMLButtonElement>
  }

export default function Modal({ handleClose }: ModalProps) {

    const { swarm } = window
    const { connector, activate, error, library, chainId, account, active } = useWeb3React()

    const { state, dispatch } = useContext(AppContext);
    const { coinBalance, bzzBalance, bzzAllowance, swarmTopology, batchId, allPostageBatch } = state


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
        if (!swarm) return 
        if (!swarmTopology) return
        const connected = swarmTopology.connected > 0
        setCheckSwarmConnect(connected)
    }, [swarm, swarmTopology])



    const [checkPostageStamp, setCheckPostageStamp] = useState(false)
    useEffect(() => {
        if(!allPostageBatch) return
        setCheckPostageStamp(allPostageBatch.length > 0)
    }, [allPostageBatch])



    const [checkBzzAllowance, setCheckBzzAllowance] = useState(false)
    useEffect(() => {
        if (!swarm) return
        if (!bzzAllowance) return
        const allowance = bzzAllowance.toNumber()
        setCheckBzzAllowance(allowance > 0)
    }, [swarm, bzzAllowance])

    




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


    const handleBzzApprove = async (e: React.MouseEvent<HTMLElement>) => {
        if(!account) return 
        if(!library) return 
        const amount = parseUnits('0.1', 16)
        dispatch(sendBzzApprove(account, library, amount))
    }

    const handleCreatePostageBatch = async (e: React.MouseEvent<HTMLElement>) => {
        if(!account) return 
        if(!library) return 
        dispatch(createPostageBatch())
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

                                            <li className="px-3 py-2 border-b border-gray-200 w-full rounded-t-lg flex">    
                                                {active ? (
                                                    <>
                                                        <div className="px-1">
                                                            <IconCheck/>
                                                        </div>
                                                        <p>Wallet is connected to the Gnosis Chain</p>
                                                    </>
                                                ) : (
                                                    <div className='box'>
                                                        <div  className='flex'>
                                                            <div className="px-1"><IconX/></div>
                                                            <p>Wallet is not connected to the Gnosis Chain</p>
                                                        </div>
                                                        <p className="font-small text-gray-700 dark:text-gray-400">
                                                            This DApp is currenly only available on <a target="_blank" href="https://docs.gnosischain.com/">Gnosis Chain</a>. please go to <a target="_blank" href="https://chainlist.org" className='underline'>chainlist.org</a> and search for gnosis, Click Connect Wallet, Add to Metamask, and Switch network.
                                                        </p>
                                                    </div>
                                                )}
                                            </li>

                                            <li className="px-3 py-2 border-b border-gray-200 w-full rounded-t-lg flex">    
                                                {checkCoinBalance ? (
                                                    <>
                                                        <div className="px-1">
                                                            <IconCheck/>
                                                        </div>
                                                        <p>Wallet is fundet with xDAI</p>
                                                    </>
                                                ) : (
                                                    <div className='box'>
                                                        <div  className='flex'>
                                                            <div className="px-1"><IconX/></div>
                                                            <p>Wallet is not fundet with xDAI</p>
                                                        </div>
                                                        <p className="font-small text-gray-700 dark:text-gray-400">
                                                            To make transactions on the Gnosis Chain you need xDAI. please go to <a target="_blank" href="https://ramp.network/buy/" className='underline'>ramp.network</a> and search for xdai and buy some coins. not much is needed, like 3 xDAI.
                                                        </p>
                                                    </div>
                                                )}
                                            </li>


                                            <li className="px-3 py-2 border-b border-gray-200 w-full rounded-t-lg flex">    
                                                {checkBzzBalance ? (
                                                    <>
                                                        <div className="px-1">
                                                            <IconCheck/>
                                                        </div>
                                                        <p>Wallet is fundet with xBZZ</p>
                                                    </>
                                                ) : (
                                                    <div className='box'>
                                                        <div  className='flex'>
                                                            <div className="px-1"><IconX/></div>
                                                            <p>Wallet is not fundet with xBZZ</p>
                                                        </div>
                                                        <p className="font-small text-gray-700 dark:text-gray-400">
                                                            This dApp is using xBZZ as a incentive token. to encourage good content and penalize bad content. please go to <a target="_blank" href="https://honeyswap.org/" className='underline'>honeyswap.org</a> and swap some xDAI for some xBZZ. not much is needed, like 1 BZZ.
                                                        </p>
                                                    </div>
                                                )}
                                            </li>



                                            <li className="px-3 py-2 border-b border-gray-200 w-full rounded-t-lg flex">    
                                                {checkBzzAllowance ? (
                                                    <>
                                                        <div className="px-1">
                                                            <IconCheck/>
                                                        </div>
                                                        <p>This dApp has allowance to spend xBZZ</p>
                                                    </>
                                                ) : (
                                                    <div className='box'>
                                                        <div  className='flex'>
                                                            <div className="px-1"><IconX/></div>
                                                            <p>This dApp has no allowance to spend xBZZ</p>
                                                        </div>
                                                        <p className="font-small text-gray-700 dark:text-gray-400">
                                                            Please allow this dApp to use your xBZZ. <a onClick={handleBzzApprove} className='underline'>Give permission</a>.
                                                        </p>
                                                    </div>
                                                )}
                                            </li>


                                            <li className="px-3 py-2 border-b border-gray-200 w-full rounded-t-lg flex">    
                                                {swarm ? (
                                                    <>
                                                        <div className="px-1">
                                                            <IconCheck/>
                                                        </div>
                                                        <p>Swarm Browser Extension is Installed</p>
                                                    </>
                                                ) : (
                                                    <div className='box'>
                                                        <div  className='flex'>
                                                            <div className="px-1"><IconX/></div>
                                                            <p>Swarm Browser Extension is not Installed</p>
                                                        </div>
                                                        <p className="font-small text-gray-700 dark:text-gray-400">
                                                            This dApp is using Ethereum Swarm as a decentralize storage. please go to <a target="_blank" href="https://chrome.google.com/webstore/detail/ethereum-swarm-extension/afpgelfcknfbbfnipnomfdbbnbbemnia?hl=en" className='underline'>chrome webstore</a> and Install the browser Extension.
                                                        </p>
                                                    </div>
                                                )}
                                            </li>


                                            <li className="px-3 py-2 border-b border-gray-200 w-full rounded-t-lg flex">    
                                                {checkSwarmConnect ? (
                                                    <>
                                                        <div className="px-1">
                                                            <IconCheck/>
                                                        </div>
                                                        <p>Swarm Browser Extension is Connected</p>
                                                    </>
                                                ) : (
                                                    <div className='box'>
                                                        <div  className='flex'>
                                                            <div className="px-1"><IconX/></div>
                                                            <p>Swarm Browser Extension is not Connected</p>
                                                        </div>
                                                        <p className="font-small text-gray-700 dark:text-gray-400">
                                                            The Swarm Extension cannot connect to Swarm-Desktop. please go to <a target="_blank" href="https://www.ethswarm.org/build/desktop" className='underline'>ethswarm.org</a> and Install the Swarm-Desktop App to connect to the Swarm-Network.
                                                        </p>
                                                    </div>
                                                )}
                                            </li>

                                            <li className="px-3 py-2 border-b border-gray-200 w-full rounded-t-lg flex">    
                                                {batchId ? (
                                                    <>
                                                        <div className="px-1">
                                                            <IconCheck/>
                                                        </div>
                                                        <p>Swarm has PostageStamps</p>
                                                    </>
                                                ) : (
                                                    <div className='box'>
                                                        <div  className='flex'>
                                                            <div className="px-1"><IconX/></div>
                                                            <p>no PostageStamps found</p>
                                                        </div>
                                                        <p className="font-small text-gray-700 dark:text-gray-400">
                                                            The Swarm Extension did not find any PostageStamps. please click <a onClick={handleCreatePostageBatch} className='underline'>here</a> to create a PostageStamp. 
                                                        </p>
                                                    </div>
                                                )}
                                            </li>

                                        </ul>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button type="button" onClick={handleClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                Start
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}