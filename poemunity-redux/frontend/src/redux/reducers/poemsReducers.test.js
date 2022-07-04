import * as commonReducers from './commonReducers';
import * as poemsReducers from './poemsReducers';
import { combineReducers } from 'redux';
import { ACTIONS }                    from '../actions/poemsActions';

jest.mock('redux');

describe('Poems reducer - allPoemsQuery', () => {
    test('should call commonReducer', () => {
        const spy = jest.spyOn(commonReducers, 'commonReducer');
        poemsReducers.allPoemsQuery(undefined, 'whatever')
        expect(spy).toHaveBeenCalled();
        expect(spy).toBeCalledTimes(1)
        expect(spy).toHaveBeenCalledWith({isFetching: false, isError: false}, 'whatever', ACTIONS.ALL_POEMS);
        spy.mockRestore()
    })
    test('should return the initial state with resetAction', () => {
        const result = poemsReducers.allPoemsQuery(
            undefined, 
            {
                type: `${ACTIONS.ALL_POEMS}_reset`,
            }
        )  
        expect(result).toEqual({isFetching: false, isError: false});
    })
    test('should return loading with requestAction', () => {
        const result = poemsReducers.allPoemsQuery(
            undefined, 
            {
            type: `${ACTIONS.ALL_POEMS}_request`
            }
        )

        expect(result).toEqual({isFetching: true, isError: false});
    })  
    test('should return correct state with fulfilledAction - with initialState', () => {
        const result = poemsReducers.allPoemsQuery(
            undefined, 
            {
                type: `${ACTIONS.ALL_POEMS}_fulfilled`,
                payload: [
                    {id: 1, title: 'title1'},
                    {id: 2, title: 'title2'},
                ]
            }
        )
        expect(result).toEqual({isFetching: false, isError: false, item: [{id: 1, title: 'title1'}, {id: 2, title: 'title2'}]});
        expect(result).toStrictEqual({err: undefined, abortController: undefined, isFetching: false, isError: false, item: [{id: 1, title: 'title1'}, {id: 2, title: 'title2'}]});
    })
    test('should return correct state with fulfilledAction - with previous state', () => {
        const prevState =  {isFetching: false, isError: false, item: [{id: 1, title: 'title1'}]}
        const result = poemsReducers.allPoemsQuery(
            prevState, 
            {
                type: `${ACTIONS.ALL_POEMS}_fulfilled`,
                payload: [
                    {id: 2, title: 'title2'},
                    {id: 3, title: 'title3'},
                ]
            }
        )
        // the previous state is not considered
        expect(result).toEqual({isFetching: false, isError: false, item: [{id: 2, title: 'title2'}, {id: 3, title: 'title3'}]});
    })
    test('should return correct state with rejectedAction', () => {
        const result = poemsReducers.allPoemsQuery(
            undefined, 
            {
                type: `${ACTIONS.ALL_POEMS}_rejected`,
                payload: [
                    {id: 1, title: 'title1'},
                    {id: 2, title: 'title2'},
                ]
            }
        )
        expect(result).toEqual({isFetching: false, isError: true, err: [{id: 1, title: 'title1'}, {id: 2, title: 'title2'}]});
        expect(result).toStrictEqual({abortController: undefined, isFetching: false, isError: true, err: [{id: 1, title: 'title1'}, {id: 2, title: 'title2'}]});
    })
})