import checkPropTypes from 'check-prop-types';
import ListItem from './ListItem';

describe('ListItem component', () => {
    it('Check PropTypes', () => {
        // we can validate that the test fails just by changing for instance, expectedProps.filter into a number
        const expectedProps = {
            poem: {},
            filter: '',
            context: {}
          }
        const propsErr = checkPropTypes(ListItem.propTypes, expectedProps, 'props', ListItem.name);
        expect(propsErr).toBeUndefined();
    })
})