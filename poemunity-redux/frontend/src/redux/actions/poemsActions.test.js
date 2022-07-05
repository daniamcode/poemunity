import axios from 'axios'
import {
    getAllPoemsAction
} from "./poemsActions";
import * as commonActions from './commonActions'
import { API_ENDPOINTS } from '../../data/API_ENDPOINTS';
import {ACTIONS} from '../reducers/poemsReducers';


jest.mock('axios');

describe('dispatch getAllPoemsAction', () => {
    let dispatch = null;
    beforeAll(() => {
        dispatch = jest.fn();
    });    
    afterAll(() => {
        dispatch.mockClear();
    });

    test('should call getAction - no fetch', () => {
        const spy = jest.spyOn(commonActions, 'getAction');
        const options = {fetch: false}
        getAllPoemsAction({params:{}, options})(dispatch)
        expect(spy).toHaveBeenCalled();
        expect(spy).toBeCalledTimes(1)
        expect(spy).toHaveBeenCalledWith({
            type: ACTIONS.ALL_POEMS,
            url: API_ENDPOINTS.POEMS,
            dispatch,
            options,
            params: {},
        })
        spy.mockRestore()
    })

    test('dispatches - reset', () => {
        const options = {fetch: false, reset: true}
        getAllPoemsAction({params: {}, options})(dispatch);

        expect(dispatch).toHaveBeenCalled();
    })

    test('Should dispatch wright type - reset', () => {
        const options = {fetch: false, reset: true}
        getAllPoemsAction({params: {}, options})(dispatch);
      
        expect(dispatch.mock.calls[0][0].type).toBe(`${ACTIONS.ALL_POEMS}_reset`);
    });

    test.skip('Should dispatch error when axios throws a generic error', async() => {
        axios.create.mockReturnThis();
        axios.get.mockReturnValueOnce(Promise.reject({response: 'some error'}));

        const options = {fetch: true}
        await getAllPoemsAction({params: {}, options})(dispatch);
      
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.calls.length).toBe(2);
        // expect(dispatch.mock.calls[1][0]).toBe(`${ACTIONS.ALL_POEMS}_rejected`);
    });

    test.skip('Should dispatch error when axios throws a network error', async() => {
        axios.create.mockReturnThis();
        axios.get.mockReturnValueOnce(Promise.reject({}));
        
        const options = {fetch: true}
        await getAllPoemsAction({params: {}, options})(dispatch);
        
        expect(dispatch.mock.calls[1][0].payload).toStrictEqual({response: 'Network Error'});
    });

    test('Should dispatch response when axios returns data correctly', async () => {
        // this is beacuse we use Axios.create
        axios.create.mockReturnThis();
        axios.get.mockReturnValueOnce(Promise.resolve({data:'yavendras.com'}));
          
        const options = {fetch: true}
        await getAllPoemsAction({params: {}, options})(dispatch);
          
        expect(dispatch.mock.calls[0][0].type).toStrictEqual(`${ACTIONS.ALL_POEMS}_request`);
        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[1][0].type).toStrictEqual(`${ACTIONS.ALL_POEMS}_fulfilled`);
        expect(dispatch.mock.calls[1][0].payload).toEqual('yavendras.com');
    });
})
