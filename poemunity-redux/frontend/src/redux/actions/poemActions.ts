import store from '../store';
import { getAction, getTypes, putAction } from './commonActions';
import { API_ENDPOINTS } from '../../data/API_ENDPOINTS';
import cloneDeep from 'lodash.clonedeep';
import { ACTIONS } from '../reducers/poemReducers';
import { ReduxOptions, ReduxCallbacks, Context, Poem } from '../../typescript/interfaces'
import { AppDispatch} from '../store'

interface getPoemActionProps {
    params?: {
        poemId: string
    }
    options?: ReduxOptions
}

export function getPoemAction({ params, options }: getPoemActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        return getAction({
            type: ACTIONS.POEM,
            url: `${API_ENDPOINTS.POEMS}/${params?.poemId}`,
            dispatch,
            options,
        });
    };
}

interface likePoemActionProps {
    params: {
        poemId: string
    }
    context: Context
    options?: ReduxOptions
    callbacks: ReduxCallbacks
}

export function likePoemAction({ params, context, options, callbacks }: likePoemActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        return putAction({
            type: ACTIONS.LIKE_POEM,
            url: `${API_ENDPOINTS.POEMS}/${params.poemId}`,
            // context.config is basically the jwt token
            config: context.config,
            dispatch,
            options,
            callbacks,
        });
    };
}

interface updatePoemCacheAfterLikePoemActionProps {
    context: Context
}

export function updatePoemCacheAfterLikePoemAction({ context }: updatePoemCacheAfterLikePoemActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        const { poemQuery: { item: poemQuery }  } = store.getState();
        const newPoemQuery = cloneDeep(poemQuery as Poem);

        const index = newPoemQuery?.likes?.indexOf(context.userId);
        if(index !== -1) {
            newPoemQuery?.likes.splice(index, 1);
        } else {
            newPoemQuery?.likes.push(context.userId);
        }            

        const { fulfilledAction } = getTypes(ACTIONS.POEM);
        dispatch({
            type: fulfilledAction,
            payload: newPoemQuery,
        });
    };
}