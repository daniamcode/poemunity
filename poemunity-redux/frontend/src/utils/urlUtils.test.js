import {useFiltersFromQuery} from './urlUtils'
import {act, renderHook} from '@testing-library/react-hooks'

// this is how custom hooks are tested. Watch https://www.youtube.com/watch?v=qRw3qKRBW4M&list=LL
describe('useFiltersFromQuery', () => {
    it('should match', () => {
        const {result} = renderHook(()=>useFiltersFromQuery({test: 'test'}))
        
        //if the returned value contains a function we could do this to execute it:
        // act(()=> {
        //     result.current.functionName(value)
        // })

        //the first element of the array is "data" ans the second one is "setData"
        expect(result.current[0]).toEqual({test: 'test'});
    })
})