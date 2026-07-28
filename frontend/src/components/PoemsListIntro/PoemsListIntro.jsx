import { SearchBar } from '../List/components/SearchBar'

function PoemsListIntro({ searchValue, resultCount, onSearchChange }) {
    return (
        <div className='list__intro'>
            <SearchBar value={searchValue} onChange={onSearchChange} resultCount={resultCount} />
        </div>
    )
}

export default PoemsListIntro
