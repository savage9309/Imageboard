import useDarkMode from "../hooks/useDarkMode"
import { useWeb3React } from '@web3-react/core';
import {useContext, useCallback, useState, useEffect } from 'react';
import {useDropzone} from 'react-dropzone'
import { Bee } from '@ethersphere/bee-js';
import { FileUploadOptions, Tag } from "@ethersphere/bee-js/dist/types/types";
import { AppContext } from '../state/context';
import { sendThread  } from '../state/actionCreators';
import { Link } from "react-router-dom";
const Nav: React.FC = () => {
    const { swarm } = window
    const { isDarkMode, toggle } = useDarkMode()
    const { state, dispatch } = useContext(AppContext);
    const { imageboard, batchId } = state
    const { account, library  } = useWeb3React()
  
    const [ filePreview, setFilePreview ] = useState<string | null>(null)
    const [ file, setFile ] = useState<File | null>(null)
    const [ bzzTag, setBzzTag ] = useState<Tag | null>(null)

    const [ bee, setBee ] = useState<Bee>()
    useEffect(()=>{
      if(!swarm) return
      const { web2Helper } = swarm
      const beeApi = web2Helper.fakeBeeApiAddress()
      //const beeApi = 'http://localhost:1633'
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
      if(!file) return
      startUpload()
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


  

  return(
    <nav className="flex items-center justify-between px-4 pt-2 mb-4 flex-wrap">

        <Link to={`/`}>
          <div className="flex items-center shrink-0 text-white mr-6 w-400 shrink-0">
            <svg className="fill-pink-600 h-7 w-7 flex-no-shrink" version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 1000 1000" enableBackground="new 0 0 1000 1000" >
              <g>
                <g transform="translate(0.000000,511.000000) scale(0.100000,-0.100000)">
                  <path d="M8108.3,4433.5c-61.3-61.4-133.3-158.7-160.8-217.9c-38.1-82.5-69.8-118.5-150.2-162.9c-57.1-31.7-107.9-57.1-112.1-57.1c-4.2,0-50.8,57.1-101.5,126.9l-95.2,124.8l-57.1-59.2c-67.7-69.8-139.6-283.5-139.6-414.6c0-86.7-6.3-97.3-93.1-158.7c-52.9-33.8-99.4-63.5-103.7-63.5c-6.3,0-52.9,57.1-103.7,126.9l-95.2,126.9l-44.4-48.6c-71.9-76.2-135.4-245.4-148.1-387.1c-8.5-126.9-12.7-135.4-99.4-196.7c-50.8-36-95.2-65.6-99.4-65.6c-6.3,0-50.8,57.1-101.5,126.9l-93.1,126.9l-46.5-44.4c-69.8-65.6-135.4-234.8-150.2-389.2c-12.7-129-14.8-137.5-105.8-201c-50.8-38.1-95.2-65.6-99.4-61.3c-4.2,4.2-46.5,63.5-97.3,131.1l-91,122.7l-48.7-46.5c-69.8-65.6-135.4-234.8-150.2-389.2c-12.7-129-14.8-137.5-105.8-201c-50.8-38.1-95.2-65.6-99.4-61.3c-4.2,4.2-46.5,63.5-97.3,131.1l-91,122.7l-48.6-46.5c-50.8-46.5-118.5-205.2-141.7-330c-12.7-59.2,6.3-95.2,177.7-327.9c105.8-143.8,198.8-266.5,207.3-277.1c8.4-8.5,643.1,454.8,1408.8,1030.2C7784.6,3314.5,8146.4,3574.7,8220.4,3598c298.2,84.6,640.9-55,763.6-315.2c38.1-78.3,48.7-139.6,48.7-264.4c2.1-139.6-8.5-179.8-67.7-300.4l-67.7-139.6L7528.7,1550.3c-753.1-564.8-1385.6-1045-1404.6-1064c-36-33.8-23.3-55,222.1-387.1c141.7-194.6,264.4-353.3,272.9-355.4c33.8,0,101.5,175.6,124.8,321.5c23.3,135.4,33.8,162.9,101.5,222.1c42.3,38.1,86.7,69.8,99.4,69.8c14.8,0,63.5-52.9,112.1-116.3c48.7-63.5,95.2-116.3,103.6-116.3c25.4,0,112.1,141.7,143.8,230.6c16.9,48.7,36,139.6,42.3,203.1c12.7,103.6,23.3,124.8,93.1,179.8c44.4,36,88.8,63.5,99.4,63.5c10.6,0,57.1-52.9,103.6-116.3c44.4-63.5,93.1-116.3,103.7-116.3c61.3,0,167.1,236.9,190.4,431.5c12.7,103.6,25.4,126.9,95.2,181.9c44.4,36,88.8,63.5,99.4,63.5c16.9,0,103.6-105.8,179.8-220c25.4-38.1,118.4,71.9,162.9,186.2c21.2,59.2,46.5,162.9,52.9,228.5c12.7,105.8,25.4,131.1,93.1,186.1c42.3,33.8,86.7,63.5,99.4,63.5c10.6,0,59.2-52.9,103.7-116.3c46.5-63.5,91-116.3,99.4-116.3s40.2,29.6,69.8,65.6c57.1,65.6,105.8,211.5,129,380.8c8.5,74,29.6,114.2,93.1,175.6l82.5,80.4l150.2-80.4c82.5-44.4,156.5-71.9,165-63.5c38.1,36,31.7,319.4-10.6,448.5c-33.9,107.9-36,146-16.9,230.6l23.2,99.4l146-14.8l146-12.7l-12.7,74c-16.9,107.9-91,247.5-194.6,366c-48.7,55-103.7,146-120.6,198.8l-33.8,99.4l135.4,91l137.5,93.1l-61.3,55c-76.2,69.8-249.6,135.4-406.2,156.5c-71.9,10.6-137.5,33.8-173.5,63.5c-31.7,27.5-69.8,52.9-84.6,57.1c-19,6.3-16.9,44.4,14.8,156.5c21.2,80.4,42.3,156.5,46.5,171.3c31.7,82.5-249.6,38.1-429.4-69.8c-103.7-63.5-139.6-71.9-228.5-67.7l-105.8,6.3l-50.7,165c-33.9,105.8-61.4,162.9-82.5,162.9C8233.1,4545.6,8169.6,4494.9,8108.3,4433.5z"/><path d="M2265.6,3012c-308.8-67.7-615.6-306.7-765.8-598.6c-184-357.5-186.2-566.9-14.8-1262.9c65.6-266.5,122.7-509.8,126.9-539.4c8.5-44.4-10.6-67.7-101.5-139.6c-243.3-188.3-374.4-444.2-391.3-770c-10.6-232.7,25.4-414.6,118.5-575.4c31.7-55,461.2-649.4,956.2-1320c495-672.7,905.4-1231.1,911.7-1241.7c16.9-25.4-91-103.7,1394,985.7c696,509.8,1290.4,960.4,1356,1030.2c217.9,222.1,306.7,476,289.8,814.4c-16.9,308.8-55,376.5-890.6,1510.4c-583.8,791.1-651.5,867.3-892.7,975.2c-169.2,78.3-327.9,112.1-327.9,71.9c0-16.9,141.7-533.1,315.2-1146.5C4766-658.2,4759.7-639.1,4747-797.8c-21.2-262.3-181.9-488.7-433.6-607.1c-122.7-57.1-148.1-61.3-317.3-52.9c-201,10.6-334.2,61.3-461.2,179.8c-148.1,137.5-167.1,194.6-514,1410.9c-184,647.3-340.6,1182.5-346.9,1188.8c-6.4,6.3-107.9-61.3-226.3-148.1c-188.3-141.7-253.8-179.8-253.8-152.3c0,4.2-44.4,181.9-97.3,395.6c-105.8,423.1-110,516.1-31.7,668.5c171.3,336.3,586,391.3,774.2,105.8c14.8-25.4,220-721.3,454.8-1544.2c232.7-825,437.9-1525.2,454.8-1559c74-143.8,304.6-198.9,442.1-103.7c133.3,91,173.5,215.8,129,387.1c-16.9,59.2-201,725.6-410.4,1480.7c-211.5,755.2-382.9,1383.4-382.9,1391.9c0,10.6-31.7,88.8-69.8,171.3C3317,2718,3031.4,2944.3,2707.8,3012C2534.3,3050.1,2434.9,3050.1,2265.6,3012z"/><path d="M782.8-1684.1c-336.3-253.8-450.6-372.3-558.5-586c-162.9-321.5-165-725.6-10.6-1064c55-120.6,393.5-577.5,501.3-681.2c342.7-323.7,896.9-404,1341.1-194.6c146,67.7,736.1,497.1,725.6,526.7c-14.8,42.3-514,717.1-533.1,719.2c-8.5,0-139.6-91-291.9-201C1806.6-3277,1660.6-3376.4,1631-3387c-148.1-57.1-253.8-2.1-414.6,215.8c-175.6,236.9-192.5,266.5-192.5,351.1c0,139.6,52.9,198.9,363.8,427.3l294,215.8l-266.5,368.1c-148.1,201-277.1,366-289.8,366C1114.9-1442.9,960.5-1552.9,782.8-1684.1z"/>
                </g>
              </g>
            </svg>
            <span className="font-semibold tracking-tight text-white pl-2">
                Pink Chainsaw
            </span>
          </div>
        </Link>
        
      
        <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
          <div className="text-sm lg:flex-grow">
            <a href="#responsive-header" className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4">
              
            </a>
          </div>

          {batchId &&
            <div>
              <a {...getRootProps()} className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0 hover:cursor-pointer">
                <input {...getInputProps()} />
                Click or Drop Image here
              </a>
            </div>
          }
        </div>




    </nav>
  )
}
export default Nav;
