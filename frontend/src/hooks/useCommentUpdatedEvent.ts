import {useEffect, useContext, useCallback} from 'react';
import {AppContext} from '../state/context';
import {Log} from '@ethersproject/abstract-provider';
import {getComment} from '../state/actionCreators';

export default function useCommentUpdatedEvent() {
  const {state, dispatch} = useContext(AppContext);
  const {imageboard} = state;

  const commentUpdate = useCallback(
    (id: string, log: Log) => {
      dispatch(getComment(id));
    },
    [dispatch, getComment]
  );

  useEffect((): any => {
    if (!imageboard) return false;
    state.imageboard?.on('CommentUpdated', commentUpdate);
    return () => {
      state.imageboard?.removeListener('CommentUpdated', commentUpdate);
    };
  }, [state.imageboard, commentUpdate]);
}
