import axios from 'axios'
import {
    getAllPoemsAction
} from "./poemsActions";
import * as commonActions from './commonActions'
import { API_ENDPOINTS } from '../../data/API_ENDPOINTS';
import { ACTIONS } from '../reducers/poemsReducers';
import { waitFor, act } from '@testing-library/react'


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
        const callbacks = {
            error: () => {
                console.log('error');
            }
        }

        getAllPoemsAction({params:{}, options, callbacks})(dispatch)

        expect(spy).toHaveBeenCalled();
        expect(spy).toBeCalledTimes(1)
        expect(spy).toHaveBeenCalledWith({
            type: ACTIONS.ALL_POEMS,
            url: API_ENDPOINTS.POEMS,
            dispatch,
            options,
            params: {},
            callbacks
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

    test('Should dispatch error when axios throws a generic error', async() => {
        axios.create.mockReturnThis();
        axios.get.mockReturnValueOnce(Promise.reject({response: 'some error'}));

        const options = {fetch: true}

        // this is done to give time to the test to wait until the second dispatch occurs. We can also use "act"
        await waitFor(() => 
            getAllPoemsAction({params: {}, options})(dispatch)
        )
        // another alternative:
        // await new Promise(resolve=> {
        //     setTimeout(() => {
        //         resolve();
        //     }, 300);
        // })
        
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[1][0].type).toBe(`${ACTIONS.ALL_POEMS}_rejected`);
        expect(dispatch.mock.calls[1][0].payload.response).toBe('some error');
    });

    // a network error is diferent beacause we don't get an error as an object with a reponse property
    test('Should dispatch error when axios throws a network error', async() => {
        axios.create.mockReturnThis();
        axios.get.mockReturnValueOnce(Promise.reject('Network error'))
        
        const options = {fetch: true}
        
        // this is done to give time to the test to wait until the second dispatch occurs. We can also use "act"
        await waitFor(() => 
            getAllPoemsAction({params: {}, options})(dispatch)
        )
        // another alternative:
        // await new Promise(resolve=> {
        //     setTimeout(() => {
        //         resolve();
        //     }, 300);
        // })
        
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[1][0].type).toBe(`${ACTIONS.ALL_POEMS}_rejected`);
        expect(dispatch.mock.calls[1][0].payload).toBe('Network error');
      
    });

    test('Should dispatch response when axios returns data correctly', async() => {
        // this is beacuse we use Axios.create
        axios.create.mockReturnThis();
        axios.get.mockReturnValueOnce(Promise.resolve({data:'yavendras.com'}));
          
        const options = {fetch: true}
        await waitFor(() => 
            getAllPoemsAction({params: {}, options})(dispatch)
        )
          
        expect(dispatch.mock.calls[0][0].type).toStrictEqual(`${ACTIONS.ALL_POEMS}_request`);
        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[1][0].type).toStrictEqual(`${ACTIONS.ALL_POEMS}_fulfilled`);
        expect(dispatch.mock.calls[1][0].payload).toEqual('yavendras.com');
    });
})
