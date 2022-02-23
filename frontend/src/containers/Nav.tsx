import useDarkMode from "../hooks/useDarkMode"
import { useWeb3React } from '@web3-react/core';
import { ContractTransaction, ethers } from 'ethers';
import {useContext, useCallback, useState, useEffect } from 'react';
import {useDropzone} from 'react-dropzone'
import { Address, Bee, FileUploadOptions, PostageBatch, Tag } from '@ethersphere/bee-js';
import { AppContext } from '../state/context';
import { addThread, addThreadTransaction, getAllPostageBatch, sendBzzApprove, sendThread  } from '../state/actionCreators';
import {IThreadTransaction} from '../state/state'
import toast from 'react-hot-toast';
import { Link } from "react-router-dom";
import useInterval from "../hooks/useInterval";
import { formatUnits, parseUnits } from "ethers/lib/utils";

const Nav: React.FC = () => {
    const { swarm } = window
    const { isDarkMode, toggle } = useDarkMode()
    const { state, dispatch } = useContext(AppContext);
    const { imageboard, bzzBalance, bzzAllowance, batchId } = state
    const { account, library, chainId  } = useWeb3React()
  
    const [ filePreview, setFilePreview ] = useState<string | null>(null)
    const [ file, setFile ] = useState<File | null>(null)
    const [ bzzTag, setBzzTag ] = useState<Tag | null>(null)

    const [ bee, setBee ] = useState<Bee>()
    useEffect(()=>{
      if(!swarm) return
      const { web2Helper } = swarm
      //const beeApi = web2Helper.fakeBeeApiAddress()
      const beeApi = 'http://localhost:1633'
      const bee = new Bee(beeApi);
      setBee(bee)
    },[swarm])
  

    const startUpload = async () =>{
      if(!imageboard) return false
      if(!bee) return false
      if(!file) return false
      if(!account) return false
      if(!batchId) return false
      try {
        const tag: Tag = await bee.createTag()
        setBzzTag(tag)
        const options: FileUploadOptions = { tag: tag.uid, contentType: file.type }
        const { reference } = await bee.uploadFile(batchId, file, file.name, options)
        dispatch(sendThread(account, library, reference))
      } 
      catch (e){
        console.log(e)
      }
      finally {
        setBzzTag(null)
        setFilePreview(null)
        setFile(null)
      }
    }
  
    // Dynamic delay
    const [delay, setDelay] = useState<number>(500)
    // ON/OFF
    const [isPlaying, setPlaying] = useState<boolean>(false)
  
    const updateBzzTag = async () => {
      if(!bee) return false
      if (bzzTag){
        if(bzzTag && bzzTag.processed >= bzzTag.total){
          setPlaying(false)
        }
        const updatedTag: Tag = await bee.retrieveTag(bzzTag.uid)
        setBzzTag(updatedTag)
      }
    }
  
    useInterval(() => {
        updateBzzTag()
      },
      isPlaying ? delay : null,
    )
  
    useEffect(() => {
      if(bzzTag){
        setPlaying(true)
      }
    }, [bzzTag])
  
  
    const onDrop = useCallback(acceptedFiles => {
      const acceptedFile = acceptedFiles[0]
      setFilePreview(URL.createObjectURL(acceptedFile))
      setFile(acceptedFile)
    }, [])
  
    const { getRootProps, getInputProps, isDragActive, isDragAccept } = useDropzone({
      onDrop,
      multiple: false,
      accept: 'image/jpeg, image/png'
    })
  
    useEffect(()=>{
      if(file){
        startUpload()
      }
    },[file])
  
    useEffect(()=>{
        if(isDarkMode){
          document.body.classList.add('dark')
          document.body.classList.add('bg-zinc-900')
          document.body.classList.remove('bg-slate-200')
        }else{
          document.body.classList.remove('dark')
          document.body.classList.remove('bg-zinc-900')
          document.body.classList.add('bg-slate-200')
        }
      },[isDarkMode])


    const handleApprove = async (e: React.MouseEvent<HTMLElement>) => {
      if(!account) return 
      if(!library) return 
      const amount = parseUnits('0.1', 16)
      dispatch(sendBzzApprove(account, library, amount))
    }

    const handleGetPostageBatchId = async (e: React.MouseEvent<HTMLElement>) => {
      if(!account) return 
      if(!library) return 
      dispatch(getAllPostageBatch())
    }
    


  return(
    <nav className="flex items-center justify-between flex-wrap bg-fuchsia-600 p-2 mb-4">

        <div className="flex items-center flex-shrink-0 text-white mr-6">
            <Link to={`/`}>
                <span className="font-semibold text-xl tracking-tight">
                    Meta Ghetto
                </span>
            </Link>
        </div>
        

        <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">

            <div className="text-sm lg:flex-grow"></div>

            <div>

              {account && (
                
                <button 
                  className="inline-block text-sm px-4 py-2 mr-1 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0"
                  onClick={handleApprove}
                >
                  {bzzAllowance && `Allowance: ${formatUnits(bzzAllowance, 16)} BZZ` }
                  {!bzzAllowance && 'no Allowance found'}
                </button>
              )}


                {batchId &&
                  <div {...getRootProps()} className="dropzone-wrap inline-block text-sm px-4 py-2 mr-1 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white hover:cursor-pointer mt-4 lg:mt-0">
                    <input {...getInputProps()} />
                    {bzzTag ? (`Uploading ${Math.round((bzzTag.processed/bzzTag.total)*100)}%`) : 'Click or Drop files here'}
                  </div>
                }

                {!batchId  &&
                  <button 
                      className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0"
                      onClick={handleGetPostageBatchId}
                  >
                      get batchId
                  </button>
                }

                <button 
                    className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0"
                    onClick={toggle}
                >
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
            </div>
        </div>

    </nav>
  )
}
export default Nav;
