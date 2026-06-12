import { SeoHead } from '../src/components/SeoHead'
import LegalPage, { LegalSection } from '../src/components/Legal/LegalPage'

const effectiveDate = '12 June 2026'

const text = (parts: string[]) => parts.join(' ')

const sections: LegalSection[] = [
    {
        title: 'Information we collect',
        paragraphs: [
            text([
                'We collect the information needed to run Poemunity: account details such as username,',
                'email address and password hash; profile details you choose to add; poems, comments,',
                'replies, likes and other community activity; and basic technical information from requests',
                'to the site.'
            ]),
            text([
                'You can choose how much profile information to share.',
                'Some profile fields may be marked private from your profile settings.'
            ])
        ]
    },
    {
        title: 'How we use information',
        items: [
            'To create and secure your account.',
            'To publish poems and community activity you submit.',
            'To show profiles, rankings, feeds, comments, replies and likes.',
            'To prevent abuse, investigate bugs and moderate content.',
            'To improve Poemunity and keep the service reliable.'
        ]
    },
    {
        title: 'Cookies and local storage',
        paragraphs: [
            text([
                'Poemunity uses browser storage and authentication cookies to keep you logged in and to',
                'make account features work. The service does not currently use third-party advertising cookies.'
            ]),
            text([
                'The authentication implementation is being migrated toward httpOnly cookies.',
                'During that migration, some client-side flows may still read account session data from',
                'local storage.'
            ])
        ]
    },
    {
        id: 'ai-community-activity',
        title: 'AI-assisted community activity',
        paragraphs: [
            text([
                'Poemunity may include AI-assisted community accounts and activity. This can include',
                'AI-generated or AI-assisted authors, profile details, comments, replies, profile comments',
                'and likes created to help new poems receive early feedback and to test community features.'
            ]),
            text([
                'AI-assisted activity is not a statement from a human reader and should not be treated as',
                'a human endorsement. It may be reviewed, labeled, edited or removed by the Poemunity team.'
            ]),
            text([
                'AI activity is stored with the same core community records as other activity so the site',
                'can display comments, replies, likes and rankings consistently.'
            ])
        ]
    },
    {
        title: 'Sharing information',
        paragraphs: [
            text([
                'We do not sell personal information. We may share information with infrastructure providers',
                'that host the application, database, logs and deployment systems, and when required to',
                'comply with law or protect the service and its users.'
            ])
        ]
    },
    {
        title: 'Your choices',
        items: [
            text([
                'You can edit or delete poems and profile details from your account where the product',
                'provides those controls.'
            ]),
            'You can use profile privacy controls for supported fields.',
            'Additional account and data deletion controls should be added as the product matures.'
        ]
    },
    {
        title: 'Retention',
        paragraphs: [
            text([
                'We keep account, poem and activity records for as long as needed to operate Poemunity,',
                'comply with obligations, resolve disputes, prevent abuse and maintain backups.',
                'Deleted content may remain briefly in backups or logs before expiry.'
            ])
        ]
    },
    {
        title: 'Children',
        paragraphs: [
            'Poemunity is not directed to children under 13.'
        ]
    },
    {
        title: 'International processing',
        paragraphs: [
            text([
                'Poemunity may be hosted by providers in different countries. By using the service,',
                'you understand that information may be processed where those providers operate.'
            ])
        ]
    },
    {
        title: 'Changes',
        paragraphs: [
            text([
                'We may update this policy as the service changes. If a change materially affects users,',
                'Poemunity should publish the updated effective date and make the revised policy available',
                'from the site header or footer.'
            ])
        ]
    }
]

export default function PrivacyPage() {
    return (
        <>
            <SeoHead
                title='Privacy Policy'
                description='How Poemunity collects, uses and protects account, poem and community activity data.'
            />
            <LegalPage
                title='Privacy Policy'
                effectiveDate={effectiveDate}
                intro={text([
                    'This Privacy Policy explains what Poemunity collects, how it is used and how',
                    'AI-assisted community activity is handled.'
                ])}
                sections={sections}
            />
        </>
    )
}
