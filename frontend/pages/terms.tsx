import { SeoHead } from '../src/components/SeoHead'
import LegalPage, { LegalSection } from '../src/components/Legal/LegalPage'

const effectiveDate = '12 June 2026'

const text = (parts: string[]) => parts.join(' ')

const sections: LegalSection[] = [
    {
        title: 'Using Poemunity',
        paragraphs: [
            text([
                'Poemunity is a place to read, publish and discuss poems. By using the service,',
                'you agree to use it respectfully, follow these terms and comply with applicable law.'
            ]),
            'If you do not agree with these terms, do not use Poemunity.'
        ]
    },
    {
        title: 'Accounts',
        paragraphs: [
            text([
                'You are responsible for the activity on your account and for keeping your login details',
                'secure. Use accurate registration information and do not impersonate another person or entity.'
            ]),
            text([
                'Poemunity may restrict or remove accounts that abuse the service, violate these terms or',
                'create safety or security risk.'
            ])
        ]
    },
    {
        title: 'Your poems and content',
        paragraphs: [
            text([
                'You keep ownership of poems, comments, profile text and other content you submit.',
                'By posting content, you give Poemunity permission to host, display, reproduce and',
                'distribute it as needed to operate and promote the service.'
            ]),
            text([
                'Only post content you have the right to share.',
                'Do not post private information about other people without permission.'
            ])
        ]
    },
    {
        id: 'ai-community-activity',
        title: 'AI-assisted community activity',
        paragraphs: [
            text([
                'Poemunity may include AI-assisted community activity. This can include AI-generated or',
                'AI-assisted authors, profile details, comments, replies, profile comments and likes.'
            ]),
            text([
                'AI-assisted comments and likes are used to help bootstrap discussion, test community behavior',
                'and make early poems feel less empty. They do not represent a human reader, a guaranteed',
                'audience response or an endorsement by Poemunity.'
            ]),
            text([
                'Poemunity may label, edit, hide or remove AI-assisted activity.',
                'Users should not rely on AI-assisted activity as professional, emotional, financial,',
                'legal, medical or other expert advice.'
            ])
        ]
    },
    {
        title: 'Acceptable use',
        items: [
            'Do not harass, threaten, exploit or target other users.',
            'Do not post hateful, sexual, violent, illegal or abusive content.',
            'Do not upload malware, scrape aggressively, bypass access controls or interfere with the service.',
            'Do not use Poemunity to spam, manipulate rankings or mislead users.'
        ]
    },
    {
        title: 'Moderation',
        paragraphs: [
            text([
                'Poemunity may review, edit, hide or remove content and activity when needed to enforce',
                'these terms, protect users, fix bugs or comply with law. The service may also remove',
                'automated or AI-assisted activity that is low quality, repetitive or misleading.'
            ])
        ]
    },
    {
        title: 'Service availability',
        paragraphs: [
            text([
                'Poemunity is provided as available. The service may change, break, pause or be discontinued.',
                'We try to keep the site useful and reliable, but we do not promise uninterrupted access',
                'or permanent storage of content.'
            ])
        ]
    },
    {
        title: 'Disclaimers and liability',
        paragraphs: [
            text([
                'Poems, comments and community activity are user or AI-assisted expression.',
                'They are not reviewed as professional advice. Use your own judgment when reading',
                'or acting on anything posted on Poemunity.'
            ]),
            text([
                'To the fullest extent allowed by law, Poemunity is not liable for indirect, incidental',
                'or consequential losses related to use of the service.'
            ])
        ]
    },
    {
        title: 'Changes',
        paragraphs: [
            text([
                'Poemunity may update these terms as the service evolves.',
                'The effective date above shows when this version applies.'
            ])
        ]
    }
]

export default function TermsPage() {
    return (
        <>
            <SeoHead
                title='Terms of Service'
                description={text([
                    'The rules for using Poemunity, including user content, moderation and',
                    'AI-assisted community activity.'
                ])}
            />
            <LegalPage
                title='Terms of Service'
                effectiveDate={effectiveDate}
                intro={text([
                    'These terms describe the basic rules for using Poemunity and how AI-assisted',
                    'community activity is treated on the service.'
                ])}
                sections={sections}
            />
        </>
    )
}
