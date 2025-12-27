import { PROFILE_POEM_PLACEHOLDER } from '../../../../data/constants'
import { PoemFormData } from '../../hooks/useProfileForm'

interface PoemTextAreaProps {
    poem: PoemFormData
    updatePoemField: <K extends keyof PoemFormData>(field: K, value: PoemFormData[K]) => void
}

function PoemTextArea({ poem, updatePoemField }: PoemTextAreaProps) {
    return (
        <div>
            <textarea
                className='profile__text-area'
                id='poem'
                name='poem'
                required
                placeholder={PROFILE_POEM_PLACEHOLDER}
                value={poem.content}
                onChange={event => updatePoemField('content', event.target.value)}
            />
        </div>
    )
}

export default PoemTextArea
