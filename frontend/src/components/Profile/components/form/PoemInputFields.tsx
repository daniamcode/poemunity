import { CATEGORIES, PROFILE_SELECT_CATEGORY, PROFILE_SELECT_TITLE } from '../../../../data/constants'
import { PoemFormData } from '../../hooks/useProfileForm'

interface PoemInputFieldsProps {
    poem: PoemFormData
    poemQuery: any
    updatePoemField: <K extends keyof PoemFormData>(field: K, value: PoemFormData[K]) => void
}

function PoemInputFields({ poem, poemQuery, updatePoemField }: PoemInputFieldsProps) {
    return (
        <>
            <label className='profile__insert-poem-input'>
                <input
                    className='profile__insert-poem-input'
                    placeholder={PROFILE_SELECT_TITLE}
                    name='title'
                    required
                    value={poem.title}
                    onChange={event => updatePoemField('title', event.target.value)}
                />
            </label>
            <label className='profile__insert-poem-input'>
                <select
                    className='profile__insert-poem-input'
                    id='category'
                    name='category'
                    required
                    value={poem.category}
                    onChange={event => updatePoemField('category', event.target.value)}
                >
                    <option value=''>{PROFILE_SELECT_CATEGORY}</option>
                    {CATEGORIES?.map((category, index) => (
                        <option
                            key={index}
                            value={category.toLowerCase()}
                            selected={poemQuery?.item?.genre === category.toLowerCase()}
                        >
                            {category}
                        </option>
                    ))}
                </select>
            </label>
        </>
    )
}

export default PoemInputFields
