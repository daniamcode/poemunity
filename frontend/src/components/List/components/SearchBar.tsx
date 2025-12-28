import React from 'react'
import { TextField } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { SEARCH_PLACEHOLDER } from '../../../data/constants'

interface SearchBarProps {
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

export function SearchBar({ onChange }: SearchBarProps) {
    return (
        <div className='list__search'>
            <div className='separator' />
            <SearchIcon
                style={{
                    fontSize: 40,
                    fill: '#4F5D73'
                }}
            />
            <TextField
                variant='standard'
                label={SEARCH_PLACEHOLDER}
                InputLabelProps={{
                    style: {
                        color: '#4F5D73'
                    }
                }}
                InputProps={{
                    style: {
                        color: '#4F5D73'
                    }
                }}
                onChange={onChange}
            />
        </div>
    )
}
