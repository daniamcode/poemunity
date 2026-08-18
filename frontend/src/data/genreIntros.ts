/**
 * ORIGINAL EDITORIAL INTRODUCTIONS FOR THE LARGEST GENRES.
 *
 * WHY THIS FILE EXISTS. 97.3% of the poems here are scraped famous ones that
 * exist verbatim on poetryfoundation.org and poets.org — the originals, on far
 * older domains. Those poem pages cannot win a search result against their own
 * source, and `docs/SEO_AUDIT.md` records the measurement.
 *
 * The genre pages are the exception. "love poems", "poems about grief",
 * "funny poems" are list-intent queries where a well-organised, well-introduced
 * collection is genuinely the best answer, and where the competition is other
 * curated lists rather than the primary publisher. That is the one surface here
 * that can rank on its own merits — but only if it carries something no other
 * site has, which is what the prose below is for.
 *
 * THE RULES THIS CONTENT LIVES BY, and they are the whole point:
 *
 *   1. EVERY CLAIM MUST BE TRUE. These are checkable statements about real
 *      poets and real poems. A confident sentence about a poem that does not
 *      say what we claim is worse than no introduction — it is the exact
 *      "content written for search engines" signal we are trying to escape.
 *
 *   2. IT MUST SAY SOMETHING A LIST CANNOT. If a paragraph could be swapped
 *      between two genres without anyone noticing, delete it. Generic framing
 *      ("Love is one of the most powerful human emotions…") is filler, and
 *      filler at scale is the problem, not the fix.
 *
 *   3. IT MUST BE HONEST ABOUT THIN GENRES. Friendship holds 74 poems and
 *      Heartbreak 61. Saying so, and pointing the reader somewhere better, is
 *      worth more than pretending otherwise.
 *
 * `startHere` slugs are AUTHOR pages, not poem pages, and every one is asserted
 * to exist by `genreIntros.test.ts`. Author pages are stable; poem slugs move
 * when a title is cleaned up, and a curated list full of 404s is worse than no
 * curated list. This also does the internal-linking job the audit asked for:
 * before this, a genre page linked to exactly ten poems and nothing else.
 *
 * SCOPE. Twenty genres, chosen by inventory WEIGHTED BY SEARCH INTENT rather
 * than inventory alone. `arts-and-sciences` (1,269 poems) and
 * `social-commentaries` (517) are Poetry Foundation taxonomy buckets that
 * nobody types into a search box, so they are deliberately absent; `friendship`
 * (74) and `heartbreak` (61) are here despite thin shelves because the queries
 * are real. A genre with no entry renders no introduction at all — that is a
 * supported state, not a gap to fill in a hurry.
 */

export interface StartHerePoet {
    /** Author page slug. Asserted to exist by the test. */
    slug: string
    name: string
    /** One line on why this poet, for this genre. Not a biography. */
    note: string
}

export interface GenreIntro {
    /** Paragraphs of original prose. Plain text — no markup. */
    body: string[]
    /** A curated entry point, so the page is not just "newest first". */
    startHere: StartHerePoet[]
    /**
     * Overrides the default `About <label> poetry` heading.
     *
     * Needed because that template only reads well for genres that name a
     * theme. "About love poetry" is idiomatic; "About mother poetry" is not.
     */
    heading?: string
}

export const GENRE_INTROS: Record<string, GenreIntro> = {
    love: {
        body: [
            'Love poetry is the oldest thing in this collection and the broadest. The poems that last are rarely about love directly — they are about time, absence, the body, or the fear of being fully known, and love is the pressure underneath. John Donne argued with his lovers the way a barrister argues a case, bending astronomy and theology into the service of getting someone to stay. Pablo Neruda built his out of ordinary objects: bread, salt, a pair of socks.',
            'If you are writing one, the trap is the abstract noun. The word "love" does almost no work in a poem; the particular does all of it. Notice how often the poems worth rereading reach instead for a specific hour, a specific room, a piece of fruit, the sound of someone else in the kitchen. The feeling arrives through the detail, never instead of it.',
            'Love is also not one subject but several, and this collection splits them. Heartbreak holds the poems written at the end, Marriage the long middle, Lust and Desire the body, and Lost Love the ones written years afterwards, when the person has become a fact rather than a wound.'
        ],
        startHere: [
            { slug: 'john-donne', name: 'John Donne', note: 'Love as argument — the metaphysical conceit at full stretch.' },
            { slug: 'pablo-neruda', name: 'Pablo Neruda', note: 'The sensual and the domestic, treated as the same thing.' },
            { slug: 'edna-st-vincent-millay', name: 'Edna St. Vincent Millay', note: 'The sonnet used unsentimentally, often against the beloved.' },
            { slug: 'e-e-cummings', name: 'E. E. Cummings', note: 'Syntax broken open until the sentence itself feels like feeling.' }
        ]
    },

    nature: {
        body: [
            'The largest collection on Poemunity, and the one most often misunderstood. Nature poetry is not description. A poem that merely catalogues a landscape is a postcard; the tradition is really about attention — what changes in a person who looks at something non-human long enough to stop narrating themselves.',
            'Wordsworth invented the modern version of this, making the poet\'s own mind part of the subject. Gerard Manley Hopkins made it strange again, inventing sprung rhythm and words like "dappled-dawn-drawn" because ordinary English was not textured enough for what he was seeing. Mary Oliver turned it into something close to a moral practice, and her instruction — pay attention, be astonished, tell about it — is as good a description of the genre as anyone has managed.',
            'Contemporary nature poetry is increasingly inseparable from loss. W. S. Merwin was writing elegies for species and forests decades before that became common, and the poems filed here under Environment and Climate Change are the direct descendants of the pastoral, with the consolation removed.'
        ],
        startHere: [
            { slug: 'william-wordsworth', name: 'William Wordsworth', note: 'The origin of the modern nature poem, and its self-consciousness.' },
            { slug: 'gerard-manley-hopkins', name: 'Gerard Manley Hopkins', note: 'Invented vocabulary and sprung rhythm; nothing else sounds like it.' },
            { slug: 'mary-oliver', name: 'Mary Oliver', note: 'Plain language, close looking, no ornament — the best way in.' },
            { slug: 'w-s-merwin', name: 'W. S. Merwin', note: 'Unpunctuated, elegiac, ecological before that was a category.' }
        ]
    },

    death: {
        body: [
            'Poems about death divide, roughly, into two jobs: arguing with it and describing it. The arguing tradition is the older one — Donne telling Death it has no cause for pride, the metaphysical poets treating mortality as a proposition to be beaten. It is rhetorical, formal, and often surprisingly consoling, because a poem that argues is a poem that still believes argument works.',
            'The describing tradition is stranger and mostly newer. Emily Dickinson wrote about dying from inside the event, in poems that report on the moment with the flat curiosity of a witness — a fly in the room, a carriage ride taken calmly. She is the reason so much modern death poetry is quiet rather than grand.',
            'If you are looking for poems to read aloud at a funeral, most of what you want is filed under Grief, which collects the poems written by the people left behind. This category is closer to the subject itself: what it is, whether it can be addressed, and what a poem is even for in its presence.'
        ],
        startHere: [
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'Dying reported from the inside, calmly and very strangely.' },
            { slug: 'john-donne', name: 'John Donne', note: 'Death addressed directly and told it has been overrated.' },
            { slug: 'christina-rossetti', name: 'Christina Rossetti', note: 'Quiet, formally exact, unsparing about being forgotten.' },
            { slug: 'mark-doty', name: 'Mark Doty', note: 'Contemporary elegy shaped by the AIDS epidemic.' }
        ]
    },

    grief: {
        body: [
            'Grief is a different subject from Death, and keeping them apart is deliberate. Death poems are about the fact; grief poems are about the survivor — the condition of continuing to live afterwards, which is a much stranger thing to put into language. The distinction matters practically too: readers looking for something to say at a funeral almost always want this shelf.',
            'The English elegy has a shape it inherited from pastoral: lament, then a turn, then consolation. Much of the best modern grief poetry refuses the third movement. Donald Hall\'s late books, written after the death of his wife Jane Kenyon — whose own poems are also here — are the clearest example of what happens when a poet declines to be consoled and writes the aftermath plainly instead. Reading the two of them together is unlike reading either alone.',
            'The other thing worth noticing is how physical these poems are. Grief in poetry rarely announces itself as emotion. It shows up as objects that have outlived their owner, a routine performed with nobody to perform it for, the wrong number of cups.'
        ],
        startHere: [
            { slug: 'donald-hall', name: 'Donald Hall', note: 'Elegies for Jane Kenyon; consolation withheld on purpose.' },
            { slug: 'jane-kenyon', name: 'Jane Kenyon', note: 'Read alongside Hall — the same house, the other voice.' },
            { slug: 'marie-howe', name: 'Marie Howe', note: 'Grief in ordinary domestic detail, almost conversational.' },
            { slug: 'seamus-heaney', name: 'Seamus Heaney', note: 'The Clearances sonnets: a mother remembered through small tasks.' }
        ]
    },

    war: {
        body: [
            'No genre here changed more decisively, or for a more identifiable reason. Before 1914 English war poetry was largely heroic and public. The soldier-poets of the First World War ended that permanently: Wilfred Owen and Siegfried Sassoon, both writing from the trenches, put the physical facts on the page and made the older register sound like a lie. Owen\'s stated subject was the pity of war, and his flat refusal of consolation is the position most war poetry has written from ever since.',
            'What followed extended it. Randall Jarrell compressed the Second World War into five lines about a gunner. Yusef Komunyakaa wrote Vietnam decades later, in poems where memory arrives through reflection and surface rather than narrative. Brian Turner wrote Iraq as an infantryman who had also read the others, which shows.',
            'The category holds more than combat. Poems about occupation, exile, the home front and the long afterwards are here too — much of the best of it written by civilians and by people who did not choose to be near it. Ilya Kaminsky and Solmaz Sharif are worth finding for that reason.'
        ],
        startHere: [
            { slug: 'wilfred-owen', name: 'Wilfred Owen', note: 'The break with heroic war poetry, made from inside the trenches.' },
            { slug: 'siegfried-sassoon', name: 'Siegfried Sassoon', note: 'Owen\'s contemporary and mentor; angrier, more satirical.' },
            { slug: 'yusef-komunyakaa', name: 'Yusef Komunyakaa', note: 'Vietnam recalled obliquely, through surfaces and reflections.' },
            { slug: 'solmaz-sharif', name: 'Solmaz Sharif', note: 'War read through the language of military dictionaries.' }
        ]
    },

    humor: {
        heading: 'About funny poems and light verse',
        body: [
            'Funny poems are not lesser poems, and the technical demand is usually higher. A joke depends on timing, and timing in verse means metre and rhyme working exactly — a comic poem with a limp line simply is not funny, whereas a serious poem can survive one. Light verse is where formal skill hides.',
            'Three modes are worth knowing apart. Nonsense, which invents its own vocabulary and keeps a straight face — Edward Lear and Lewis Carroll built the entire tradition, and "Jabberwocky" is still the best demonstration that syntax alone can carry sense. The epigram, which exists to land one closing line, of which Dorothy Parker remains the sharpest practitioner in English. And deadpan, where a poem stays calm while the situation does not, a mode Billy Collins made the dominant register of contemporary American light verse.',
            'The shorter poems in this collection tend to be the funnier ones. That is not a coincidence — a comic poem that outstays its setup stops being one.'
        ],
        startHere: [
            { slug: 'lewis-carroll', name: 'Lewis Carroll', note: 'Nonsense with perfect grammar; the syntax does the work.' },
            { slug: 'edward-lear', name: 'Edward Lear', note: 'The limerick and the invented word, at the source.' },
            { slug: 'dorothy-parker', name: 'Dorothy Parker', note: 'The epigram: everything staked on the last line.' },
            { slug: 'billy-collins', name: 'Billy Collins', note: 'Deadpan and conversational, right up to the swerve.' }
        ]
    },

    religion: {
        heading: 'About religious and devotional poetry',
        body: [
            'Devotional poetry is, more often than not, poetry of difficulty rather than certainty. The English tradition\'s central figure is George Herbert, whose poems stage an argument with God and frequently lose it, and whose formal ingenuity — poems shaped like altars and wings — is inseparable from their humility. The pattern he set is that faith in a poem is interesting at exactly the point where it is under strain.',
            'Hopkins is the other pole, and holds both extremes himself: the early poems ring with a world charged with grandeur, and the late "terrible sonnets" record a desolation with the same technical intensity. Read in order they are one of the most honest sequences about belief in the language.',
            'The collection is not only Christian. Rumi is here in translation, as is Kahlil Gibran, and the poems filed under Prayer, Faith and Spiritual overlap with this one in ways worth wandering between. A note on translation: Rumi in English is heavily mediated, and the popular versions are often loose adaptations rather than translations — read them as the beginning of an enquiry, not the end.'
        ],
        startHere: [
            { slug: 'george-herbert', name: 'George Herbert', note: 'Argument with God, in formally inventive miniature.' },
            { slug: 'gerard-manley-hopkins', name: 'Gerard Manley Hopkins', note: 'Grandeur and desolation, at the same technical pitch.' },
            { slug: 'christina-rossetti', name: 'Christina Rossetti', note: 'Devotional verse of great plainness and great control.' },
            { slug: 'jalal-al-din-rumi', name: 'Rumi', note: 'Read in translation, and read more than one translator.' }
        ]
    },

    identity: {
        body: [
            'The most active category in contemporary poetry, and the one where the collection is least dominated by the distant past. The question these poems ask is not "who am I" in a diary sense but something harder: who gets to describe you, in whose language, and what happens to a self that is being narrated by other people.',
            'The Harlem Renaissance is the pivot. Langston Hughes wrote in the rhythms of blues and jazz at a moment when that was itself an argument about whose speech counted as literary, and Claude McKay and Countee Cullen worked the inherited English forms from the inside for related reasons. Gwendolyn Brooks then carried it forward across half a century, and her shift in the late 1960s from formal mastery to something rawer is one of the most instructive career turns in American poetry.',
            'The living poets here are where the genre is most alive. Natalie Diaz, Ocean Vuong, Danez Smith, Jericho Brown and Joy Harjo are all writing about inheritance, language and the body in ways that are formally inventive rather than merely confessional. If you only read one section of this site for the poetry rather than the history, make it this one.'
        ],
        startHere: [
            { slug: 'langston-hughes', name: 'Langston Hughes', note: 'Blues and jazz rhythms made into a literary argument.' },
            { slug: 'gwendolyn-brooks', name: 'Gwendolyn Brooks', note: 'Formal mastery, then a deliberate break from it.' },
            { slug: 'natalie-diaz', name: 'Natalie Diaz', note: 'Language, desire and Mojave inheritance held together.' },
            { slug: 'ocean-vuong', name: 'Ocean Vuong', note: 'Inheritance and the body, in sentences that keep turning.' }
        ]
    },

    childhood: {
        body: [
            'Almost none of these poems were written by children, and that is the genre\'s defining tension. A childhood poem is a double exposure: the child\'s perception and the adult\'s understanding of it, printed over each other, and the good ones let the two disagree.',
            'Theodore Roethke\'s "My Papa\'s Waltz" is the standard case, and worth reading precisely because readers still argue about it — the same sixteen lines are a warm memory of roughhousing or a record of a frightening man, depending on where you put the weight, and the poem refuses to settle it. Robert Hayden\'s "Those Winter Sundays" does something related and quieter, arriving at its recognition too late to deliver it to the person concerned.',
            'The other strong current here is childhood as a place rather than a time, particularly in poets writing about a landscape or a language they have left. Seamus Heaney\'s early poems turn a farm into an inheritance; Li-Young Lee\'s turn a father, a fruit, a house into the same thing.'
        ],
        startHere: [
            { slug: 'theodore-roethke', name: 'Theodore Roethke', note: 'The poem readers have argued about for seventy years.' },
            { slug: 'robert-hayden', name: 'Robert Hayden', note: 'Gratitude arriving decades too late to be spoken.' },
            { slug: 'seamus-heaney', name: 'Seamus Heaney', note: 'Childhood as ground, and as a trade to be inherited.' },
            { slug: 'li-young-lee', name: 'Li-Young Lee', note: 'A father, a house, a piece of fruit, made enormous.' }
        ]
    },

    family: {
        body: [
            'Family poems are where poetry is least polite. The subject licenses a directness that the same poets often avoid elsewhere, and the genre has been shaped by that — this is the shelf where the confessional turn of the mid-twentieth century did its most lasting work.',
            'Sharon Olds is the clearest example: poems about parents, children and the body written with a bluntness that was genuinely shocking when it arrived and is now close to a default mode. Lucille Clifton achieved something comparable by the opposite route, in short, plain, unpunctuated poems whose restraint carries as much as Olds\'s candour.',
            'Read the parent poems and the child poems against each other. The site keeps Mother and Father as separate categories, and the two shelves rarely sound alike — father poems in English lean towards silence, distance and work; mother poems towards inheritance, the body and speech. That is a real pattern in the tradition, not a rule, and the exceptions are usually the best poems on either shelf.'
        ],
        startHere: [
            { slug: 'sharon-olds', name: 'Sharon Olds', note: 'The confessional family poem at its most unguarded.' },
            { slug: 'lucille-clifton', name: 'Lucille Clifton', note: 'Short, plain, unpunctuated, and enormously durable.' },
            { slug: 'li-young-lee', name: 'Li-Young Lee', note: 'Family as sensory memory — food, hands, rooms.' },
            { slug: 'robert-hayden', name: 'Robert Hayden', note: 'Love expressed entirely through unglamorous labour.' }
        ]
    },

    life: {
        body: [
            'The broadest category on the site, and worth being honest about: "life" is less a subject than a place poems land when their real subject is everything at once. Poems arrive here when they are about being alive in general — mortality, work, routine, the passage of an ordinary day — rather than about any single occasion.',
            'That makes it a good shelf for browsing and a poor one for searching. If you know roughly what you are after, the narrower categories will serve you better: Aging for the later part of it, Work for how most of it is spent, Memory and Nostalgia for looking back at it, Death and Grief for its end, Identity for who is doing the living.',
            'What the category does hold, more than any other, is the poem of ordinary attention — the kind that takes a completely unremarkable moment and declines to make it remarkable, trusting that accurate description is enough. Ted Kooser and Jane Kenyon are the masters of this mode, and it is much harder than it looks.'
        ],
        startHere: [
            { slug: 'ted-kooser', name: 'Ted Kooser', note: 'The ordinary described accurately and left alone.' },
            { slug: 'jane-kenyon', name: 'Jane Kenyon', note: 'Plain domestic attention, with real weight underneath.' },
            { slug: 'walt-whitman', name: 'Walt Whitman', note: 'The opposite instinct: life as everything, catalogued.' },
            { slug: 'philip-larkin', name: 'Philip Larkin', note: 'Ordinary English life, observed without much mercy.' }
        ]
    },

    philosophy: {
        heading: 'About philosophical poetry',
        body: [
            'Philosophical poetry has a specific risk: a poem that merely states a position is an essay with line breaks. The poems that work do something else — they enact the thinking rather than reporting its conclusion, so the reader arrives at the difficulty rather than being told about it.',
            'Wallace Stevens is the central figure in English for exactly this reason. His poems are about how imagination and reality make each other, and they proceed by variation and restatement, circling a proposition rather than proving it. They can be forbidding at first; the way in is to stop looking for the argument and follow the sound.',
            'Rilke works the other side, addressing the reader directly about attention, solitude and change, in a voice of instruction that somehow avoids being instructive. Czesław Miłosz brings history into it — the questions become urgent rather than abstract when the century keeps supplying evidence. And Anne Carson, working across classics and contemporary form, is where the tradition currently is.'
        ],
        startHere: [
            { slug: 'wallace-stevens', name: 'Wallace Stevens', note: 'Thinking enacted, not reported; follow the sound first.' },
            { slug: 'rainer-maria-rilke', name: 'Rainer Maria Rilke', note: 'Instruction on attention and solitude, without preaching.' },
            { slug: 'czeslaw-milosz', name: 'Czesław Miłosz', note: 'Philosophy under the pressure of actual history.' },
            { slug: 'anne-carson', name: 'Anne Carson', note: 'Classics and contemporary form, deliberately unsettled.' }
        ]
    },

    memory: {
        heading: 'About poems about memory',
        body: [
            'Memory poems and nostalgia poems are kept apart here, and the difference is temperature. Nostalgia wants the past back. Memory is more interested in the machinery — what gets kept, what is quietly invented, and how unreliable the whole apparatus turns out to be when examined.',
            'Elizabeth Bishop is the great poet of this. Her poems return to childhood scenes with an eye so exact that the exactness itself becomes the subject, and "In the Waiting Room" is probably the best account in English of the moment a self first notices it exists. Nothing in it is nostalgic.',
            'Natasha Trethewey extends the mode into public history, working with photographs, archives and the gaps in official records — memory as something contested rather than private. Read her alongside Bishop and the genre stops being about looking back and becomes about who is permitted to.',
            'One mechanism recurs across the whole shelf and is worth watching for: the poem is usually triggered by a single physical detail — a smell, a sound, an object still in the house — and the memory arrives sideways, unbidden, rather than being summoned. Poems that instead announce their intention to remember tend to be the weaker ones, because the interesting part of memory is precisely that it is not under the rememberer\'s control.'
        ],
        startHere: [
            { slug: 'elizabeth-bishop', name: 'Elizabeth Bishop', note: 'Exactness so complete it becomes the poem\'s real subject.' },
            { slug: 'natasha-trethewey', name: 'Natasha Trethewey', note: 'Private memory set against the public record.' },
            { slug: 'seamus-heaney', name: 'Seamus Heaney', note: 'Memory as physical work — digging, and what it turns up.' },
            { slug: 'stanley-kunitz', name: 'Stanley Kunitz', note: 'A long life looked back over, late and unsentimentally.' }
        ]
    },

    nostalgia: {
        body: [
            'Nostalgia is the most easily ruined of the moods in this collection, because it is the one closest to sentimentality — and the difference is only ever a matter of honesty about what is really being missed.',
            'A. E. Housman is the necessary starting point. "Into my heart an air that kills" names the whole condition in four lines: the remembered country is visible, specific and permanently unreachable, and Housman is entirely clear that what he wants back is not a place but a time. That clarity is what keeps the poem from being greetings-card verse.',
            'Cavafy is the other essential, and the corrective. His poems return constantly to a lost Alexandria and to vanished young men, but he writes about the past as something to be handled precisely rather than mourned vaguely, and "Ithaka" turns the entire nostalgic impulse around: the point was the journey, and arriving to find the place small is not a disappointment. Thomas Hardy sits between them, revisiting the same lost people for forty years without ever quite forgiving himself.'
        ],
        startHere: [
            { slug: 'a-e-housman', name: 'A. E. Housman', note: 'The blue remembered hills — the condition, exactly named.' },
            { slug: 'c-p-cavafy', name: 'C. P. Cavafy', note: 'The past handled precisely; nostalgia turned around.' },
            { slug: 'thomas-hardy', name: 'Thomas Hardy', note: 'Forty years of returning to the same few losses.' },
            { slug: 'edward-thomas', name: 'Edward Thomas', note: 'An England remembered from the edge of losing it.' }
        ]
    },

    aging: {
        heading: 'About poems on growing older',
        body: [
            'Poetry about growing old is unusual in having a reliable correlation between the poet\'s age and the quality of the work. Poets are often better on this subject late, and the shelf rewards reading a poet\'s last book rather than their most anthologised one.',
            'Stanley Kunitz is the case in point — he published strong work into his nineties, and the late poems have a plainness the earlier ones were too skilful for. Thomas Hardy wrote most of the poetry he is now valued for after he turned sixty and had given up novels entirely.',
            'The recurring mechanism to watch for is the body as an unreliable narrator: poems where the mind reports one age and the physical facts report another, and the gap between them is where the poem happens. Larkin gets at this coldly and Kooser warmly, and it is worth reading the two of them close together to see how far tone alone can carry the same observation.'
        ],
        startHere: [
            { slug: 'stanley-kunitz', name: 'Stanley Kunitz', note: 'Late poems that gave up skill for something better.' },
            { slug: 'thomas-hardy', name: 'Thomas Hardy', note: 'A second career as a poet, begun in his sixties.' },
            { slug: 'philip-larkin', name: 'Philip Larkin', note: 'Aging and mortality faced coldly and very precisely.' },
            { slug: 'linda-pastan', name: 'Linda Pastan', note: 'Domestic, quiet, and unflinching about time.' }
        ]
    },

    mother: {
        heading: 'About poems for mothers',
        body: [
            'The mother poem in English tends towards inheritance — of the body, of speech, of temperament — and it is far more likely than the father poem to be written in or about the mother\'s own voice.',
            'Gwendolyn Brooks\'s "the mother" is the poem that most complicates the shelf, and readers should know what they are opening: it is a poem about abortion, spoken with a directness that was extraordinary in 1945 and is still unusual, and it refuses every easy position available to it. Lucille Clifton works nearby in poems that celebrate the body and its lineage in very few words.',
            'Sharon Olds and Li-Young Lee approach from the child\'s side, decades on, and both are worth reading for the same reason: they resist the two default settings of the genre, which are unbroken tribute and settled grievance. The poems that last on this shelf almost always hold more than one feeling at once.'
        ],
        startHere: [
            { slug: 'gwendolyn-brooks', name: 'Gwendolyn Brooks', note: 'Read "the mother" — difficult, and the best thing here.' },
            { slug: 'lucille-clifton', name: 'Lucille Clifton', note: 'The body and its lineage, celebrated in very few words.' },
            { slug: 'sharon-olds', name: 'Sharon Olds', note: 'The adult child, still unresolved and saying so.' },
            { slug: 'li-young-lee', name: 'Li-Young Lee', note: 'Inheritance carried in food, language and hands.' }
        ]
    },

    father: {
        heading: 'About poems about fathers',
        body: [
            'Father poems in English cluster around silence, work and physical distance — the recurring situation is a man who did not explain himself and a poem written to close the gap, usually too late.',
            'Robert Hayden\'s "Those Winter Sundays" is the model: a father who got up in the cold to light the fires and was thanked by nobody, and a final line that names the failure without excusing it. Roethke\'s "My Papa\'s Waltz" is the same territory and much more unstable, and the disagreement it still provokes is the point rather than a flaw.',
            'At the other extreme is Sylvia Plath\'s "Daddy", which is worth approaching with some care — a poem of enormous force that reaches for Holocaust imagery to describe a private grievance, a choice that has been contested since it was published and that you should decide about yourself rather than take on trust. It belongs on the shelf because it changed what the genre was permitted to do, not because it settled anything.'
        ],
        startHere: [
            { slug: 'robert-hayden', name: 'Robert Hayden', note: 'The definitive father poem; fourteen lines, no excuses.' },
            { slug: 'theodore-roethke', name: 'Theodore Roethke', note: 'Deliberately unstable — readers still cannot agree.' },
            { slug: 'sylvia-plath', name: 'Sylvia Plath', note: 'Forceful and genuinely contested; read it critically.' },
            { slug: 'li-young-lee', name: 'Li-Young Lee', note: 'The tender counterweight to the whole tradition.' }
        ]
    },

    friendship: {
        body: [
            'A small shelf, and honestly so — 74 poems, where Love holds over a thousand. That imbalance is not an accident of this collection but a fact about the tradition: English poetry has spent centuries developing a vocabulary for romantic love and comparatively little on the affection that structures most people\'s actual lives.',
            'Where it does appear, it is often disguised. A great deal of what reads as friendship in poetry is filed under love, elegy or the verse letter — poems written to a specific person, frequently another poet, and shaped by the assumption that they would be read by them. That is worth knowing if the shelf here looks thin: try Grief for the poems written when a friend dies, which is where a surprising amount of the tradition\'s real friendship poetry ended up.',
            'Whitman is the exception who set a template, writing about comradeship as something political as well as personal. Cavafy, decades later and very differently, wrote about companionship remembered rather than held.'
        ],
        startHere: [
            { slug: 'walt-whitman', name: 'Walt Whitman', note: 'Comradeship as a political proposition, not just a warm one.' },
            { slug: 'c-p-cavafy', name: 'C. P. Cavafy', note: 'Companionship recalled, precisely and without pathos.' },
            { slug: 'langston-hughes', name: 'Langston Hughes', note: 'The conversational register — poems addressed to someone.' },
            { slug: 'naomi-shihab-nye', name: 'Naomi Shihab Nye', note: 'Kindness and connection between strangers.' }
        ]
    },

    loneliness: {
        body: [
            'Loneliness is a difficult subject for a poem for one structural reason: a poem is addressed to someone, so writing one is already a partial contradiction of the state being described. The best poems on this shelf know that and use it.',
            'Two distinct things get filed here. The first is solitude chosen and found productive — Rilke is the essential voice, arguing that solitude is the condition of any real inner life and that most people flee it too quickly. The second is isolation that was not chosen at all, which is a colder subject and better served by Larkin, Hardy, and Edward Hopper\'s poetic contemporaries.',
            'Matthew Arnold\'s "Dover Beach" sits oddly and importantly across both. It is a poem about a whole civilisation\'s faith receding, but its resolution is two people in a room agreeing to be true to one another — loneliness answered by the smallest possible unit of company. Nobody has improved on that ending.'
        ],
        startHere: [
            { slug: 'rainer-maria-rilke', name: 'Rainer Maria Rilke', note: 'Solitude argued for, not merely suffered.' },
            { slug: 'matthew-arnold', name: 'Matthew Arnold', note: '"Dover Beach" — isolation answered by one other person.' },
            { slug: 'philip-larkin', name: 'Philip Larkin', note: 'Isolation that was not chosen, described without comfort.' },
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'Interior solitude mapped more finely than by anyone since.' }
        ]
    },

    heartbreak: {
        body: [
            'A small and very specific shelf — 61 poems — for the ones written after it ends. If it is not here, look in Love, which holds the whole arc, or in Lost Love for the poems written long enough afterwards to have cooled.',
            'The formal observation worth making is that heartbreak poems are disproportionately in strict form. That looks backwards and is not: metre and rhyme give a poem a shape to hold when its subject has none, which is why so many of them are sonnets and villanelles. Edna St. Vincent Millay is the sharpest practitioner in English — her sonnets are unsentimental to the point of coldness, frequently about her own diminishing interest rather than her suffering, and they are much funnier than the genre usually allows.',
            'Thomas Hardy\'s poems for his first wife, written after her death and after decades of estrangement, are the other pole: heartbreak complicated by guilt and by having had the chance to fix it. Between those two you have most of what the shelf can do.'
        ],
        startHere: [
            { slug: 'edna-st-vincent-millay', name: 'Edna St. Vincent Millay', note: 'Sonnets, unsentimental, and drier than you expect.' },
            { slug: 'thomas-hardy', name: 'Thomas Hardy', note: 'Grief and guilt for a marriage he let go cold.' },
            { slug: 'dorothy-parker', name: 'Dorothy Parker', note: 'Heartbreak handled as comedy, which is its own defence.' },
            { slug: 'anne-sexton', name: 'Anne Sexton', note: 'Confessional and unguarded about wanting someone back.' }
        ]
    },

    'arts-and-sciences': {
        heading: 'About poems on art and science',
        body: [
            'A Poetry Foundation shelf rather than a theme, and the broadest here after Nature: it collects poems about painting, music, mathematics, astronomy, medicine and — most of all — about writing poems. Browsing it is more rewarding than searching it.',
            'Its centre is the ars poetica, the poem about poetry itself. Marianne Moore opens hers by admitting she dislikes it, then argues her way to what would make it bearable; Archibald MacLeish ends his with the line that a poem should not mean but be, which has been quoted approvingly and attacked ever since. Wallace Stevens spent a career on the same question without ever putting it that briefly.',
            'The science poems are the more surprising half. The useful thing to notice is that poets rarely use science as decoration — they take a genuine structure from it, which is why so many of these poems are about scale, measurement and the limits of observation rather than about laboratories.'
        ],
        startHere: [
            { slug: 'marianne-moore', name: 'Marianne Moore', note: 'Begins by disliking poetry and argues back from there.' },
            { slug: 'archibald-macleish', name: 'Archibald MacLeish', note: '"Ars Poetica" — the most quoted and most disputed of them.' },
            { slug: 'wallace-stevens', name: 'Wallace Stevens', note: 'Imagination and reality, worked at for a whole career.' },
            { slug: 'anne-carson', name: 'Anne Carson', note: 'Classics, scholarship and poetry refusing to stay separate.' }
        ]
    },

    'social-commentaries': {
        heading: 'About poems that argue with their times',
        body: [
            'Poems written to disagree with the society around them. It is one of the oldest uses of verse and one of the riskiest, because a poem that only states a position dates the moment the argument is settled — while the ones that last usually work by putting a reader inside a situation rather than by telling them what to conclude.',
            'Langston Hughes is the clearest demonstration. "Let America be America again" makes its case by letting two voices contradict each other on the page rather than by asserting either, and it is far more durable than the editorial it could have been. Carl Sandburg does something related with Chicago, refusing to defend the city and describing it accurately instead.',
            'Shelley is the ancestor worth knowing: "The Masque of Anarchy" was written in fury after Peterloo and suppressed for years, and its closing stanza has been borrowed by protest movements ever since. If you want the narrower modern strands, Social Justice, Racism and Discrimination, and Poverty each collect them separately.'
        ],
        startHere: [
            { slug: 'langston-hughes', name: 'Langston Hughes', note: 'Argument made by letting two voices contradict each other.' },
            { slug: 'carl-sandburg', name: 'Carl Sandburg', note: 'Describes rather than defends, and wins that way.' },
            { slug: 'percy-bysshe-shelley', name: 'Percy Bysshe Shelley', note: 'Written in fury after Peterloo, suppressed for years.' },
            { slug: 'claude-mckay', name: 'Claude McKay', note: 'The sonnet turned into a weapon, deliberately.' }
        ]
    },

    'history-and-politics': {
        heading: 'About poems on history and politics',
        body: [
            'The distinction worth holding onto: a political poem argues about the present, a history poem stands somewhere after the event and asks what it did to the people inside it. This shelf holds both, and the second kind ages better.',
            'Czesław Miłosz is the essential figure, having lived through occupied Warsaw and then Stalinism, and his subject is really what history does to language — what happens to ordinary words after they have been used by a regime. Seamus Heaney wrote through the Troubles while refusing the role of spokesman, and the resulting obliqueness is the poetry, not an evasion of it.',
            'Robert Lowell brought American public life into the confessional mode, and Ilya Kaminsky\'s work on occupation and deafness is where the tradition currently sits. Read any of them for how carefully they avoid the one thing that kills a political poem: certainty arriving too early.'
        ],
        startHere: [
            { slug: 'czeslaw-milosz', name: 'Czesław Miłosz', note: 'What a regime does to ordinary words.' },
            { slug: 'seamus-heaney', name: 'Seamus Heaney', note: 'Wrote through the Troubles and refused to be a spokesman.' },
            { slug: 'robert-lowell', name: 'Robert Lowell', note: 'American public life pulled into the confessional mode.' },
            { slug: 'ilya-kaminsky', name: 'Ilya Kaminsky', note: 'Occupation and deafness; where the tradition is now.' }
        ]
    },

    mythology: {
        heading: 'About poems that retell myths',
        body: [
            'Retelling is the whole genre. A myth arrives already known, so the poem cannot surprise you with what happens — it has to earn its place by changing where you are standing, and the usual move is to hand the story to whoever was silent in the original.',
            'Anne Carson is the contemporary master of this, working directly from Greek as a classicist and then breaking the results open formally. Cavafy did it a century earlier and more quietly, writing Ithaka as advice rather than narrative and turning the whole Odyssey into a remark about journeys.',
            'Tennyson\'s "Ulysses" is the poem most people meet first and is worth rereading suspiciously: it is usually quoted as inspiration, and it is also a portrait of a restless old king proposing to abandon his kingdom. H. D. is the other essential — an Imagist working from Greek material, and one of the first to give the women of those stories their own voices.'
        ],
        startHere: [
            { slug: 'anne-carson', name: 'Anne Carson', note: 'A classicist who breaks the source open formally.' },
            { slug: 'c-p-cavafy', name: 'C. P. Cavafy', note: 'The Odyssey reduced to a remark about journeys.' },
            { slug: 'alfred-lord-tennyson', name: 'Alfred, Lord Tennyson', note: 'Read "Ulysses" suspiciously, not just approvingly.' },
            { slug: 'h-d', name: 'H. D.', note: 'Imagist Greek, giving the silent women a voice.' }
        ]
    },

    spiritual: {
        body: [
            'Kept separate from Religion on purpose. Religion collects poems working inside a tradition and often arguing with it; this shelf is for the poems that reach for something larger without a doctrine attached — which is a much older and much more common impulse than either category suggests.',
            'Rumi is the giant here, though what circulates in English is a caution as much as a recommendation: the popular versions are loose adaptations by writers who did not read Persian, and they are beautiful and not always translations. Read more than one, and prefer the ones that name their translator.',
            'Whitman is the American origin of the un-doctrinal version, treating the self, the body and the grass as continuous with everything else. Mary Oliver made a practice of the same instinct in far plainer language, and if the mystical register puts you off, she is the way in — the attention is identical, the vocabulary is not.'
        ],
        startHere: [
            { slug: 'jalal-al-din-rumi', name: 'Rumi', note: 'Read more than one translator, and check which is which.' },
            { slug: 'walt-whitman', name: 'Walt Whitman', note: 'The self and the grass treated as the same substance.' },
            { slug: 'mary-oliver', name: 'Mary Oliver', note: 'The same attention in plain language, no doctrine.' },
            { slug: 'kahlil-gibran', name: 'Kahlil Gibran', note: 'The aphoristic register, hugely popular and much imitated.' }
        ]
    },

    'racism-and-discrimination': {
        heading: 'About poems on racism and discrimination',
        body: [
            'The Harlem Renaissance is where this shelf becomes unavoidable, and the formal choice its poets faced is worth understanding before reading them. Claude McKay and Countee Cullen wrote in strict inherited English forms — sonnets especially — and using the coloniser\'s own prosody to indict him was a deliberate argument, not conservatism. Langston Hughes went the other way and built from blues and jazz. Both positions were contested at the time.',
            'Gwendolyn Brooks lived through the whole argument and switched sides late, abandoning a mastery of received form for something rawer after 1967. Reading her early and late work together is the most instructive hour available on this shelf.',
            'The contemporary poets — Audre Lorde, Claudia Rankine, Danez Smith, Jericho Brown — are where the formal invention now is. Rankine in particular writes in a register that is not obviously verse at all, which is part of the point.'
        ],
        startHere: [
            { slug: 'claude-mckay', name: 'Claude McKay', note: 'The sonnet used against the tradition that produced it.' },
            { slug: 'gwendolyn-brooks', name: 'Gwendolyn Brooks', note: 'Read the early and late work together — she changed sides.' },
            { slug: 'audre-lorde', name: 'Audre Lorde', note: 'Race, gender and anger treated as a single subject.' },
            { slug: 'claudia-rankine', name: 'Claudia Rankine', note: 'Barely looks like verse, and that is deliberate.' }
        ]
    },

    travel: {
        body: [
            'Travel poetry is rarely about the destination. The reliable subject is the traveller — what gets noticed abroad that would be invisible at home, and the slight shame of being a person who looks at other people\'s lives and calls it experience.',
            'Elizabeth Bishop is the essential poet here and the most honest about that discomfort. "Questions of Travel" asks outright whether it would have been better to have stayed at home and imagined the place, and declines to answer; she spent most of her life away from the country she was from, so the question is not rhetorical.',
            'Cavafy supplies the counter-argument in "Ithaka": the arrival is beside the point and finding the island poor is not a disappointment. Basho\'s tradition sits behind a good deal of this too, though he is not on Poemunity — the travel journal punctuated by haiku is where the form of "notice one thing precisely, move on" comes from.'
        ],
        startHere: [
            { slug: 'elizabeth-bishop', name: 'Elizabeth Bishop', note: 'Asks whether travelling was worth it and does not answer.' },
            { slug: 'c-p-cavafy', name: 'C. P. Cavafy', note: '"Ithaka" — arriving is not the point.' },
            { slug: 'robert-louis-stevenson', name: 'Robert Louis Stevenson', note: 'The romance of departure, before the doubts set in.' },
            { slug: 'derek-walcott', name: 'Derek Walcott', note: 'Arrival, empire and the sea, from the other direction.' }
        ]
    },

    ocean: {
        heading: 'About poems of the sea',
        body: [
            'The sea gets used for two incompatible jobs in English poetry and it is worth knowing which one you are reading. It is either the sublime — vast, indifferent, a way of making a speaker small — or it is a workplace, with weather, wages and drowning in it.',
            'Matthew Arnold\'s "Dover Beach" is the sublime version at its most consequential: the tide going out becomes the retreat of faith itself, and the poem\'s answer to that is two people agreeing to be true to one another. Nobody has bettered that ending.',
            'Derek Walcott is the necessary corrective, writing the Caribbean sea as history rather than scenery — a place with the Middle Passage in it, not a metaphor for feeling. Read him against Arnold and the genre stops being about awe and starts being about who is standing on which shore.'
        ],
        startHere: [
            { slug: 'matthew-arnold', name: 'Matthew Arnold', note: '"Dover Beach" — the tide as the retreat of belief.' },
            { slug: 'derek-walcott', name: 'Derek Walcott', note: 'The sea as history, not scenery.' },
            { slug: 'elizabeth-bishop', name: 'Elizabeth Bishop', note: 'Exact, unmystical, and better for it.' },
            { slug: 'walt-whitman', name: 'Walt Whitman', note: 'The sea as the place the self dissolves into.' }
        ]
    },

    animal: {
        heading: 'About poems about animals',
        body: [
            'The test of an animal poem is whether the animal survives it. Most fail: the creature turns into a symbol somewhere in the second stanza and the poem is really about the poet. The ones worth reading keep the animal stubbornly itself.',
            'Marianne Moore is the great practitioner, and her method is essentially research — precise, borrowed, faintly encyclopaedic description that refuses to make a pangolin stand for anything. D. H. Lawrence\'s "Snake" is the other model and works by admitting the failure: he throws a log at it, and the poem is about his own pettiness.',
            'Christopher Smart is the outlier everyone should meet once. The passage on his cat Jeoffry was written while he was confined in an asylum in the 1760s, is a genuinely great religious poem, and is also just a man watching his cat very closely.'
        ],
        startHere: [
            { slug: 'marianne-moore', name: 'Marianne Moore', note: 'Description so exact the animal refuses to be a symbol.' },
            { slug: 'd-h-lawrence', name: 'D. H. Lawrence', note: '"Snake" — the poem is about his own pettiness.' },
            { slug: 'christopher-smart', name: 'Christopher Smart', note: 'His cat Jeoffry, written from an asylum in the 1760s.' },
            { slug: 'mary-oliver', name: 'Mary Oliver', note: 'Attention offered as a form of respect.' }
        ]
    },

    city: {
        heading: 'About poems about cities',
        body: [
            'City poems tend to be built out of lists, because that is what a city does to perception — too much at once, in no order. The form follows the fact.',
            'Frank O\'Hara made this a method. The "I do this, I do that" poems walk through Manhattan at lunchtime naming what they pass, and their casualness is highly worked; the famous elegy for Billie Holiday spends most of its length buying cigarettes and a newspaper before it lands. Carl Sandburg wrote Chicago as muscle and stockyards without apologising for either.',
            'Baudelaire is the ancestor of the whole line, inventing the figure of the person who walks a modern city as a spectator and treating crowds, prostitution and rubbish as legitimate material. Almost every urban poem written since is downstream of that permission.'
        ],
        startHere: [
            { slug: 'frank-ohara', name: 'Frank O\'Hara', note: 'Lunchtime in Manhattan; the casualness is highly worked.' },
            { slug: 'carl-sandburg', name: 'Carl Sandburg', note: 'Chicago as muscle and stockyards, unapologetic.' },
            { slug: 'charles-baudelaire', name: 'Charles Baudelaire', note: 'Invented the modern city as legitimate material.' },
            { slug: 'william-carlos-williams', name: 'William Carlos Williams', note: 'The small American town seen with the same eye.' }
        ]
    },

    illness: {
        heading: 'About poems on illness',
        body: [
            'Illness poems have a structural problem that is also their opportunity: pain resists language, and a poem is nothing but language. The good ones do not describe the pain. They describe the room, the appointment, the waiting, the body behaving like an object — and the pain arrives sideways.',
            'Mark Doty and the poets of the AIDS epidemic changed what this shelf could hold, writing illness as something public and political rather than private misfortune. Audre Lorde did the same for cancer, insisting on speech where silence was expected.',
            'Jane Kenyon\'s poems on depression are the other essential, and worth naming precisely because they refuse metaphor almost entirely — the condition is described as weather and routine, which is far more recognisable than any figure would be. Mental Health collects more of that strand.'
        ],
        startHere: [
            { slug: 'mark-doty', name: 'Mark Doty', note: 'Illness as public and political, not private misfortune.' },
            { slug: 'audre-lorde', name: 'Audre Lorde', note: 'Insisted on speech where silence was expected.' },
            { slug: 'jane-kenyon', name: 'Jane Kenyon', note: 'Depression as weather and routine, almost no metaphor.' },
            { slug: 'lucille-clifton', name: 'Lucille Clifton', note: 'The body addressed directly, in very few words.' }
        ]
    },

    music: {
        heading: 'About poems about music',
        body: [
            'Poetry and music were the same art for most of their history — lyric means a thing sung to a lyre — and the poems on this shelf are mostly attempts to get some of that back after several centuries of print.',
            'The most successful of them borrow an actual musical form rather than describing music. Langston Hughes wrote in blues stanzas, with the repeated line and the answering third that the form requires, so the poem carries the shape of the music instead of praising it. Yusef Komunyakaa does something comparable with jazz, using improvisation as a structural principle.',
            'Gwendolyn Brooks\'s "We Real Cool" is the compact demonstration — eight lines, the pronoun stranded at the end of each so the whole poem moves on a syncopation. Read it aloud, and then read it aloud again with the line breaks ignored, and the difference is the entire lesson.'
        ],
        startHere: [
            { slug: 'langston-hughes', name: 'Langston Hughes', note: 'Actual blues stanzas, not poems about the blues.' },
            { slug: 'yusef-komunyakaa', name: 'Yusef Komunyakaa', note: 'Improvisation used as a structural principle.' },
            { slug: 'gwendolyn-brooks', name: 'Gwendolyn Brooks', note: '"We Real Cool" — read it aloud twice, differently.' },
            { slug: 'walt-whitman', name: 'Walt Whitman', note: 'Long breath lines built on how a voice actually carries.' }
        ]
    },

    'sorrow-and-grieving': {
        heading: 'About poems of sorrow',
        body: [
            'An older, wider shelf than Grief, and the two overlap heavily — this one inherited its name from the Poetry Foundation\'s taxonomy. If you are looking for poems about a specific death, or for something to read at a funeral, Grief is the better place to start.',
            'What sits here more naturally is sorrow without a named cause: the low, unattributed sadness that has no event attached to it and therefore no obvious end. English has a poor vocabulary for this, which is exactly why there are poems.',
            'Thomas Hardy is the presiding figure — few poets have written so much, so well, out of a sadness they could not quite account for — and Christina Rossetti supplies the more formally contained version of the same. For the modern clinical register, see Mental Health and Depression instead.'
        ],
        startHere: [
            { slug: 'thomas-hardy', name: 'Thomas Hardy', note: 'A lifetime of sadness he never fully accounted for.' },
            { slug: 'christina-rossetti', name: 'Christina Rossetti', note: 'The same feeling under strict formal control.' },
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'Interior weather mapped more finely than by anyone.' },
            { slug: 'edward-thomas', name: 'Edward Thomas', note: 'Melancholy attached to landscape and to nothing else.' }
        ]
    },

    winter: {
        body: [
            'Winter is the season poets reach for when they want the world reduced. Leaves gone, colour gone, sound muffled — whatever remains visible in a winter poem is there because the season stripped everything else away, which makes it a useful setting for a poem that wants very few elements.',
            'Wallace Stevens\'s "The Snow Man" is the extreme case and the one to read first: it argues that you need a mind of winter to look at a winter landscape without projecting misery onto it, and it ends with one of the strangest lines in American poetry, about a nothing that is and is not there.',
            'Frost\'s snowy woods are the other pole — the same emptiness, but with a human being in it who has somewhere to be. Read the two together and you have most of what the season is for.'
        ],
        startHere: [
            { slug: 'wallace-stevens', name: 'Wallace Stevens', note: '"The Snow Man" — you need a mind of winter to see it.' },
            { slug: 'robert-frost', name: 'Robert Frost', note: 'The same emptiness, with someone in it who must leave.' },
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'A certain slant of light, and what it does indoors.' },
            { slug: 'edward-thomas', name: 'Edward Thomas', note: 'English winter, plainly, without symbolism.' }
        ]
    },

    'gender-and-feminism': {
        heading: 'About poems on gender and feminism',
        body: [
            'Adrienne Rich is the hinge. Her early books were formally impeccable and praised for it; she then spent decades dismantling that voice deliberately, and her essay on re-vision — looking back at old texts with fresh eyes as an act of survival rather than scholarship — is the clearest statement of what this shelf is doing.',
            'Audre Lorde\'s contribution was to refuse the separation of subjects: race, gender, sexuality and anger are one subject in her work, and any reading that takes only one of them is a misreading she anticipated in prose.',
            'The confessional poets sit here uneasily and productively. Plath and Sexton wrote about the female body, marriage and rage at a time when doing so was treated as an illness rather than a subject, and both are more formally controlled than their reputations suggest — read for the technique, not just the biography.'
        ],
        startHere: [
            { slug: 'adrienne-rich', name: 'Adrienne Rich', note: 'Dismantled her own praised early voice on purpose.' },
            { slug: 'audre-lorde', name: 'Audre Lorde', note: 'Refused to let the subjects be separated.' },
            { slug: 'sylvia-plath', name: 'Sylvia Plath', note: 'More formally controlled than the reputation suggests.' },
            { slug: 'marge-piercy', name: 'Marge Piercy', note: 'Plainer, angrier, and aimed at ordinary working life.' }
        ]
    },

    'social-justice': {
        heading: 'About poems on social justice',
        body: [
            'Close enough to Social Commentaries that you should browse both. The rough difference is direction: commentary describes what is wrong, and the poems here are usually addressed to someone, with an expectation that something should change.',
            'That makes them the hardest poems on the site to write well, because address slides easily into instruction and instruction is not poetry. June Jordan is the one to read for how it is done — her work is unmistakably committed and never stops being written to a person rather than at a cause.',
            'The strongest of these poems almost always work by particularity: a name, a street, a single case. The moment the subject becomes "injustice" in the abstract, the poem stops being able to do anything a pamphlet could not do better.'
        ],
        startHere: [
            { slug: 'june-jordan', name: 'June Jordan', note: 'Committed, and always addressed to a person.' },
            { slug: 'audre-lorde', name: 'Audre Lorde', note: 'Anger treated as a resource rather than a lapse.' },
            { slug: 'langston-hughes', name: 'Langston Hughes', note: 'A deferred dream, asked about rather than argued.' },
            { slug: 'carl-sandburg', name: 'Carl Sandburg', note: 'The case made by naming the work and the wages.' }
        ]
    },

    work: {
        heading: 'About poems about work',
        body: [
            'Most people spend most of their lives working and English poetry spent most of its history not mentioning it. That absence is worth noticing before you read this shelf: labour enters the canon late, and largely because particular poets insisted on it.',
            'Philip Levine is the central figure, having worked in Detroit auto plants before he wrote about them, and his poems are unusual in treating industrial work as ordinary rather than as either tragedy or virtue. Seamus Heaney\'s "Digging" does the adjacent thing for farm labour, and turns the poet\'s pen into an awkward, honest substitute for his father\'s spade.',
            'Marge Piercy\'s "To be of use" is the argument in compressed form — a poem that straightforwardly admires people who work hard and does not apologise for the sentiment, which is harder to bring off than irony.'
        ],
        startHere: [
            { slug: 'philip-levine', name: 'Philip Levine', note: 'Detroit auto plants, treated as ordinary life.' },
            { slug: 'seamus-heaney', name: 'Seamus Heaney', note: '"Digging" — the pen as a substitute for the spade.' },
            { slug: 'marge-piercy', name: 'Marge Piercy', note: 'Admires hard work without irony, and gets away with it.' },
            { slug: 'carl-sandburg', name: 'Carl Sandburg', note: 'The worker as the subject, not the backdrop.' }
        ]
    },

    food: {
        heading: 'About poems about food',
        body: [
            'Food poems are almost never about food. They are about family, migration, class and memory, and the meal is the object that holds those things still long enough to be looked at.',
            'Neruda\'s odes are the pure form: an entire poem addressed to an onion, or a lemon, taking the thing seriously enough to praise it at length. The joke and the sincerity are the same gesture, which is why they survive translation so well.',
            'Li-Young Lee is the essential poet here for the other mode — food as inheritance, where a shared peach or a father\'s hands carry a whole history of arrival and loss without the poem ever naming it. Ross Gay\'s work on gardens, fruit and delight is the closest contemporary equivalent.'
        ],
        startHere: [
            { slug: 'pablo-neruda', name: 'Pablo Neruda', note: 'Odes to an onion, a lemon — the joke and the sincerity are one.' },
            { slug: 'li-young-lee', name: 'Li-Young Lee', note: 'Food as inheritance, never named as such.' },
            { slug: 'ross-gay', name: 'Ross Gay', note: 'Gardens, fruit and delight taken seriously.' },
            { slug: 'naomi-shihab-nye', name: 'Naomi Shihab Nye', note: 'The meal as the place two cultures meet.' }
        ]
    },
    immigration: {
        heading: 'About poems on immigration and exile',
        body: [
            'Two poems define the poles of this shelf and they disagree. Emma Lazarus wrote the lines cast on the Statue of Liberty — the huddled masses, the lamp beside the golden door — as an act of advocacy in 1883, and they describe a promise. Almost everything written since describes the arrival.',
            'The recurring subject is not the journey but language: what it costs to be fluent, what a parent sounds like in a tongue their child is losing, which words have no equivalent. Li-Young Lee and Ocean Vuong both write about a father whose English never became the language he thought in, and the poems are made of that gap.',
            'Warsan Shire\'s work on refuge is the contemporary counterpart, and worth reading directly rather than through the fragments that circulate online. Exile as a longer condition sits under Nostalgia and Home.'
        ],
        startHere: [
            { slug: 'emma-lazarus', name: 'Emma Lazarus', note: 'The promise, written on the statue in 1883.' },
            { slug: 'li-young-lee', name: 'Li-Young Lee', note: 'A father whose English never became his thinking.' },
            { slug: 'ocean-vuong', name: 'Ocean Vuong', note: 'Inheritance carried in a language being lost.' },
            { slug: 'warsan-shire', name: 'Warsan Shire', note: 'Read whole poems, not the fragments that circulate.' }
        ]
    },

    birds: {
        heading: 'About poems about birds',
        body: [
            'Birds are the most over-used image in English poetry and still the most productive, because a bird gives a poet the two things a lyric wants: a voice that is not human, and the ability to leave.',
            'Keats\'s nightingale and Shelley\'s skylark are the canonical pair and they do opposite work — Keats wants to dissolve into the bird\'s song and dread coming back, Shelley wants the bird to teach him to sing. Hardy\'s "The Darkling Thrush" is the corrective: an old, gaunt, ragged bird singing for no discernible reason at the end of a century, and the poem refuses to know why.',
            'Dickinson\'s hope with feathers is the most quoted and the least examined; note that the poem never says the bird is right. Poe supplies the opposite bird entirely.'
        ],
        startHere: [
            { slug: 'john-keats', name: 'John Keats', note: 'The nightingale, and the dread of coming back.' },
            { slug: 'thomas-hardy', name: 'Thomas Hardy', note: 'A ragged thrush singing for no reason anyone can find.' },
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'Hope with feathers — she never says it is right.' },
            { slug: 'percy-bysshe-shelley', name: 'Percy Bysshe Shelley', note: 'Wants the skylark to teach him how to sing.' }
        ]
    },

    'lust-and-desire': {
        heading: 'About poems of desire',
        body: [
            'Desire is separated from Love here for a good reason: they are different subjects and the poems sound nothing alike. Love poems tend towards the future and the whole person; desire poems are in the present tense and concerned with a body.',
            'Sappho is the origin, and what survives is mostly fragments — which turns out to suit the subject, since the gaps do work no complete poem could. Donne is the great English practitioner, arguing his way into bed with logic borrowed from theology, and the wit is the seduction rather than an ornament on it.',
            'Sharon Olds is the modern equivalent for candour, writing sex with the same plainness she brings to childbirth and illness. Adjacent shelves: Romantic for the softer register, Marriage for the long term.'
        ],
        startHere: [
            { slug: 'sappho', name: 'Sappho', note: 'Fragments, where the gaps do the work.' },
            { slug: 'john-donne', name: 'John Donne', note: 'Theology repurposed as seduction, and the wit IS the seduction.' },
            { slug: 'sharon-olds', name: 'Sharon Olds', note: 'Plain, unguarded, and still surprising readers.' },
            { slug: 'pablo-neruda', name: 'Pablo Neruda', note: 'The body described through ordinary objects.' }
        ]
    },

    spirituality: {
        body: [
            'This shelf and Spiritual are near-duplicates — both came out of a scraped topic vocabulary that was never reconciled — so browse the two together and expect overlap. Religion holds the poems working inside a named tradition.',
            'What is worth saying about the subject itself: the spiritual poems that survive are almost never the confident ones. Confidence produces hymns, which do a different job. The poems people return to are the ones where something is being reached for and not reliably obtained.',
            'Rumi and Tagore are the two non-English giants here, both read in translation by nearly everyone who reads them, and both worth approaching with that in mind. Whitman is the American origin of the version with no doctrine at all.'
        ],
        startHere: [
            { slug: 'jalal-al-din-rumi', name: 'Rumi', note: 'Read in translation — check whose.' },
            { slug: 'rabindranath-tagore', name: 'Rabindranath Tagore', note: 'Translated his own work into English, which shows.' },
            { slug: 'walt-whitman', name: 'Walt Whitman', note: 'Transcendence with no doctrine attached.' },
            { slug: 'mary-oliver', name: 'Mary Oliver', note: 'The plainest possible way into the same territory.' }
        ]
    },

    dreams: {
        heading: 'About poems about dreams',
        body: [
            'Two unrelated meanings share this shelf, and knowing which you want will save you time. There are poems about sleeping and dreaming, and there are poems about ambition and hope deferred. The scraped topic vocabulary never separated them.',
            'For the second, Langston Hughes is unavoidable. "Harlem" asks what happens to a dream deferred and answers only with questions — raisin, sore, meat, syrup — before the single line that is not a question at all. The restraint is the whole poem.',
            'For the first, Coleridge\'s "Kubla Khan" is the famous case, published with a preface claiming it was composed in an opium sleep and interrupted by a visitor — a story worth treating as part of the poem rather than as biography. Poe supplies the vertiginous version.'
        ],
        startHere: [
            { slug: 'langston-hughes', name: 'Langston Hughes', note: 'A dream deferred, answered almost entirely in questions.' },
            { slug: 'samuel-taylor-coleridge', name: 'Samuel Taylor Coleridge', note: 'Kubla Khan — treat the origin story as part of the poem.' },
            { slug: 'edgar-allan-poe', name: 'Edgar Allan Poe', note: 'The dream that undermines everything around it.' },
            { slug: 'william-butler-yeats', name: 'W. B. Yeats', note: 'Tread softly — the most borrowed line about dreams.' }
        ]
    },

    autumn: {
        body: [
            'Autumn produced the single most admired short poem in English, and it is worth knowing what makes it unusual. Keats\'s "To Autumn" contains no argument, no grief and almost no speaker — it is three stanzas of description that decline to draw a conclusion, and its refusal to moralise the season is exactly why it outlasted every autumn poem that did.',
            'Hopkins takes the opposite route in "Spring and Fall", using falling leaves to tell a child she is really mourning herself, and gets there in fifteen lines.',
            'Rilke\'s autumn poem is the third essential and the bleakest: whoever has no house now will not build one, whoever is alone will stay alone. Read the three together and the season stops being decorative.'
        ],
        startHere: [
            { slug: 'john-keats', name: 'John Keats', note: 'Three stanzas that refuse to draw a conclusion.' },
            { slug: 'gerard-manley-hopkins', name: 'Gerard Manley Hopkins', note: 'Falling leaves, and what a child is really mourning.' },
            { slug: 'rainer-maria-rilke', name: 'Rainer Maria Rilke', note: 'Whoever is alone now will stay alone.' },
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'The season observed indoors, obliquely.' }
        ]
    },

    darkness: {
        body: [
            'Two literal-and-figurative senses again: night and the absence of light, and despair. The best poems on this shelf use the first to get at the second without ever announcing that they are doing so.',
            'Hopkins\'s late sonnets — sometimes called the terrible sonnets — are the most technically extraordinary despair in English, written by a Jesuit priest who could not stop working at the language even while describing a state in which nothing worked. Theodore Roethke\'s "In a Dark Time" is the American counterpart, and reaches an unnerving line about the eye beginning to see in darkness.',
            'If it is night rather than despair you want, Night is a separate shelf. If it is clinical depression, Mental Health is more honest about it than this one.'
        ],
        startHere: [
            { slug: 'gerard-manley-hopkins', name: 'Gerard Manley Hopkins', note: 'The terrible sonnets — despair at full technical stretch.' },
            { slug: 'theodore-roethke', name: 'Theodore Roethke', note: 'In a dark time, the eye begins to see.' },
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'Interior darkness charted with unsettling precision.' },
            { slug: 'edgar-allan-poe', name: 'Edgar Allan Poe', note: 'The gothic register, at its source.' }
        ]
    },

    prayer: {
        heading: 'About poems of prayer',
        body: [
            'A prayer and a poem are structurally the same object: an address to someone who does not answer in the moment. That is why the form works so well, and why the best poems here are not always devout.',
            'George Herbert wrote the definitive one — a sonnet that never uses a verb, defining prayer through a cascade of images and ending on the phrase "something understood", which concedes almost everything while sounding like an answer.',
            'Mary Oliver is the modern secular version, and said so plainly: her instruction that prayer is mostly a matter of paying attention is the most useful sentence on this shelf. Rumi supplies the ecstatic register. Faith and Religion hold the more doctrinal poems.'
        ],
        startHere: [
            { slug: 'george-herbert', name: 'George Herbert', note: 'A sonnet with no verb, ending on "something understood".' },
            { slug: 'mary-oliver', name: 'Mary Oliver', note: 'Prayer redefined as paying attention.' },
            { slug: 'gerard-manley-hopkins', name: 'Gerard Manley Hopkins', note: 'Address that turns into argument and back.' },
            { slug: 'jalal-al-din-rumi', name: 'Rumi', note: 'The ecstatic register, in translation.' }
        ]
    },

    'mental-health': {
        heading: 'About poems on mental health',
        body: [
            'The most useful thing to say about this shelf is a warning and a recommendation at once: the poems here are frequently better than the mythology around their authors, and reading them as symptoms is both a critical mistake and a disservice.',
            'Jane Kenyon\'s depression poems are the ones to start with. They almost entirely refuse metaphor — the condition is described as weather, as a physical presence, as the shape of a day — and that plainness makes them more recognisable than any figurative account.',
            'Plath, Sexton and Lowell are the confessional core and are more formally controlled than their reputations allow; read them for the technique. If you are looking for these poems because you are struggling, that is a legitimate reason to read them, and it is not the same as a reason to be alone with them.'
        ],
        startHere: [
            { slug: 'jane-kenyon', name: 'Jane Kenyon', note: 'Depression as weather and routine, almost no metaphor.' },
            { slug: 'anne-sexton', name: 'Anne Sexton', note: 'Unguarded, and far more crafted than she is credited for.' },
            { slug: 'robert-lowell', name: 'Robert Lowell', note: 'The confessional mode, invented largely here.' },
            { slug: 'sylvia-plath', name: 'Sylvia Plath', note: 'Read for the technique, not the biography.' }
        ]
    },

    romantic: {
        heading: 'About romantic poems',
        body: [
            'A shelf with an ambiguous name, and worth clarifying before you browse: these are poems of romance rather than poems of Romanticism, though the scraped topic vocabulary that produced the category was not always careful about the difference.',
            'What distinguishes romance from Love as a category is temperature and intention. Romantic poems are usually addressed to the beloved and mean to be given — which is a real constraint, because a poem written to be received cannot afford the doubt that makes many of the best love poems interesting.',
            'Elizabeth Barrett Browning\'s "How do I love thee" is the great example of the mode done at full strength, and it survives its own ubiquity. For the harder-edged versions, try Love; for the aftermath, Heartbreak.'
        ],
        startHere: [
            { slug: 'elizabeth-barrett-browning', name: 'Elizabeth Barrett Browning', note: 'Survives being the most quoted love sonnet in English.' },
            { slug: 'pablo-neruda', name: 'Pablo Neruda', note: 'Romance grounded in ordinary domestic things.' },
            { slug: 'e-e-cummings', name: 'E. E. Cummings', note: 'Carries your heart — sentimental and formally radical.' },
            { slug: 'william-shakespeare', name: 'William Shakespeare', note: 'The sonnets, including the ones that mock the mode.' }
        ]
    },

    night: {
        heading: 'About poems about night',
        body: [
            'Night poems work because darkness removes the visual field and leaves a poet with sound, memory and their own mind — which is most of what a lyric poem runs on anyway.',
            'Frost\'s "Acquainted with the Night" is the compact masterpiece: a terza rima walk through a city, no event, no explanation, and a clock that declares the time neither wrong nor right. It is a poem about depression that never uses the word.',
            'Sara Teasdale and Walter de la Mare are the quieter voices worth finding here, and Rilke\'s nights are where the subject turns metaphysical. Darkness holds the despairing version; Dreams the sleeping one.'
        ],
        startHere: [
            { slug: 'robert-frost', name: 'Robert Frost', note: 'A walk, a clock, and no explanation offered.' },
            { slug: 'sara-teasdale', name: 'Sara Teasdale', note: 'Short, musical, and darker than it first sounds.' },
            { slug: 'walter-de-la-mare', name: 'Walter de la Mare', note: 'The listener in an empty house.' },
            { slug: 'rainer-maria-rilke', name: 'Rainer Maria Rilke', note: 'Night as the condition for thinking at all.' }
        ]
    },

    home: {
        heading: 'About poems about home',
        body: [
            'Home is a subject poets almost always approach from outside it — from exile, from a car in the driveway, from thirty years later. A poem written comfortably at home tends not to be about home at all.',
            'Frost supplied the definition everyone quotes, in "The Death of the Hired Man": home is the place where, when you have to go there, they have to take you in. It is worth noticing that this is said by one character and immediately disputed by another. The poem does not endorse it.',
            'Edward Thomas is the English poet of the almost-home — landscapes recognised and never quite arrived at — and Naomi Shihab Nye writes the version where home is in two countries at once. See also Nostalgia, Immigration and Family.'
        ],
        startHere: [
            { slug: 'robert-frost', name: 'Robert Frost', note: 'The famous definition — and the character who disputes it.' },
            { slug: 'edward-thomas', name: 'Edward Thomas', note: 'Places recognised and never quite arrived at.' },
            { slug: 'naomi-shihab-nye', name: 'Naomi Shihab Nye', note: 'Home in two countries simultaneously.' },
            { slug: 'c-p-cavafy', name: 'C. P. Cavafy', note: 'The city you carry with you wherever you go.' }
        ]
    },

    school: {
        heading: 'About poems about school',
        body: [
            'A thin shelf in the canon and a busy one in practice — school is written about constantly by people who are in it, and comparatively rarely by poets who have left. That imbalance is visible here.',
            'The best-known poem adjacent to the subject is Gwendolyn Brooks\'s "We Real Cool", spoken by seven boys who have left school, and it is eight lines long, ends on "we die soon", and does more with the word "we" than most poems manage with a page.',
            'Billy Collins\'s "Introduction to Poetry" is the other one to read, and it is about the classroom rather than the school: a teacher watching students tie a poem to a chair and beat a confession out of it. If you are here for poems to use in a classroom, Childhood and Growing Up have more.'
        ],
        startHere: [
            { slug: 'gwendolyn-brooks', name: 'Gwendolyn Brooks', note: 'Eight lines, seven boys, one devastating pronoun.' },
            { slug: 'billy-collins', name: 'Billy Collins', note: 'Students beating a confession out of a poem.' },
            { slug: 'seamus-heaney', name: 'Seamus Heaney', note: 'Being called out of class, in "Mid-Term Break".' },
            { slug: 'theodore-roethke', name: 'Theodore Roethke', note: 'A teacher\'s poems about being taught.' }
        ]
    },

    marriage: {
        heading: 'About poems about marriage',
        body: [
            'Marriage is the long middle of love, and it is a harder subject than either the beginning or the end, because it has no natural shape — no first meeting, no final scene, just duration. The poems that work usually find one small object and let it carry decades.',
            'Anne Bradstreet, writing in Massachusetts in the 1600s, produced the earliest great English marriage poem, and it is unembarrassed: if ever two were one, then surely we. Hardy is the counter-case and the more instructive one — his best marriage poems were written after his wife died, about years in which they had stopped speaking.',
            'Donald Hall and Jane Kenyon were married and both are here, which makes reading them alongside each other unlike anything else on the site. Sharon Olds\'s poems on divorce are the modern end of the arc.'
        ],
        startHere: [
            { slug: 'anne-bradstreet', name: 'Anne Bradstreet', note: 'The earliest great one, from 1600s Massachusetts.' },
            { slug: 'thomas-hardy', name: 'Thomas Hardy', note: 'Written after her death, about the silent years.' },
            { slug: 'jane-kenyon', name: 'Jane Kenyon', note: 'Read beside Donald Hall — the same house, two voices.' },
            { slug: 'sharon-olds', name: 'Sharon Olds', note: 'The end of one, recorded without flinching.' }
        ]
    },

    beauty: {
        heading: 'About poems about beauty',
        body: [
            'Beauty is the subject most likely to produce a bad poem, because admiration is not an idea and a poem that only admires has nowhere to go. The good ones almost always complicate it in the second half.',
            'Keats\'s urn is the canonical case and the argument about its ending has run for two hundred years: beauty is truth, truth beauty — is that the poet speaking, the urn speaking, or a piece of cold comfort the poem does not endorse? The poem is deliberately unresolvable and better for it.',
            'Hopkins\'s "Pied Beauty" is the corrective, praising what is dappled, freckled, spare and strange rather than what is symmetrical. Shakespeare\'s sonnet 130 is the joke version, cataloguing his mistress\'s failure to resemble any conventional simile and preferring her anyway.'
        ],
        startHere: [
            { slug: 'john-keats', name: 'John Keats', note: 'The urn, and two centuries of arguing about its last line.' },
            { slug: 'gerard-manley-hopkins', name: 'Gerard Manley Hopkins', note: 'Praises the dappled and the strange instead.' },
            { slug: 'william-shakespeare', name: 'William Shakespeare', note: 'Sonnet 130 — the joke at the tradition\'s expense.' },
            { slug: 'sara-teasdale', name: 'Sara Teasdale', note: 'Beauty as something to be traded for, at a price.' }
        ]
    },

    imagination: {
        heading: 'About poems on imagination',
        body: [
            'The Romantics made imagination a serious philosophical claim rather than a synonym for making things up, and this shelf still runs on that argument: that the mind partly creates what it perceives, and that poetry is the evidence.',
            'Coleridge is where the theory lives, and he distinguished imagination from mere fancy at length in prose that is heavier going than the poems. Blake is where the claim is at its most absolute — he saw a world in a grain of sand and did not consider that a figure of speech.',
            'Wallace Stevens spent the twentieth century restating the question without settling it, and is the best modern place to watch imagination and reality argue. See also Fantasy and Dreams for the lighter versions.'
        ],
        startHere: [
            { slug: 'samuel-taylor-coleridge', name: 'Samuel Taylor Coleridge', note: 'Where the theory of imagination actually lives.' },
            { slug: 'william-blake', name: 'William Blake', note: 'A world in a grain of sand — not, for him, a metaphor.' },
            { slug: 'wallace-stevens', name: 'Wallace Stevens', note: 'A century of restating the question.' },
            { slug: 'john-keats', name: 'John Keats', note: 'Negative capability: staying in doubt on purpose.' }
        ]
    },

    morning: {
        heading: 'About morning poems',
        body: [
            'Morning poems divide neatly into the aubade — a lover complaining that dawn has arrived too early — and the poem of ordinary waking, which is a much later invention and a quieter one.',
            'Donne\'s "The Sun Rising" is the aubade at its most audacious: he tells the sun off for interrupting, then argues that the bed contains the whole world so the sun may as well shine only there. The bravado is the point.',
            'Wallace Stevens\'s "Sunday Morning" is the other pole — a woman not at church, considering what a life without an afterlife would need to contain — and it is one of the great American poems. Night is the opposite shelf.'
        ],
        startHere: [
            { slug: 'john-donne', name: 'John Donne', note: 'Tells the sun off for arriving, then out-argues it.' },
            { slug: 'wallace-stevens', name: 'Wallace Stevens', note: '"Sunday Morning" — a life measured without an afterlife.' },
            { slug: 'gerard-manley-hopkins', name: 'Gerard Manley Hopkins', note: 'Dawn described as if language were barely adequate.' },
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'Morning as an event that happens to a mind.' }
        ]
    },

    poverty: {
        heading: 'About poems on poverty',
        body: [
            'The reliable failure of a poem about poverty is pity, which places the poet above the subject and gives a reader something comfortable to feel. The poems that last either come from inside the condition or describe it flatly enough to remove the cushion.',
            'Blake\'s "London" is the model of the second kind: a walk through the city naming chimney-sweepers, soldiers and infants in a metre so regular it becomes oppressive, with no plea attached. He does not ask for anything, which is why it still works.',
            'Langston Hughes and Carl Sandburg wrote poverty as ordinary rather than exceptional, and Philip Levine did the same for industrial work at the edge of it. See also Social Justice and Social Commentaries.'
        ],
        startHere: [
            { slug: 'william-blake', name: 'William Blake', note: '"London" — names everything, asks for nothing.' },
            { slug: 'langston-hughes', name: 'Langston Hughes', note: 'Poverty as ordinary, not exceptional.' },
            { slug: 'philip-levine', name: 'Philip Levine', note: 'Written from inside the work, not about it.' },
            { slug: 'carl-sandburg', name: 'Carl Sandburg', note: 'Wages and weather, without a plea attached.' }
        ]
    },

    time: {
        heading: 'About poems about time',
        body: [
            'Time is the oldest subject in the collection and the one most likely to be the real subject of a poem filed elsewhere. Love poems are usually about time; so are most nature poems.',
            'Shakespeare\'s sonnets contain the fullest working-through: time as the enemy, procreation as one answer, and then the immodest claim that the poem itself is the answer — so long as men can breathe, this gives life to thee. He was right, which is the strangest part.',
            'Marvell\'s "To His Coy Mistress" is the argument version, using mortality as a seduction tactic and producing the winged chariot everyone quotes. Eliot\'s "Four Quartets" is where it becomes philosophy. See also Aging, Memory and Nostalgia.'
        ],
        startHere: [
            { slug: 'william-shakespeare', name: 'William Shakespeare', note: 'The sonnets: time as enemy, the poem as the answer.' },
            { slug: 'andrew-marvell', name: 'Andrew Marvell', note: 'Mortality deployed as a seduction tactic.' },
            { slug: 't-s-eliot', name: 'T. S. Eliot', note: 'Where the subject turns into philosophy.' },
            { slug: 'thomas-hardy', name: 'Thomas Hardy', note: 'Time measured in what it took away.' }
        ]
    },

    faith: {
        heading: 'About poems about faith',
        body: [
            'Overlaps Religion and Prayer, and the distinction such as it is: Religion holds poems about a tradition, Prayer holds poems that address, and this shelf holds poems about the state of believing — including, very often, not managing to.',
            'That is not a modern development. Herbert\'s poems in the 1630s are full of rebellion, exhaustion and being talked back to; Hopkins\'s late sonnets are a Jesuit priest recording desolation in the most intense language he could build. Doubt has been the engine of devotional poetry throughout, not a late arrival to it.',
            'Dickinson is the essential American case, and unusually hard to place: she wrote constantly about God without belonging to a church, and the poems are neither believing nor unbelieving in any way that resolves.'
        ],
        startHere: [
            { slug: 'george-herbert', name: 'George Herbert', note: 'Rebellion and exhaustion, in the 1630s.' },
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'Constantly about God, never resolving either way.' },
            { slug: 'gerard-manley-hopkins', name: 'Gerard Manley Hopkins', note: 'Desolation recorded at maximum technical intensity.' },
            { slug: 'christina-rossetti', name: 'Christina Rossetti', note: 'Belief held plainly, and not without cost.' }
        ]
    },

    america: {
        heading: 'About poems about America',
        body: [
            'American poetry has argued with America from the beginning, and this shelf is mostly that argument rather than celebration of it.',
            'Whitman set the terms: a catalogue of occupations and bodies, an insistence that a nation could be written by listing it, and a self large enough to contain contradictions. Almost every poem here is either extending that or answering it.',
            'Langston Hughes wrote the most durable answer — "Let America be America again", which quotes the promise and then interrupts itself, in parentheses, to say it never was. Emma Lazarus wrote the promise itself. Ginsberg wrote the exasperated middle-of-the-night version. Read the four in that order.'
        ],
        startHere: [
            { slug: 'walt-whitman', name: 'Walt Whitman', note: 'Set the terms: a nation written by being listed.' },
            { slug: 'langston-hughes', name: 'Langston Hughes', note: 'Quotes the promise, then interrupts it in parentheses.' },
            { slug: 'emma-lazarus', name: 'Emma Lazarus', note: 'The promise itself, in fourteen lines.' },
            { slug: 'allen-ginsberg', name: 'Allen Ginsberg', note: 'The exasperated, funny, middle-of-the-night version.' }
        ]
    },

    lgbtq: {
        heading: 'About LGBTQ poetry',
        body: [
            'This shelf has a history of concealment attached to it, and reading it well means noticing what a poem could not say. For most of the tradition the choice was between silence, coded language, and ungendered pronouns.',
            'Whitman is the great ambiguous ancestor — the Calamus poems are as open as mid-nineteenth-century America permitted and he spent decades deflecting questions about them. Cavafy, writing in Alexandria and mostly unpublished in his lifetime, is the opposite case: entirely specific about young men and rooms, and unbothered.',
            'The contemporary poets are where the concealment ends and the formal invention begins. Audre Lorde, Danez Smith, Jericho Brown and Ocean Vuong are all writing at the intersection of desire, race and the body, and Brown\'s invented form — the duplex — is one of the few genuinely new fixed forms of the century.'
        ],
        startHere: [
            { slug: 'walt-whitman', name: 'Walt Whitman', note: 'The Calamus poems, and a lifetime of deflecting questions.' },
            { slug: 'c-p-cavafy', name: 'C. P. Cavafy', note: 'Entirely specific, and mostly unpublished while alive.' },
            { slug: 'jericho-brown', name: 'Jericho Brown', note: 'Invented the duplex — a genuinely new fixed form.' },
            { slug: 'audre-lorde', name: 'Audre Lorde', note: 'Desire and identity treated as one subject.' }
        ]
    },

    violence: {
        heading: 'About poems about violence',
        body: [
            'The problem every poem here has to solve is that describing violence well risks making it attractive, and describing it badly makes it abstract. The tradition\'s answer, arrived at slowly, is to stay with the physical detail and refuse the frame that would make it meaningful.',
            'Wilfred Owen is where English poetry learned this. The gas attack in "Dulce et Decorum Est" is rendered as a body being loaded onto a wagon, and the poem ends by naming the lie it was written against rather than by drawing a lesson.',
            'Gwendolyn Brooks brought the same attention to domestic and street violence in American cities, and Yusef Komunyakaa to Vietnam remembered decades later. War holds the organised version; Abuse the intimate one.'
        ],
        startHere: [
            { slug: 'wilfred-owen', name: 'Wilfred Owen', note: 'The physical detail, and no lesson drawn.' },
            { slug: 'gwendolyn-brooks', name: 'Gwendolyn Brooks', note: 'The same attention brought to a city street.' },
            { slug: 'yusef-komunyakaa', name: 'Yusef Komunyakaa', note: 'Violence recalled obliquely, through surfaces.' },
            { slug: 'claudia-rankine', name: 'Claudia Rankine', note: 'The slow, cumulative, everyday kind.' }
        ]
    },

    rain: {
        heading: 'About poems about rain',
        body: [
            'Rain is the most useful weather a poem can have, because it does three jobs at once: it makes a sound, it keeps people indoors, and it is the standard English shorthand for sadness — which means a poet can also refuse that shorthand and get an effect from the refusal.',
            'Edward Thomas\'s "Rain" is the essential one and it does refuse: written in a hut at midnight during the First World War, it uses rain not as melancholy but as a solvent, dissolving the speaker\'s attachment to being alive. He was killed at Arras two years later.',
            'Longfellow supplied the version everyone knows — into each life some rain must fall — which has been quoted into meaninglessness and is better in context. Hopkins and Dickinson both write weather as an event happening to a mind.'
        ],
        startHere: [
            { slug: 'edward-thomas', name: 'Edward Thomas', note: 'Midnight rain in a wartime hut; not melancholy, a solvent.' },
            { slug: 'henry-wadsworth-longfellow', name: 'Henry Wadsworth Longfellow', note: 'The over-quoted line, much better in context.' },
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'Weather as something that happens to a mind.' },
            { slug: 'gerard-manley-hopkins', name: 'Gerard Manley Hopkins', note: 'Rain given more sonic attention than it can bear.' }
        ]
    },
    christmas: {
        heading: 'About Christmas poems',
        body: [
            'Christmas poems have a harder job than Christmas carols, which is why the good ones are almost all sceptical. A carol can simply celebrate; a poem published for adults has to earn the feeling, and the usual route is doubt.',
            'Hardy\'s "The Oxen" is the model: an old story that the animals kneel at midnight, a speaker who no longer believes it, and a last stanza saying he would go and look, hoping it might be so. Eliot\'s "Journey of the Magi" is the other essential — the nativity narrated by an exhausted traveller who is not sure whether he witnessed a birth or a death. Rossetti supplies the version that became a carol anyway.'
        ],
        startHere: [
            { slug: 'thomas-hardy', name: 'Thomas Hardy', note: 'Does not believe it, and would go and look anyway.' },
            { slug: 't-s-eliot', name: 'T. S. Eliot', note: 'The nativity told by a traveller who is not sure what he saw.' },
            { slug: 'christina-rossetti', name: 'Christina Rossetti', note: 'Written as a poem, sung ever since.' },
            { slug: 'clement-clarke-moore', name: 'Clement Clarke Moore', note: 'Invented most of the modern Santa Claus in 1823.' }
        ]
    },

    flower: {
        heading: 'About poems about flowers',
        body: [
            'The flower is poetry\'s oldest shorthand for beauty that will not last, which means most flower poems are really about time — and the interesting ones know that and do something else with it.',
            'Blake\'s "The Sick Rose" is eight lines long, contains an invisible worm, and has been read as being about disease, sexuality, secrecy and corruption without ever settling. Wordsworth\'s daffodils supply the opposite: the flowers do their work later, from memory, when the poet is lying on his couch. Burns\'s red rose is where the simile that everyone uses came from.'
        ],
        startHere: [
            { slug: 'william-blake', name: 'William Blake', note: 'Eight lines, one invisible worm, no settled reading.' },
            { slug: 'william-wordsworth', name: 'William Wordsworth', note: 'The daffodils do their real work later, from memory.' },
            { slug: 'robert-burns', name: 'Robert Burns', note: 'The source of the simile everybody borrows.' },
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'A serious botanist, which shows in the precision.' }
        ]
    },

    baby: {
        heading: 'About poems about babies',
        body: [
            'New-baby poems are unusually likely to be sentimental and unusually good when they are not. The difference is almost always whether the poem admits to fear alongside the joy.',
            'Plath\'s "Morning Song" is the great modern example and opens with love setting the baby going like a fat gold watch — an image that is admiring and slightly alarming at once — before admitting that she is no more the child\'s mother than a cloud is. Blake\'s "Infant Joy" is the pure unmixed version, and Anne Bradstreet, writing in the 1600s with high infant mortality as an ordinary fact, is the most unsparing.'
        ],
        startHere: [
            { slug: 'sylvia-plath', name: 'Sylvia Plath', note: 'Admiring and alarmed in the same line.' },
            { slug: 'william-blake', name: 'William Blake', note: 'The pure, unmixed version of the feeling.' },
            { slug: 'anne-bradstreet', name: 'Anne Bradstreet', note: 'Written when losing a child was ordinary.' },
            { slug: 'lucille-clifton', name: 'Lucille Clifton', note: 'The body and its lineage, celebrated briefly.' }
        ]
    },

    loss: {
        heading: 'About poems about loss',
        body: [
            'Broader than Grief, which is specifically about death. Loss covers everything else a person can be deprived of — a place, a language, a capacity, a version of themselves — and it is often the more useful shelf.',
            'Elizabeth Bishop\'s "One Art" is the poem to read first and possibly the best villanelle in English. It insists across five stanzas that losing is easy and gets progressively less convincing, until the last line breaks its own composure with a parenthesis and an instruction to write it. The form does the argument; the crack in the form does the feeling.'
        ],
        startHere: [
            { slug: 'elizabeth-bishop', name: 'Elizabeth Bishop', note: '"One Art" — the form argues, the crack in it feels.' },
            { slug: 'thomas-hardy', name: 'Thomas Hardy', note: 'A career built out of what went missing.' },
            { slug: 'a-e-housman', name: 'A. E. Housman', note: 'Loss of a place and a time, named exactly.' },
            { slug: 'w-s-merwin', name: 'W. S. Merwin', note: 'Elegies for species, forests and whole languages.' }
        ]
    },

    trees: {
        heading: 'About poems about trees',
        body: [
            'The most famous tree poem in English is Joyce Kilmer\'s, and it is worth reading precisely because it is the standard example of well-meant verse that critics have used as a punching bag for a century. Read it, then read Hopkins.',
            'Hopkins\'s "Binsey Poplars", written after a row of trees he loved was felled, is the poem that gets the subject right: it is furious, technically extraordinary, and about how a landscape can be unmade by people who did not mean any harm. Frost\'s "Birches" is the other essential, and is really about wanting to leave the earth briefly and be returned to it.'
        ],
        startHere: [
            { slug: 'gerard-manley-hopkins', name: 'Gerard Manley Hopkins', note: 'Written in fury after a row of poplars was felled.' },
            { slug: 'robert-frost', name: 'Robert Frost', note: 'Leaving the earth briefly, and being sent back.' },
            { slug: 'joyce-kilmer', name: 'Joyce Kilmer', note: 'The famous one — read it, then read Hopkins.' },
            { slug: 'mary-oliver', name: 'Mary Oliver', note: 'Trees as company rather than as symbol.' }
        ]
    },

    abuse: {
        heading: 'About poems on abuse',
        body: [
            'A shelf to approach carefully, and one where the poems are frequently doing something more careful than their reputations suggest. The recurring formal problem is that plain narration can re-inflict the event, so many of these poems work by displacement — a fairy tale, a myth, a third person.',
            'Anne Sexton\'s Transformations retells Grimm as an adult with a history, and the fairy-tale surface is what makes the material bearable and sharp at once. Plath\'s "Daddy" is the most forceful and the most contested — it reaches for Holocaust imagery to describe a private grievance, a choice argued about since publication and one you should judge for yourself.'
        ],
        startHere: [
            { slug: 'anne-sexton', name: 'Anne Sexton', note: 'Grimm retold by an adult with a history.' },
            { slug: 'sylvia-plath', name: 'Sylvia Plath', note: 'Forceful, contested — read it critically.' },
            { slug: 'lucille-clifton', name: 'Lucille Clifton', note: 'Very short poems carrying very heavy material.' },
            { slug: 'warsan-shire', name: 'Warsan Shire', note: 'Contemporary, direct, and formally careful.' }
        ]
    },

    healing: {
        heading: 'About poems about healing',
        body: [
            'Poems of recovery are harder to write than poems of damage, because damage has narrative shape and healing mostly does not — it is undramatic, non-linear, and tends to arrive as an absence of something rather than a presence.',
            'The poems that manage it usually register the change in a small physical fact rather than announcing it. Lucille Clifton\'s "won\'t you celebrate with me" is the compact case, ending on a life that has tried to kill her and failed. Naomi Shihab Nye\'s "Kindness" argues that you have to lose things before you can know it, which is bleaker and more convincing than most poems on this shelf.'
        ],
        startHere: [
            { slug: 'lucille-clifton', name: 'Lucille Clifton', note: 'Something has tried to kill her and has failed.' },
            { slug: 'naomi-shihab-nye', name: 'Naomi Shihab Nye', note: '"Kindness" — you have to lose first.' },
            { slug: 'mary-oliver', name: 'Mary Oliver', note: 'Recovery as attention, practised daily.' },
            { slug: 'jalal-al-din-rumi', name: 'Rumi', note: 'The wound as the place the light enters.' }
        ]
    },

    stars: {
        heading: 'About poems about the stars',
        body: [
            'Star poems are almost always about scale — a person looking up and adjusting their estimate of their own size — and the best of them turn that into an argument rather than a mood.',
            'Whitman\'s "When I Heard the Learn\'d Astronomer" makes the argument explicitly by walking out of a lecture to look at the sky in silence, and it is the origin of a long quarrel in poetry about whether measurement destroys wonder. Hopkins\'s "The Starlight Night" is the answer from the other side, piling up so much precise detail that accuracy becomes ecstasy.'
        ],
        startHere: [
            { slug: 'walt-whitman', name: 'Walt Whitman', note: 'Walks out of the lecture to look at the sky.' },
            { slug: 'gerard-manley-hopkins', name: 'Gerard Manley Hopkins', note: 'Precision piled up until it becomes ecstasy.' },
            { slug: 'sara-teasdale', name: 'Sara Teasdale', note: 'Short, musical, and quietly bleak about it.' },
            { slug: 'robert-frost', name: 'Robert Frost', note: 'Asks a star for something steadying, half-ironically.' }
        ]
    },

    spring: {
        heading: 'About spring poems',
        body: [
            'Spring is the season poets distrust. Autumn and winter get straightforward treatment; spring almost always arrives with a complication attached, because renewal is exactly the kind of consolation a serious poem is reluctant to accept.',
            'Hopkins\'s "Spring" starts in pure delight and turns, in the sestet, into anxiety about innocence being lost. Millay\'s "Spring" opens by asking what the point of April is and calls the world an idiot babbling flowers. Cummings\'s "in Just-" hides a goat-footed balloon man in the middle of a children\'s springtime. Chaucer, at the head of the whole tradition, at least meant it.'
        ],
        startHere: [
            { slug: 'gerard-manley-hopkins', name: 'Gerard Manley Hopkins', note: 'Begins in delight and turns anxious by the sestet.' },
            { slug: 'edna-st-vincent-millay', name: 'Edna St. Vincent Millay', note: 'Asks what April is for and is not impressed.' },
            { slug: 'e-e-cummings', name: 'E. E. Cummings', note: 'Something unsettling hidden in a children\'s spring.' },
            { slug: 'geoffrey-chaucer', name: 'Geoffrey Chaucer', note: 'The head of the tradition, and sincere about it.' }
        ]
    },

    environment: {
        heading: 'About poems on the environment',
        body: [
            'The direct descendant of pastoral, with the consolation removed. Where a nature poem can end in restoration, these end in accounting — and the shift is recent enough that you can watch it happen across individual careers.',
            'W. S. Merwin is the essential figure, writing elegies for species and forests decades before that became a recognised subject, and eventually planting a palm forest on Maui as a second answer to the same problem. Hopkins got there first, in the 1870s: "God\'s Grandeur" describes a world seared, bleared and smeared with trade, which is an industrial-pollution poem written before the vocabulary existed.'
        ],
        startHere: [
            { slug: 'w-s-merwin', name: 'W. S. Merwin', note: 'Ecological elegy before it was a category.' },
            { slug: 'gerard-manley-hopkins', name: 'Gerard Manley Hopkins', note: 'Industrial pollution, described in the 1870s.' },
            { slug: 'wendell-berry', name: 'Wendell Berry', note: 'Farming, and staying put, as an argument.' },
            { slug: 'robinson-jeffers', name: 'Robinson Jeffers', note: 'Argued humanity mattered less than the coastline.' }
        ]
    },

    moon: {
        heading: 'About poems about the moon',
        body: [
            'The moon has been asked to stand for so much — chastity, madness, women, constancy, inconstancy — that a modern poem usually has to fight the accumulated symbolism before it can see anything.',
            'Plath\'s "The Moon and the Yew Tree" is the great refusal: the moon is no door, it is a face in its own right, white as a knuckle and terribly upset. Larkin\'s "Sad Steps" does the same thing comically, catching himself being moved by the moon at four in the morning and mocking the impulse before admitting it. Sidney\'s Elizabethan sonnet to the moon is the tradition both are pushing against.'
        ],
        startHere: [
            { slug: 'sylvia-plath', name: 'Sylvia Plath', note: 'The moon refused as a symbol and seen as a face.' },
            { slug: 'philip-larkin', name: 'Philip Larkin', note: 'Mocks himself for being moved, then is moved.' },
            { slug: 'sir-philip-sidney', name: 'Sir Philip Sidney', note: 'The Elizabethan tradition the others push against.' },
            { slug: 'sappho', name: 'Sappho', note: 'The oldest fragments, and still the plainest.' }
        ]
    },

    'slavery-and-freedom': {
        heading: 'About poems on slavery and freedom',
        body: [
            'Phillis Wheatley is where this begins in English: kidnapped as a child, enslaved in Boston, and the first African American to publish a book of poems, in 1773 — a book prefaced by a panel of men attesting that she had really written it. That document is part of the reading.',
            'Robert Hayden\'s "Middle Passage" is the twentieth century\'s central work on the subject, assembled from ship logs, testimony and hymn fragments so that the history speaks in its own contradictory voices. Paul Laurence Dunbar\'s caged bird — a generation before Angelou borrowed the image — is the compact statement of the same theme.'
        ],
        startHere: [
            { slug: 'phillis-wheatley', name: 'Phillis Wheatley', note: 'First African American poet in print, 1773.' },
            { slug: 'robert-hayden', name: 'Robert Hayden', note: '"Middle Passage" — history in its own voices.' },
            { slug: 'paul-laurence-dunbar', name: 'Paul Laurence Dunbar', note: 'The caged bird, a generation before Angelou.' },
            { slug: 'langston-hughes', name: 'Langston Hughes', note: 'Rivers, memory and inheritance in thirteen lines.' }
        ]
    },

    hope: {
        heading: 'About poems about hope',
        body: [
            'A small shelf here and a large subject, and the reason is that hope is genuinely difficult to write. Despair supplies its own detail; hope tends toward assertion, and assertion is not a poem.',
            'The ones that work earn it. Dickinson\'s hope is a thing with feathers that never stops and never asks for a crumb — and note the poem never claims the bird is right about anything. Heaney\'s lines about hope and history rhyming come from a translation of Sophocles and are careful to say it happens once in a lifetime. Angelou\'s "Still I Rise" is the defiant register and is better read aloud than on the page.'
        ],
        startHere: [
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'The bird never stops — and is never said to be right.' },
            { slug: 'seamus-heaney', name: 'Seamus Heaney', note: 'Hope and history rhyme once in a lifetime, he says.' },
            { slug: 'maya-angelou', name: 'Maya Angelou', note: 'Defiance; much better aloud than on the page.' },
            { slug: 'langston-hughes', name: 'Langston Hughes', note: 'Hold fast to dreams — and what happens if you do not.' }
        ]
    },

    silence: {
        heading: 'About poems about silence',
        body: [
            'A poem about silence is a contradiction being performed, and the good ones know it. The subject forces a poet to demonstrate rather than describe, usually through space on the page, short lines, or a refusal to finish a sentence.',
            'Marianne Moore\'s "Silence" is the sly example: it quotes her father approvingly on the virtue of restraint, at length, in a poem — the joke is structural. Rilke is the serious version, treating silence as the condition in which anything real can be heard.'
        ],
        startHere: [
            { slug: 'marianne-moore', name: 'Marianne Moore', note: 'Quotes her father on restraint, at length. The joke is structural.' },
            { slug: 'rainer-maria-rilke', name: 'Rainer Maria Rilke', note: 'Silence as the precondition for hearing anything.' },
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'The dashes are the silence, doing the work.' },
            { slug: 'w-s-merwin', name: 'W. S. Merwin', note: 'Abandoned punctuation entirely, and meant it.' }
        ]
    },

    addiction: {
        heading: 'About poems on addiction',
        body: [
            'A shelf with an unusual relationship to its authors: several of the poets here wrote about substances they were using, and the poems are neither confessions nor advertisements, which is what makes them worth reading.',
            'Coleridge is the historical case — "Kubla Khan" arrived with a preface blaming opium and an interrupting visitor, a story that is doing literary work whether or not it is true. Baudelaire made intoxication a stated aesthetic programme. Bukowski is the modern register, and his flatness about it is the point rather than a lack of craft.'
        ],
        startHere: [
            { slug: 'samuel-taylor-coleridge', name: 'Samuel Taylor Coleridge', note: 'The opium preface, doing literary work either way.' },
            { slug: 'charles-baudelaire', name: 'Charles Baudelaire', note: 'Intoxication as a stated programme.' },
            { slug: 'charles-bukowski', name: 'Charles Bukowski', note: 'Flatness as the technique, not the absence of one.' },
            { slug: 'anne-sexton', name: 'Anne Sexton', note: 'Dependence written from inside it.' }
        ]
    },

    garden: {
        heading: 'About poems about gardens',
        body: [
            'The garden is nature with a person\'s intentions in it, which makes it a more complicated subject than landscape. Every garden poem is partly about control, and usually about its limits.',
            'Marvell\'s "The Garden" is the seventeenth-century high point and contains the line about a green thought in a green shade, which is as close as English poetry gets to describing a mind at rest. Ross Gay is the contemporary equivalent and writes gardening as delight, labour and grief at once. Dickinson, a serious gardener, is precise in a way that only someone who actually grew things could be.'
        ],
        startHere: [
            { slug: 'andrew-marvell', name: 'Andrew Marvell', note: 'A green thought in a green shade.' },
            { slug: 'ross-gay', name: 'Ross Gay', note: 'Delight, labour and grief in the same beds.' },
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'Precise in the way only a real gardener is.' },
            { slug: 'wendell-berry', name: 'Wendell Berry', note: 'Cultivation as an argument about how to live.' }
        ]
    },

    dance: {
        heading: 'About poems about dance',
        body: [
            'Dance gives poetry its favourite image for the impossibility of separating a thing from its doing, and one line has dominated the subject for a century.',
            'Yeats ends "Among School Children" by asking how we can know the dancer from the dance — a question about art, identity and unity that gets quoted far outside poetry. Roethke\'s "My Papa\'s Waltz" is the domestic counterweight, a waltz round a kitchen that readers still cannot agree is warm or frightening. Rumi supplies the ecstatic tradition, where dance is the point rather than the metaphor.'
        ],
        startHere: [
            { slug: 'william-butler-yeats', name: 'W. B. Yeats', note: 'How can we know the dancer from the dance.' },
            { slug: 'theodore-roethke', name: 'Theodore Roethke', note: 'A waltz round a kitchen, readable two ways.' },
            { slug: 'jalal-al-din-rumi', name: 'Rumi', note: 'Where dance is the practice, not the image.' },
            { slug: 'langston-hughes', name: 'Langston Hughes', note: 'Written to be moved to, in blues and jazz time.' }
        ]
    },

    living: {
        heading: 'About poems about living',
        body: [
            'A near-twin of Life, and both are catch-alls: poems arrive here when their subject is simply being alive rather than any particular occasion. The two categories came out of a scraped topic vocabulary that never reconciled them.',
            'That makes this a browsing shelf rather than a searching one. If you know roughly what you want, the narrower categories will serve you better — Aging, Work, Memory, Death — and Life itself has considerably more in it.'
        ],
        startHere: [
            { slug: 'ted-kooser', name: 'Ted Kooser', note: 'The ordinary described exactly and left alone.' },
            { slug: 'walt-whitman', name: 'Walt Whitman', note: 'The opposite instinct: everything, catalogued.' },
            { slug: 'mary-oliver', name: 'Mary Oliver', note: 'What do you plan to do with your one wild life.' },
            { slug: 'philip-larkin', name: 'Philip Larkin', note: 'The same subject, without the encouragement.' }
        ]
    },

    'lost-love': {
        heading: 'About poems about lost love',
        body: [
            'Distinct from Heartbreak by time elapsed. Heartbreak is written in the wound; these are written years later, when the person has become a fact rather than an injury — which is a colder and often better poem.',
            'Hardy is the master of the mode and its most extreme case: his finest love poems were written in his seventies about a wife who had died after decades of estrangement, and they are full of a guilt no reconciliation is available for. Cavafy is the other pole — remembering vanished young men precisely, with pleasure and without regret.'
        ],
        startHere: [
            { slug: 'thomas-hardy', name: 'Thomas Hardy', note: 'Written in his seventies, about the silent years.' },
            { slug: 'c-p-cavafy', name: 'C. P. Cavafy', note: 'Remembers precisely, and does not regret.' },
            { slug: 'edna-st-vincent-millay', name: 'Edna St. Vincent Millay', note: 'Forgotten lovers, listed without apology.' },
            { slug: 'a-e-housman', name: 'A. E. Housman', note: 'Attachment that was never spoken aloud.' }
        ]
    },

    space: {
        heading: 'About poems about space',
        body: [
            'Space poetry is newer than most shelves here and splits along one line: whether scientific knowledge enlarges wonder or replaces it. That argument is older than spaceflight — Whitman walked out of an astronomy lecture in 1865 to settle it in favour of silence.',
            'Tracy K. Smith\'s "Life on Mars" is where the subject currently lives, written partly in memory of her father, who worked on the Hubble telescope, and it manages to be about physics, grief and David Bowie at once without any of the three being decorative.'
        ],
        startHere: [
            { slug: 'tracy-k-smith', name: 'Tracy K. Smith', note: 'Physics, grief and Bowie, none of them decorative.' },
            { slug: 'walt-whitman', name: 'Walt Whitman', note: 'Left the lecture; settled the argument for silence.' },
            { slug: 'robert-frost', name: 'Robert Frost', note: 'Empty spaces between stars, and nearer ones.' },
            { slug: 'archibald-macleish', name: 'Archibald MacLeish', note: 'Wrote on Earth seen whole from outside it.' }
        ]
    },

    'goodbye-and-farewell': {
        heading: 'About poems of farewell',
        body: [
            'A parting poem has one structural advantage over almost every other kind: it has a natural ending built into its subject, and the whole art is in refusing the obvious one.',
            'Donne\'s "A Valediction: Forbidding Mourning" is the greatest example and works by forbidding the expected reaction outright — no tears, no sighs — before producing the compass image that has been borrowed ever since. Rossetti\'s "Remember" does the opposite and more generously: remember me, and then, halfway through, better to forget and smile than remember and be sad.'
        ],
        startHere: [
            { slug: 'john-donne', name: 'John Donne', note: 'Forbids the expected reaction, then argues for it.' },
            { slug: 'christina-rossetti', name: 'Christina Rossetti', note: 'Asks to be remembered, then withdraws the request.' },
            { slug: 'robert-burns', name: 'Robert Burns', note: 'Auld Lang Syne — sung far more than it is read.' },
            { slug: 'c-p-cavafy', name: 'C. P. Cavafy', note: 'Leaving a city that follows you anyway.' }
        ]
    },

    'missing-you': {
        heading: 'About poems about missing someone',
        body: [
            'Absence is easier to write than presence, because a missing person can be assembled entirely out of ordinary objects — a chair, a route, a time of day when they used to ring — and that indirection is what keeps these poems from becoming complaints.',
            'Hardy is again the essential figure: his poems about a dead wife are mostly inventories of places she is no longer in. Neruda supplies the version written while the person is merely elsewhere, which is a different and more restless feeling.'
        ],
        startHere: [
            { slug: 'thomas-hardy', name: 'Thomas Hardy', note: 'Absence built out of places, not adjectives.' },
            { slug: 'pablo-neruda', name: 'Pablo Neruda', note: 'Missing someone who is merely elsewhere.' },
            { slug: 'c-p-cavafy', name: 'C. P. Cavafy', note: 'Distance measured in years rather than miles.' },
            { slug: 'edna-st-vincent-millay', name: 'Edna St. Vincent Millay', note: 'Missing someone and resenting it.' }
        ]
    },

    anger: {
        heading: 'About poems about anger',
        body: [
            'Anger is the emotion most likely to produce a bad poem and, handled well, the one that produces the most durable. The failure mode is venting, which is satisfying to write and inert to read; the successful poems almost always contain the anger inside a form tight enough to make it dangerous.',
            'Blake\'s "A Poison Tree" is the perfect small demonstration: sixteen lines of nursery-rhyme metre in which a man waters his wrath until it grows fruit and kills his enemy, told with complete calm. Audre Lorde is the essential modern voice, and argued explicitly that anger is a source of information rather than a lapse in manners.'
        ],
        startHere: [
            { slug: 'william-blake', name: 'William Blake', note: 'Nursery-rhyme metre; a man grows a murder.' },
            { slug: 'audre-lorde', name: 'Audre Lorde', note: 'Anger treated as information, not a lapse.' },
            { slug: 'sylvia-plath', name: 'Sylvia Plath', note: 'Rage under extremely tight formal control.' },
            { slug: 'claude-mckay', name: 'Claude McKay', note: 'The sonnet used as a weapon.' }
        ]
    },

    freedom: {
        heading: 'About poems about freedom',
        body: [
            'Freedom poems are almost always written from confinement, which is the shelf\'s recurring irony and its source of energy: the subject only becomes vivid to someone who does not have it.',
            'Lovelace wrote from an actual prison in 1642 that stone walls do not a prison make, which is either consolation or defiance depending on how you hear it. Dunbar\'s caged bird and Hughes\'s dream deferred are the American answers, and both are much harder-edged than the anthology versions suggest. See also Slavery and Freedom.'
        ],
        startHere: [
            { slug: 'richard-lovelace', name: 'Richard Lovelace', note: 'Written from an actual prison, in 1642.' },
            { slug: 'paul-laurence-dunbar', name: 'Paul Laurence Dunbar', note: 'The caged bird, and why it sings.' },
            { slug: 'langston-hughes', name: 'Langston Hughes', note: 'Freedom deferred, asked about rather than argued.' },
            { slug: 'maya-angelou', name: 'Maya Angelou', note: 'The defiant register, meant to be spoken.' }
        ]
    },

    pregnancy: {
        heading: 'About poems on pregnancy',
        body: [
            'A subject almost entirely absent from English poetry until women were publishing in numbers, which is itself worth noticing when you browse: the shelf is thin for historical reasons, not because nobody was pregnant.',
            'Plath\'s "Metaphors" is the compact classic — nine lines, nine syllables each, nine months, a riddle in which the speaker calls herself an elephant, a ponderous house, a means to an end. The wit and the alarm are inseparable. Sharon Olds and Lucille Clifton are the poets who made the subject ordinary rather than remarkable.'
        ],
        startHere: [
            { slug: 'sylvia-plath', name: 'Sylvia Plath', note: 'Nine lines of nine syllables, for nine months.' },
            { slug: 'sharon-olds', name: 'Sharon Olds', note: 'The body during and after, described plainly.' },
            { slug: 'lucille-clifton', name: 'Lucille Clifton', note: 'Made the subject ordinary, and celebratory.' },
            { slug: 'anne-bradstreet', name: 'Anne Bradstreet', note: 'Wrote before childbirth, expecting not to survive it.' }
        ]
    },

    birthday: {
        heading: 'About birthday poems',
        body: [
            'Birthday poems split into two moods that barely acknowledge each other: celebration, and counting. The greeting-card tradition took the first; poetry mostly kept the second.',
            'Christina Rossetti\'s "A Birthday" is the great exception and is pure, unembarrassed joy — my heart is like a singing bird — with no undertow at all, which is rarer in her work than its popularity suggests. Most other poets use the date to notice how many there have been.'
        ],
        startHere: [
            { slug: 'christina-rossetti', name: 'Christina Rossetti', note: 'Unembarrassed joy, rare for her and better for it.' },
            { slug: 'thomas-hardy', name: 'Thomas Hardy', note: 'Uses the date to count backwards.' },
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'Anniversaries as small private reckonings.' },
            { slug: 'stanley-kunitz', name: 'Stanley Kunitz', note: 'Late birthdays, written into his nineties.' }
        ]
    },

    sports: {
        heading: 'About poems about sport',
        body: [
            'A thin shelf with one undisputed masterpiece. Housman\'s "To an Athlete Dying Young" congratulates a dead runner on his timing — leaving before the record was broken and the crowd moved on — and the poem is either consoling or appalling depending on the hour you read it.',
            'James Wright\'s "Autumn Begins in Martins Ferry, Ohio" is the other essential, and is not about football so much as about the men in the stands and the sons they send out to be beautiful and violent. Marianne Moore, a genuine baseball obsessive, supplies the enthusiast\'s version.'
        ],
        startHere: [
            { slug: 'a-e-housman', name: 'A. E. Housman', note: 'Congratulates a dead runner on his timing.' },
            { slug: 'james-wright', name: 'James Wright', note: 'About the men in the stands, not the game.' },
            { slug: 'marianne-moore', name: 'Marianne Moore', note: 'A real baseball obsessive, writing as a fan.' },
            { slug: 'walt-whitman', name: 'Walt Whitman', note: 'The body in motion, treated as a subject in itself.' }
        ]
    },

    'growing-up': {
        heading: 'About poems on growing up',
        body: [
            'Distinct from Childhood by direction of travel: childhood poems look back at a state, these follow a passage out of one. The genre\'s defining moment is the recognition that the adults were improvising all along.',
            'Bishop\'s "In the Waiting Room" is the finest example in English — a child of almost seven reading a magazine in a dentist\'s waiting room and abruptly understanding that she is a person, and one of them. Heaney\'s "Mid-Term Break" does the brutal version in a single closing line about a coffin measured in years.'
        ],
        startHere: [
            { slug: 'elizabeth-bishop', name: 'Elizabeth Bishop', note: 'The moment a self notices it exists.' },
            { slug: 'seamus-heaney', name: 'Seamus Heaney', note: 'Mid-Term Break — everything in the last line.' },
            { slug: 'gwendolyn-brooks', name: 'Gwendolyn Brooks', note: 'Leaving school, in eight lines.' },
            { slug: 'theodore-roethke', name: 'Theodore Roethke', note: 'The unstable memories that will not resolve.' }
        ]
    },

    regret: {
        heading: 'About poems about regret',
        body: [
            'The most misread poem in English is a regret poem, or is usually taken for one. Frost\'s "The Road Not Taken" is quoted as an anthem of individualism, and the poem plainly says the two roads were worn about the same and that the speaker will misreport this later with a sigh. It is a poem about the stories we will tell, not about brave choices.',
            'Hardy is the honest practitioner of the mode — decades of returning to the same few things he did not do — and Cavafy the most elegant, treating past mistakes as facts to be described accurately rather than atoned for.'
        ],
        startHere: [
            { slug: 'robert-frost', name: 'Robert Frost', note: 'The most misread poem in English. Read it again.' },
            { slug: 'thomas-hardy', name: 'Thomas Hardy', note: 'Forty years of returning to the same omissions.' },
            { slug: 'c-p-cavafy', name: 'C. P. Cavafy', note: 'Mistakes described exactly, never atoned for.' },
            { slug: 'a-e-housman', name: 'A. E. Housman', note: 'What was not said, and the time for saying it.' }
        ]
    },

    sad: {
        heading: 'About sad poems',
        body: [
            'A broad, informal shelf that overlaps several more precise ones, and knowing which you want will find you better poems faster. Grief is for bereavement, Sorrow for sadness without a cause, Mental Health for the clinical register, Heartbreak for the end of a relationship, Loneliness for isolation.',
            'What is worth saying about sadness in general is that the poems which console are rarely the ones that try to. Accuracy consoles; encouragement usually does not. That is why Hardy and Dickinson are on this shelf and very little verse written to cheer anyone up has survived.'
        ],
        startHere: [
            { slug: 'thomas-hardy', name: 'Thomas Hardy', note: 'Accuracy about sadness, offered instead of comfort.' },
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'Interior weather, charted precisely.' },
            { slug: 'sara-teasdale', name: 'Sara Teasdale', note: 'Short and musical, and darker than it sounds.' },
            { slug: 'edward-thomas', name: 'Edward Thomas', note: 'Melancholy with a landscape and no explanation.' }
        ]
    },

    strength: {
        heading: 'About poems about strength',
        body: [
            'The risk on this shelf is the motivational poster, and the two most famous poems here have both been reduced to one by quotation. Both are better than their reputations.',
            'Henley\'s "Invictus" was written by a man who had lost a leg to tuberculosis at seventeen and spent years in hospital — the unconquerable soul is a claim made from a sickbed, not a slogan. Clifton\'s "won\'t you celebrate with me" is the modern equal and the more precise: she had no model, made it up, and something has tried to kill her every day and failed.'
        ],
        startHere: [
            { slug: 'william-ernest-henley', name: 'William Ernest Henley', note: 'Written from a hospital bed, not a podium.' },
            { slug: 'lucille-clifton', name: 'Lucille Clifton', note: 'Had no model; made one up; survived.' },
            { slug: 'maya-angelou', name: 'Maya Angelou', note: 'Defiance built for the voice.' },
            { slug: 'audre-lorde', name: 'Audre Lorde', note: 'Survival as a deliberate, daily practice.' }
        ]
    },

    gratitude: {
        heading: 'About poems of gratitude',
        body: [
            'Gratitude is harder to write than complaint for the same reason happiness is harder to plot than misery: it has no conflict in it. The poems that manage it usually do so by being extremely specific, since a general thankfulness reads as a greeting card and a particular one does not.',
            'Ross Gay is the contemporary master and his "Catalog of Unabashed Gratitude" is exactly what the title says — a long, unembarrassed list, and the length is the argument. Hopkins\'s "Pied Beauty" is the older version: praise for the freckled and the spare rather than the perfect.'
        ],
        startHere: [
            { slug: 'ross-gay', name: 'Ross Gay', note: 'An unembarrassed list; the length is the argument.' },
            { slug: 'gerard-manley-hopkins', name: 'Gerard Manley Hopkins', note: 'Praise for the freckled rather than the perfect.' },
            { slug: 'mary-oliver', name: 'Mary Oliver', note: 'Attention offered as thanks.' },
            { slug: 'naomi-shihab-nye', name: 'Naomi Shihab Nye', note: 'Gratitude that has been through something first.' }
        ]
    },
    anxiety: {
        heading: 'About poems on anxiety',
        body: [
            'Anxiety is a subject poetry was writing about long before it had the word — the state of dreading something unspecified, at an hour when nothing can be done about it, is all over the tradition under other names.',
            'Larkin\'s "Aubade" is the definitive modern statement: four in the morning, the fear of death examined without a single consolation offered, and a conclusion that religion and courage both fail the moment they are needed. Hopkins\'s late sonnets are the older equivalent, and Dickinson mapped the interior weather of it more finely than anyone.'
        ],
        startHere: [
            { slug: 'philip-larkin', name: 'Philip Larkin', note: '"Aubade" — four a.m., and no consolation permitted.' },
            { slug: 'gerard-manley-hopkins', name: 'Gerard Manley Hopkins', note: 'Dread at maximum technical intensity.' },
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'Interior weather, mapped finely.' },
            { slug: 'jane-kenyon', name: 'Jane Kenyon', note: 'The plain version: dread described as routine.' }
        ]
    },

    suicide: {
        heading: 'About poems on suicide',
        body: [
            'A shelf to approach on your own terms. If you are reading it because you are struggling, these poems are legitimate company — but company is not the same as help, and it is worth having a person as well as a book.',
            'Edwin Arlington Robinson\'s "Richard Cory" is the poem most people meet first, and its whole method is the gap between how a life looks and what it is. Sexton and Plath wrote from inside the condition and both are more formally controlled than their reputations allow. Dorothy Parker\'s "Résumé" is the dark comic version and is doing something genuinely serious with the joke.'
        ],
        startHere: [
            { slug: 'edwin-arlington-robinson', name: 'Edwin Arlington Robinson', note: 'The gap between how a life looks and what it is.' },
            { slug: 'anne-sexton', name: 'Anne Sexton', note: 'Written from inside, and far more crafted than credited.' },
            { slug: 'dorothy-parker', name: 'Dorothy Parker', note: 'The joke is doing something serious.' },
            { slug: 'jane-kenyon', name: 'Jane Kenyon', note: 'Depression without metaphor, and survival in it.' }
        ]
    },

    daughter: {
        heading: 'About poems about daughters',
        body: [
            'Poems to daughters are unusually likely to be poems about the future, and about the limits of what a parent can arrange — which is what separates them from poems to sons, where the anxiety tends to be about resemblance.',
            'Yeats\'s "A Prayer for my Daughter" is the famous case and is uncomfortable reading: written in a storm after her birth, wishing her beauty but not too much, and courtesy over opinions. Sharon Olds and Lucille Clifton are the correctives, writing daughters as people rather than as projects.'
        ],
        startHere: [
            { slug: 'william-butler-yeats', name: 'W. B. Yeats', note: 'Famous, and uncomfortable — read it critically.' },
            { slug: 'sharon-olds', name: 'Sharon Olds', note: 'A daughter as a person, not a project.' },
            { slug: 'lucille-clifton', name: 'Lucille Clifton', note: 'Lineage celebrated in very few words.' },
            { slug: 'sylvia-plath', name: 'Sylvia Plath', note: 'The mother\'s side, unsentimental about it.' }
        ]
    },

    depression: {
        heading: 'About poems on depression',
        body: [
            'Overlaps Mental Health, Sadness and Darkness — browse all four. What belongs here specifically is the clinical condition rather than ordinary unhappiness, and the distinction matters because the poems are different: unhappiness has a cause and a shape, and depression characteristically has neither.',
            'Jane Kenyon is the essential poet, and her achievement is refusing metaphor almost entirely — the condition arrives as weather, as a presence in the room, as the shape of a day. Hopkins\'s late sonnets are the historical counterpart.'
        ],
        startHere: [
            { slug: 'jane-kenyon', name: 'Jane Kenyon', note: 'Refuses metaphor, which is why it is recognisable.' },
            { slug: 'gerard-manley-hopkins', name: 'Gerard Manley Hopkins', note: 'The terrible sonnets, written by a priest.' },
            { slug: 'robert-lowell', name: 'Robert Lowell', note: 'The confessional mode, largely invented here.' },
            { slug: 'philip-larkin', name: 'Philip Larkin', note: 'Flat, cold, and unnervingly exact.' }
        ]
    },

    divorce: {
        heading: 'About poems on divorce',
        body: [
            'A late subject in English poetry for obvious legal and social reasons, and one that arrived properly only when women were publishing in numbers and able to say so.',
            'Sharon Olds\'s "Stag\'s Leap" is the major work: a full book written after her husband left, published years later, and remarkable for refusing both self-pity and revenge while giving up none of the detail. Hardy\'s late poems are the nineteenth-century equivalent for a marriage that ended without a divorce being available.'
        ],
        startHere: [
            { slug: 'sharon-olds', name: 'Sharon Olds', note: 'A whole book, with neither self-pity nor revenge.' },
            { slug: 'thomas-hardy', name: 'Thomas Hardy', note: 'A marriage that ended without ending.' },
            { slug: 'edna-st-vincent-millay', name: 'Edna St. Vincent Millay', note: 'Leaving, described without regret.' },
            { slug: 'anne-sexton', name: 'Anne Sexton', note: 'The domestic wreckage, close up.' }
        ]
    },

    fantasy: {
        body: [
            'Poetry got to the fantastic long before genre fiction existed, and the difference is that a poem rarely builds a world — it opens a door, looks through, and closes it, which is why so many of these are short.',
            'Coleridge\'s "Kubla Khan" is the founding fragment, and its incompleteness is much of its power. Keats\'s "La Belle Dame sans Merci" is the other model: a knight, a fairy woman, and an ending on a cold hillside with nothing explained. See also Imagination and Mythology.'
        ],
        startHere: [
            { slug: 'samuel-taylor-coleridge', name: 'Samuel Taylor Coleridge', note: 'A fragment, and stronger for being unfinished.' },
            { slug: 'john-keats', name: 'John Keats', note: 'A cold hillside, and nothing explained.' },
            { slug: 'lewis-carroll', name: 'Lewis Carroll', note: 'Invented vocabulary that somehow parses.' },
            { slug: 'william-butler-yeats', name: 'W. B. Yeats', note: 'Irish myth taken entirely seriously.' }
        ]
    },

    betrayal: {
        heading: 'About poems about betrayal',
        body: [
            'Betrayal poems are usually about memory rather than the event: the poem arrives long after, when the speaker is reconstructing what was true at the time and finding they cannot.',
            'Wyatt\'s "They flee from me" is the Tudor masterpiece and one of the strangest poems in English — former lovers described as tame deer who now avoid him, and an ending so bitter and off-balance that critics still argue about its tone. Shakespeare\'s sonnets supply the sustained version.'
        ],
        startHere: [
            { slug: 'sir-thomas-wyatt', name: 'Sir Thomas Wyatt', note: 'Tudor, strange, and still unresolved by critics.' },
            { slug: 'william-shakespeare', name: 'William Shakespeare', note: 'Betrayal sustained across a sonnet sequence.' },
            { slug: 'thomas-hardy', name: 'Thomas Hardy', note: 'What was true at the time, reconstructed badly.' },
            { slug: 'edna-st-vincent-millay', name: 'Edna St. Vincent Millay', note: 'Sometimes the betrayer, and honest about it.' }
        ]
    },

    'moving-on': {
        heading: 'About poems about moving on',
        body: [
            'The hardest of the love-adjacent shelves to write well, because the emotional event is an absence of feeling — and nothing is harder to dramatise than no longer minding.',
            'Millay is the poet who solved it, repeatedly, by being brisk rather than wistful: her sonnets about forgotten lovers list them without apology and refuse to perform regret. Cavafy does the elegant version, and Clifton the celebratory one.'
        ],
        startHere: [
            { slug: 'edna-st-vincent-millay', name: 'Edna St. Vincent Millay', note: 'Brisk, unapologetic, and much funnier than expected.' },
            { slug: 'c-p-cavafy', name: 'C. P. Cavafy', note: 'Remembers precisely, and has moved on anyway.' },
            { slug: 'lucille-clifton', name: 'Lucille Clifton', note: 'Survival treated as something to celebrate.' },
            { slug: 'derek-walcott', name: 'Derek Walcott', note: '"Love After Love" — greeting yourself at your own door.' }
        ]
    },

    summer: {
        heading: 'About summer poems',
        body: [
            'Summer is the season poets have to work hardest to make interesting, because it supplies no natural conflict — which is why the best summer poems are almost always about its ending.',
            'Shakespeare\'s eighteenth sonnet is the famous case and it is not really a summer poem: it compares the beloved to a summer\'s day in order to say summer is worse, being short-leased and too hot, and then claims the poem itself will outlast both. Keats\'s late-summer ripeness in "To Autumn" is where the season properly lands.'
        ],
        startHere: [
            { slug: 'william-shakespeare', name: 'William Shakespeare', note: 'Compares her to summer, then says summer is worse.' },
            { slug: 'john-keats', name: 'John Keats', note: 'Where summer actually lands: at its end.' },
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'Heat observed indoors, obliquely.' },
            { slug: 'gerard-manley-hopkins', name: 'Gerard Manley Hopkins', note: 'Summer given more sonic attention than it can hold.' }
        ]
    },

    teen: {
        heading: 'About poems about teenagers',
        body: [
            'A shelf where the poems are mostly written about adolescence rather than during it, and the gap shows — adult poets tend to write teenagers as either doomed or comic, and rarely as people making reasonable decisions with bad information.',
            'Gwendolyn Brooks\'s "We Real Cool" is the exception that everybody knows: eight lines, seven pool players, and a final "we die soon" that the poem does not editorialise. Bishop\'s "In the Waiting Room" is the other essential — the exact moment a self arrives.'
        ],
        startHere: [
            { slug: 'gwendolyn-brooks', name: 'Gwendolyn Brooks', note: 'Eight lines, and no editorialising.' },
            { slug: 'elizabeth-bishop', name: 'Elizabeth Bishop', note: 'The exact moment a self arrives.' },
            { slug: 'seamus-heaney', name: 'Seamus Heaney', note: 'Adolescence interrupted by a death.' },
            { slug: 'danez-smith', name: 'Danez Smith', note: 'Adolescence written from much closer to it.' }
        ]
    },

    'climate-change': {
        heading: 'About poems on climate change',
        body: [
            'The newest subject on the site and the one with the least settled form. Poetry has no established shape for a slow, collective, statistical catastrophe — every previous disaster it handled was sudden or local — and reading this shelf is partly watching poets look for one.',
            'W. S. Merwin is the ancestor, writing ecological elegy decades before it had a name. Environment holds the broader version; Nature holds the tradition it grew out of, with the consolation still attached.'
        ],
        startHere: [
            { slug: 'w-s-merwin', name: 'W. S. Merwin', note: 'Ecological elegy, decades early.' },
            { slug: 'wendell-berry', name: 'Wendell Berry', note: 'Staying put, farming, and the long argument.' },
            { slug: 'robinson-jeffers', name: 'Robinson Jeffers', note: 'Held that the coastline mattered more than us.' },
            { slug: 'natalie-diaz', name: 'Natalie Diaz', note: 'A river treated as a body, not a resource.' }
        ]
    },

    children: {
        heading: 'About poems for children',
        body: [
            'Distinct from Childhood, which collects adults looking back. These are poems written for children to read — a form with a much higher technical bar than its reputation suggests, because a child will simply stop reading a poem with a limp line.',
            'Blake\'s "Songs of Innocence" are the origin and are considerably stranger than their nursery surface. Stevenson\'s "A Child\'s Garden of Verses" is the warmest, Lear and Carroll the funniest, and all four are worth reading aloud rather than silently.'
        ],
        startHere: [
            { slug: 'william-blake', name: 'William Blake', note: 'Stranger underneath than the nursery surface suggests.' },
            { slug: 'robert-louis-stevenson', name: 'Robert Louis Stevenson', note: 'The warmest of them, and built to be read aloud.' },
            { slug: 'edward-lear', name: 'Edward Lear', note: 'Nonsense with impeccable timing.' },
            { slug: 'lewis-carroll', name: 'Lewis Carroll', note: 'Invented words a child can follow anyway.' }
        ]
    },

    veterans: {
        heading: 'About poems about veterans',
        body: [
            'The difference between this shelf and War is time. War poems are written in or near the event; these are written by people who came back, and the recurring subject is that the war did not end when it ended.',
            'Yusef Komunyakaa is the essential figure — his Vietnam poems were written some fourteen years afterwards, and the delay is visible in the method, with memory arriving through reflections and surfaces rather than narrative. Sassoon survived and spent decades writing the aftermath; Brian Turner did the same for Iraq.'
        ],
        startHere: [
            { slug: 'yusef-komunyakaa', name: 'Yusef Komunyakaa', note: 'Written fourteen years later, and it shows in the method.' },
            { slug: 'siegfried-sassoon', name: 'Siegfried Sassoon', note: 'Survived, and wrote the decades afterwards.' },
            { slug: 'brian-turner', name: 'Brian Turner', note: 'Iraq, by an infantryman who had read the others.' },
            { slug: 'randall-jarrell', name: 'Randall Jarrell', note: 'Five lines about a gunner, and nothing wasted.' }
        ]
    },

    'new-year': {
        heading: 'About poems for the new year',
        body: [
            'New Year poems are reckonings dressed as celebrations, and the good ones admit it. The turn of a year gives a poet a legitimate excuse to count, which is a more interesting impulse than resolve.',
            'Hardy\'s "The Darkling Thrush" is dated 31 December 1900 and is the best of them: a bleak century\'s end, a frail old bird singing anyway, and a speaker who cannot find the reason for the song and reports the fact. Tennyson\'s "Ring out, wild bells" is the ceremonial counterpart.'
        ],
        startHere: [
            { slug: 'thomas-hardy', name: 'Thomas Hardy', note: 'Dated 31 December 1900, and unconsoled.' },
            { slug: 'alfred-lord-tennyson', name: 'Alfred, Lord Tennyson', note: 'Ring out, wild bells — the ceremonial version.' },
            { slug: 'christina-rossetti', name: 'Christina Rossetti', note: 'The turning year as a private accounting.' },
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'Time noticed obliquely, never announced.' }
        ]
    },

    courage: {
        heading: 'About poems about courage',
        body: [
            'Courage poems risk becoming instructions, and the ones that survive almost always locate the bravery in something small and specific rather than in a general disposition.',
            'Henley\'s "Invictus" is the famous exception that earns its rhetoric: written from a hospital bed after losing a leg at seventeen, its unconquerable soul is a claim made in circumstances, not a slogan. Clifton and Angelou supply the modern versions, both grounded in a particular life.'
        ],
        startHere: [
            { slug: 'william-ernest-henley', name: 'William Ernest Henley', note: 'Written from a sickbed, not a podium.' },
            { slug: 'maya-angelou', name: 'Maya Angelou', note: 'Defiance, built for the speaking voice.' },
            { slug: 'lucille-clifton', name: 'Lucille Clifton', note: 'Courage as an ordinary daily practice.' },
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'Bravery located in something very small.' }
        ]
    },

    money: {
        heading: 'About poems about money',
        body: [
            'English poetry is oddly reticent about money given how much of life it decides, and the poems that do address it are usually about what having none does to a person rather than about wealth.',
            'Larkin\'s "Money" is the sharp modern one, ending with a view over a provincial town that makes the whole subject look intensely sad. Blake\'s "London" counts the human cost without ever naming a sum. See also Poverty and Work.'
        ],
        startHere: [
            { slug: 'philip-larkin', name: 'Philip Larkin', note: 'Ends on a view that makes the subject look very sad.' },
            { slug: 'william-blake', name: 'William Blake', note: 'Counts the cost without naming a sum.' },
            { slug: 'charles-bukowski', name: 'Charles Bukowski', note: 'Rent, work and drinking, flatly.' },
            { slug: 'carl-sandburg', name: 'Carl Sandburg', note: 'Wages treated as a legitimate subject.' }
        ]
    },

    'self-love': {
        heading: 'About poems on self-acceptance',
        body: [
            'A modern name for an old subject, and the shelf is thin because the sincere version is very hard to write — self-regard on the page slides into either boasting or therapy language almost immediately.',
            'Derek Walcott\'s "Love After Love" is the poem that solves it: you will greet yourself arriving at your own door, and the instruction to sit, eat and give back your own heart to itself. Clifton\'s "won\'t you celebrate with me" is its equal. Whitman is the immodest ancestor of both.'
        ],
        startHere: [
            { slug: 'derek-walcott', name: 'Derek Walcott', note: 'Greeting yourself arriving at your own door.' },
            { slug: 'lucille-clifton', name: 'Lucille Clifton', note: 'Made herself up, having had no model.' },
            { slug: 'walt-whitman', name: 'Walt Whitman', note: 'The immodest ancestor of the whole idea.' },
            { slug: 'maya-angelou', name: 'Maya Angelou', note: 'Self-possession written to be spoken aloud.' }
        ]
    },

    anniversary: {
        heading: 'About anniversary poems',
        body: [
            'A small shelf, and mostly a subset of Marriage — the poems here mark duration, which is the one thing a love poem written at the beginning cannot do.',
            'Donne\'s "The Anniversarie" is the early masterpiece and makes a characteristically outrageous argument: everything else in the world is a year older and a year nearer its end, and this alone is not. Bradstreet and Hardy supply the plainer versions, one grateful and one much too late.'
        ],
        startHere: [
            { slug: 'john-donne', name: 'John Donne', note: 'Everything ages except this, he argues.' },
            { slug: 'anne-bradstreet', name: 'Anne Bradstreet', note: 'The plain, grateful version, from the 1600s.' },
            { slug: 'thomas-hardy', name: 'Thomas Hardy', note: 'Anniversaries kept alone, and far too late.' },
            { slug: 'jane-kenyon', name: 'Jane Kenyon', note: 'Duration recorded in ordinary domestic detail.' }
        ]
    },

    motivational: {
        heading: 'About motivational poems',
        body: [
            'The shelf most likely to disappoint a serious reader and most likely to be genuinely useful to somebody who needs it today. Both facts are true and there is no need to resolve them.',
            'Kipling\'s "If—" is the archetype and repays a suspicious reading: it is a list of conditions that no person could meet, addressed to a son, and it is either bracing or crushing depending on the day. Angelou and Henley are the more honest alternatives, because both are speaking from a particular life rather than issuing instructions.'
        ],
        startHere: [
            { slug: 'rudyard-kipling', name: 'Rudyard Kipling', note: 'Conditions nobody could meet — bracing or crushing.' },
            { slug: 'maya-angelou', name: 'Maya Angelou', note: 'Speaks from a life rather than issuing instructions.' },
            { slug: 'william-ernest-henley', name: 'William Ernest Henley', note: 'Earned its rhetoric from a hospital bed.' },
            { slug: 'henry-wadsworth-longfellow', name: 'Henry Wadsworth Longfellow', note: 'The Victorian version, sincerely meant.' }
        ]
    },

    thanksgiving: {
        heading: 'About Thanksgiving poems',
        body: [
            'A small shelf that overlaps Gratitude, which has more in it. What is specific here is the occasion — a fixed date on which thankfulness is expected, which is a difficult condition for a poem, since obligation and gratitude sit badly together.',
            'The poems that manage it are the specific ones. Ross Gay\'s long catalogue works because it names actual things at length; Hopkins praises the freckled and irregular rather than the deserving.'
        ],
        startHere: [
            { slug: 'ross-gay', name: 'Ross Gay', note: 'Names actual things, at length.' },
            { slug: 'walt-whitman', name: 'Walt Whitman', note: 'Thanks offered by listing what there is.' },
            { slug: 'mary-oliver', name: 'Mary Oliver', note: 'Attention offered as thanks.' },
            { slug: 'naomi-shihab-nye', name: 'Naomi Shihab Nye', note: 'Gratitude that has been through something.' }
        ]
    },

    'overcoming-adversity': {
        heading: 'About poems on overcoming adversity',
        body: [
            'Closely related to Strength and Courage, and the caution is the same: the poems that last are grounded in a particular life, and the ones that generalise become posters.',
            'Langston Hughes\'s "Mother to Son" is the best thing on this shelf — a mother telling her son that life for her has been no crystal stair, in her own voice, with splinters and boards torn up and places with no carpet on the floor. It never once uses an abstract noun.'
        ],
        startHere: [
            { slug: 'langston-hughes', name: 'Langston Hughes', note: 'No crystal stair — and not one abstract noun.' },
            { slug: 'maya-angelou', name: 'Maya Angelou', note: 'Written to be spoken, and better that way.' },
            { slug: 'lucille-clifton', name: 'Lucille Clifton', note: 'Survival stated as fact, briefly.' },
            { slug: 'william-ernest-henley', name: 'William Ernest Henley', note: 'The Victorian archetype, earned.' }
        ]
    },

    sister: {
        heading: 'About poems about sisters',
        body: [
            'A thinner shelf than Brother is not, and both are thin — sibling poems are rarer in the canon than parent poems, probably because siblings are contemporaries and poetry gravitates to hierarchy.',
            'Christina Rossetti\'s "Goblin Market" is the great exception and one of the strangest poems in Victorian English: two sisters, forbidden fruit, and a rescue that has been read as religious allegory, sexual parable and a straightforward story about sisterhood ever since.'
        ],
        startHere: [
            { slug: 'christina-rossetti', name: 'Christina Rossetti', note: 'Goblin Market — strange, and read three ways at once.' },
            { slug: 'lucille-clifton', name: 'Lucille Clifton', note: 'Sisters and lineage, in very few words.' },
            { slug: 'sharon-olds', name: 'Sharon Olds', note: 'Family relations without the diplomacy.' },
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'Wrote constantly to her sister-in-law next door.' }
        ]
    },

    change: {
        heading: 'About poems about change',
        body: [
            'Change is less a subject than a condition, and poems arrive here when transformation itself is the event — not what was lost or gained, but the fact of becoming something else.',
            'Yeats\'s "Easter, 1916" is the great political instance, with its refrain that all is changed, changed utterly, and a terrible beauty born — a poem genuinely unsure whether what happened was good. Rilke\'s instruction at the end of the archaic torso poem, that you must change your life, is the personal version and arrives with no explanation at all.'
        ],
        startHere: [
            { slug: 'william-butler-yeats', name: 'W. B. Yeats', note: 'Changed utterly — and unsure whether that is good.' },
            { slug: 'rainer-maria-rilke', name: 'Rainer Maria Rilke', note: 'You must change your life. No explanation given.' },
            { slug: 'w-s-merwin', name: 'W. S. Merwin', note: 'Change as loss, recorded without punctuation.' },
            { slug: 'lucille-clifton', name: 'Lucille Clifton', note: 'Transformation as something achieved, not suffered.' }
        ]
    },

    inspirational: {
        heading: 'About inspirational poems',
        body: [
            'Overlaps Motivational and Strength, and the same caveat applies to all three: these poems are read for use rather than for study, and that is a legitimate way to read.',
            'The ones worth returning to are grounded in a life. Mary Oliver asking what you plan to do with your one wild and precious life is the most quoted line in modern American poetry, and it works because everything around it is a description of a grasshopper.'
        ],
        startHere: [
            { slug: 'mary-oliver', name: 'Mary Oliver', note: 'The famous question, earned by a grasshopper.' },
            { slug: 'maya-angelou', name: 'Maya Angelou', note: 'Grounded in a particular life, not a sentiment.' },
            { slug: 'derek-walcott', name: 'Derek Walcott', note: 'Love After Love — the gentlest thing here.' },
            { slug: 'william-ernest-henley', name: 'William Ernest Henley', note: 'The archetype, and its real circumstances.' }
        ]
    },

    son: {
        heading: 'About poems about sons',
        body: [
            'Poems to sons are more anxious than poems to daughters and the anxiety is usually about resemblance — whether the son will repeat the father, and whether that would be a failure.',
            'Langston Hughes\'s "Mother to Son" is the finest and inverts the pattern: a mother\'s voice, entirely concrete, no advice that is not also a description of her own stairs. Kipling\'s "If—" is the opposite approach and worth reading against it.'
        ],
        startHere: [
            { slug: 'langston-hughes', name: 'Langston Hughes', note: 'Advice that is only ever description.' },
            { slug: 'rudyard-kipling', name: 'Rudyard Kipling', note: 'The opposite method — read the two together.' },
            { slug: 'sharon-olds', name: 'Sharon Olds', note: 'A son watched, unsentimentally.' },
            { slug: 'robert-hayden', name: 'Robert Hayden', note: 'What a father did, recognised far too late.' }
        ]
    },

    brother: {
        heading: 'About poems about brothers',
        body: [
            'A very small shelf holding one of the most devastating poems in modern English. Seamus Heaney\'s "Mid-Term Break" describes being fetched from school, a house full of adults, and a coffin — and withholds the fact that his brother was four until the final line, where a box measured in feet is given one for each year.',
            'Housman supplies the older register of the same subject: young men who did not get to grow up, remembered by someone who did.'
        ],
        startHere: [
            { slug: 'seamus-heaney', name: 'Seamus Heaney', note: 'Withholds everything until the final line.' },
            { slug: 'a-e-housman', name: 'A. E. Housman', note: 'Young men who did not get to grow older.' },
            { slug: 'walt-whitman', name: 'Walt Whitman', note: 'Brotherhood extended past the family.' },
            { slug: 'sharon-olds', name: 'Sharon Olds', note: 'Siblings written without diplomacy.' }
        ]
    },

    halloween: {
        heading: 'About Halloween poems',
        body: [
            'A small, cheerful shelf with one genuinely great poem behind it. Burns\'s "Halloween" is a long, funny, densely Scots account of an actual eighteenth-century village night of divination games — closer to anthropology than to horror.',
            'Poe supplies everything the modern holiday actually borrows from, and it is worth remembering that his effects are built from metre and repetition rather than from imagery: "The Raven" is frightening because of how it sounds.'
        ],
        startHere: [
            { slug: 'robert-burns', name: 'Robert Burns', note: 'A real village night of divination games, in Scots.' },
            { slug: 'edgar-allan-poe', name: 'Edgar Allan Poe', note: 'Frightening because of how it sounds, not what it shows.' },
            { slug: 'william-shakespeare', name: 'William Shakespeare', note: 'The witches — still the model for all of it.' },
            { slug: 'walter-de-la-mare', name: 'Walter de la Mare', note: 'The empty house, and whoever is listening in it.' }
        ]
    },

    peace: {
        heading: 'About poems about peace',
        body: [
            'Peace is difficult for the same reason happiness is: it has no conflict in it. Poems get round this either by placing peace somewhere the speaker is not, or by writing it as the absence left after violence.',
            'Yeats\'s "The Lake Isle of Innisfree" is the first method — a cabin, nine bean rows, and peace coming dropping slow — written by a man standing on a London pavement. Sara Teasdale\'s "There Will Come Soft Rains" is the second, and much colder: nature carrying on serenely, not noticing that mankind has gone.'
        ],
        startHere: [
            { slug: 'william-butler-yeats', name: 'W. B. Yeats', note: 'Written on a London pavement, about a cabin.' },
            { slug: 'sara-teasdale', name: 'Sara Teasdale', note: 'Nature not noticing that we have gone.' },
            { slug: 'wilfred-owen', name: 'Wilfred Owen', note: 'Peace defined entirely by its absence.' },
            { slug: 'walt-whitman', name: 'Walt Whitman', note: 'Reconciliation, written after a civil war.' }
        ]
    },

    funny: {
        heading: 'About funny poems',
        body: [
            'A near-duplicate of Humor, which is much larger and where you should probably browse — both categories came out of a scraped topic vocabulary that never merged them.',
            'The thing worth repeating about comic verse: it demands more technical precision than serious verse, not less, because a joke depends on timing and timing in poetry is metre. A comic poem with one limp line stops being funny; a serious poem survives it.'
        ],
        startHere: [
            { slug: 'edward-lear', name: 'Edward Lear', note: 'The limerick, at the source.' },
            { slug: 'dorothy-parker', name: 'Dorothy Parker', note: 'Everything staked on the last line.' },
            { slug: 'lewis-carroll', name: 'Lewis Carroll', note: 'Nonsense with perfect grammar.' },
            { slug: 'shel-silverstein', name: 'Shel Silverstein', note: 'Written for children, and funnier than most adult verse.' }
        ]
    },

    'memorial-day': {
        heading: 'About poems of remembrance',
        body: [
            'Poems written to be read at a ceremony have a specific difficulty: they must console a crowd, and consolation offered to a crowd is exactly the register that the twentieth century taught poets to distrust.',
            'McCrae\'s "In Flanders Fields" is the most-recited war poem in English and repays a careful reading — it is spoken by the dead, and its final stanza does not ask for peace but for the quarrel to be taken up. Owen wrote directly against that instinct. Both are here; read them together.'
        ],
        startHere: [
            { slug: 'john-mccrae', name: 'John McCrae', note: 'Spoken by the dead — and asks for the fight to continue.' },
            { slug: 'wilfred-owen', name: 'Wilfred Owen', note: 'Written directly against that instinct.' },
            { slug: 'walt-whitman', name: 'Walt Whitman', note: 'Nursed the wounded, and wrote the American version.' },
            { slug: 'randall-jarrell', name: 'Randall Jarrell', note: 'Five lines, and nothing ceremonial in them.' }
        ]
    },

    apology: {
        heading: 'About poems of apology',
        body: [
            'A tiny shelf containing one perfect poem. William Carlos Williams\'s "This Is Just To Say" is a note left on an icebox about eaten plums, and it apologises without withdrawing anything — they were delicious, so sweet and so cold. Whether it is an apology at all has been argued over for a century, which is why it is still read.',
            'The general point it demonstrates: an apology poem stops working the moment it asks to be forgiven.'
        ],
        startHere: [
            { slug: 'william-carlos-williams', name: 'William Carlos Williams', note: 'Apologises without withdrawing anything.' },
            { slug: 'thomas-hardy', name: 'Thomas Hardy', note: 'Apology arriving decades after it was owed.' },
            { slug: 'robert-hayden', name: 'Robert Hayden', note: 'Gratitude too late to be delivered.' },
            { slug: 'anne-sexton', name: 'Anne Sexton', note: 'Refuses to ask for forgiveness, and is better for it.' }
        ]
    },

    bullying: {
        heading: 'About poems on bullying',
        body: [
            'A small shelf and a subject poetry mostly approaches sideways, through the poems about being the child who did not fit — which is more useful than direct treatment, because the sideways version does not require the reader to identify as a victim.',
            'Dunbar\'s "We Wear the Mask" is the essential one, and although it was written about a different and larger cruelty, it describes the mechanism exactly: the grinning face, the torn and bleeding hearts, the world permitted to see only the mask.'
        ],
        startHere: [
            { slug: 'paul-laurence-dunbar', name: 'Paul Laurence Dunbar', note: 'We wear the mask — the mechanism, exactly.' },
            { slug: 'gwendolyn-brooks', name: 'Gwendolyn Brooks', note: 'Children written without condescension.' },
            { slug: 'maya-angelou', name: 'Maya Angelou', note: 'The answering voice, built to be spoken.' },
            { slug: 'lucille-clifton', name: 'Lucille Clifton', note: 'Survival stated plainly and briefly.' }
        ]
    },

    god: {
        heading: 'About poems addressed to God',
        body: [
            'A small shelf overlapping Religion, Faith, Prayer and Spiritual, all of which have more in them. What is worth saying is that the poems addressed directly to God are, almost without exception, arguments rather than praise.',
            'Herbert argues and loses; Hopkins argues and is not answered; Dickinson argues without ever deciding whether there is anyone there; Blake reassigns the whole role. Devotional poetry in English is a record of disagreement, not of assent.'
        ],
        startHere: [
            { slug: 'george-herbert', name: 'George Herbert', note: 'Argues, and loses, and writes it down.' },
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'Never decides whether anyone is there.' },
            { slug: 'gerard-manley-hopkins', name: 'Gerard Manley Hopkins', note: 'Argues and is not answered.' },
            { slug: 'william-blake', name: 'William Blake', note: 'Reassigns the role entirely.' }
        ]
    },

    'long-distance': {
        heading: 'About poems on distance',
        body: [
            'Separation is one of the oldest occasions for a love poem, for the practical reason that a poem is what you send when you cannot go — the form and the situation were made for each other.',
            'Donne\'s "A Valediction: Forbidding Mourning" is the definitive treatment, ending on twin compasses: one foot fixed at home, the other leaning after it and coming home upright. It is the best argument in English that distance need not mean loss.'
        ],
        startHere: [
            { slug: 'john-donne', name: 'John Donne', note: 'Twin compasses — distance argued out of existence.' },
            { slug: 'pablo-neruda', name: 'Pablo Neruda', note: 'Absence written as physical appetite.' },
            { slug: 'c-p-cavafy', name: 'C. P. Cavafy', note: 'Distance measured in years, not miles.' },
            { slug: 'sappho', name: 'Sappho', note: 'The oldest version, in fragments.' }
        ]
    },

    funeral: {
        heading: 'About funeral poems',
        body: [
            'A very small shelf. If you are looking for something to read at a service, Grief has far more and is the better place to start — as does Goodbye and Farewell for the parting itself.',
            'What sits here specifically is the ceremony: the poems about the awkward machinery of a funeral rather than about the person. Dickinson\'s felt-a-funeral-in-my-brain is the strangest of them and is not about a burial at all — it uses the ritual to describe a mind coming apart.'
        ],
        startHere: [
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'The ritual used to describe a mind coming apart.' },
            { slug: 'christina-rossetti', name: 'Christina Rossetti', note: 'Remember me — then, better, forget and smile.' },
            { slug: 'john-donne', name: 'John Donne', note: 'Death told it has been overrated.' },
            { slug: 'donald-hall', name: 'Donald Hall', note: 'The aftermath, with consolation refused.' }
        ]
    },

    justice: {
        heading: 'About poems about justice',
        body: [
            'A very small shelf; Social Justice and Social Commentaries hold nearly all of this material and are the better places to browse.',
            'The one observation worth carrying into any of them: poems about justice work by particularity. A named person, a specific street, one case. The moment the subject becomes justice in the abstract, the poem can no longer do anything an argument could not do better.'
        ],
        startHere: [
            { slug: 'langston-hughes', name: 'Langston Hughes', note: 'The particular case, never the abstraction.' },
            { slug: 'june-jordan', name: 'June Jordan', note: 'Committed, and addressed to a person.' },
            { slug: 'percy-bysshe-shelley', name: 'Percy Bysshe Shelley', note: 'Written in fury, and suppressed for years.' },
            { slug: 'audre-lorde', name: 'Audre Lorde', note: 'Anger treated as information.' }
        ]
    },

    kindness: {
        heading: 'About poems about kindness',
        body: [
            'One poem defines this shelf and it is worth the visit on its own. Naomi Shihab Nye\'s "Kindness" argues that you cannot know kindness until you have lost things — that you must see the dead man in the road, and recognise that it could have been you, before the word means anything.',
            'That is a much harder claim than the greeting-card version, and it is why the poem has travelled so far. See also Gratitude and Healing.'
        ],
        startHere: [
            { slug: 'naomi-shihab-nye', name: 'Naomi Shihab Nye', note: 'You must lose things first — the whole argument.' },
            { slug: 'mary-oliver', name: 'Mary Oliver', note: 'Attention offered as a form of care.' },
            { slug: 'ross-gay', name: 'Ross Gay', note: 'Small kindnesses, catalogued at length.' },
            { slug: 'lucille-clifton', name: 'Lucille Clifton', note: 'Generosity in very few words.' }
        ]
    },

    trust: {
        heading: 'About poems about trust',
        body: [
            'The smallest shelf on the site, and the subject is genuinely difficult: trust is invisible while it holds and only becomes describable once it has broken — which is why Betrayal has more poems in it than this does.',
            'What poetry can do with it is show the small, unremarkable acts that constitute it. For the other side of the same subject, see Betrayal, Marriage and Friendship.'
        ],
        startHere: [
            { slug: 'robert-frost', name: 'Robert Frost', note: 'Neighbours, walls, and what holds between them.' },
            { slug: 'jane-kenyon', name: 'Jane Kenyon', note: 'Trust visible only in ordinary domestic detail.' },
            { slug: 'sir-thomas-wyatt', name: 'Sir Thomas Wyatt', note: 'The Tudor account of it failing.' },
            { slug: 'christina-rossetti', name: 'Christina Rossetti', note: 'Promises made carefully, and kept.' }
        ]
    },
}

/**
 * The introduction for a genre slug, or null when none is written.
 *
 * `Object.hasOwn`, not a bare `GENRE_INTROS[slug]`. The slug comes straight
 * from the URL, and a plain object lookup resolves inherited properties: both
 * `constructor` and `toString` return truthy functions off `Object.prototype`,
 * so `/constructor` would have rendered an "introduction" and then crashed
 * mapping over `intro.body`. Same class as the genre route accepting any
 * casing — a route parameter reaching a lookup unchecked.
 */
export function genreIntro(slug: string): GenreIntro | null {
    return Object.hasOwn(GENRE_INTROS, slug) ? GENRE_INTROS[slug] : null
}
