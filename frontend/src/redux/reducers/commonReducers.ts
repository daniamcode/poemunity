import { getTypes } from '../actions/commonActions'
import { StateItem } from '../../typescript/interfaces'

export const INITIAL = { isFetching: false, isError: false }

interface CommonReducerProps {
    state?: StateItem<unknown>
    action: {
        type: string
        payload?: object[] | object
    }
    actionType?: string
    abortRequests?: boolean
}

export function commonReducer({ state = INITIAL, action, actionType, abortRequests = true }: CommonReducerProps) {
    const { rejectedAction, requestAction, fulfilledAction, resetAction } = getTypes(actionType)

    switch (action.type) {
    case requestAction: {
        if (state.abortController && abortRequests) {
            state.abortController.abort()
        }
        return Object.assign({}, state, {
            isFetching: true
            // abortController: action.payload.abortController,
        })
    }
    case fulfilledAction: {
        let item
        if (action.payload) {
            const isOneAttrObj =
                    typeof action.payload === 'object' &&
                    !Array.isArray(action.payload) &&
                    Object.keys(action.payload).length === 1
            item = isOneAttrObj ? Object.values(action.payload)[0] : action.payload
        }
        else {
            item = action.payload
        }
        return Object.assign({}, state, {
            isFetching: false,
            isError: false,
            item,
            err: undefined,
            abortController: undefined
        })
    }
    case rejectedAction:
        return Object.assign({}, state, {
            isFetching: false,
            isError: true,
            err: action.payload,
            abortController: undefined
        })
    case resetAction: {
        if (state.abortController) {
            state.abortController.abort()
        }
        return INITIAL
    }

    default:
        return state
    }
}
