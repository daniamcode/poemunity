import ReactDOM from 'react-dom'
import './index'

jest.mock('react-dom', () => ({ render: jest.fn() }))

describe('Application root', () => {
    test('should render', () => {
        const root = document.getElementById('root')
        if (root) {
            // todo: check why i need all these eslint-disable-next-line
            // eslint-disable-next-line react/no-deprecated
            expect(ReactDOM.render).toHaveBeenCalled()
        }
    })
})
