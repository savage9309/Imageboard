import {useEffect, useContext, useCallback} from 'react';
import {AppContext} from '../state/context';
import {getAndUpdateThreadById} from '../state/actionCreators';
import {Log} from '@ethersproject/abstract-provider';

export default function useThreadUpdatedEvent() {
  const {state, dispatch} = useContext(AppContext);
  const {imageboard} = state;

  const run = useCallback(
    (bzzhash: string, log: Log) => {
      dispatch(getAndUpdateThreadById(bzzhash));
    },
    [dispatch, getAndUpdateThreadById]
  );

  useEffect((): any => {
    if (!imageboard) return false;
    imageboard?.on('ThreadUpdated', run);
    return () => {
      imageboard?.removeListener('ThreadUpdated', run);
    };
  }, [imageboard, run]);
}
