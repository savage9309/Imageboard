import {useEffect, useReducer } from 'react';
import { AppContext, IAppContext } from './state/context';
import { appReducer } from './state/reducer';
import { AppState, initialAppState } from './state/state';
import Imageboard from './containers/Imageboard'
import { HashRouter } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { Web3ReactProvider, useWeb3React } from "@web3-react/core";
import { Web3Provider } from '@ethersproject/providers'
import { AppAction } from './state/actions';


function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider)
  library.pollingInterval = 12000
  return library
}

const augmentDispatch = (dispatch: React.Dispatch<AppAction>, state: AppState) => (input: AppAction | Function) =>
  input instanceof Function ? input(dispatch, state) : dispatch(input);

export default function App() {
  const [state, dispatch] = useReducer(appReducer, initialAppState);  
  
  const appContext: IAppContext = { 
    state, 
    dispatch: augmentDispatch(dispatch, state)
  }

  return (
    <div className='bg-slate-200 dark:bg-zinc-900'>
      <Web3ReactProvider getLibrary={getLibrary}>
        <AppContext.Provider value={appContext}>
          <HashRouter>
            <Imageboard />
          </HashRouter>
        </AppContext.Provider>
      </Web3ReactProvider>
      <Toaster />
    </div>
  );
}
