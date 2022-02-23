import {useEffect, useContext, useCallback} from 'react';
import {AppContext} from '../state/context';
import {addThreadIds, getAndAddThreadById, removeThreadTransaction} from '../state/actionCreators';
import {Log} from '@ethersproject/abstract-provider';

export default function useThreadCreatedEvent() {
  const {state, dispatch} = useContext(AppContext);
  const {imageboard} = state;

  const run = useCallback(
    (bzzhash: string, log: Log) => {
      dispatch(removeThreadTransaction(log.transactionHash));
      dispatch(addThreadIds([bzzhash]));
    },
    [dispatch, getAndAddThreadById]
  );

  useEffect((): any => {
    if (!imageboard) return false;
    imageboard?.on('ThreadCreated', run);
    return () => {
      imageboard?.removeListener('ThreadCreated', run);
    };
  }, [imageboard, run]);
}
