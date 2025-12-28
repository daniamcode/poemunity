import React from 'react'
import { CATEGORIES_TITLE_LABEL } from '../../../data/constants'
import { SearchBar } from './SearchBar'
import { OriginFilter } from './OriginFilter'
import { SortFilter } from './SortFilter'

interface ListHeaderProps {
    genre?: string
    origin: string
    orderBy: string
    onSearchChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
    onOriginChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
    onOrderChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
}

export function ListHeader({ genre, origin, orderBy, onSearchChange, onOriginChange, onOrderChange }: ListHeaderProps) {
    return (
        <div className='list__intro'>
            {genre && (
                <p className='list__presentation'>
                    {CATEGORIES_TITLE_LABEL}
                    {genre.toUpperCase()}
                </p>
            )}
            <SearchBar onChange={onSearchChange} />
            <OriginFilter value={origin} onChange={onOriginChange} />
            <SortFilter value={orderBy} onChange={onOrderChange} />
        </div>
    )
}
