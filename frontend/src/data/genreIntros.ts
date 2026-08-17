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
    }
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
