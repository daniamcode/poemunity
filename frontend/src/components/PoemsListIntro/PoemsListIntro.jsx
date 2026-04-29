import { SearchBar } from '../List/components/SearchBar'

function PoemsListIntro({ onSearchChange }) {
    return (
        <div className='list__intro'>
            <SearchBar onChange={onSearchChange} />
        </div>
    )
}

export default PoemsListIntro
