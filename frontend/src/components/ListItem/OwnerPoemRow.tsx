import React from 'react'
import { Poem, Context } from '../../typescript/interfaces'
import { usePoemActions } from '../../hooks/usePoemActions'
import { PUBLISH_POEM, UNPUBLISH_POEM, DRAFT_BADGE } from '../../data/constants'
import ListItem from './ListItem'

interface Props {
    poem: Poem
    context: Context
}

/**
 * A poem card on one of the OWNER'S OWN lists (My poems, Drafts), with the
 * publish/withdraw control attached.
 *
 * It wraps ListItem rather than extending it, because ListItem is the same card
 * the dashboard, genre lists and author pages render — a draft control inside it
 * would be a piece of private state on every public surface, guarded only by a
 * flag somebody has to remember to pass. Here the control exists only where the
 * viewer is provably the author.
 *
 * A missing `status` means published: the poems that predate the feature carry
 * no status at all and the server reads them the same way.
 */
export default function OwnerPoemRow({ poem, context }: Props) {
    const { onPublish, onUnpublish } = usePoemActions({ poem, context })
    const isDraft = poem.status === 'draft'

    return (
        <div className='owner-poem'>
            {isDraft && (
                <p className='owner-poem__badge'>{DRAFT_BADGE}</p>
            )}
            <ListItem poem={poem} context={context} />
            <div className='owner-poem__actions'>
                <button
                    type='button'
                    className='owner-poem__status-button'
                    onClick={isDraft ? onPublish : onUnpublish}
                >
                    {isDraft ? PUBLISH_POEM : UNPUBLISH_POEM}
                </button>
            </div>
        </div>
    )
}
