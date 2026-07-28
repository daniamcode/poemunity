import React from 'react'
import SearchIcon from '@mui/icons-material/Search'
import {
    SEARCH_PLACEHOLDER,
    SEARCH_MIN_LENGTH,
    SEARCH_MIN_LENGTH_HINT
} from '../../../data/constants'

interface SearchBarProps {
    value: string
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
    /**
     * Number of results currently shown, announced to screen readers. Pass
     * undefined while a search is in flight so nothing is announced until the
     * count is real — announcing "0 results" mid-request is a lie.
     */
    resultCount?: number
}

export function SearchBar({ value, onChange, resultCount }: SearchBarProps) {
    const isBelowThreshold = value.trim().length > 0 && value.trim().length < SEARCH_MIN_LENGTH
    const isSearching = value.trim().length >= SEARCH_MIN_LENGTH

    // This is a filtered region, NOT a combobox: there is no popup listbox of
    // suggestions, the results replace the page content. Using combobox/listbox
    // roles without a popup misreports the widget to screen readers, so the
    // right pattern here is a searchbox plus a polite status region.
    const status = (() => {
        if (isBelowThreshold) return SEARCH_MIN_LENGTH_HINT
        if (!isSearching || resultCount === undefined) return ''
        return resultCount === 1 ? '1 result' : `${resultCount} results`
    })()

    return (
        <div className='search-input__container'>
            <SearchIcon className='search-input__icon' />
            <input
                type='search'
                className='search-input__field'
                placeholder={SEARCH_PLACEHOLDER}
                aria-label={SEARCH_PLACEHOLDER}
                aria-describedby='search-input__status'
                value={value}
                onChange={onChange}
            />
            <div
                id='search-input__status'
                className='search-input__status'
                role='status'
                aria-live='polite'
            >
                {status}
            </div>
        </div>
    )
}
