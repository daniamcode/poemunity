import React from 'react'
import { format } from 'date-fns'
import { Poem } from '../../../typescript/interfaces'

interface PoemContentProps {
    poem: Poem
}

export function PoemContent({ poem }: PoemContentProps) {
    return (
        <>
            <section>
                <h2 className='poem__title'>{poem.title}</h2>
                <div className='poem__author-container'>
                    <img className='poem__picture' src={poem.picture} alt={poem.author} />
                    <p className='poem__author'>{poem.author}</p>
                </div>
                <div className='poem__date'>{format(new Date(poem.date), "MM/dd/yyyy HH:mm'h'")}</div>
            </section>
            <section>
                <div className='poem__content'>{poem.poem}</div>
            </section>
        </>
    )
}
