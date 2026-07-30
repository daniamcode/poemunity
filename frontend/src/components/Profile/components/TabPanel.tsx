import React from 'react'
import Box from '@mui/material/Box'

interface TabPanelProps {
    children?: React.ReactNode
    value: number
    index: number
    dir?: string
    className?: string
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props

    return (
        <div
            role='tabpanel'
            hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
            {...other}
        >
            {/* Children go in as-is. They used to be wrapped in MUI <Typography>,
                which renders a <p> — and the panel's children are the poem list:
                divs, sections and an <svg>. The HTML parser closes an open <p>
                when it meets flow content, so the DOM the browser built from the
                server HTML did not match the tree React was hydrating, and every
                load of /profile threw "Hydration failed because the initial UI
                does not match what was rendered on the server" and re-rendered
                the whole page on the client. Typography is for text; a panel that
                holds arbitrary content has no business declaring it a paragraph. */}
            {value === index && (
                <Box p={3}>
                    {children}
                </Box>
            )}
        </div>
    )
}

export function a11yProps(index: number) {
    return {
        id: `full-width-tab-${index}`,
        'aria-controls': `full-width-tabpanel-${index}`
    }
}

export default TabPanel
