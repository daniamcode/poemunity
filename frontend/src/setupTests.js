// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
// import '@testing-library/jest-dom/extend-expect'

import Enzime from 'enzyme'
import EnzimeAdapter from '@wojtekmaj/enzyme-adapter-react-17'

Enzime.configure({
    adapter: new EnzimeAdapter(),
    disableLifecycleMethods: true
})
