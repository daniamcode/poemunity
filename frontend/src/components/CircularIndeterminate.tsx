import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

export default function CircularIndeterminate() {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                padding: '40px 0',
                minHeight: '200px'
            }}
        >
            <CircularProgress 
                style={{ color: '#3498db' }} 
                size={40}
                thickness={4}
            />
        </Box>
    )
}
