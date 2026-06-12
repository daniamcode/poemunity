export interface LegalSection {
    id?: string
    title: string
    paragraphs?: string[]
    items?: string[]
}

interface LegalPageProps {
    title: string
    effectiveDate: string
    intro: string
    sections: LegalSection[]
}

export default function LegalPage({ title, effectiveDate, intro, sections }: LegalPageProps) {
    return (
        <article className='legal-page'>
            <header className='legal-page__header'>
                <p className='legal-page__eyebrow'>Poemunity policy</p>
                <h1>{title}</h1>
                <p className='legal-page__date'>Effective date: {effectiveDate}</p>
                <p className='legal-page__intro'>{intro}</p>
            </header>

            <div className='legal-page__content'>
                {sections.map(section => (
                    <section className='legal-page__section' id={section.id} key={section.title}>
                        <h2>{section.title}</h2>
                        {section.paragraphs?.map(paragraph => (
                            <p key={paragraph}>{paragraph}</p>
                        ))}
                        {section.items && (
                            <ul>
                                {section.items.map(item => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        )}
                    </section>
                ))}
            </div>
        </article>
    )
}
