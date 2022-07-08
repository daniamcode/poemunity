import { postAction } from './commonActions';
import { API_ENDPOINTS } from '../../data/API_ENDPOINTS';
import { ACTIONS } from '../reducers/loginReducers';
import { ReduxOptions, ReduxCallbacks } from '../../typescript/interfaces'
import { AppDispatch} from '../store'


interface LoginActionProps {
    data: object
    options?: ReduxOptions
    callbacks: ReduxCallbacks
}

export function loginAction({ data, callbacks }: LoginActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        return postAction({
            type: ACTIONS.LOGIN,
            url: `${API_ENDPOINTS.LOGIN}`,
            dispatch,
            data,
            callbacks,
        })
    };
}

export function registerAction({ data, callbacks }: LoginActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        return postAction({
            type: ACTIONS.REGISTER,
            url: `${API_ENDPOINTS.REGISTER}`,
            dispatch,
            data,
            callbacks,
        })
    };
}
