import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

export default function CircularIndeterminate() {
    return (
        <Box
            sx={{
                display: 'flex',
                '& > * + *': {
                    marginLeft: 2
                }
            }}
        >
            <CircularProgress color='secondary' />
        </Box>
    )
}
