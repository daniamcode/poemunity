import { postAction } from './commonActions';
import { API_ENDPOINTS } from '../../data/API_ENDPOINTS';
import { ACTIONS } from '../reducers/loginReducers';
import { ReduxOptions, ReduxCallbacks, Context } from '../../typescript/interfaces'
import { AppDispatch} from '../store'


interface LoginActionProps {
    data: object
    options?: ReduxOptions
    callbacks: ReduxCallbacks
    context: Context
}

export function loginAction({ data, context, callbacks }: LoginActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        return postAction({
            type: ACTIONS.LOGIN,
            url: `${API_ENDPOINTS.LOGIN}`,
            dispatch,
            data,
            callbacks,
            config: context.config,
        })
    };
}
