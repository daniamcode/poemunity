import React from 'react'
import SearchIcon from '@mui/icons-material/Search'
import { SEARCH_PLACEHOLDER } from '../../../data/constants'

interface SearchBarProps {
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

export function SearchBar({ onChange }: SearchBarProps) {
    return (
        <div className='search-input__container'>
            <SearchIcon className='search-input__icon' />
            <input
                type='text'
                className='search-input__field'
                placeholder={SEARCH_PLACEHOLDER}
                onChange={onChange}
            />
        </div>
    )
}
