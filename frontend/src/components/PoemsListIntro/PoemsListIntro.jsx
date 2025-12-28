import { TextField } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

function PoemsListIntro({ onSearchChange }) {
    return (
        <div className='list__intro'>
            <div className='separator' />
            <div className='list__search'>
                <SearchIcon
                    style={{
                        fontSize: 40,
                        fill: '#551A8B'
                    }}
                />
                <TextField
                    variant='standard'
                    label='Search author'
                    InputLabelProps={{
                        style: {
                            color: '#551A8B'
                        }
                    }}
                    InputProps={{
                        style: {
                            color: '#551A8B'
                        }
                    }}
                    onChange={onSearchChange}
                />
            </div>
        </div>
    )
}

export default PoemsListIntro
