import * as commonReducers from './commonReducers';
import * as poemsReducers from './poemsReducers';
import { ACTIONS }                    from './poemsReducers';


// jest.mock('redux');

describe('Poems reducer - allPoemsQuery', () => {
    const poem1 = {id: '1', author: 'author1', date: 'date1', genre: 'genre1', likes: ['1'], picture: 'picture1', poem: 'poem1', title: 'title1', userId: 'userId1'}
    const poem2 = {id: '2', author: 'author2', date: 'date2', genre: 'genre2', likes: ['2'], picture: 'picture2', poem: 'poem2', title: 'title2', userId: 'userId2'}
    const poem3 = {id: '3', author: 'author3', date: 'date3', genre: 'genre3', likes: ['3'], picture: 'picture3', poem: 'poem3', title: 'title3', userId: 'userId3'}
    
    test('should call commonReducer', () => {
        const spy = jest.spyOn(commonReducers, 'commonReducer');
        poemsReducers.allPoemsQuery(undefined, {type: 'whatever'})
        expect(spy).toHaveBeenCalled();
        expect(spy).toBeCalledTimes(1)
        expect(spy).toHaveBeenCalledWith({state: {isFetching: false, isError: false}, action: {type: 'whatever'}, actionType: ACTIONS.ALL_POEMS});
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
    test('should return the initial state with resetAction calling abort', () => {
        const prevState =  {isFetching: false, isError: false, abortController: new AbortController()}
        const abortSpy = jest.spyOn(prevState.abortController, 'abort');

        const result = poemsReducers.allPoemsQuery(
            prevState, 
            {
                type: `${ACTIONS.ALL_POEMS}_reset`,
            }
        )  

        expect(result).toEqual({isFetching: false, isError: false});
        expect(abortSpy).toHaveBeenCalledTimes(1)
        abortSpy.mockRestore()
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
    test('should return loading true with requestAction when calling abort, and abort should be called', () => {
        const prevState =  {isFetching: false, isError: false, abortController: new AbortController(), abortRequests: true}
        const abortSpy = jest.spyOn(prevState.abortController, 'abort');
        const result = poemsReducers.allPoemsQuery(
            prevState, 
            {
            type: `${ACTIONS.ALL_POEMS}_request`
            }
        )

        expect(result).toEqual({...prevState, isFetching: true});
        expect(abortSpy).toHaveBeenCalledTimes(1)
        abortSpy.mockRestore()
    })  
    test('should return correct state with fulfilledAction - with initialState', () => {
        const result = poemsReducers.allPoemsQuery(
            undefined, 
            {
                type: `${ACTIONS.ALL_POEMS}_fulfilled`,
                payload: [
                    poem1,
                    poem2,
                ]
            }
        )
        expect(result).toEqual({isFetching: false, isError: false, item: [poem1, poem2]});
        expect(result).toStrictEqual({
            err: undefined, 
            abortController: undefined, 
            isFetching: false, 
            isError: false, 
            item: [poem1, poem2]});
    })
    test('should return correct state with fulfilledAction - with previous state', () => {
        const prevState =  {isFetching: false, isError: false, item: [poem1]}
        const result = poemsReducers.allPoemsQuery(
            prevState, 
            {
                type: `${ACTIONS.ALL_POEMS}_fulfilled`,
                payload: [
                    poem2,
                    poem3,
                ]
            }
        )
        // the previous state is not considered
        expect(result).toEqual({isFetching: false, isError: false, item: [poem2, poem3]});
    })
    test('should return correct state with rejectedAction', () => {
        const result = poemsReducers.allPoemsQuery(
            undefined, 
            {
                type: `${ACTIONS.ALL_POEMS}_rejected`,
                payload: [
                    poem1,
                    poem2,
                ]
            }
        )
        expect(result).toEqual({isFetching: false, isError: true, err: [poem1, poem2]});
        expect(result).toStrictEqual({
            abortController: undefined, 
            isFetching: false, 
            isError: true, 
            err: [poem1, poem2]});
    })
})