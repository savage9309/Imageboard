import {AppState, Thread, Comment, Status} from './state';
import {ActionType, AppAction} from './actions';

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {

    case ActionType.SetImageboardDeployment:
      return {...state, ...action.payload};

    case ActionType.SetBzzDeployment:
      return {...state, ...action.payload};

    case ActionType.SetImageboardContract:
      return { ...state, ...action.payload};

    case ActionType.SetBzzContract:
      return { ...state, ...action.payload};

      
    case ActionType.SetBzzBalance:
      return { ...state, ...action.payload};
      
    case ActionType.SetBzzAllowance:
      return { ...state, ...action.payload};

    case ActionType.SetPostageBatchId:
      return { ...state, ...action.payload };
      
    case ActionType.SetCurrentPage:
      return { ...state, ...action.payload};

    case ActionType.ThreadListDidMount:
      return {
        ...state,
        status: Status.Finished,
      };

    case ActionType.SetTotalThreads:
      return {
        ...state,
        ...action.payload,
      };

    case ActionType.AddThreadIds:
      return {
        ...state,
        threadIds: action.payload.endOfList
          ? Array.from(new Set(state.threadIds.concat(action.payload.threadIds)))
          : Array.from(new Set(action.payload.threadIds.concat(state.threadIds))),
      };

    case ActionType.ResetThreadIds:
      return {
        ...state,
        threadIds: [],
      };

    case ActionType.RemoveThreadByIndex:
      const threads = state.threads.filter((thread) => thread.index !== action.payload.thread.index);
      return {
        ...state,
        threads,
      };

    case ActionType.AddThread:
      return {
        ...state,
        threads: action.payload.endOfList
          ? [...state.threads, action.payload.thread]
          : [action.payload.thread, ...state.threads],
      };

    case ActionType.AddThreadTransaction:
      return {
        ...state,
        threadTransactions: [...state.threadTransactions, action.payload.threadTransaction],
      };


      case ActionType.RemoveThreadTransaction:
        return {
          ...state,
          threadTransactions: state.threadTransactions.filter((threadTransaction) => threadTransaction.txHash !== action.payload.txHash)
        };

    case ActionType.ResetThreads:
      return {
        ...state,
        threads: [],
      };

    case ActionType.UpdateThreadByTxHash:
      return {
        ...state,
        threads: state.threads.map((thread: Thread) =>
          thread.txHash === action.payload.thread.txHash
            ? {
                ...thread,
                ...action.payload.thread,
              }
            : thread
        ),
      };

    case ActionType.UpdateThreadByBzzhash:
      return {
        ...state,
        threads: state.threads.map((thread: Thread) =>
          thread.bzzhash === action.payload.thread.bzzhash
            ? {
                ...thread,
                ...action.payload.thread,
              }
            : thread
        ),
      };

    case ActionType.UpdateThreadByIndex:
      return {
        ...state,
        threads: state.threads.map((thread: Thread) =>
          thread.index === action.payload.thread.index
            ? {
                ...thread,
                ...action.payload.thread,
              }
            : thread
        ),
      };
  
    case ActionType.AddComment:
      const comments = action.payload.endOfList
        ? [...state.comments, action.payload.comment]
        : [action.payload.comment, ...state.comments];
      return {...state, comments};


    case ActionType.UpdateComment:
      return {
        ...state,
        comments: state.comments.map((comment: Comment) =>
          comment.bzzhash === action.payload.comment.bzzhash
            ? {
                ...comment,
                ...action.payload.comment,
              }
            : comment
        ),
      };

    case ActionType.UpdateCommentByBzzhash:
      return {
        ...state,
        comments: state.comments.map((comment: Comment) =>
          comment.bzzhash === action.payload.comment.bzzhash
            ? {
                ...comment,
                ...action.payload.comment,
              }
            : comment
        ),
      };

    default:
      return state;
  }
}
