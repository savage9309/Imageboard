import React from 'react';
import {AppState, initialAppState} from './state';
import {AppAction} from './actions';

export interface IAppContext {
  state: AppState;
  dispatch: React.Dispatch<AppAction | Function>;
}

const defaultAppContext = {
  state: initialAppState,
  dispatch: () => undefined,
};

export const AppContext = React.createContext<IAppContext>(defaultAppContext);
