import { render, screen } from '@testing-library/react'
import TabPanel, { a11yProps } from './TabPanel'

describe('TabPanel', () => {
    test('renders its children when the tab is selected', () => {
        render(<TabPanel value={0} index={0}><span>panel content</span></TabPanel>)

        expect(screen.getByText('panel content')).toBeInTheDocument()
    })

    test('renders nothing for the tab that is not selected', () => {
        render(<TabPanel value={1} index={0}><span>panel content</span></TabPanel>)

        expect(screen.queryByText('panel content')).not.toBeInTheDocument()
    })

    test('marks the unselected panel hidden', () => {
        const { container } = render(<TabPanel value={1} index={0}>x</TabPanel>)

        expect(container.querySelector('[role="tabpanel"]')).toHaveAttribute('hidden')
    })

    // The panel holds the poem list — divs, sections and an <svg>. Wrapping that
    // in MUI <Typography> put it all inside a <p>, and the HTML parser closes an
    // open <p> when it meets flow content: the DOM the browser built from the
    // SSR html did not match the tree React was hydrating, so every load of
    // /profile threw a hydration error and re-rendered the page client-side.
    //
    // jsdom cannot catch that — it never parses server HTML, and appending a div
    // to a p through the DOM API is perfectly legal. So this asserts the SHAPE
    // that made it possible rather than the symptom: no ancestor <p> around
    // content that is not text.
    test('does not nest flow content inside a paragraph', () => {
        render(
            <TabPanel value={0} index={0}>
                <div data-testid='block-child'>a list, not a sentence</div>
            </TabPanel>
        )

        expect(screen.getByTestId('block-child').closest('p')).toBeNull()
    })

    describe('a11yProps', () => {
        test('ties each tab to the panel it controls', () => {
            expect(a11yProps(1)).toEqual({
                id: 'full-width-tab-1',
                'aria-controls': 'full-width-tabpanel-1'
            })
        })

        test('the panel carries the matching ids', () => {
            const { container } = render(<TabPanel value={0} index={1}>x</TabPanel>)
            const panel = container.querySelector('[role="tabpanel"]')

            expect(panel).toHaveAttribute('id', 'full-width-tabpanel-1')
            expect(panel).toHaveAttribute('aria-labelledby', 'full-width-tab-1')
        })
    })
})
