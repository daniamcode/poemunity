/**
 * ORIGINAL EDITORIAL INTRODUCTIONS FOR THE MOST-REPRESENTED POETS.
 *
 * The author-page counterpart to `genreIntros.ts`, and it exists for the same
 * reason: 97.3% of the poems here are scraped famous ones that cannot outrank
 * their own source, so the pages that CAN rank are the ones carrying text that
 * exists nowhere else (`docs/SEO_AUDIT.md`). Author pages are also the largest
 * group of pages Google currently indexes on this site, which makes them worth
 * improving rather than merely worth having.
 *
 * SCOPE: every author with 30 or more poems here. That is 40 of 3,367 — the
 * distribution is extremely long-tailed (only six poets clear 50) and the
 * remainder average under five poems each, where an essay would outweigh the
 * collection it introduces.
 *
 * ═══ THREE POETS ARE DELIBERATELY EXCLUDED, AND THIS IS THE IMPORTANT PART ═══
 *
 * `emily-hart` (38 poems), `sadie-monroe` (35) and `thomas-walker` (30) all
 * clear the threshold and are **AI personas**, not people. They get no entry.
 *
 * Writing a biography for them would fabricate a human being — asserting in
 * prose the very thing the AI badge, the footer disclosure and the deliberate
 * absence of a `Person` entity in their structured data all exist to deny. It
 * is the same rule as `structuredData.ts`: their pages describe a collection
 * and stay silent about authorship. `authorIntros.test.ts` asserts by slug that
 * none of the three is ever added.
 *
 * Real registered users are excluded by the same logic and a simpler one: this
 * file is editorial commentary about published poets, and inventing a
 * description of a living account-holder is not something to do on their
 * behalf. None currently clears 30 poems in any case.
 *
 * `anonymous` (82 poems) IS included, and is not a biography — it is a note
 * about what that byline means, which is a genuinely useful thing to explain.
 *
 * ═══ ACCURACY ═══
 *
 * These are claims about REAL PEOPLE, several of them living, which is a higher
 * bar than the genre introductions. The rules followed here:
 *
 *   1. WRITE ABOUT THE WORK, not the life. Biography is where errors hide and
 *      where they do the most damage; the poems are the subject anyway.
 *   2. NO DATES unless they are load-bearing AND certain. A wrong birth year
 *      for a living poet is a factual error about a person, published.
 *   3. NOTHING THAT COULD EMBARRASS A LIVING POET. Several here are alive;
 *      critical judgement is fine, gossip and diagnosis are not.
 *
 * `readNext` slugs are asserted to exist by the test, exactly as `startHere` is
 * in the genre file — and they do the author-to-author internal linking the
 * audit found missing entirely.
 */

export interface ReadNextPoet {
    /** Author page slug. Asserted to exist by the test. */
    slug: string
    name: string
    /** One line on the connection. */
    note: string
}

export interface AuthorIntro {
    /** Paragraphs of original prose. Plain text — no markup. */
    body: string[]
    /** Other poets here worth reading next — the author-to-author link graph. */
    readNext: ReadNextPoet[]
}

export const AUTHOR_INTROS: Record<string, AuthorIntro> = {
    'william-shakespeare': {
        body: [
            'The poems collected here are the sonnets and the shorter verse rather than the plays, and they are a stranger body of work than their fame suggests. The sequence is addressed largely to a young man, turns later to a woman described in terms that mock every convention of praise then available, and spends much of its length arguing with time rather than courting anybody.',
            'What to notice technically: the English sonnet form he used puts its turn late, in a closing couplet, which gives these poems their characteristic shape of an argument built over twelve lines and then snapped shut in two. Sometimes the couplet genuinely resolves what came before. Often it does not, and the mismatch is the point — sonnet 18 promises immortality in its last two lines, and the claim has held.'
        ],
        readNext: [
            { slug: 'john-donne', name: 'John Donne', note: 'The next generation, and far more argumentative.' },
            { slug: 'sir-philip-sidney', name: 'Sir Philip Sidney', note: 'The sonnet sequence Shakespeare was writing after.' },
            { slug: 'ben-jonson', name: 'Ben Jonson', note: 'His contemporary and rival, plainer and more classical.' }
        ]
    },

    anonymous: {
        body: [
            'Not a person. This page collects the poems that reached print without a name attached — traditional ballads, folk songs, hymns, riddles and verse whose authorship was lost, never recorded, or never claimed.',
            'It is worth browsing rather than skipping. The ballads in particular are among the oldest things on this site and their techniques were shaped by memory rather than by the page: heavy repetition, refrains, stock phrases and abrupt cuts between scenes are all features of poems that had to be carried in a head before they could be written down. A great deal of what later poets do deliberately, this material does because it had no choice.'
        ],
        readNext: [
            { slug: 'robert-burns', name: 'Robert Burns', note: 'Collected and reworked Scots songs from this tradition.' },
            { slug: 'samuel-taylor-coleridge', name: 'Samuel Taylor Coleridge', note: 'Wrote a literary ballad in deliberate imitation of them.' },
            { slug: 'alfred-lord-tennyson', name: 'Alfred, Lord Tennyson', note: 'Took the ballad and the old story into Victorian English.' }
        ]
    },

    'alfred-lord-tennyson': {
        body: [
            'The most technically accomplished ear of the Victorian period, and the poet most damaged by his own popularity — the anthology pieces are so familiar that the strangeness of the work is easy to miss.',
            'Read "Ulysses" suspiciously rather than approvingly. It is quoted as an anthem of striving, and it is also a portrait of an old king proposing to abandon his kingdom and his son out of restlessness. "In Memoriam", written over seventeen years after the death of a friend, is the major work: a long sequence of short lyrics in a stanza he made his own, working through grief and doubt in public at a moment when doing so was genuinely risky.'
        ],
        readNext: [
            { slug: 'robert-browning', name: 'Robert Browning', note: 'His great contemporary, and his opposite in method.' },
            { slug: 'matthew-arnold', name: 'Matthew Arnold', note: 'The same Victorian doubt, argued rather than sung.' },
            { slug: 'thomas-hardy', name: 'Thomas Hardy', note: 'What came next: the music kept, the consolation dropped.' }
        ]
    },

    'rae-armantrout': {
        body: [
            'A contemporary American poet and one of the very few living writers heavily represented here. Her poems are short, sectioned, and built out of overheard language — advertising, science reporting, small talk — set against each other so the gaps between the pieces do the work.',
            'They reward a different kind of attention than most of this collection. There is usually no argument to follow and no scene to picture; the method is juxtaposition, and the meaning appears in the join. If a poem seems to change the subject between sections, that is not a lapse — it is the poem.'
        ],
        readNext: [
            { slug: 'john-ashbery', name: 'John Ashbery', note: 'The other pole of difficulty, and much more expansive.' },
            { slug: 'kay-ryan', name: 'Kay Ryan', note: 'Also compressed, but funny and rhymed.' },
            { slug: 'marianne-moore', name: 'Marianne Moore', note: 'The ancestor: found language, precisely arranged.' }
        ]
    },

    'william-wordsworth': {
        body: [
            'The poet who made the poet\'s own mind a legitimate subject, which is why so much English poetry after him sounds like somebody thinking rather than somebody declaring.',
            'The manifesto is worth knowing: he argued for poetry written in the ordinary language of ordinary people, about ordinary lives, and against the elevated diction that preceded him. He did not always follow his own rule. But "Tintern Abbey" and "The Prelude" do something genuinely new — they describe not a landscape but the process of remembering a landscape, and the difference between the two is the whole Romantic project in miniature.'
        ],
        readNext: [
            { slug: 'samuel-taylor-coleridge', name: 'Samuel Taylor Coleridge', note: 'His collaborator on the book that started it.' },
            { slug: 'john-keats', name: 'John Keats', note: 'The next generation, and warmer.' },
            { slug: 'mary-oliver', name: 'Mary Oliver', note: 'The living inheritance of this way of looking.' }
        ]
    },

    'emily-dickinson': {
        body: [
            'Fewer than a dozen of her nearly 1,800 poems appeared in print while she was alive, and those were edited into conventional shape without her consent. Everything unusual about her — the dashes, the slant rhymes, the abrupt capitals, the refusal to close a thought — was treated as error to be corrected for decades afterwards.',
            'Read her for the sentences that stop mid-turn. Her subjects are death, faith, pain and the mind observing itself, and her characteristic move is to report an interior event with the flat curiosity of a witness rather than the distress of a sufferer — a fly in the room at the moment of dying, a funeral held inside a brain. The hymn metres she uses are deliberately ordinary, which makes what she does inside them stranger.'
        ],
        readNext: [
            { slug: 'walt-whitman', name: 'Walt Whitman', note: 'Her exact contemporary and total opposite.' },
            { slug: 'christina-rossetti', name: 'Christina Rossetti', note: 'The same decade, the same subjects, formal control.' },
            { slug: 'gerard-manley-hopkins', name: 'Gerard Manley Hopkins', note: 'Also unpublished in life, also inventing his own prosody.' }
        ]
    },

    'william-butler-yeats': {
        body: [
            'The rare poet who got substantially better after fifty. The early work is dreamy, Celtic and heavily ornamented; the late work is spare, bitter, political and among the greatest in the language. Reading him in chronological order is unlike reading anyone else here.',
            'The turn is visible in "Easter, 1916", written after the Dublin rising, with its refrain that all is changed, changed utterly, and a terrible beauty born — a poem genuinely unsure whether what happened was good, by a man who knew the people executed. The later poems on age, art and Byzantium are where he ends up.'
        ],
        readNext: [
            { slug: 'seamus-heaney', name: 'Seamus Heaney', note: 'The next Irish poet to face the same question.' },
            { slug: 't-s-eliot', name: 'T. S. Eliot', note: 'The other pole of modernism in English.' },
            { slug: 'ezra-pound', name: 'Ezra Pound', note: 'Edited him, and pushed him towards the spare late style.' }
        ]
    },

    'john-ashbery': {
        body: [
            'The most influential and most argued-about American poet of the later twentieth century, and the one most likely to make a reader feel they are doing it wrong. They are not.',
            'His poems move by association rather than argument, change register without warning, and rarely settle into a paraphrasable subject. The productive way in is to stop looking for what a poem is "about" and read for the movement of a mind in language — the tone, which is unmistakable, does more work than the content. "Self-Portrait in a Convex Mirror" is the major long poem and the most conventionally rewarding place to start.'
        ],
        readNext: [
            { slug: 'frank-ohara', name: 'Frank O\'Hara', note: 'His friend and contemporary; far more immediate.' },
            { slug: 'wallace-stevens', name: 'Wallace Stevens', note: 'The clearest ancestor of this kind of difficulty.' },
            { slug: 'rae-armantrout', name: 'Rae Armantrout', note: 'The same refusals, compressed instead of expansive.' }
        ]
    },

    'yusef-komunyakaa': {
        body: [
            'A contemporary American poet best known for work drawn from his service in Vietnam, though the range here is much wider — jazz, the Louisiana of his childhood, and the classical material of his later books.',
            'The war poems are the ones to start with and their method is the lesson: they were written well over a decade after the events, and memory arrives through surfaces and reflections rather than narrative. "Facing It" places the whole subject in the polished granite of a memorial wall, where the speaker\'s face and the names occupy the same plane. The jazz influence is structural rather than decorative — improvisation used as a principle of construction.'
        ],
        readNext: [
            { slug: 'brian-turner', name: 'Brian Turner', note: 'Iraq, by someone who had read these first.' },
            { slug: 'wilfred-owen', name: 'Wilfred Owen', note: 'Where the refusal of consolation begins.' },
            { slug: 'robert-hayden', name: 'Robert Hayden', note: 'History assembled from documents and voices.' }
        ]
    },

    'percy-bysshe-shelley': {
        body: [
            'The most politically radical of the major Romantics and the one whose reputation has swung furthest. Victorian editors preferred the ethereal lyric poet; the political writing was suppressed, unpublished for years, or quietly left out.',
            '"The Masque of Anarchy", written in fury after the Peterloo massacre, was not printed until long after his death, and its closing stanza has been borrowed by protest movements ever since. Read it next to "Ode to the West Wind" and "To a Skylark" — the same voice, wanting to be an instrument something larger blows through, applied in one case to weather and in the other to a state.'
        ],
        readNext: [
            { slug: 'william-blake', name: 'William Blake', note: 'The same radicalism, stranger and more private.' },
            { slug: 'john-keats', name: 'John Keats', note: 'His contemporary; sensuous where Shelley is abstract.' },
            { slug: 'william-wordsworth', name: 'William Wordsworth', note: 'The elder Romantic he admired and then attacked.' }
        ]
    },

    'john-donne': {
        body: [
            'The founder of what got called the metaphysical style, and the most argumentative love poet in English. His characteristic poem takes an outrageous proposition and proves it — that two lovers contain the whole world, that a flea has already married them, that death should not be proud.',
            'The device to know is the conceit: an extended comparison between things that have no business being compared, sustained past the point of decoration until it becomes an actual argument. The twin compasses at the end of "A Valediction: Forbidding Mourning" are the famous case. His later religious poems use exactly the same equipment on God, and are more violent than the love poems.'
        ],
        readNext: [
            { slug: 'george-herbert', name: 'George Herbert', note: 'The devotional side of the same tradition, quieter.' },
            { slug: 'andrew-marvell', name: 'Andrew Marvell', note: 'The next generation of the conceit, and wittier.' },
            { slug: 'ben-jonson', name: 'Ben Jonson', note: 'His contemporary and the classical alternative.' }
        ]
    },

    'walt-whitman': {
        body: [
            'He self-published the first edition of "Leaves of Grass", set some of the type himself, printed it without his name on the title page, and then revised and expanded the book for the rest of his life. It is less a collection than a single project he kept rebuilding.',
            'What he invented was a long, unrhymed, unmetered line built on the rhythms of speech and the King James Bible, and a first person large enough to claim it contained multitudes and contradicted itself. Almost all American free verse descends from this. Read the Civil War poems too — he nursed the wounded in Washington hospitals, and the poems from that period are the least rhetorical thing he wrote.'
        ],
        readNext: [
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'His exact contemporary and total opposite.' },
            { slug: 'allen-ginsberg', name: 'Allen Ginsberg', note: 'The most direct inheritor of the long line.' },
            { slug: 'langston-hughes', name: 'Langston Hughes', note: 'Took the American catalogue and asked who it left out.' }
        ]
    },

    'kay-ryan': {
        body: [
            'A contemporary American poet whose poems are very short, very narrow on the page, and much funnier than their reputation for compression suggests.',
            'The technical signature is internal rhyme — rhymes buried mid-line rather than placed at the ends, so the poem chimes without announcing that it is rhyming. Combined with the thin column shape, this makes her poems read fast and then stop you. They usually work by taking a cliché or a piece of received wisdom literally until it comes apart.'
        ],
        readNext: [
            { slug: 'marianne-moore', name: 'Marianne Moore', note: 'The obvious ancestor: precise, dry, syllabic.' },
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'Compression and slant rhyme, a century earlier.' },
            { slug: 'rae-armantrout', name: 'Rae Armantrout', note: 'Also short and sectioned, but far less consoling.' }
        ]
    },

    'sir-philip-sidney': {
        body: [
            'An Elizabethan courtier who wrote the first major sonnet sequence in English, "Astrophil and Stella", and largely established what an English sonnet sequence was for.',
            'The opening sonnet is the one to read first: it describes the poet struggling to write, ransacking other people\'s books for phrases, and ending with the instruction to look in his heart and write. That gesture — the poem about failing to write the poem — is now so common it is a cliché, and this is close to where it starts. He also wrote the "Defence of Poesy", the first significant work of literary criticism in English.'
        ],
        readNext: [
            { slug: 'william-shakespeare', name: 'William Shakespeare', note: 'The sequence that answered this one.' },
            { slug: 'edmund-spenser', name: 'Edmund Spenser', note: 'His contemporary, and the other great Elizabethan.' },
            { slug: 'john-donne', name: 'John Donne', note: 'The reaction against all this courtly smoothness.' }
        ]
    },

    'algernon-charles-swinburne': {
        body: [
            'The most sonically extravagant poet in Victorian English and the most divisive — his contemporaries were scandalised by the subject matter and mesmerised by the sound, frequently at the same time.',
            'Read him aloud or you will miss the point entirely. The poems run on relentless metre, heavy alliteration and long rolling lines that carry you past the sense; several critics have complained, not unfairly, that the music sometimes runs ahead of the meaning. He is also a serious classicist, and the Greek material is where the technique is doing the most work.'
        ],
        readNext: [
            { slug: 'gerard-manley-hopkins', name: 'Gerard Manley Hopkins', note: 'The other great Victorian sound-inventor, far denser.' },
            { slug: 'charles-baudelaire', name: 'Charles Baudelaire', note: 'The French scandal Swinburne admired and imported.' },
            { slug: 'alfred-lord-tennyson', name: 'Alfred, Lord Tennyson', note: 'The respectable Victorian ear, for contrast.' }
        ]
    },

    'robert-browning': {
        body: [
            'The inventor, more than anyone, of the dramatic monologue — a poem spoken entirely by a character who is not the poet, and who usually reveals more than they intend.',
            '"My Last Duchess" is the model and the best place to start: a duke shows a visitor a portrait of his previous wife, and in the course of being charming he discloses that he had her killed. Nothing in the poem tells you this; you assemble it from what he says and what he assumes you will not notice. That technique — meaning arriving past the speaker rather than through them — is his major contribution, and it is everywhere in modern poetry and fiction.'
        ],
        readNext: [
            { slug: 'elizabeth-barrett-browning', name: 'Elizabeth Barrett Browning', note: 'His wife, and more famous than him in their lifetime.' },
            { slug: 'alfred-lord-tennyson', name: 'Alfred, Lord Tennyson', note: 'His great rival, and the opposite method.' },
            { slug: 't-s-eliot', name: 'T. S. Eliot', note: 'Prufrock is a dramatic monologue, and knows it.' }
        ]
    },

    'henry-wadsworth-longfellow': {
        body: [
            'The most popular poet in nineteenth-century America by a wide margin, memorised by schoolchildren for generations, and then critically demoted so thoroughly that the demotion is now itself worth questioning.',
            'What he actually did well: narrative at length, in metres that carry a reader forward, on American material at a moment when American poetry was still assumed to be a provincial branch of English. What dates: the moralising, and the habit of ending on an instruction. His most-quoted lines — about rain falling into every life — are better in context than they are as a fridge magnet.'
        ],
        readNext: [
            { slug: 'walt-whitman', name: 'Walt Whitman', note: 'The American alternative that won the argument.' },
            { slug: 'edgar-allan-poe', name: 'Edgar Allan Poe', note: 'His contemporary, and a hostile critic of him.' },
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'Read him; wrote nothing like him.' }
        ]
    },

    'samuel-menashe': {
        body: [
            'An American poet who wrote extremely short poems for decades in near-total obscurity, and received serious recognition only very late in his life.',
            'The poems are often under ten lines and repay slow reading in a way that length usually gets credit for. They are dense with rhyme and half-rhyme, frequently biblical in vocabulary, and built so that removing one word would collapse them. If you read fast you will read past them; this is a body of work that assumes you will stop.'
        ],
        readNext: [
            { slug: 'kay-ryan', name: 'Kay Ryan', note: 'The same compression, drier and funnier.' },
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'The great precedent for the very short poem.' },
            { slug: 'george-herbert', name: 'George Herbert', note: 'Devotional brevity, four centuries earlier.' }
        ]
    },

    'thomas-hardy': {
        body: [
            'He gave up novels after the hostile reception of "Jude the Obscure" and wrote poetry for the rest of his life — which means the work he is now most valued for as a poet came after sixty.',
            'The subject that produced his best poems is uncomfortable: after his first wife died, following years in which they had largely stopped speaking, he wrote a sequence about her that is full of a guilt no reconciliation was available for. He is technically restless, inventing stanza forms constantly, and deliberately awkward in diction — the roughness is a choice, and it is what keeps the sentiment honest.'
        ],
        readNext: [
            { slug: 'edward-thomas', name: 'Edward Thomas', note: 'The English melancholy, one generation on.' },
            { slug: 'philip-larkin', name: 'Philip Larkin', note: 'Named Hardy as the poet who mattered most to him.' },
            { slug: 'a-e-housman', name: 'A. E. Housman', note: 'The same losses, in tighter and colder forms.' }
        ]
    },

    'william-blake': {
        body: [
            'A poet, engraver and printer who produced his books himself — text and images etched together on the same plate and coloured by hand — so the poems were not originally read as text on a page at all.',
            '"Songs of Innocence and of Experience" is the way in, and the design is the argument: paired poems that answer each other, so the lamb has a tiger and the innocent version of a scene has an experienced one. Read the pairs together. His longer prophetic books are a private mythology of his own invention and are genuinely difficult; nobody should feel obliged to start there.'
        ],
        readNext: [
            { slug: 'percy-bysshe-shelley', name: 'Percy Bysshe Shelley', note: 'The same radicalism, made public and political.' },
            { slug: 'william-wordsworth', name: 'William Wordsworth', note: 'His contemporary, and far more respectable.' },
            { slug: 'allen-ginsberg', name: 'Allen Ginsberg', note: 'Claimed Blake directly as an ancestor.' }
        ]
    },

    'dean-young': {
        body: [
            'A contemporary American poet associated with a fast, associative, deliberately funny mode that owes a good deal to Surrealism and to the New York School.',
            'The poems move quickly and change direction without apology, and the comedy is doing serious work rather than lightening it — several of his best pieces are about illness and mortality while remaining genuinely funny on the line. If a poem seems to be going somewhere and then goes somewhere else instead, that is the method rather than a fault in the reading.'
        ],
        readNext: [
            { slug: 'frank-ohara', name: 'Frank O\'Hara', note: 'The New York School voice this descends from.' },
            { slug: 'john-ashbery', name: 'John Ashbery', note: 'The same associative movement, more oblique.' },
            { slug: 'billy-collins', name: 'Billy Collins', note: 'Also funny, and much more orderly about it.' }
        ]
    },

    'robert-herrick': {
        body: [
            'A seventeenth-century clergyman who wrote over a thousand short poems about flowers, festivals, country customs, women\'s clothing and the shortness of everything.',
            'He wrote the most-quoted opening line in English carpe diem verse — gather ye rosebuds while ye may — and the poem it opens is doing something slightly more complicated than the line suggests. The pleasures of reading him are small-scale and cumulative: an ear for the short line, a genuine interest in ordinary rural life, and a habit of noticing textures that most of his contemporaries thought beneath poetry.'
        ],
        readNext: [
            { slug: 'ben-jonson', name: 'Ben Jonson', note: 'His acknowledged master.' },
            { slug: 'andrew-marvell', name: 'Andrew Marvell', note: 'The same argument, made far more strangely.' },
            { slug: 'christopher-marlowe', name: 'Christopher Marlowe', note: 'The pastoral invitation, at its source.' }
        ]
    },

    'w-s-merwin': {
        body: [
            'He abandoned punctuation entirely in the 1960s and never went back, which is the first thing anyone notices and the least interesting thing about him.',
            'The absence of commas and full stops makes the poems read as a single unbroken movement of speech, with the line breaks doing all the work of pacing — it is a formal decision, not a stylistic tic. His enduring subject is loss, and specifically ecological loss: he was writing elegies for species, forests and vanishing languages decades before that was a recognised thing for a poet to do, and he spent his later life restoring rainforest on Maui.'
        ],
        readNext: [
            { slug: 'wendell-berry', name: 'Wendell Berry', note: 'The same commitment, argued from a farm.' },
            { slug: 'mary-oliver', name: 'Mary Oliver', note: 'Attention to the non-human, far more consoling.' },
            { slug: 'rainer-maria-rilke', name: 'Rainer Maria Rilke', note: 'Merwin translated widely; this is the register.' }
        ]
    },

    'carl-sandburg': {
        body: [
            'The poet of industrial America, and the one who insisted that stockyards, freight handlers and wage work were legitimate subjects for poetry at a time when that was contested.',
            '"Chicago" is the model and its method is refusal: he lists the accusations against the city — that it is wicked, crooked, brutal — agrees with all of them, and then admires it anyway. He works in Whitman\'s long line and plain American speech, and his weakness is the same as Whitman\'s: at length the catalogue can turn into a list. The short poems, "Fog" especially, show the other gear.'
        ],
        readNext: [
            { slug: 'walt-whitman', name: 'Walt Whitman', note: 'The line and the catalogue come from here.' },
            { slug: 'philip-levine', name: 'Philip Levine', note: 'The same work, two generations later and closer up.' },
            { slug: 'edgar-lee-masters', name: 'Edgar Lee Masters', note: 'His contemporary; the Midwest from inside a graveyard.' }
        ]
    },

    'edgar-lee-masters': {
        body: [
            'Best known for "Spoon River Anthology", a book of short free-verse epitaphs spoken by the dead of a fictional Midwestern town — each poem a person, and the whole assembling into a portrait of a community.',
            'The pleasure and the point are in the contradictions between them. One resident\'s account of an event is flatly denied by the next; a respected citizen is exposed by somebody buried two pages later. No narrator adjudicates. It was a scandal on publication for exactly that reason, and it remains one of the most readable long American books of the period.'
        ],
        readNext: [
            { slug: 'carl-sandburg', name: 'Carl Sandburg', note: 'The same Midwest, from street level.' },
            { slug: 'robert-browning', name: 'Robert Browning', note: 'The dramatic monologue this technique descends from.' },
            { slug: 'edwin-arlington-robinson', name: 'Edwin Arlington Robinson', note: 'Small-town portraits, formally traditional.' }
        ]
    },

    'kahlil-gibran': {
        body: [
            'A Lebanese-American writer whose book "The Prophet" has never been out of print since publication and has been translated into more than a hundred languages — one of the best-selling books of poetry ever written, and one largely ignored by academic criticism.',
            'The form is aphoristic: short prose-poem addresses on marriage, children, work, joy and sorrow, delivered by a departing sage. Read for what it is rather than what it is not — it is wisdom literature in the older sense, closer to scripture or proverb than to the lyric tradition around it here, and its enormous readership is a fact about it worth taking seriously.'
        ],
        readNext: [
            { slug: 'jalal-al-din-rumi', name: 'Rumi', note: 'The tradition Gibran is closest to.' },
            { slug: 'rabindranath-tagore', name: 'Rabindranath Tagore', note: 'The same moment of Eastern writing in English.' },
            { slug: 'walt-whitman', name: 'Walt Whitman', note: 'The expansive, unmetered, prophetic voice.' }
        ]
    },

    'jane-hirshfield': {
        body: [
            'A contemporary American poet whose work is shaped by long practice in Zen Buddhism and by extensive translation from classical Japanese — both are visible in the poems without either being announced.',
            'The characteristic gesture is a small, exactly observed physical fact that opens, without commentary, onto something much larger. She resists the closing flourish that most lyric poems reach for, and the restraint is the technique. Her poems on science and on climate are among the few in that mode that avoid both lecture and despair.'
        ],
        readNext: [
            { slug: 'mary-oliver', name: 'Mary Oliver', note: 'The same attention, warmer and more instructive.' },
            { slug: 'w-s-merwin', name: 'W. S. Merwin', note: 'Also a translator, also formally quiet.' },
            { slug: 'jack-gilbert', name: 'Jack Gilbert', note: 'Plain American speech doing serious work.' }
        ]
    },

    'w-s-di-piero': {
        body: [
            'A contemporary American poet and essayist whose poems are grounded in cities, working-class immigrant life, and the visual arts — he writes about painting as somebody who has looked at a great deal of it.',
            'The voice is conversational but not casual, and the poems tend to move through a real street or a real picture rather than through an idea. Read him for the texture of place; the Philadelphia and San Francisco material is where the work is most itself.'
        ],
        readNext: [
            { slug: 'philip-levine', name: 'Philip Levine', note: 'Working life as a poetic subject, insisted upon.' },
            { slug: 'frank-ohara', name: 'Frank O\'Hara', note: 'The city walked through, and the art looked at.' },
            { slug: 'william-carlos-williams', name: 'William Carlos Williams', note: 'The American place, plainly rendered.' }
        ]
    },

    'ben-jonson': {
        body: [
            'Shakespeare\'s contemporary, rival, and first serious editor — the tribute he wrote for the First Folio is where the phrase about Shakespeare not being of an age but for all time comes from.',
            'His own poems are the classical alternative to everything Donne was doing at the same moment: balanced, plain, learned, built on Latin models, and suspicious of extravagance. "On My First Son", written after the death of his seven-year-old, is the most affecting thing here precisely because the restraint is total — he calls the boy his best piece of poetry and stops.'
        ],
        readNext: [
            { slug: 'william-shakespeare', name: 'William Shakespeare', note: 'The rival he both mocked and canonised.' },
            { slug: 'john-donne', name: 'John Donne', note: 'The opposite instinct, in the same decade.' },
            { slug: 'robert-herrick', name: 'Robert Herrick', note: 'His self-declared disciple.' }
        ]
    },

    'john-milton': {
        body: [
            'He wrote his major work after going completely blind, dictating it to whoever was available, and the result is the most ambitious poem in English.',
            '"Paradise Lost" is in unrhymed iambic pentameter — a deliberate refusal, argued in a preface, of rhyme as a modern bondage — with sentences that run for a dozen lines and hold their grammar the whole way. The famous problem is that Satan gets the best lines and the strongest characterisation, which readers have been arguing about since Blake said Milton was of the Devil\'s party without knowing it. The shorter poems, including the sonnet on his blindness, are a gentler introduction.'
        ],
        readNext: [
            { slug: 'william-blake', name: 'William Blake', note: 'Read Milton as a rebel, and said so.' },
            { slug: 'edmund-spenser', name: 'Edmund Spenser', note: 'The English epic tradition Milton inherited.' },
            { slug: 'percy-bysshe-shelley', name: 'Percy Bysshe Shelley', note: 'Took Milton\'s Satan as a political model.' }
        ]
    },

    'edmund-spenser': {
        body: [
            'The most ambitious English poet before Milton, and the one who invented a stanza still named after him — eight lines of iambic pentameter closed by a longer ninth, which slows the whole thing down deliberately.',
            '"The Faerie Queene" is enormous, allegorical, deliberately archaic in its language even when it was written, and not a book to start at page one out of duty. The shorter work is the better entry: the "Amoretti" sonnets and "Epithalamion", a wedding poem for his own marriage whose stanza count is built around the hours of a midsummer day.'
        ],
        readNext: [
            { slug: 'sir-philip-sidney', name: 'Sir Philip Sidney', note: 'His contemporary and the other Elizabethan pole.' },
            { slug: 'john-milton', name: 'John Milton', note: 'Called Spenser a better teacher than the theologians.' },
            { slug: 'john-keats', name: 'John Keats', note: 'Learned his craft by imitating Spenser directly.' }
        ]
    },

    'billy-collins': {
        body: [
            'Probably the most widely read living American poet, and the one most often used to argue about whether accessibility is a virtue. The poems are conversational, funny, and structured so that a reader is never lost.',
            'The method is consistent and worth watching: begin in a completely ordinary situation — a room, a piece of music, a task — proceed calmly, and then swerve somewhere much stranger or sadder in the last few lines without raising his voice. "Introduction to Poetry", about students tying a poem to a chair to beat a confession out of it, is the one most likely to be handed to you in a classroom.'
        ],
        readNext: [
            { slug: 'dorothy-parker', name: 'Dorothy Parker', note: 'The other tradition of the late-landing joke.' },
            { slug: 'ted-kooser', name: 'Ted Kooser', note: 'The same plainness, without the punchline.' },
            { slug: 'dean-young', name: 'Dean Young', note: 'Funny too, and far less orderly.' }
        ]
    },

    'samuel-taylor-coleridge': {
        body: [
            'Half of the partnership that started English Romanticism, and the one who did the theorising — his distinction between imagination and mere fancy is the philosophical backbone of the whole movement.',
            'Three poems carry his reputation: "The Rime of the Ancient Mariner", a deliberate literary imitation of the old ballads; "Kubla Khan", published with a preface claiming it was composed in an opium sleep and interrupted by a visitor from Porlock, a story that does literary work whether or not it is true; and "Frost at Midnight", the quietest and possibly the best, a father talking to a sleeping baby by a dying fire.'
        ],
        readNext: [
            { slug: 'william-wordsworth', name: 'William Wordsworth', note: 'His collaborator and the other half of the project.' },
            { slug: 'john-keats', name: 'John Keats', note: 'The next generation, and the better ear.' },
            { slug: 'william-blake', name: 'William Blake', note: 'Imagination as an absolute claim, not a theory.' }
        ]
    },

    'john-keats': {
        body: [
            'He wrote almost everything he is known for in a single extraordinary year, and died at twenty-five having been savaged by reviewers who thought him socially beneath the art.',
            'The odes are the achievement, and the useful thing to know about them is that they are arguments rather than raptures — "Ode on a Grecian Urn" ends on a proposition about beauty and truth that the poem may or may not endorse and has been fought over for two centuries. His concept of negative capability, the capacity to remain in uncertainty without irritably reaching after fact, is as good a description of what poems do as anyone has managed.'
        ],
        readNext: [
            { slug: 'percy-bysshe-shelley', name: 'Percy Bysshe Shelley', note: 'His contemporary; wrote the elegy for him.' },
            { slug: 'gerard-manley-hopkins', name: 'Gerard Manley Hopkins', note: 'The next great inventor of English sound.' },
            { slug: 'wallace-stevens', name: 'Wallace Stevens', note: 'The ode as philosophical argument, continued.' }
        ]
    },

    'gwendolyn-brooks': {
        body: [
            'The first Black author to win the Pulitzer Prize for poetry, and a poet whose career contains one of the most instructive turns in American literature.',
            'Her early work is formally immaculate — sonnets, ballads, technically exacting — and it is superb. After 1967 she deliberately broke with that mode, publishing with Black-owned presses and writing in a rawer, more direct register aimed at a different readership. Reading the early and late work together is the single most useful hour available on this site. "We Real Cool" sits between them: eight lines, seven pool players, and everything carried by where the word "we" falls.'
        ],
        readNext: [
            { slug: 'langston-hughes', name: 'Langston Hughes', note: 'Encouraged her early; the tradition she came from.' },
            { slug: 'lucille-clifton', name: 'Lucille Clifton', note: 'The next generation of the same compression.' },
            { slug: 'sonia-sanchez', name: 'Sonia Sanchez', note: 'The movement Brooks turned towards after 1967.' }
        ]
    },

    'frank-stanford': {
        body: [
            'An American poet who died at twenty-nine, wrote prolifically, and remains a cult figure whose influence on later poets far exceeds his general readership.',
            'The work is surreal, violent, drenched in the rural South and the Mississippi delta, and full of images that do not resolve into sense so much as accumulate. His enormous book-length poem is famously unpunctuated and near-endless. Start with the shorter poems; the voice arrives immediately, and either it takes or it does not.'
        ],
        readNext: [
            { slug: 'james-wright', name: 'James Wright', note: 'American rural surrealism, more controlled.' },
            { slug: 'yusef-komunyakaa', name: 'Yusef Komunyakaa', note: 'The Southern landscape, differently haunted.' },
            { slug: 'charles-bukowski', name: 'Charles Bukowski', note: 'The other outsider mode, flatter and drier.' }
        ]
    },

    'george-herbert': {
        body: [
            'A country parson whose entire book of poems was published only after his death, on his instruction that it should be printed if it might help any dejected soul and burned otherwise.',
            'They are devotional poems that mostly consist of losing arguments with God. "The Collar" is a tantrum of forty lines that ends with a single word spoken from outside it; "Prayer" is a sonnet containing no verb at all, defining its subject through a cascade of images before settling on the phrase "something understood". He also wrote shaped poems — an altar, a pair of wings — where the form on the page is part of the meaning.'
        ],
        readNext: [
            { slug: 'john-donne', name: 'John Donne', note: 'A friend of the family, and the louder version.' },
            { slug: 'gerard-manley-hopkins', name: 'Gerard Manley Hopkins', note: 'The same argument, two centuries on and fiercer.' },
            { slug: 'christina-rossetti', name: 'Christina Rossetti', note: 'Devotional plainness, and equally controlled.' }
        ]
    },

    'christina-rossetti': {
        body: [
            'A Victorian poet of unusual technical range, capable of a poem sung in churches every December and, in the same career, one of the strangest narrative poems of the century.',
            '"Goblin Market" is that poem: two sisters, forbidden fruit sold by goblin men, and a rescue that has been read as religious allegory, sexual parable and a plain story about sisterhood, without any reading exhausting it. Her shorter lyrics are the other half of her — formally exact, unsentimental about death, and in "Remember" generous enough to withdraw their own request halfway through.'
        ],
        readNext: [
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'The same decade and subjects, across an ocean.' },
            { slug: 'elizabeth-barrett-browning', name: 'Elizabeth Barrett Browning', note: 'The other major Victorian woman poet.' },
            { slug: 'george-herbert', name: 'George Herbert', note: 'The devotional tradition she is working in.' }
        ]
    },

    'alice-notley': {
        body: [
            'A contemporary American poet with one of the longest and least compromising careers in the second-generation New York School and well beyond it.',
            'Her work is formally restless — book-length narrative poems, invented punctuation, quotation marks used as a rhythmic device rather than to report speech — and unusually willing to be difficult. "The Descent of Alette", an epic set on a subway, is the most-discussed. She writes about grief, war and being a woman writing at length in a tradition that mostly did not make room for that.'
        ],
        readNext: [
            { slug: 'john-ashbery', name: 'John Ashbery', note: 'The New York School she came out of.' },
            { slug: 'rae-armantrout', name: 'Rae Armantrout', note: 'The other end of contemporary difficulty.' },
            { slug: 'anne-carson', name: 'Anne Carson', note: 'The long poem rebuilt from classical material.' }
        ]
    },

    'david-ferry': {
        body: [
            'A poet and translator whose own work and whose translations are hard to separate — he translated Virgil, Horace and Gilgamesh, and his versions read as poems rather than as cribs.',
            'The original poems are quiet, formally traditional and preoccupied with distance: from the dead, from other people, from the past being translated. He was still publishing major work in his nineties, and the late books are the ones to start with — the plainness there is earned rather than chosen.'
        ],
        readNext: [
            { slug: 'w-s-merwin', name: 'W. S. Merwin', note: 'Also a major translator, also elegiac.' },
            { slug: 'anne-carson', name: 'Anne Carson', note: 'Translation and original work in the same breath.' },
            { slug: 'stanley-kunitz', name: 'Stanley Kunitz', note: 'The other great late career on this site.' }
        ]
    }
}

/**
 * The introduction for an author slug, or null when none is written.
 *
 * `Object.hasOwn`, not a bare lookup — the slug comes straight from the URL,
 * and a plain object resolves inherited properties, so `/authors/constructor`
 * would otherwise render an "introduction" built from `Object.prototype` and
 * then crash mapping over `intro.body`. Same guard as `genreIntro()`.
 */
export function authorIntro(slug: string): AuthorIntro | null {
    return Object.hasOwn(AUTHOR_INTROS, slug) ? AUTHOR_INTROS[slug] : null
}
