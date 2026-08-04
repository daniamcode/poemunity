import React from 'react'
import { SearchBar } from './SearchBar'
import { OriginFilter } from './OriginFilter'
import { SortFilter } from './SortFilter'

interface ListHeaderProps {
    origin: string
    orderBy: string
    searchValue: string
    resultCount?: number
    onSearchChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
    onOriginChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
    onOrderChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
}

export function ListHeader({
    origin,
    orderBy,
    searchValue,
    resultCount,
    onSearchChange,
    onOriginChange,
    onOrderChange
}: ListHeaderProps) {
    return (
        <div className='list__intro'>
            {/* "Category: BEAUTY" used to sit here. Removed: the page already
                says it twice — the `h1` reads "52 Beauty poems" and the
                breadcrumb ends on "Beauty" — and a third copy in the filter row
                competed with the search box and the two dropdowns beside it,
                which are the controls somebody is actually reaching for. */}
            <SearchBar value={searchValue} onChange={onSearchChange} resultCount={resultCount} />
            {/* Grouped so the two dropdowns share one row on phones instead of
                costing two lines of a sticky header. */}
            <div className='list__filters'>
                <OriginFilter value={origin} onChange={onOriginChange} />
                <SortFilter value={orderBy} onChange={onOrderChange} />
            </div>
        </div>
    )
}
