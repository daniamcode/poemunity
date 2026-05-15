require('dotenv/config')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const MONGODB = process.env.MONGODB_PRE || process.env.MONGODB

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'was', 'are', 'were', 'be', 'been',
  'as', 'this', 'that', 'it', 'its', 'my', 'your', 'his', 'her', 'our',
  'their', 'i', 'you', 'he', 'she', 'we', 'they', 'not', 'no', 'so'
])

function maybeCapitalize(text, id) {
  if (!text) return text
  let hash = 0
  const str = (id || text).toString()
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  }
  if ((hash % 100) >= 85) return text
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function slugifyText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .filter(word => word && !STOP_WORDS.has(word))
    .join('-')
}

function generatePoemSlug(title, author) {
  const titlePart = slugifyText(title || '')
  const authorPart = slugifyText(author || '')
  const base = [titlePart, authorPart].filter(Boolean).join('-')
  return base || 'poem'
}

async function buildUniqueSlug(title, author, Poem) {
  const base = generatePoemSlug(title, author)
  let slug = base
  let counter = 2
  while (await Poem.exists({ slug })) {
    slug = `${base}-${counter++}`
  }
  return slug
}

const PASSWORD = 'FakeUser2024!'

// ============================================================
// USERS
// ============================================================
const fakeUsers = [
  // --- Power users ---
  { username: 'moonwriter23',    email: 'moonwriter23@fakemail.com',   name: 'Emily',     surname: 'Hart',     picture: 'https://i.pravatar.cc/150?img=23' },
  { username: 'VersesBy_Sadie', email: 'versesbysadie@fakemail.com',  name: 'Sadie',     surname: 'Monroe',   picture: null },
  { username: 't.walker_outdoors', email: 'thomaswalker@fakemail.com', name: 'Thomas',   surname: 'Walker',   picture: 'https://picsum.photos/seed/walker/150/150' },
  { username: 'DadOf3_Writes',  email: 'dadof3writes@fakemail.com',   name: 'Michael',   surname: 'Brennan',  picture: 'https://i.pravatar.cc/150?img=12' },
  { username: 'angry.quill',    email: 'angryquill@fakemail.com',     name: 'Maya',      surname: 'Torres',   picture: 'https://i.pravatar.cc/150?img=44' },
  // --- Regular users ---
  { username: 'coffeeshop.verses', email: 'coffeeshopverses@fakemail.com', name: 'Jake', surname: 'Sullivan', picture: 'https://picsum.photos/seed/coffeeshop/150/150' },
  { username: 'JesusIsMyRock_', email: 'jesusismyrock@fakemail.com',  name: 'Ruth',      surname: 'Caldwell', picture: 'https://i.pravatar.cc/150?img=62' },
  { username: 'queerpoetrybabe', email: 'queerpoetrybabe@fakemail.com', name: 'Sam',     surname: 'Rivera',   picture: 'https://i.pravatar.cc/150?img=15' },
  { username: 'ryan_in_nature', email: 'ryaninnature@fakemail.com',   name: 'Ryan',      surname: 'Cole',     picture: 'https://picsum.photos/seed/ryanforest/150/150' },
  { username: 'teen.writes_',   email: 'teenwrites@fakemail.com',     name: 'Lily',      surname: 'Chen',     picture: 'https://i.pravatar.cc/150?img=9' },
  { username: 'OceanDeep99',    email: 'oceandeep99@fakemail.com',    name: 'Marcus',    surname: 'Webb',     picture: 'https://picsum.photos/seed/oceandeep/150/150' },
  { username: 'GrumpyGrandpa',  email: 'grumpygrandpa@fakemail.com',  name: 'Harold',    surname: 'Jenkins',  picture: 'https://i.pravatar.cc/150?img=53' },
  { username: 'lostinlove23',   email: 'lostinlove23@fakemail.com',   name: 'Aria',      surname: 'Patel',    picture: 'https://i.pravatar.cc/150?img=43' },
  { username: 'spiritual.fire', email: 'spiritualfire@fakemail.com',  name: 'Grace',     surname: 'Okafor',   picture: null },
  { username: 'silent_scream',  email: 'silentscream@fakemail.com',   name: 'Devon',     surname: 'Blake',    picture: null },
  { username: 'MomLife_Poems',  email: 'momlifepoems@fakemail.com',   name: 'Karen',     surname: 'Fischer',  picture: 'https://i.pravatar.cc/150?img=49' },
  { username: 'historybuff42',  email: 'historybuff42@fakemail.com',  name: 'Robert',    surname: 'Steele',   picture: 'https://i.pravatar.cc/150?img=57' },
  { username: 'WinterMuse',     email: 'wintermuse@fakemail.com',     name: 'Chloe',     surname: 'Frost',    picture: 'https://picsum.photos/seed/snowfield/150/150' },
  { username: 'galaxy.poet',    email: 'galaxypoet@fakemail.com',     name: 'Zion',      surname: 'Parks',    picture: null },
  { username: 'workday.blues',  email: 'workdayblues@fakemail.com',   name: 'Diane',     surname: 'Murphy',   picture: 'https://i.pravatar.cc/150?img=36' },
  // --- Casual users ---
  { username: 'SunrisePoet_',   email: 'sunrisepoet@fakemail.com',    name: 'Nina',      surname: 'Walsh',    picture: 'https://i.pravatar.cc/150?img=20' },
  { username: 'traveling.bard', email: 'travelingbard@fakemail.com',  name: 'Alex',      surname: 'Kim',      picture: 'https://picsum.photos/seed/travelbard/150/150' },
  { username: 'broken_but_ok',  email: 'broken_but_ok@fakemail.com',  name: 'Tasha',     surname: 'Reed',     picture: null },
  { username: 'Garden_Guru',    email: 'gardenguru@fakemail.com',     name: 'Priscilla', surname: 'Hobbs',    picture: 'https://picsum.photos/seed/gardenflower/150/150' },
  { username: 'CitySlicker_V',  email: 'cityslickerv@fakemail.com',   name: 'Danny',     surname: 'Vega',     picture: 'https://i.pravatar.cc/150?img=27' },
  { username: 'SomberSunday',   email: 'sombersunday@fakemail.com',   name: 'Eliot',     surname: 'Nash',     picture: null },
  { username: 'butterfly_soul', email: 'butterflysoul@fakemail.com',  name: 'Jasmine',   surname: 'Lee',      picture: 'https://i.pravatar.cc/150?img=25' },
  { username: 'warpoet_fred',   email: 'warpoetfred@fakemail.com',    name: 'Frederick', surname: 'Stone',    picture: 'https://i.pravatar.cc/150?img=54' },
  { username: 'MusicIsMyLife',  email: 'musicismylife@fakemail.com',  name: 'Harmony',   surname: 'Blake',    picture: null },
  { username: 'hopeful.heart',  email: 'hopefulheart@fakemail.com',   name: 'Brianna',   surname: 'Day',      picture: 'https://i.pravatar.cc/150?img=7' },
  { username: 'ChristmasEve_',  email: 'christmaseve@fakemail.com',   name: 'Carol',     surname: 'Woods',    picture: 'https://i.pravatar.cc/150?img=60' },
  { username: 'desert_dragon',  email: 'desertdragon@fakemail.com',   name: 'Carlos',    surname: 'Ruiz',     picture: 'https://picsum.photos/seed/desertsand/150/150' },
  { username: 'bookworm.poet',  email: 'bookwormpoet@fakemail.com',   name: 'Olivia',    surname: 'Grant',    picture: 'https://i.pravatar.cc/150?img=16' },
  { username: 'StormSurfer',    email: 'stormsurfer@fakemail.com',    name: 'Brett',     surname: 'Connelly', picture: 'https://picsum.photos/seed/stormwave/150/150' },
  { username: 'midnight.ink_',  email: 'midnightink@fakemail.com',    name: 'Violet',    surname: 'Pierce',   picture: 'https://i.pravatar.cc/150?img=21' },
  { username: 'SmallTownLife',  email: 'smalltownlife@fakemail.com',  name: 'Hank',      surname: 'Morrison', picture: null },
  { username: 'forgive_and_write', email: 'forgiveandwrite@fakemail.com', name: 'Stella', surname: 'Burns',  picture: 'https://i.pravatar.cc/150?img=35' },
  { username: 'tears_and_ink',  email: 'tearsandink@fakemail.com',    name: 'Mia',       surname: 'Thornton', picture: 'https://i.pravatar.cc/150?img=13' },
  { username: 'FutureIsNow_',   email: 'futureisnow@fakemail.com',    name: 'Jordan',    surname: 'Price',    picture: null },
  { username: 'LaughLines',     email: 'laughlines@fakemail.com',     name: 'Pete',      surname: 'Callahan', picture: 'https://i.pravatar.cc/150?img=34' },
  { username: 'prayer.poems',   email: 'prayerpoems@fakemail.com',    name: 'Dorothy',   surname: 'Hall',     picture: 'https://i.pravatar.cc/150?img=67' },
  { username: 'twenty_something', email: 'twentysomething@fakemail.com', name: 'Nadia',  surname: 'Simmons',  picture: 'https://i.pravatar.cc/150?img=22' },
  { username: 'divorce.poems',  email: 'divorcepoems@fakemail.com',   name: 'Rachel',    surname: 'Burns',    picture: null },
  { username: 'WarmSummer_',    email: 'warmsummer@fakemail.com',     name: 'Luke',      surname: 'Patterson', picture: 'https://picsum.photos/seed/summerlake/150/150' },
  { username: 'wintry.words',   email: 'wintrywords@fakemail.com',    name: 'Fiona',     surname: 'Marsh',    picture: 'https://i.pravatar.cc/150?img=26' },
  { username: 'SiblingHood',    email: 'siblinghood@fakemail.com',    name: 'Tyler',     surname: 'Brooks',   picture: 'https://i.pravatar.cc/150?img=38' },
  { username: 'soberlife_',     email: 'soberlife@fakemail.com',      name: 'Marcus',    surname: 'Stone',    picture: 'https://i.pravatar.cc/150?img=48' },
  { username: 'birthdays_hurt', email: 'birthdayshurt@fakemail.com',  name: 'Abby',      surname: 'Clarke',   picture: 'https://i.pravatar.cc/150?img=10' },
  { username: 'immigrant.pen',  email: 'immigrantpen@fakemail.com',   name: 'Elena',     surname: 'Vega',     picture: 'https://picsum.photos/seed/citystreet/150/150' },
  { username: 'GrievingMom_',   email: 'grievingmom@fakemail.com',    name: 'Sandra',    surname: 'Collins',  picture: 'https://i.pravatar.cc/150?img=64' }
]

// ============================================================
// POEMS
// ============================================================
const fakePoems = [

  // === moonwriter23 (Emily Hart) — night / moon / dreams / silence ===
  { username: 'moonwriter23', title: 'The Moon Again', genre: 'moon', date: new Date('2023-01-15'), poem: `the moon keeps coming back
like it hasn't decided anything yet
pale and round and indifferent
i watch it from the same window

it doesn't know my name` },

  { username: 'moonwriter23', title: '3am', genre: 'night', date: new Date('2023-02-11'), poem: `everything is louder at 3am
the thoughts i don't have time for
during the day
come home

the refrigerator hums
and i think about you` },

  { username: 'moonwriter23', title: 'What I Dream', genre: 'dreams', date: new Date('2023-03-08'), poem: `i dream about the house i grew up in
it's always rearranged
rooms in different order
doors that shouldn't be there

my mother is in the kitchen
but when i walk in
it's someone else` },

  { username: 'moonwriter23', title: 'Quiet', genre: 'silence', date: new Date('2023-04-22'), poem: `there is a kind of silence
that isn't empty at all
it's full of everything
you chose not to say

i live in that silence` },

  { username: 'moonwriter23', title: 'Silver', genre: 'moon', date: new Date('2023-05-17'), poem: `silver on the garden
silver on the floor
the moon makes everything look
like it belongs somewhere else

i stand in it
letting myself be
translated` },

  { username: 'moonwriter23', title: 'Insomnia', genre: 'night', date: new Date('2023-06-30'), poem: `i counted the tiles in the ceiling
i counted my breaths
i counted the cars that passed outside
one in a while

sleep is not a door i can knock on` },

  { username: 'moonwriter23', title: 'The Same Dream Twice', genre: 'dreams', date: new Date('2023-07-14'), poem: `i had the same dream twice this week
you were still here
the apartment still smelled like your coffee

when i woke up
i lay very still
trying to keep it close` },

  { username: 'moonwriter23', title: 'Empty House', genre: 'loneliness', date: new Date('2023-08-28'), poem: `the echo is the worst part
every step, every cup set down
the house repeats you
back to yourself

i've started walking softer` },

  { username: 'moonwriter23', title: 'Midnight Walk', genre: 'night', date: new Date('2023-09-19'), poem: `i walked to the end of the street
and back again
not because it helped
but because moving felt like doing something

the streetlights don't ask questions
i appreciated that` },

  { username: 'moonwriter23', title: 'Stars', genre: 'stars', date: new Date('2023-10-05'), poem: `you said the stars were just fire and distance
nothing more

maybe you're right
but fire and distance
is enough for me` },

  { username: 'moonwriter23', title: 'Half Moon', genre: 'moon', date: new Date('2023-11-11'), poem: `half of something
is still something

i keep telling myself this
looking at the half moon
on a tuesday night

half is fine
half is a lot actually` },

  { username: 'moonwriter23', title: 'What Silence Knows', genre: 'silence', date: new Date('2023-12-23'), poem: `silence knows more than it lets on
it was there for all of it
the conversations
the arguments
the nothing

and it kept everything` },

  { username: 'moonwriter23', title: 'Winter Night', genre: 'night', date: new Date('2024-01-08'), poem: `the cold makes everything precise
edges clear, breath visible
i like winter nights for this

everything fuzzy in summer
everything blurred in grief
but winter cuts through

i can see where things end` },

  { username: 'moonwriter23', title: 'Lucid', genre: 'dreams', date: new Date('2024-02-14'), poem: `the one time i was lucid
i flew over a city i didn't recognize
and landed in a park

a dog came up to me
like it knew me
like we had met before

i woke up and missed the dog` },

  { username: 'moonwriter23', title: 'The Dark', genre: 'darkness', date: new Date('2024-03-21'), poem: `i'm not afraid of the dark
i'm afraid of what i think about
when the dark makes thinking
the only option

the dark isn't the problem` },

  { username: 'moonwriter23', title: 'October Moon', genre: 'moon', date: new Date('2024-04-09'), poem: `october moon you're orange and low
you look closer than you are
i keep reaching for things
that are farther than they look

me and october moon
we understand each other` },

  { username: 'moonwriter23', title: 'Before Dawn', genre: 'night', date: new Date('2024-05-26'), poem: `before dawn the birds start
something i never noticed
until i started waking up at 4am

they're not waiting for the sun
they start early on purpose

i've been thinking about that` },

  { username: 'moonwriter23', title: 'Unsaid', genre: 'silence', date: new Date('2024-06-15'), poem: `everything i didn't say to you
takes up a lot of room

some days the unsaid
is louder than anything i could have said

i don't know if that's grief
or just bad timing` },

  { username: 'moonwriter23', title: 'Dreamless', genre: 'dreams', date: new Date('2024-07-04'), poem: `some nights i don't dream
i fall and i rise
and nothing in between

those are the hardest mornings
like a sentence
with no middle` },

  { username: 'moonwriter23', title: 'New Moon', genre: 'moon', date: new Date('2024-08-17'), poem: `nothing up there tonight
just sky pretending

the new moon is the most honest
it says: i'm here
you just can't see me

i think about people like that` },

  { username: 'moonwriter23', title: 'Night Rain', genre: 'rain', date: new Date('2024-09-30'), poem: `the rain at night sounds
like company

i don't mind being alone
when it rains
the sound fills the room

i think that's okay` },

  { username: 'moonwriter23', title: 'Fog', genre: 'silence', date: new Date('2024-10-18'), poem: `the fog is a kind of silence
that you can see
it takes the edges off everything

i like the fog
i am often the fog` },

  { username: 'moonwriter23', title: 'The Long Dark', genre: 'darkness', date: new Date('2024-11-07'), poem: `i used to be afraid of long dark evenings
now they feel like mine

i own the long dark now
we have an understanding

it stays, i stay
we don't explain ourselves` },

  { username: 'moonwriter23', title: 'Pale Light', genre: 'moon', date: new Date('2024-12-29'), poem: `the pale light through the curtain
means it's night
and i'm still awake
and the world is still turning

without asking me first` },

  { username: 'moonwriter23', title: 'Vigil', genre: 'night', date: new Date('2025-01-20'), poem: `i kept watch over nothing
for hours
window to ceiling to window

but keeping watch
is its own purpose i think

the watched night is not alone` },

  // === versesbysadie (Sadie Monroe) — heartbreak / sad / lost-love ===
  { username: 'versesbysadie', title: 'You Left on a Tuesday', genre: 'lost-love', date: new Date('2023-02-28'), poem: `you left on a tuesday
which is nobody's favorite day
even the week didn't care about it

i still hate tuesdays
but now at least
there's a reason` },

  { username: 'versesbysadie', title: 'Read Receipts', genre: 'heartbreak', date: new Date('2023-04-01'), poem: `you read my message at 2:47pm
and then nothing
and then nothing
and then nothing

i stared at my phone
like staring harder
would change the color` },

  { username: 'versesbysadie', title: 'Your Jacket', genre: 'missing-you', date: new Date('2023-05-10'), poem: `i still have your jacket
in the closet behind my winter coats
i don't wear it
but i don't move it either

it's still there
and so is everything it means` },

  { username: 'versesbysadie', title: 'Moving On is Stupid', genre: 'heartbreak', date: new Date('2023-06-18'), poem: `people keep telling me to move on
like moving on is a train
you can catch

where does it go
who said i want to go there` },

  { username: 'versesbysadie', title: 'Three Months', genre: 'sad', date: new Date('2023-07-25'), poem: `it's been three months
and i still
sometimes forget

for about two seconds in the morning
before i remember
everything floods back` },

  { username: 'versesbysadie', title: 'Last Text', genre: 'lost-love', date: new Date('2023-08-14'), poem: `the last text you ever sent me
is still there
i don't read it
but i know exactly where it is

i could scroll up anytime
but what would that do` },

  { username: 'versesbysadie', title: 'Playlist', genre: 'heartbreak', date: new Date('2023-09-22'), poem: `i can't listen to half my playlist anymore
you're in all of it
laughing in the background
of things that were mine before they were ours

it's all ruined now
but also it's all i have` },

  { username: 'versesbysadie', title: 'What You Said', genre: 'sad', date: new Date('2023-10-30'), poem: `you said it like you meant it
at the time i think you did
that's almost worse
than if you'd lied

you meant it
and then you didn't
and i'm still here with both things` },

  { username: 'versesbysadie', title: 'Your Name in My Phone', genre: 'missing-you', date: new Date('2023-11-15'), poem: `your name is still in my phone
i scrolled past it yesterday
by accident

i didn't delete it
you know why` },

  { username: 'versesbysadie', title: 'Not Mad Anymore', genre: 'lost-love', date: new Date('2023-12-12'), poem: `i'm not even mad anymore
that's the sad part

mad was something
mad was energy

now it's just
nothing
which is heavier` },

  { username: 'versesbysadie', title: 'How You Said Goodbye', genre: 'sad', date: new Date('2024-01-20'), poem: `you said it casual
like it wasn't the last time
like we'd have another chance to practice

i wish i'd known
i'd have said it better` },

  { username: 'versesbysadie', title: 'Still', genre: 'heartbreak', date: new Date('2024-02-29'), poem: `still check your instagram
still
even though nothing will be there for me
still` },

  { username: 'versesbysadie', title: 'The Couch', genre: 'missing-you', date: new Date('2024-03-15'), poem: `we watched so many movies on this couch
i can't lie down on it
the same way anymore

my body remembers
where you were` },

  { username: 'versesbysadie', title: 'Small Things', genre: 'sad', date: new Date('2024-04-28'), poem: `it's the small things that get me
not the big anniversaries
but the small things

like the brand of yogurt you liked
being on sale` },

  { username: 'versesbysadie', title: 'Moving Boxes', genre: 'lost-love', date: new Date('2024-05-11'), poem: `i packed your stuff in three boxes
it fit in three boxes
everything you left behind

i thought it would take longer` },

  { username: 'versesbysadie', title: 'Six Months Out', genre: 'healing', date: new Date('2024-06-03'), poem: `six months out
and i made plans with someone new
not romantic just plans

it felt okay
and then i felt bad for it feeling okay
and then okay again

it's a whole thing` },

  { username: 'versesbysadie', title: 'Before You', genre: 'memory', date: new Date('2024-07-19'), poem: `i was someone before you
i keep forgetting that
there was a whole person
going places and having opinions

i'm still here
i'm going to get back to her` },

  { username: 'versesbysadie', title: 'Crying in the Car', genre: 'sad', date: new Date('2024-08-25'), poem: `i cried in the car again
just sat in the parking lot
and let it happen

my car knows more about this
than any of my friends` },

  { username: 'versesbysadie', title: 'Progress', genre: 'healing', date: new Date('2024-09-08'), poem: `today i only thought about you
twice
which is progress i think

or maybe i was busy
either way` },

  { username: 'versesbysadie', title: 'Better Than You', genre: 'strength', date: new Date('2024-10-21'), poem: `my mom says i'm better than you
and she's not wrong
but that's not really the point is it

the point is
i loved you anyway
that says something about me
not you` },

  { username: 'versesbysadie', title: 'What Love Actually Is', genre: 'love', date: new Date('2024-11-14'), poem: `i thought i knew what love was
turns out i knew what
wanting someone to stay
feels like

different thing
harder thing
mine thing` },

  { username: 'versesbysadie', title: 'Anyway', genre: 'moving-on', date: new Date('2024-12-31'), poem: `anyway
that's done now

i'm going to go get coffee
and not think about it
for at least the next
twenty minutes

that's a win` },

  // === thomaswalker_ (Thomas Walker) — nature / ocean / environment / seasons ===
  { username: 'thomaswalker_', title: 'The River Doesn\'t Care', genre: 'nature', date: new Date('2023-03-12'), poem: `the river doesn't care what day it is
doesn't mark its own seasons
it rises and it goes
without ceremony

i've been watching rivers for years
trying to learn this` },

  { username: 'thomaswalker_', title: 'High Tide', genre: 'ocean', date: new Date('2023-04-25'), poem: `high tide covers the footprints
makes the beach new again
temporary, sure
but clean

i've been thinking about clean starts
the tide makes them look easy` },

  { username: 'thomaswalker_', title: 'Redwoods', genre: 'trees', date: new Date('2023-05-30'), poem: `the trees here were old before anyone
was writing anything down
they don't care about that

they just kept being trees
and we called that survival` },

  { username: 'thomaswalker_', title: 'October Birds', genre: 'birds', date: new Date('2023-07-08'), poem: `in october the birds get practical
south is south
no ceremony no goodbye

just the decision
and then the going` },

  { username: 'thomaswalker_', title: 'Climate', genre: 'climate-change', date: new Date('2023-08-17'), poem: `the glacier is smaller this year
than last year
than the year before

i have pictures from thirty years ago
and the comparison is hard to look at
but i keep looking` },

  { username: 'thomaswalker_', title: 'Low Water', genre: 'environment', date: new Date('2023-09-29'), poem: `the lake is lower every summer
the ring of pale rock
tells the story
without any help

we still sit by it
like nothing has changed` },

  { username: 'thomaswalker_', title: 'Winter Field', genre: 'winter', date: new Date('2023-10-21'), poem: `nothing in the field but brown stalks
and frost
and two crows
looking for whatever crows look for

it's enough
this is a complete scene` },

  { username: 'thomaswalker_', title: 'Returning', genre: 'nature', date: new Date('2023-11-28'), poem: `i came back to the same campsite
after twelve years
the trees were taller
and the fire pit was someone else's rocks

everything returns to something
but not to itself` },

  { username: 'thomaswalker_', title: 'Tide Pool', genre: 'ocean', date: new Date('2023-12-15'), poem: `the tide pool has its own rules
everything waiting for the tide to tell it what to do
the anemone doesn't rush

i sat there an hour
before i realized i was holding my breath` },

  { username: 'thomaswalker_', title: 'Spring Mud', genre: 'spring', date: new Date('2024-01-26'), poem: `the mud is the first sign
ugly and true and cold
the mud is spring before spring knows it

i walked through the field
anyway
my boots disagree` },

  { username: 'thomaswalker_', title: 'The Wind', genre: 'nature', date: new Date('2024-03-04'), poem: `the wind moved through the grass
and the grass moved
in a wave that started somewhere else

everything moves because
something else moved first` },

  { username: 'thomaswalker_', title: 'Coral', genre: 'ocean', date: new Date('2024-04-18'), poem: `they showed me pictures of the reef
what it looked like before the bleaching
the color of it

and then what it looks like now
pale and branching and quiet
like an apology` },

  { username: 'thomaswalker_', title: 'Deer at Dusk', genre: 'animal', date: new Date('2024-05-09'), poem: `the deer came into the clearing at dusk
two of them
they looked at me and didn't run

i don't know what that means
but it felt like something` },

  { username: 'thomaswalker_', title: 'Rain on Tent', genre: 'rain', date: new Date('2024-06-22'), poem: `rain on a tent
is the best sound for sleeping
i don't need a reason
i don't need a study

i know what i know` },

  { username: 'thomaswalker_', title: 'Late Summer', genre: 'summer', date: new Date('2024-07-31'), poem: `late summer has a specific feeling
everything at its most
and the knowledge
that most is about to become less

i love late summer
i hate it too` },

  { username: 'thomaswalker_', title: 'The Elm', genre: 'trees', date: new Date('2024-09-02'), poem: `the elm in the town square
got dutch elm disease last spring
they took it down in sections

it was there when my grandparents
were married in that square
now it's not` },

  { username: 'thomaswalker_', title: 'Sea Glass', genre: 'ocean', date: new Date('2024-10-14'), poem: `sea glass is a broken bottle
after long enough
it becomes something people collect

i like that story
i don't want to explain why` },

  { username: 'thomaswalker_', title: 'Autumn Migration', genre: 'birds', date: new Date('2024-11-28'), poem: `forty thousand birds
above the marsh
in a moving cloud

i pulled over and got out of the car
and watched until they were gone
late for everything` },

  { username: 'thomaswalker_', title: 'First Snow', genre: 'winter', date: new Date('2025-01-10'), poem: `first snow fell last night
quiet and accurate
covered everything with the same blanket

in the morning everything looked like
it had been forgiven
for something` },

  { username: 'thomaswalker_', title: 'The Watershed', genre: 'environment', date: new Date('2025-03-05'), poem: `all of it
the rain on the mountain
the stream through the field
the river to the sea

everything belongs to the watershed
even you
even me` },

  // === dadof3writes (Michael Brennan) — family / father / memory / nostalgia ===
  { username: 'dadof3writes', title: 'Three Kids', genre: 'family', date: new Date('2023-04-15'), poem: `three kids is a lot
more than i expected to love
more than i thought i had room for

turns out love doesn't work like space
you don't divide it
you just keep making more` },

  { username: 'dadof3writes', title: 'Teaching to Ride', genre: 'father', date: new Date('2023-06-01'), poem: `i held the seat for longer than she knew
and then i let go
she went six feet and fell

we did it seventeen more times
she got it on the eighteenth

i pretended i wasn't crying
she didn't notice` },

  { username: 'dadof3writes', title: 'My Father\'s Hands', genre: 'father', date: new Date('2023-07-20'), poem: `my father's hands were never soft
wood and soil and hard use
the hands of someone
who solved problems with them

i have his hands
i realized it one day
in the kitchen
and stood there for a while` },

  { username: 'dadof3writes', title: 'Bedtime', genre: 'childhood', date: new Date('2023-08-30'), poem: `the kids still want a story
even the oldest
who pretends she doesn't

but she stays in the doorway
listening
until i'm done` },

  { username: 'dadof3writes', title: 'Old Neighborhood', genre: 'nostalgia', date: new Date('2023-09-25'), poem: `i drove through the old neighborhood
the house is a different color
someone put up a fence
where there wasn't one

everything fits except me
i drove out slow` },

  { username: 'dadof3writes', title: 'First Day of School', genre: 'childhood', date: new Date('2023-11-05'), poem: `first day of school
she carried her backpack
like it was her job now

it is her job now
she's doing it fine
she doesn't need me for this part

it's still hard` },

  { username: 'dadof3writes', title: 'What I Wanted to Be', genre: 'memory', date: new Date('2023-12-18'), poem: `when i was eleven i wanted to be
a marine biologist
then an astronaut
then a chef

now i'm a project manager
and a father of three

i'm okay with the second one` },

  { username: 'dadof3writes', title: 'His Things', genre: 'memory', date: new Date('2024-01-15'), poem: `my father's watch is on my dresser
i don't wear it
it's not really my style

but it's his
and he's not here
so it's mine to keep` },

  { username: 'dadof3writes', title: 'Summer Mornings', genre: 'nostalgia', date: new Date('2024-03-08'), poem: `summer mornings when i was a kid
we'd be outside by eight
and back inside at dark

my kids are different
they want air conditioning and wifi
i don't blame them
but i miss something i can't explain` },

  { username: 'dadof3writes', title: 'Middle Child', genre: 'family', date: new Date('2024-04-22'), poem: `my middle one is quiet
the one you have to check on
easy to miss in the noise of the others

she has a whole life going on
i try to remember to ask about it
she tells me things she doesn't tell her mother
i take that seriously` },

  { username: 'dadof3writes', title: 'Driving to College', genre: 'growing-up', date: new Date('2024-05-30'), poem: `i drove her to college
three hours
we didn't talk much

at the dorm i carried boxes
and met her roommate
and said okay well

and she said yeah okay dad
and we hugged in the hallway
and i drove three hours home` },

  { username: 'dadof3writes', title: 'Saturday Morning', genre: 'nostalgia', date: new Date('2024-07-15'), poem: `saturday morning cartoons
and cereal in front of the tv
my mother pretending to be mad
and actually not caring at all

those saturday mornings were the whole world
i didn't know they would end
nobody told me` },

  { username: 'dadof3writes', title: 'The Attic Box', genre: 'memory', date: new Date('2024-08-28'), poem: `i found an attic box
with report cards
and drawings
and a ribbon from a race i won

i was a child
someone kept these things
carefully, on purpose

that gets me every time` },

  { username: 'dadof3writes', title: 'My Son at Fifteen', genre: 'teen', date: new Date('2024-10-01'), poem: `my son at fifteen
is a closed door
a shrug, a fine

i remember being fifteen
i was also a closed door
he'll open when he's ready

i'm trying to be patient
and present at the same time` },

  { username: 'dadof3writes', title: 'Christmas Eve Ritual', genre: 'christmas', date: new Date('2024-11-20'), poem: `every christmas eve
my dad read the same story
and we put out cookies
and argued about whether santa was real

we all knew
we played along anyway
some things are true
because you keep doing them` },

  { username: 'dadof3writes', title: 'What I Know Now', genre: 'aging', date: new Date('2025-01-05'), poem: `i know now that time is the thing
not money or ambition or being right
just time

and i knew it when my kids were small
but i was busy knowing it
instead of using it` },

  { username: 'dadof3writes', title: 'Retirement', genre: 'aging', date: new Date('2025-03-14'), poem: `my dad retired on a friday
and on saturday
didn't know what to do

he learned woodworking
he made things for people
he was good at it
he was happy

i think about that a lot` },

  { username: 'dadof3writes', title: 'Grocery List', genre: 'family', date: new Date('2025-05-22'), poem: `i still buy things she likes
by accident
after eight months

apple juice
those specific chips

i put them back
or i don't
depends on the day` },

  // === angryquill (Maya Torres) — social-justice / anger / racism-and-discrimination ===
  { username: 'angryquill', title: 'Not Again', genre: 'racism-and-discrimination', date: new Date('2023-01-25'), poem: `not again
the headline again
the name again
the video i will not watch again

but will know about
will carry
like all the other names
i was not supposed to have to carry` },

  { username: 'angryquill', title: 'Invisible', genre: 'racism-and-discrimination', date: new Date('2023-04-06'), poem: `the kind of invisible
where everyone can see you
but no one is looking

the kind of invisible
that makes you loud
just to prove you exist` },

  { username: 'angryquill', title: 'Anger is a Tool', genre: 'anger', date: new Date('2023-06-12'), poem: `they want me calm
they want me reasonable
they want me digestible

my anger is not for their comfort
my anger is a tool
i've learned to use it

step back if you're not ready` },

  { username: 'angryquill', title: 'What We Built', genre: 'history-and-politics', date: new Date('2023-08-22'), poem: `we built this country too
the unrecorded labor
the unpaid hands
the erased names

we built it
and we're still being asked
to prove we belong here` },

  { username: 'angryquill', title: 'The Vote', genre: 'social-justice', date: new Date('2023-10-14'), poem: `my grandmother stood in line for hours
to vote for the first time at age 52
the year was 1965

i vote for her
i vote loud
i vote like it costs me something
because it did` },

  { username: 'angryquill', title: 'Coded Language', genre: 'social-commentaries', date: new Date('2023-12-02'), poem: `the language is always coded
safety concern is a translation
certain neighborhood is a translation
not the right fit is a translation

i've learned to read it
but i'm tired of needing to` },

  { username: 'angryquill', title: 'For the Girls After Me', genre: 'gender-and-feminism', date: new Date('2024-02-16'), poem: `for the girls who come after me
i want the air to be cleaner
the doors to be open wider
the asking to be less

i'm not sure i'll live to see it
but i'm making it anyway` },

  { username: 'angryquill', title: 'Silence is a Choice', genre: 'social-justice', date: new Date('2024-04-01'), poem: `when you stay quiet
you're still choosing
quiet is the choice
that keeps things the same

i see the quiet
the careful looking away
that's a vote too` },

  { username: 'angryquill', title: 'My Name', genre: 'identity', date: new Date('2024-05-20'), poem: `my name is not difficult
it is exactly as long as it is
and sounds like what it sounds like

if you can say chardonnay
you can say my name
try again` },

  { username: 'angryquill', title: 'Legacy', genre: 'slavery-and-freedom', date: new Date('2024-07-08'), poem: `the legacy isn't behind us
it's in the interest rates
the school districts
the arrest records
the hospital data

the past is very present
i wish this were a metaphor` },

  { username: 'angryquill', title: 'Who Gets the Benefit', genre: 'social-commentaries', date: new Date('2024-09-03'), poem: `who gets the benefit of the doubt
that's the question
that's always been the question

write it down
ask it every time
see what the answer is` },

  { username: 'angryquill', title: 'Still Here', genre: 'strength', date: new Date('2024-10-28'), poem: `still here
after everything
still here

they did not finish us
we are inconveniently still here
and we will be here tomorrow
making it harder to ignore` },

  { username: 'angryquill', title: 'What I Owe', genre: 'social-justice', date: new Date('2024-12-15'), poem: `i owe something to the people
who couldn't say what they needed to say
who were not allowed
who said it anyway
at great cost

i owe them noise
i owe them this poem` },

  { username: 'angryquill', title: 'Immigration Line', genre: 'immigration', date: new Date('2025-02-11'), poem: `my father waited years
for a form
for an answer to a form

my family is from here and not from here
both things are true
the border has opinions
my father doesn't` },

  { username: 'angryquill', title: 'The Policy', genre: 'poverty', date: new Date('2025-04-20'), poem: `the policy sounds neutral
numbers and percentages
cost-benefit analysis

but policy lands on bodies
specific bodies
bodies with names and children
and bills due on the first` },

  // === coffeeshopverses (Jake Sullivan) — city / work / humor / loneliness ===
  { username: 'coffeeshopverses', title: 'Open Office', genre: 'work', date: new Date('2023-05-18'), poem: `they took away the walls
and called it collaboration
now i know exactly
when greg is on the phone with his mom

this is the innovation` },

  { username: 'coffeeshopverses', title: 'Coffee Number Four', genre: 'humor', date: new Date('2023-07-11'), poem: `this is coffee number four
at 2pm on a wednesday
the fourth is always a mistake
but also necessary

i've made peace with it` },

  { username: 'coffeeshopverses', title: 'Morning Commute', genre: 'city', date: new Date('2023-09-02'), poem: `on the subway everyone stares
at their own screen
showing their own version
of something they'd rather be doing

i do it too
we all do it
we're down here together
not touching` },

  { username: 'coffeeshopverses', title: 'LinkedIn', genre: 'work', date: new Date('2023-11-14'), poem: `excited to announce
thrilled to share
humbled to be recognized as

i'm not sure any of us
are this excited about work
but we're all performing it
on the same platform` },

  { username: 'coffeeshopverses', title: 'Corner Booth', genre: 'loneliness', date: new Date('2024-01-28'), poem: `corner booth for one
at a restaurant that seats two hundred
i have a book
i'm not reading it

i'm watching people
who came with people` },

  { username: 'coffeeshopverses', title: 'After Work', genre: 'humor', date: new Date('2024-04-07'), poem: `free drinks from 5 to 7
which means everyone drinks fast
and is suddenly best friends with HR

at 7:01 it ends
and we remember
who we actually are` },

  { username: 'coffeeshopverses', title: 'City Windows at Night', genre: 'city', date: new Date('2024-06-19'), poem: `from the street i can see into windows
other people's lights
other people's living rooms
other people's tuesday evenings

everyone looks okay from this distance` },

  { username: 'coffeeshopverses', title: 'Still Working', genre: 'work', date: new Date('2024-09-01'), poem: `11pm still at the laptop
the apartment smells like delivery food
there's a meeting at 8am

i'll be there
i'll be fine
i'm always fine` },

  { username: 'coffeeshopverses', title: 'Weekend in the City', genre: 'loneliness', date: new Date('2024-11-23'), poem: `saturday morning and the city
belongs to people with plans
i have a list
and a coffee
and no one expecting me anywhere

i like it
i do
mostly` },

  // === jesusismyrock_ (Ruth Caldwell) — faith / prayer / god / hope ===
  { username: 'jesusismyrock_', title: 'Morning Prayer', genre: 'prayer', date: new Date('2023-06-04'), poem: `every morning before the coffee
i sit in the quiet
and say thank you

for the morning
for the breath
for the fact that i'm still here
to say it` },

  { username: 'jesusismyrock_', title: 'When It Was Hard', genre: 'faith', date: new Date('2023-08-19'), poem: `when my husband left
when the diagnosis came
when my daughter wasn't speaking to me

i still prayed
not because i had answers
but because i needed something
to hold onto` },

  { username: 'jesusismyrock_', title: 'I Don\'t Understand', genre: 'god', date: new Date('2023-10-25'), poem: `i don't understand why things happen
i stopped trying to explain it
to myself or anyone else

i believe anyway
not in explanations
in grace` },

  { username: 'jesusismyrock_', title: 'Sunday', genre: 'spiritual', date: new Date('2024-01-07'), poem: `sunday i sit in the same pew
where my mother sat
and her mother before her

the wood is worn smooth
where hands have held on
for a hundred years

i hold on too` },

  { username: 'jesusismyrock_', title: 'His Eye is on the Sparrow', genre: 'hope', date: new Date('2024-03-17'), poem: `i remember my grandmother singing it
in the kitchen
not performing
just singing

if god watches sparrows
then surely
surely
surely` },

  { username: 'jesusismyrock_', title: 'Doubt', genre: 'faith', date: new Date('2024-06-08'), poem: `i've had doubt
i won't pretend i haven't
some nights it sat right next to me
heavy and close

but faith isn't the absence of doubt
i know that now
it's choosing to get up anyway` },

  { username: 'jesusismyrock_', title: 'For My Daughter', genre: 'prayer', date: new Date('2024-09-14'), poem: `i pray for my daughter
every single night
even when we aren't speaking
especially then

i don't know if it reaches her
but it reaches somewhere
and i keep sending it` },

  { username: 'jesusismyrock_', title: 'Enough', genre: 'gratitude', date: new Date('2025-01-03'), poem: `i have enough
not everything
but enough

the roof
the table
the people who answer when i call

i say it every day
i have enough
thank you` },

  // === queerpoetrybabe (Sam Rivera) — lgbtq / identity / self-love ===
  { username: 'queerpoetrybabe', title: 'Coming Out Again', genre: 'lgbtq', date: new Date('2023-03-22'), poem: `i've come out more times than i can count
to cousins at christmas
to new jobs
to doctors who assume

every time is the first time
the breath before
the wondering how it lands` },

  { username: 'queerpoetrybabe', title: 'What I Am', genre: 'identity', date: new Date('2023-05-31'), poem: `i am not a phase
not a political statement
not confusion
not something that happened to me

i am exactly
what i told you i am
on the first try` },

  { username: 'queerpoetrybabe', title: 'Pride Parade', genre: 'lgbtq', date: new Date('2023-08-09'), poem: `the first time i went
i cried at the corner of 5th and main
just from seeing everyone
just from the volume of it
all of us

i didn't know there were so many of us` },

  { username: 'queerpoetrybabe', title: 'Mirror', genre: 'self-love', date: new Date('2023-10-18'), poem: `the mirror and i
have worked out a truce

some days i look good
some days i look like a person
trying to look good

either way i show up
that's what we agreed` },

  { username: 'queerpoetrybabe', title: 'Family Dinner', genre: 'identity', date: new Date('2024-01-04'), poem: `family dinner and nobody says it
the pronoun nobody uses
the name my aunt still gets wrong

i correct her
she nods
she forgets
i correct her again

this is what love looks like sometimes
doing it again` },

  { username: 'queerpoetrybabe', title: 'Enough Room', genre: 'lgbtq', date: new Date('2024-03-28'), poem: `there is enough room for me here
i've decided

i've been asking permission for years
i'm done asking
i'm just taking up the space
i was always allowed to have` },

  { username: 'queerpoetrybabe', title: 'To the Kid Who Was Me', genre: 'self-love', date: new Date('2024-06-12'), poem: `to the kid who was me
at fourteen
alone with a secret

i want to say:
you don't have to carry this alone
it gets louder and lighter at the same time
you survive the carrying` },

  { username: 'queerpoetrybabe', title: 'My Body', genre: 'self-love', date: new Date('2024-09-07'), poem: `my body has been
everyone's opinion for years
commented on corrected adjusted

it's mine actually
i'm the one who lives here
i'm the one who decides` },

  { username: 'queerpoetrybabe', title: 'Out and Fine', genre: 'lgbtq', date: new Date('2024-12-20'), poem: `i'm out and i'm fine
the two things that seemed impossible at once

out and fine
like a weather report
for a life i didn't think i'd have` },

  // === ryaninnature (Ryan Cole) — nature / birds / garden ===
  { username: 'ryaninnature', title: 'Morning Birdsong', genre: 'birds', date: new Date('2023-04-08'), poem: `before the alarm
before the news
before coffee

the birds are already at it
having their whole morning
without asking anyone's permission` },

  { username: 'ryaninnature', title: 'The Garden in March', genre: 'garden', date: new Date('2023-06-15'), poem: `nothing much in march
but i go out anyway
and check the corners
where things come back from

they come back
they always come back
i forget this every winter` },

  { username: 'ryaninnature', title: 'Watching the Hawk', genre: 'birds', date: new Date('2023-08-27'), poem: `the hawk on the fence post
didn't move for twenty minutes
neither did i

we had an understanding
about stillness` },

  { username: 'ryaninnature', title: 'First Tomatoes', genre: 'garden', date: new Date('2023-11-01'), poem: `first tomatoes of the year
warm from the vine
i eat one right there
standing in the dirt

no plate
no recipe
just the thing itself` },

  { username: 'ryaninnature', title: 'Migration', genre: 'birds', date: new Date('2024-02-10'), poem: `i track the warbler migration every may
on a spreadsheet i've kept for eleven years
people think it's strange

but i know when spring is here
before anyone else does` },

  { username: 'ryaninnature', title: 'Wildflowers', genre: 'flower', date: new Date('2024-05-03'), poem: `i stopped mowing one section of the lawn
just left it
and waited

by june it was full of things
i didn't plant
that didn't need me` },

  { username: 'ryaninnature', title: 'Fall Equinox', genre: 'autumn', date: new Date('2024-08-14'), poem: `the equinox is just a date
but the light knows
the light is different
the afternoon has an opinion

the light says: start finishing things` },

  { username: 'ryaninnature', title: 'Sunday Soil', genre: 'garden', date: new Date('2024-11-09'), poem: `sunday morning with my hands in the soil
the church bells are going
somewhere down the street

i have my own service out here` },

  // === teenwrites_ (Lily Chen) — teen / school / heartbreak ===
  { username: 'teenwrites_', title: 'Lunch Table', genre: 'school', date: new Date('2023-09-14'), poem: `there's a whole science to where you sit
i've studied it for three years
i still don't understand all of it

i sit with the same two people
who also don't understand it
we're okay` },

  { username: 'teenwrites_', title: 'He Didn\'t Text Back', genre: 'heartbreak', date: new Date('2023-11-03'), poem: `he didn't text back
and now i'm rereading everything i sent
looking for the wrong thing

i texted him first
that was probably it` },

  { username: 'teenwrites_', title: 'GPA', genre: 'school', date: new Date('2024-01-19'), poem: `my gpa determines my future
according to everyone
i calculate it in my head
while walking to class

like it's a number i can fix
by thinking about it harder` },

  { username: 'teenwrites_', title: 'The Group Chat', genre: 'teen', date: new Date('2024-04-02'), poem: `the group chat moved on
from something i said
three messages later
like i didn't say it

that's somehow worse
than an argument` },

  { username: 'teenwrites_', title: 'Instagram vs Real', genre: 'teen', date: new Date('2024-06-30'), poem: `instagram version: laughing with friends
real version: cropped out the sadness
real version: took forty-three pictures to get one
real version: didn't feel like any of it

but the one that posted looked fun` },

  { username: 'teenwrites_', title: 'Prom', genre: 'school', date: new Date('2024-09-22'), poem: `prom is supposed to be everything
and it's mostly just
a dress and pictures
and waiting for something to happen

something happened
i didn't love it
i don't know what i expected` },

  { username: 'teenwrites_', title: 'Okay I Think', genre: 'growing-up', date: new Date('2024-12-08'), poem: `i think i'm okay
most days
not all days

some days being sixteen is fine
some days it's too heavy to carry

today was medium
which is better than last month` },

  // === oceandeep99 (Marcus Webb) — ocean / rain / travel ===
  { username: 'oceandeep99', title: 'The Open Water', genre: 'ocean', date: new Date('2023-02-17'), poem: `there's nothing past the horizon
until there is
i've thought about that on every crossing

the horizon moves with you
you never reach it
you just keep going` },

  { username: 'oceandeep99', title: 'Rain in Porto', genre: 'rain', date: new Date('2023-05-04'), poem: `it rained in porto for four days
and i didn't mind
the cobblestones were wet and shining
the wine was cheap and honest

i've been chasing that week for three years` },

  { username: 'oceandeep99', title: 'Night Ferry', genre: 'travel', date: new Date('2023-07-22'), poem: `night ferry across the channel
sleeping upright in a plastic chair
cold coffee from a vending machine

none of that matters when morning comes
and france is there` },

  { username: 'oceandeep99', title: 'Current', genre: 'ocean', date: new Date('2023-10-09'), poem: `the current takes you
if you fight it you tire
if you follow it you go somewhere else

i've been thinking about this
not about swimming` },

  { username: 'oceandeep99', title: 'How Rain Sounds Everywhere', genre: 'rain', date: new Date('2024-01-14'), poem: `rain in tokyo
rain in glasgow
rain in nairobi

all the same sound
everything else different
the rain is the constant` },

  { username: 'oceandeep99', title: 'Layover', genre: 'travel', date: new Date('2024-03-30'), poem: `three hours in an airport
in a country where i don't know anyone
eating a sandwich from a chain
that exists everywhere

i've learned to love layovers
the in-between` },

  { username: 'oceandeep99', title: 'Underwater', genre: 'ocean', date: new Date('2024-06-17'), poem: `underwater the noise stops
everything slows down
i've found it's the only way
to think sometimes

i go under and stay until i need air
which is a metaphor
but also literally true` },

  { username: 'oceandeep99', title: 'Monsoon', genre: 'rain', date: new Date('2024-09-05'), poem: `i was in mumbai for the monsoon once
the whole city stopped
then the rain started
then the city started again

in rain` },

  { username: 'oceandeep99', title: 'Why I Travel Alone', genre: 'travel', date: new Date('2024-11-30'), poem: `people ask why i travel alone
like it needs an explanation
like staying needs one too

i travel alone because
i am the only one i always have with me` },

  // === GrumpyGrandpa (Harold Jenkins) — aging / nostalgia / war / veterans ===
  { username: 'GrumpyGrandpa', title: 'These Knees', genre: 'aging', date: new Date('2023-07-03'), poem: `these knees aren't what they were
which is fine
i wasn't what i was either
at some point

everything changes
my knees are just being honest about it` },

  { username: 'GrumpyGrandpa', title: 'Vietnam', genre: 'war', date: new Date('2023-09-18'), poem: `i don't talk about vietnam
not at the dinner table
not with people who weren't there

some things are not
for explaining` },

  { username: 'GrumpyGrandpa', title: 'The Old House', genre: 'nostalgia', date: new Date('2023-12-04'), poem: `we sold the house in '09
the kids were grown
it made sense to sell it

i drove past it last summer
someone painted the shutters blue
i didn't like it
but i didn't have a say in it` },

  { username: 'GrumpyGrandpa', title: 'What Young People Don\'t Know', genre: 'aging', date: new Date('2024-02-22'), poem: `what young people don't know
is that you still feel twenty-six
inside
while the outside
does what it does

strange business
being in here while out there changes` },

  { username: 'GrumpyGrandpa', title: 'Memorial Day', genre: 'memorial-day', date: new Date('2024-05-27'), poem: `every memorial day i go to the cemetery
i don't bring flowers
i bring silence

the men i'm visiting
are past the need for flowers` },

  { username: 'GrumpyGrandpa', title: 'The VFW', genre: 'veterans', date: new Date('2024-08-11'), poem: `tuesday nights at the VFW
same faces
same complaints
same bad coffee

the best people i know` },

  { username: 'GrumpyGrandpa', title: 'Old Letters', genre: 'nostalgia', date: new Date('2024-10-30'), poem: `i found letters she wrote me
before we were married
sixty years ago

the handwriting is hers
but the voice is someone young
nervous and hopeful
someone i knew

someone i loved for sixty years` },

  // === lostinlove23 (Aria Patel) — romantic / love / missing-you ===
  { username: 'lostinlove23', title: 'You\'re Still The One', genre: 'love', date: new Date('2023-04-19'), poem: `after all the years
you're still the one i text
when something funny happens
when something terrible happens
when nothing happens
and i want to say so

you're still the one` },

  { username: 'lostinlove23', title: 'Long Distance', genre: 'long-distance', date: new Date('2023-07-06'), poem: `the time difference is 8 hours
which means i miss you
in a different time zone

you're already tomorrow
and i'm still today
and i love you across all of it` },

  { username: 'lostinlove23', title: 'How You Laugh', genre: 'romantic', date: new Date('2023-09-27'), poem: `how you laugh
like it surprises you every time
like the joke caught you off guard

i set up jokes just for that` },

  { username: 'lostinlove23', title: 'Waiting for Your Call', genre: 'missing-you', date: new Date('2023-12-01'), poem: `my phone on the counter
face up
always face up now

you said you'd call at seven
it's seven-oh-four
which is fine
which is nothing

but i'm watching` },

  { username: 'lostinlove23', title: 'Eleven Years', genre: 'anniversary', date: new Date('2024-02-05'), poem: `eleven years today
we ate at the same place we always go
ordered the same things
held hands across the table

i love eleven years
i love ordinary
i love you every year including this one` },

  { username: 'lostinlove23', title: 'Your Side of the Bed', genre: 'missing-you', date: new Date('2024-04-13'), poem: `your side of the bed
still smells like you
i haven't washed the pillowcase

don't tell me to wash it
i know
but not yet` },

  { username: 'lostinlove23', title: 'First Date Memory', genre: 'romantic', date: new Date('2024-06-25'), poem: `we got lost
the restaurant was closed
we ate noodles from a place we found by accident

it was perfect
not because anything went right
but because you were there while it went wrong` },

  { username: 'lostinlove23', title: 'What Love Is', genre: 'love', date: new Date('2024-09-11'), poem: `love is remembering
how you take your coffee
love is buying it before you ask

love is the small things done consistently
for years
until they aren't small anymore` },

  { username: 'lostinlove23', title: 'For You', genre: 'love', date: new Date('2024-12-14'), poem: `i wrote you a poem
and then deleted it
because it wasn't good enough

this one isn't either
but you love me anyway
so here it is` },

  // === spiritualfire (Grace Okafor) — spiritual / prayer / god / healing ===
  { username: 'spiritualfire', title: 'In the Morning', genre: 'spiritual', date: new Date('2023-05-11'), poem: `before the world starts
i sit with god
in the kitchen
in the quiet

it's not formal
we don't need formal
we've known each other
for years` },

  { username: 'spiritualfire', title: 'Praise Anyway', genre: 'faith', date: new Date('2023-08-03'), poem: `praise anyway
that's what my grandmother said

when the year was hard
when the money was short
when the body wasn't cooperating

praise anyway
and so i do` },

  { username: 'spiritualfire', title: 'The Spirit Moves', genre: 'spiritual', date: new Date('2023-10-29'), poem: `the spirit moves like wind
you don't see it
you see what it does

the tree bending
the curtain lifting
the feeling in the room
when someone starts to cry

that's the spirit` },

  { username: 'spiritualfire', title: 'Church Home', genre: 'religion', date: new Date('2024-01-21'), poem: `i've been a member of this church
for thirty years
some people think that's too long
in one place

but roots are not a limitation
they're what hold you
when things shake` },

  { username: 'spiritualfire', title: 'Unanswered Prayer', genre: 'prayer', date: new Date('2024-04-06'), poem: `i prayed for things i didn't get
more times than i can count

i've made my peace with this
not by understanding
but by trusting
that the view from here
is not the whole view` },

  { username: 'spiritualfire', title: 'Gratitude as Practice', genre: 'gratitude', date: new Date('2024-07-20'), poem: `gratitude is not a feeling
it's a practice
you do it even on the days
it doesn't feel natural

especially on those days` },

  { username: 'spiritualfire', title: 'Healing Came Slowly', genre: 'healing', date: new Date('2024-10-12'), poem: `healing came slowly
not like a miracle
like a garden

you don't see it
day to day
and then one morning
there's something there
that wasn't there before` },

  { username: 'spiritualfire', title: 'What I Believe', genre: 'faith', date: new Date('2025-02-01'), poem: `i believe in a god
who knows my name
who is not distant
who is in the room

that's enough to keep me going
when everything else
is not enough` },

  // === silentscream (Devon Blake) — mental-health / anxiety / depression / healing ===
  { username: 'silentscream', title: 'Today Was Hard', genre: 'mental-health', date: new Date('2023-03-29'), poem: `today was hard
not in a way i can explain
not in a way that makes sense to most people

just hard
like carrying something heavy
all day
without being able to put it down` },

  { username: 'silentscream', title: 'The Anxiety Sound', genre: 'anxiety', date: new Date('2023-06-16'), poem: `my brain makes a sound
when i'm anxious
not a literal sound
more like a frequency
underneath everything else

some days i don't notice it
most days i do` },

  { username: 'silentscream', title: 'Bad Day Protocol', genre: 'depression', date: new Date('2023-09-08'), poem: `bad day protocol:
drink water
open one window
eat something
lie down
don't lie down too long` },

  { username: 'silentscream', title: 'Invisible Illness', genre: 'mental-health', date: new Date('2023-11-24'), poem: `you can't see what's wrong
that's the problem they have with it
but they also can't see your liver
and they believe in that just fine` },

  { username: 'silentscream', title: 'Therapy', genre: 'healing', date: new Date('2024-02-03'), poem: `i talk to a stranger every week
about things i can't say to anyone else
and it helps

that felt embarrassing to admit once
i don't care anymore
it helps` },

  { username: 'silentscream', title: 'On Medication', genre: 'mental-health', date: new Date('2024-04-19'), poem: `i take a pill every morning
that makes the mornings possible
i'm not ashamed of it

the same people who would be
also take ibuprofen for headaches
the logic is the same` },

  { username: 'silentscream', title: 'The Spiral', genre: 'anxiety', date: new Date('2024-07-03'), poem: `the spiral starts with something small
and then it's everything
and then it's everything that could go wrong
and then it's everything that has gone wrong

and then i breathe
and it's smaller
but it was big for a while` },

  { username: 'silentscream', title: 'Getting Up', genre: 'depression', date: new Date('2024-09-26'), poem: `some days getting up is the whole achievement
shower and coffee
that's two more achievements
on a hard day that's enough

i've learned to count this` },

  { username: 'silentscream', title: 'Recovery Isn\'t Linear', genre: 'healing', date: new Date('2024-12-18'), poem: `i had a good week
and then a bad one
and then a good two days
and then yesterday

recovery isn't linear
everyone says this
it's still annoying when you feel it` },

  // === momlife_poems (Karen Fischer) — mother / family / baby ===
  { username: 'momlife_poems', title: 'Midnight Feeding', genre: 'baby', date: new Date('2023-05-25'), poem: `3am in the chair
the small heavy weight of her on my chest
her breathing slows

i should be sleeping
this is what i'm doing instead
and i don't mind` },

  { username: 'momlife_poems', title: 'First Word', genre: 'baby', date: new Date('2023-08-07'), poem: `her first word was the dog's name
not mama
not dada
the dog

i can't even be mad
the dog is great` },

  { username: 'momlife_poems', title: 'Bedtime Negotiations', genre: 'family', date: new Date('2023-10-22'), poem: `five more minutes
then five more
then one more hug
then one more question
then water

forty-five minutes later
we're done
tomorrow we do it again` },

  { username: 'momlife_poems', title: 'Mother\'s Day', genre: 'mother', date: new Date('2024-01-30'), poem: `they made me breakfast
which was actually cereal
and a card that said
hape muthr daye

it's on the fridge
and it's staying there` },

  { username: 'momlife_poems', title: 'Watching Her Sleep', genre: 'mother', date: new Date('2024-04-15'), poem: `i watch her sleep
and she looks like the baby she was
and the teenager she'll be
at the same time

this is what time looks like
when you love someone growing` },

  { username: 'momlife_poems', title: 'School Project', genre: 'school', date: new Date('2024-07-09'), poem: `the school project
is really the parent's project
everyone knows this
everyone pretends otherwise

i made a nice volcano` },

  { username: 'momlife_poems', title: 'The Mom Guilt', genre: 'mother', date: new Date('2024-10-05'), poem: `i didn't read to her enough
i raised my voice
i let her watch too much
i worked too much
i didn't work

the mom guilt catalog is infinite
and mostly fictional` },

  // === historybuff42 (Robert Steele) — history-and-politics / war / america / veterans ===
  { username: 'historybuff42', title: 'Constitution', genre: 'america', date: new Date('2023-06-27'), poem: `i've read the constitution more times
than is normal for a person
it's shorter than you think
and older than anything else we share

we argue about it
which means it's still working` },

  { username: 'historybuff42', title: 'Gettysburg', genre: 'war', date: new Date('2023-09-05'), poem: `i stood at gettysburg in november
the field was empty and cold
fifty thousand casualties
in three days

the silence was the loudest thing
i've ever heard` },

  { username: 'historybuff42', title: 'The Vote', genre: 'history-and-politics', date: new Date('2023-11-20'), poem: `democracy is a conversation
across time
the founders talking to us
us talking back

it's messy
it's supposed to be` },

  { username: 'historybuff42', title: 'What History Remembers', genre: 'history-and-politics', date: new Date('2024-02-08'), poem: `history remembers the leaders
not the ones who carried the water
or wrote the letters
or stayed at home and kept things running

history is always a narrowing
of what actually happened` },

  { username: 'historybuff42', title: 'Veterans Day', genre: 'veterans', date: new Date('2024-05-16'), poem: `veterans day and most people
have the day off and don't think about it
which is fine
which is also sad

my grandfather would not have minded
he was quiet about it too` },

  { username: 'historybuff42', title: 'The Amendment Process', genre: 'america', date: new Date('2024-08-04'), poem: `the amendment process is slow on purpose
they knew we'd want to change things fast
they made us wait

sometimes the waiting is wisdom
sometimes it's just waiting` },

  { username: 'historybuff42', title: 'Archives', genre: 'history-and-politics', date: new Date('2024-11-01'), poem: `i went to the national archives once
they let me hold a letter
from 1789

just paper
just words
but i thought about whose hands
it passed through
to get to mine` },

  // === wintermuse (Chloe Frost) — winter / autumn / silence / sad ===
  { username: 'wintermuse', title: 'December', genre: 'winter', date: new Date('2023-04-30'), poem: `december presses down on everything
grey and early dark and cold
i've learned to find comfort in this

not because it's comfortable
but because it comes every year
like a visitor you've made peace with` },

  { username: 'wintermuse', title: 'Autumn Again', genre: 'autumn', date: new Date('2023-07-17'), poem: `autumn again
the leaves doing their best
dramatic exit

i don't know why i feel
most like myself
when things are dying` },

  { username: 'wintermuse', title: 'Quiet House', genre: 'silence', date: new Date('2023-10-03'), poem: `quiet house
midwinter afternoon
the kind of quiet you can touch

i sit in it
and let the quiet do its work` },

  { username: 'wintermuse', title: 'The Short Days', genre: 'winter', date: new Date('2023-12-20'), poem: `the short days of november
the sun going down at 4pm
like it has somewhere else to be

i follow the light to the window
and watch it leave anyway` },

  { username: 'wintermuse', title: 'Melancholy', genre: 'sad', date: new Date('2024-03-14'), poem: `melancholy is not depression
it's something softer
a small sadness with no address
that visits and leaves

i've learned to make tea
and wait it out` },

  { username: 'wintermuse', title: 'Dead Leaves', genre: 'autumn', date: new Date('2024-06-01'), poem: `dead leaves on the path
i am walking through death
in my boots
on a wednesday

this feels significant
it's probably just leaves` },

  { username: 'wintermuse', title: 'The First Frost', genre: 'winter', date: new Date('2024-09-18'), poem: `the first frost kills the annuals
every year
and every year i'm somehow surprised

goodbye to the basil
goodbye to the begonias
see you in may` },

  { username: 'wintermuse', title: 'February', genre: 'winter', date: new Date('2024-12-10'), poem: `february is when winter becomes
unglamorous
the novelty gone
just the cold and the grey
and the waiting

but march comes
it always comes
february is just the price` },

  // === galaxypoet (Zion Parks) — space / stars / moon / fantasy ===
  { username: 'galaxypoet', title: 'Dark Matter', genre: 'space', date: new Date('2023-05-22'), poem: `most of the universe is something
we can't see or measure
we know it's there
by what it pulls toward itself

i think about the things
that pull at me
that i can't see` },

  { username: 'galaxypoet', title: 'Star Map', genre: 'stars', date: new Date('2023-08-01'), poem: `i bought a star map
of the night i was born
what was overhead
when i arrived

i don't believe in astrology
but i like the image
of the sky as record` },

  { username: 'galaxypoet', title: 'The James Webb Images', genre: 'space', date: new Date('2023-10-17'), poem: `the first images from the webb telescope
i cried
which surprised me

but there it was
galaxies from 13 billion years ago
pixels on a screen
and me
in my living room
crying` },

  { username: 'galaxypoet', title: 'Wishing on Stars', genre: 'stars', date: new Date('2024-01-09'), poem: `i know stars are suns
i know the light is old
the star might be dead
by the time the light reached me

i still wish
old light or not` },

  { username: 'galaxypoet', title: 'Moon Phase App', genre: 'moon', date: new Date('2024-03-25'), poem: `i check the moon phase app
every morning
not because i plan around it
just because i like to know

this is the kind of person i am now` },

  { username: 'galaxypoet', title: 'Black Hole', genre: 'space', date: new Date('2024-06-08'), poem: `a black hole is a thing
so massive
that not even light escapes

i understand this
i have things like that inside me
ideas that don't come out
no matter how much light there is` },

  { username: 'galaxypoet', title: 'The Dragon', genre: 'fantasy', date: new Date('2024-09-20'), poem: `in my head the dragon has been patient
sitting on its mountain
waiting for a story worth belonging to

i'm still writing it` },

  { username: 'galaxypoet', title: 'Constellations', genre: 'stars', date: new Date('2024-12-03'), poem: `the greeks named the stars
in patterns that made sense to them
we inherited the patterns
without the context

sometimes i think about all the things
i inherited
without the context` },

  // === workdayblues (Diane Murphy) — work / money / loneliness ===
  { username: 'workdayblues', title: 'Performance Review', genre: 'work', date: new Date('2023-08-10'), poem: `exceeds expectations in some areas
meets expectations in others
opportunities for growth

i've had twelve of these meetings
in twelve years
and i've never felt
like anyone really saw me in one` },

  { username: 'workdayblues', title: 'Rent Day', genre: 'money', date: new Date('2023-11-07'), poem: `rent due on the first
every first
forever

the account drains
and fills
and drains again

this is the rhythm` },

  { username: 'workdayblues', title: 'Work Friend', genre: 'loneliness', date: new Date('2024-02-18'), poem: `i have a work friend
who is only a work friend
which is fine
but sometimes
i wonder if we'd be friends outside

then i don't wonder
because it's easier not to` },

  { username: 'workdayblues', title: 'Empty Inbox', genre: 'work', date: new Date('2024-05-31'), poem: `i cleared my inbox once
completely
it took three days
and it was empty for about two hours

then it started filling up again
i've never done that again` },

  { username: 'workdayblues', title: 'The Raise', genre: 'money', date: new Date('2024-09-13'), poem: `i asked for a raise
they said they'd look into it
that was eight months ago

i've stopped reminding them
which is probably a problem` },

  { username: 'workdayblues', title: 'Lunch Alone', genre: 'loneliness', date: new Date('2024-12-05'), poem: `lunch alone at my desk again
headphones in
something to watch on my phone

this is fine actually
i don't have to share the chips` },

  // === casual users ===

  // sunrisepoet (Nina Walsh)
  { username: 'sunrisepoet', title: 'Morning Light', genre: 'morning', date: new Date('2024-03-07'), poem: `morning light through the curtain
the day hasn't decided what it is yet
everything still possible` },
  { username: 'sunrisepoet', title: 'Coffee Ritual', genre: 'gratitude', date: new Date('2024-06-21'), poem: `the coffee is hot
the morning is quiet
and i have an hour
before anything is asked of me

thank you for this` },
  { username: 'sunrisepoet', title: 'Birds at Dawn', genre: 'birds', date: new Date('2024-10-09'), poem: `the birds start before it's light
they don't wait for permission
for me to be ready
or for the sun

they just start
i'm learning from this` },
  { username: 'sunrisepoet', title: 'Thank You', genre: 'gratitude', date: new Date('2025-02-14'), poem: `i don't say it enough
the thank you for all of it
the small warm ordinary things
that make a life

thank you` },

  // travelingbard (Alex Kim)
  { username: 'travelingbard', title: 'Train Window', genre: 'travel', date: new Date('2024-01-12'), poem: `everything looks better
from a moving train
the fields and the towns
and the lives i'll never know

i collect them from windows` },
  { username: 'travelingbard', title: 'Hostel', genre: 'travel', date: new Date('2024-04-28'), poem: `six strangers in a room
none of us from here
all of us on the way somewhere

by morning everyone is gone
the way it's supposed to be` },
  { username: 'travelingbard', title: 'The Market', genre: 'city', date: new Date('2024-08-17'), poem: `the market at 6am
the merchants arriving
the lights coming on

i was there for it
unplanned, jetlagged, happy` },
  { username: 'travelingbard', title: 'Why I Go', genre: 'freedom', date: new Date('2024-11-30'), poem: `i go because somewhere else
i don't have a role to play
no one knows me here

i go for the nothing
i go for the space
it makes` },

  // broken_but_ok (Tasha Reed)
  { username: 'broken_but_ok', title: 'Still Standing', genre: 'strength', date: new Date('2024-05-11'), poem: `still standing
after the year i had
barely, maybe
but standing counts

standing is the whole thing` },
  { username: 'broken_but_ok', title: 'Getting Better Slowly', genre: 'healing', date: new Date('2024-09-03'), poem: `getting better slowly
is still getting better
even when it doesn't feel like it
even when it looks like standing still

trust the slowly` },
  { username: 'broken_but_ok', title: 'What Helped', genre: 'healing', date: new Date('2025-01-28'), poem: `what helped:
the friend who didn't ask questions
the long walks
the one good song on repeat
the morning i woke up
and felt something
that wasn't nothing` },

  // GardenGuru (Priscilla Hobbs)
  { username: 'GardenGuru', title: 'Planting Time', genre: 'garden', date: new Date('2024-02-29'), poem: `planting time in april
seeds in rows
dirt under my fingernails
which never fully comes out

i've stopped minding` },
  { username: 'GardenGuru', title: 'Roses', genre: 'flower', date: new Date('2024-07-14'), poem: `i have seventeen rose varieties
and nobody warned me
about the opinions they'd have

each one wanting something different
like children, but thornier
and less talkative` },
  { username: 'GardenGuru', title: 'Early Spring', genre: 'spring', date: new Date('2024-12-01'), poem: `the first crocus is always a surprise
even when i planted it
even knowing it would come

hope is like that
you plant it
then you're surprised when it shows up` },

  // cityslicker_v (Danny Vega)
  { username: 'cityslicker_v', title: 'Bodega', genre: 'city', date: new Date('2024-03-15'), poem: `the bodega is open
at 3am
when nothing else is
and the city is still thirsty

bless the bodega` },
  { username: 'cityslicker_v', title: 'Parallel Parking', genre: 'humor', date: new Date('2024-07-28'), poem: `parallel parking in new york city
is a spiritual test
and most people fail it
including me

i circled the block six times
and then took the bus` },
  { username: 'cityslicker_v', title: 'Fire Escape', genre: 'city', date: new Date('2024-11-12'), poem: `my fire escape is the best room in the apartment
no ceiling
view of three other buildings
my neighbor's herbs

unofficial balcony
absolutely worth it` },

  // SomberSunday (Eliot Nash)
  { username: 'SomberSunday', title: 'Sunday Feeling', genre: 'sad', date: new Date('2024-01-27'), poem: `the sunday feeling is its own thing
not depression
not sadness exactly
just the weight of tomorrow
arriving early` },
  { username: 'SomberSunday', title: 'Things I Regret', genre: 'regret', date: new Date('2024-05-05'), poem: `i regret the things i didn't say
more than the things i said
the unsaid piles up
like old mail` },
  { username: 'SomberSunday', title: 'Alone Again', genre: 'loneliness', date: new Date('2024-08-22'), poem: `alone again
which is fine
which is what it is
which is fine` },
  { username: 'SomberSunday', title: 'What I Miss', genre: 'nostalgia', date: new Date('2024-12-19'), poem: `i miss the version of my life
where i didn't know
how things would turn out

not because it was better
because the not-knowing
had a kind of lightness to it` },

  // butterflysoul (Jasmine Lee)
  { username: 'butterflysoul', title: 'I Am Enough', genre: 'self-love', date: new Date('2024-02-11'), poem: `i wrote this on my mirror
in dry-erase marker
three years ago

i erased it twice
and wrote it back again
still working on meaning it` },
  { username: 'butterflysoul', title: 'Who I Am', genre: 'identity', date: new Date('2024-06-30'), poem: `i am not the thing that happened to me
i am what i did after
and i'm still doing it

that's who i am` },
  { username: 'butterflysoul', title: 'Wings', genre: 'freedom', date: new Date('2024-11-04'), poem: `everyone talks about wings
like they're dramatic
like it's a transformation

sometimes wings are just
deciding to take up space
gently` },

  // warpoet_fred (Frederick Stone)
  { username: 'warpoet_fred', title: 'Two Tours', genre: 'war', date: new Date('2024-04-11'), poem: `two tours
i came back
not everyone did

i don't talk about the ones who didn't
but i think about them
every day of my life` },
  { username: 'warpoet_fred', title: 'The Rifle', genre: 'veterans', date: new Date('2024-08-29'), poem: `i haven't touched a gun since i got back
twelve years
people think that's strange

they weren't there` },
  { username: 'warpoet_fred', title: 'Remember Them', genre: 'memorial-day', date: new Date('2025-01-17'), poem: `remember them
not the way the politicians do
with speeches and ceremony

remember them the way
the people who knew them do
by missing them specifically
by name` },

  // musicismylife (Harmony Blake)
  { username: 'musicismylife', title: 'The Song I Keep Coming Back To', genre: 'music', date: new Date('2024-03-22'), poem: `some songs
you return to them
for years
without knowing why
and then one day you know why

that's the best kind of knowing` },
  { username: 'musicismylife', title: 'Dancing Alone', genre: 'dance', date: new Date('2024-07-11'), poem: `i dance in the kitchen
when no one is watching
badly and with commitment

i recommend it` },
  { username: 'musicismylife', title: 'First Concert', genre: 'music', date: new Date('2024-10-25'), poem: `my first concert
i was thirteen
and my ears rang for three days

worth it
completely worth it
i've never felt more alive` },

  // hopeful_heart (Brianna Day)
  { username: 'hopeful_heart', title: 'It Gets Better', genre: 'hope', date: new Date('2024-05-18'), poem: `it gets better
i know this is cliche
i know you're tired of hearing it

but it got better for me
and i was the one
who believed it least` },
  { username: 'hopeful_heart', title: 'Tomorrow', genre: 'motivational', date: new Date('2024-10-31'), poem: `tomorrow is still there
waiting
uncanceled
it doesn't know about today

that's the thing about tomorrow` },

  // christmaseve_ (Carol Woods)
  { username: 'christmaseve_', title: 'Christmas Eve', genre: 'christmas', date: new Date('2024-04-06'), poem: `christmas eve every year
the kids on the stairs
waiting for permission to come down

we all pretend the magic is real
even the ones who know
maybe especially them` },
  { username: 'christmaseve_', title: 'The Gift', genre: 'gratitude', date: new Date('2024-11-20'), poem: `the best gift is the same every year
everyone around the table
nobody missing this time

i ask for this every year
some years i get it` },

  // desertdragon (Carlos Ruiz)
  { username: 'desertdragon', title: 'Desert Dawn', genre: 'travel', date: new Date('2024-02-07'), poem: `the desert at dawn is pink
and absolutely quiet
and honest in the way
that empty places are honest

no hiding here` },
  { username: 'desertdragon', title: 'Border', genre: 'immigration', date: new Date('2024-05-24'), poem: `my grandmother crossed a border
with two children and a bag
and became the beginning of something

i carry that with me
like a compass` },
  { username: 'desertdragon', title: 'Solo', genre: 'freedom', date: new Date('2024-09-10'), poem: `solo road trip
ten days
radio off most of it
just the road and the thinking

i solved nothing
i organized everything` },
  { username: 'desertdragon', title: 'Philosophy in the Car', genre: 'philosophy', date: new Date('2025-01-06'), poem: `i think about big questions
most often
in the car
which is inconvenient
but consistent

what is consciousness
what is the point
what exit is mine` },

  // bookwormpoet (Olivia Grant)
  { username: 'bookwormpoet', title: 'Library', genre: 'arts-and-sciences', date: new Date('2024-03-03'), poem: `the library smells like
old paper and good decisions
i go there to think
the thinking works better there` },
  { username: 'bookwormpoet', title: 'Reading a Hard Book', genre: 'arts-and-sciences', date: new Date('2024-07-19'), poem: `a book i don't fully understand
but keep reading anyway
because understanding isn't always
the first step

sometimes it's the last one` },
  { username: 'bookwormpoet', title: 'What I Learned', genre: 'school', date: new Date('2024-11-28'), poem: `the most useful thing i learned in school
was how to learn things
not in a class
from a teacher

just: find the thing
read the thing
try the thing` },

  // stormsurfer (Brett Connelly)
  { username: 'stormsurfer', title: 'Storm Coming', genre: 'nature', date: new Date('2024-04-17'), poem: `you can feel a storm coming
before the rain
the pressure drops
and the birds get quiet
and the air has an opinion

i love the before` },
  { username: 'stormsurfer', title: 'After the Rain', genre: 'rain', date: new Date('2024-08-05'), poem: `after the rain
everything is louder
the birds came back
the green got greener

the world does a reset
and keeps going` },
  { username: 'stormsurfer', title: 'The Pacific', genre: 'ocean', date: new Date('2024-12-27'), poem: `the pacific is too big to understand
i stand at the edge of it
and feel appropriately small

that's all i came for
the appropriate smallness` },

  // midnightink_ (Violet Pierce)
  { username: 'midnightink_', title: 'Midnight Writing', genre: 'night', date: new Date('2024-02-24'), poem: `i only write at midnight
which is impractical
and the only time it works

the day is too loud
the midnight has the right frequency` },
  { username: 'midnightink_', title: 'Shadows', genre: 'darkness', date: new Date('2024-06-13'), poem: `the shadows in the old house
move in ways shadows shouldn't
i've learned to respect them

not everything needs to be explained` },
  { username: 'midnightink_', title: 'Recurring Dream', genre: 'dreams', date: new Date('2024-09-29'), poem: `the same house
the same hallway
the same door i never open

every week the same dream
someday i'll open the door` },
  { username: 'midnightink_', title: '3am Writing', genre: 'night', date: new Date('2025-01-15'), poem: `3am writing is different
no filter
no audience
no tomorrow yet

just the words
and the dark
and the one lamp` },

  // smalltownlife (Hank Morrison)
  { username: 'smalltownlife', title: 'The Diner', genre: 'home', date: new Date('2024-03-29'), poem: `the diner on main street
same owner since '78
same coffee forever
i've been coming since i was eight

some things staying the same
is the whole point` },
  { username: 'smalltownlife', title: 'Where I\'m From', genre: 'nostalgia', date: new Date('2024-08-16'), poem: `where i'm from
everyone knows your parents
and your parents' parents
and the story that came before you

i left and came back
it fits differently now
but it still fits` },
  { username: 'smalltownlife', title: 'Childhood Street', genre: 'childhood', date: new Date('2025-01-11'), poem: `the street i grew up on
is smaller than i remember
all streets are
when you go back

you were bigger then too
you just didn't know it` },

  // forgiveandwrite (Stella Burns)
  { username: 'forgiveandwrite', title: 'The Apology I Wrote', genre: 'apology', date: new Date('2024-04-02'), poem: `i wrote the apology
three times
before i sent it

the first was defensive
the second was too long
the third was just sorry

sorry was the right answer` },
  { username: 'forgiveandwrite', title: 'Forgive Myself', genre: 'healing', date: new Date('2024-08-21'), poem: `forgiving myself
is harder than forgiving anyone else
i hold myself to a standard
no one else would pass

i'm working on this` },
  { username: 'forgiveandwrite', title: 'Moving On', genre: 'moving-on', date: new Date('2025-01-09'), poem: `moving on doesn't mean
forgetting
or not caring
or being fine

it means carrying it
with you
while you go
somewhere else` },

  // tearsandink (Mia Thornton)
  { username: 'tearsandink', title: 'After the Funeral', genre: 'grief', date: new Date('2024-05-07'), poem: `after the funeral
everyone went home
and there was a casserole in my fridge
that nobody made me eat

the casserole was the kindest thing` },
  { username: 'tearsandink', title: 'Grief Math', genre: 'loss', date: new Date('2024-09-15'), poem: `grief math:
subtract one person
and suddenly nothing adds up

the equation was built around them
you have to rebuild it
without them in it` },
  { username: 'tearsandink', title: 'A Year Later', genre: 'sorrow-and-grieving', date: new Date('2025-02-03'), poem: `a year later
i still talk to them
when i'm driving
or doing dishes
or when something happens
they would have loved

i think that's okay` },

  // futureisnow_ (Jordan Price)
  { username: 'futureisnow_', title: 'Something Better', genre: 'motivational', date: new Date('2024-06-07'), poem: `something better is coming
i don't know what
but the trajectory says something

i keep going` },
  { username: 'futureisnow_', title: 'The New Thing', genre: 'change', date: new Date('2024-11-14'), poem: `the new thing is scary
and unknown
and probably worth it

most new things are` },

  // laughlines (Pete Callahan)
  { username: 'laughlines', title: 'Dad Jokes', genre: 'humor', date: new Date('2024-03-08'), poem: `i make dad jokes now
i've become that person
i didn't plan it
it happened naturally

i'm fine with it actually
my kids are not` },
  { username: 'laughlines', title: 'The Wrong Pan', genre: 'funny', date: new Date('2024-06-25'), poem: `i grabbed the wrong pan
and made a lot of noise about it
which woke the dog
which woke my wife
which woke my son

one wrong pan
an entire household affected
i put the pan back quietly` },
  { username: 'laughlines', title: 'Grocery Store Self-Checkout', genre: 'humor', date: new Date('2024-09-17'), poem: `unexpected item in the bagging area
is not a question
it's an accusation

the machine doesn't trust me
i don't trust the machine
we are at an impasse` },
  { username: 'laughlines', title: 'WiFi Password', genre: 'funny', date: new Date('2024-12-31'), poem: `guests always ask for the wifi password
which means i have to go find it
which means i have to find the router
which means i have to move the box

this is why i don't have guests often` },

  // prayerpoems (Dorothy Hall)
  { username: 'prayerpoems', title: 'Evening Prayer', genre: 'prayer', date: new Date('2024-07-02'), poem: `every evening i say the same words
i've said my whole life
they don't need to be new
to be true

old words
old comfort
still working` },
  { username: 'prayerpoems', title: 'God is Good', genre: 'god', date: new Date('2024-12-22'), poem: `god is good
i say it when things are good
i say it when things are not good
both are true at once

that's the faith part` },

  // twentysomething (Nadia Simmons)
  { username: 'twentysomething', title: 'Quarter Life', genre: 'growing-up', date: new Date('2024-04-20'), poem: `twenty-five and nothing is decided
i thought it would be by now
i thought i'd have
more of an outline

turns out the outline comes later
or not at all
and you're doing it anyway` },
  { username: 'twentysomething', title: 'Adulting', genre: 'anxiety', date: new Date('2024-08-09'), poem: `nobody told me about the forms
the constant forms
for everything
health insurance forms
tax forms
lease forms

somewhere there's a form
for learning about all the forms
i haven't found it` },
  { username: 'twentysomething', title: 'My Twenties', genre: 'identity', date: new Date('2024-12-17'), poem: `my twenties look nothing like the movies
mine involve a lot of laundry
and trying to figure out
who i am
without anyone watching

which is actually fine
the no one watching part` },

  // divorcepoems (Rachel Burns)
  { username: 'divorcepoems', title: 'Signing the Papers', genre: 'divorce', date: new Date('2024-04-24'), poem: `the papers were twelve pages
we signed them in twenty minutes
the marriage was fourteen years

the math is what it is` },
  { username: 'divorcepoems', title: 'Half a Closet', genre: 'heartbreak', date: new Date('2024-08-30'), poem: `half a closet now
where there was a full one

the space is there
and it's mine
i don't know what to put in it` },
  { username: 'divorcepoems', title: 'Starting Over', genre: 'moving-on', date: new Date('2025-01-22'), poem: `starting over at forty-one
is different from what i expected

i expected fear
there's some of that
i didn't expect the quiet relief
of only having to decide for myself` },

  // warmsummer_ (Luke Patterson)
  { username: 'warmsummer_', title: 'August', genre: 'summer', date: new Date('2024-05-30'), poem: `august is the best and worst month
summer at its most
but the end is visible from here

i love august
because you have to
while you can` },
  { username: 'warmsummer_', title: 'Swimming at Night', genre: 'ocean', date: new Date('2024-09-07'), poem: `i went swimming in the ocean at night
which everyone says not to do
but the water was warm
and the moon was there
and i'm here to tell you it was fine` },
  { username: 'warmsummer_', title: 'Summer Jobs', genre: 'nostalgia', date: new Date('2025-01-30'), poem: `i had seven summer jobs
between fifteen and twenty-two
each one taught me something
none of it what the job was supposed to teach

what i learned: how to show up
how to leave
how to get paid` },

  // wintrywords (Fiona Marsh)
  { username: 'wintrywords', title: 'January', genre: 'winter', date: new Date('2024-06-18'), poem: `january and nobody wants it
the enthusiasm of december
completely gone

but january is honest at least
it doesn't pretend to be festive
it just is` },
  { username: 'wintrywords', title: 'What Winter Does', genre: 'nostalgia', date: new Date('2024-11-06'), poem: `winter slows everything
makes you stay inside
makes you sit with yourself

sometimes that's what you needed
and didn't know it` },

  // siblinghood (Tyler Brooks)
  { username: 'siblinghood', title: 'My Brother', genre: 'brother', date: new Date('2024-07-05'), poem: `my brother and i
are very different
and also exactly the same
when it matters

when it matters
we're the same person` },
  { username: 'siblinghood', title: 'Sisters', genre: 'sister', date: new Date('2024-12-13'), poem: `my sister knew before i did
what i needed
she showed up with food
she didn't ask questions

that's what a sister does` },

  // soberlife_ (Marcus Stone)
  { username: 'soberlife_', title: 'Three Years', genre: 'addiction', date: new Date('2024-05-15'), poem: `three years sober
some people get trophies for this
i got my life back
which is better` },
  { username: 'soberlife_', title: 'What I Lost', genre: 'strength', date: new Date('2024-09-04'), poem: `i lost things i don't talk about
to the years before this
people and time and chances

i can't get them back
i can make different ones` },
  { username: 'soberlife_', title: 'The Meeting', genre: 'healing', date: new Date('2025-01-24'), poem: `tuesday nights at the meeting
same folding chairs
same bad coffee
same honest people

the most honest room i've ever been in` },

  // birthdays_hurt (Abby Clarke)
  { username: 'birthdays_hurt', title: 'Another Year', genre: 'birthday', date: new Date('2024-04-03'), poem: `another year
and i didn't expect to be here
doing this
not in a bad way
just: i couldn't have predicted

life keeps surprising me
mostly in good ways` },
  { username: 'birthdays_hurt', title: 'Counting Up', genre: 'aging', date: new Date('2024-08-19'), poem: `counting up
not down
i don't count down to anything

each number is something i made it to
and i'd like credit for that` },
  { username: 'birthdays_hurt', title: 'Birthday Wishes', genre: 'birthday', date: new Date('2024-12-28'), poem: `i don't know what to wish for anymore
everything i needed
i've had or found or made

i wish for more of this
whatever this is
it's good` },

  // immigrantpen (Elena Vega)
  { username: 'immigrantpen', title: 'Two Countries', genre: 'immigration', date: new Date('2024-03-18'), poem: `i have two countries now
and belong to both
and neither
which is a specific kind of loneliness

that has a specific kind of beauty to it too` },
  { username: 'immigrantpen', title: 'The Language', genre: 'identity', date: new Date('2024-07-01'), poem: `i dream in two languages now
which one depends on what i'm dreaming about

love: spanish
fear: english
most things: both at once` },
  { username: 'immigrantpen', title: 'My Mother\'s Kitchen', genre: 'home', date: new Date('2024-10-22'), poem: `my mother's kitchen smells like a country
i left behind
when she cooks
i'm there again
for as long as the smell lasts` },
  { username: 'immigrantpen', title: 'Papers', genre: 'immigration', date: new Date('2025-02-27'), poem: `i have the papers now
they're in a drawer
i know exactly where

i look at them sometimes
not to check they're real
just to confirm the fact of them` },

  // grievingmom_ (Sandra Collins)
  { username: 'grievingmom_', title: 'Still Your Mother', genre: 'grief', date: new Date('2024-08-12'), poem: `i am still your mother
even now
even after

that doesn't change
that's the only thing
that doesn't change` },
  { username: 'grievingmom_', title: 'For You', genre: 'loss', date: new Date('2025-02-08'), poem: `everything i do now
has a for you at the end of it

i woke up: for you
i ate something: for you
i called a friend: for you

you're still the reason` },

  // === moonwriter23 additional poems (to reach ~38 total) ===
  { username: 'moonwriter23', title: 'The Quiet Hours', genre: 'silence', date: new Date('2025-02-18'), poem: `the quiet hours between 2 and 4
belong to a different version of me
she has no plans
she has no obligations

she just sits here
in the quiet
and waits for morning` },

  { username: 'moonwriter23', title: 'Tuesday Moon', genre: 'moon', date: new Date('2025-03-09'), poem: `nothing special about a tuesday moon
no ceremony
no name for it

just up there
doing the thing
on a tuesday` },

  { username: 'moonwriter23', title: 'What I Dream About Now', genre: 'dreams', date: new Date('2025-03-25'), poem: `i dream about ordinary things now
grocery stores
long hallways
a car that won't start

the dramatic dreams have left
replaced by the logistics
of imaginary errands

i think this means i'm healing` },

  { username: 'moonwriter23', title: 'Late October Night', genre: 'night', date: new Date('2025-04-05'), poem: `late october night
the air has a smell
leaves and something colder underneath

i stood outside for twenty minutes
not doing anything
just being in the air
that smells like this` },

  { username: 'moonwriter23', title: 'Glass', genre: 'silence', date: new Date('2025-04-20'), poem: `the silence in this house
is made of glass
i walk through it carefully

i haven't broken it yet
i'm not sure i want to` },

  { username: 'moonwriter23', title: 'Crescent', genre: 'moon', date: new Date('2025-05-03'), poem: `crescent moon tonight
a sliver
barely a commitment

i like it like this
not trying too hard
just enough to be there` },

  { username: 'moonwriter23', title: 'The Stars Last Night', genre: 'stars', date: new Date('2025-05-15'), poem: `the stars last night were very clear
which happens after rain
i stood in the wet grass
and looked up for longer than i meant to

some looking is not about seeing
it's about the looking itself` },

  { username: 'moonwriter23', title: 'Deep Sleep', genre: 'dreams', date: new Date('2025-06-01'), poem: `when i finally sleep deeply
i don't go anywhere
no dreams
just dark and warm

i wake up slower
which is how i know it worked` },

  { username: 'moonwriter23', title: 'Waning', genre: 'moon', date: new Date('2025-06-20'), poem: `the moon is waning again
going back to nothing
so it can come back to something

i've been waning
i have to trust the coming back` },

  { username: 'moonwriter23', title: 'Blue Hours', genre: 'night', date: new Date('2025-07-04'), poem: `the blue hour before dark
when the light hasn't decided to leave
but it's going

i love the going more than the gone
the in-between has more color` },

  { username: 'moonwriter23', title: 'The Quiet Below', genre: 'silence', date: new Date('2025-07-18'), poem: `underneath all of it
there's a quiet
i've been excavating toward for years

not emptiness
not peace exactly
just: the quiet below the noise

i've touched it a few times
briefly
it's there` },

  { username: 'moonwriter23', title: 'Full', genre: 'moon', date: new Date('2025-08-03'), poem: `full moon tonight
the kind that comes once a month
and we act like it's an event

it is an event
i forget that
and then i remember
standing in the parking lot at 11pm
looking up` },

  { username: 'moonwriter23', title: 'Morning After', genre: 'night', date: new Date('2025-08-22'), poem: `the morning after a bad night
tastes different
a little stale
a little raw

but it's morning
and the night is done with me
until next time` },

  // === versesbysadie additional poems (to reach ~35 total) ===
  { username: 'versesbysadie', title: 'Your Chair', genre: 'missing-you', date: new Date('2025-01-18'), poem: `nobody sits in your chair
we haven't talked about it
we just don't

i don't think we will for a while
that's okay
that's what chairs are for sometimes` },

  { username: 'versesbysadie', title: 'The Breakup Advice I Got', genre: 'heartbreak', date: new Date('2025-02-05'), poem: `keep yourself busy
get a hobby
go to the gym
travel

i did all of them
and the sad was still there
waiting patiently
at home` },

  { username: 'versesbysadie', title: "I'm Fine Thanks", genre: 'sad', date: new Date('2025-02-20'), poem: `i'm fine thanks
how are you
yeah it's been a while
i'm doing really well

these are the things i say
when someone asks
in passing
and really wants the short version` },

  { username: 'versesbysadie', title: 'Deleted Photos', genre: 'lost-love', date: new Date('2025-03-06'), poem: `i deleted the photos
or i tried to
the cloud had other ideas
they're still there somewhere

existing in the cloud
like everything does now
forever and out of reach` },

  { username: 'versesbysadie', title: 'Almost Texted You', genre: 'missing-you', date: new Date('2025-03-21'), poem: `something happened today
i almost texted you
had my thumb on your name

put my phone down
made tea instead
which is not the same
but it's something` },

  { username: 'versesbysadie', title: 'Getting Dressed', genre: 'sad', date: new Date('2025-04-07'), poem: `for a while i couldn't get dressed
everything felt wrong
the colors wrong
the weight of fabric wrong

now i get dressed
most days before noon
that's where i am
that's honestly fine` },

  { username: 'versesbysadie', title: 'Going Back to Places', genre: 'memory', date: new Date('2025-04-25'), poem: `we went to that bar
the one from before
i went alone
on purpose

it's just a bar now
which is what i needed to know
it's just a bar` },

  { username: 'versesbysadie', title: 'What I Tell People', genre: 'sad', date: new Date('2025-05-10'), poem: `i tell people i'm over it
which is mostly true
and partly something
i need to keep saying
until it's all true` },

  { username: 'versesbysadie', title: 'Better Days', genre: 'hope', date: new Date('2025-05-28'), poem: `i had a week
where i didn't think about you
every single day

that was a good week
i'm banking on more of those` },

  { username: 'versesbysadie', title: 'Permission', genre: 'moving-on', date: new Date('2025-06-15'), poem: `i gave myself permission
to stop waiting
for some sign
that it was okay to move on

that sign was always going to be me
so i signed it
and sent it to myself` },

  { username: 'versesbysadie', title: 'When I\'m Ready', genre: 'healing', date: new Date('2025-07-01'), poem: `i'll know when i'm ready
not because someone tells me
but because one day
the thought of you
will be just a thought

not a wound
not a weight
just a thing that happened
once` },

  { username: 'versesbysadie', title: 'Things You Said', genre: 'heartbreak', date: new Date('2025-07-20'), poem: `some things you said
come back at odd moments
in the shower
in a meeting
while i'm buying bread

i'm not collecting them
they just arrive
uninvited` },

  { username: 'versesbysadie', title: 'New Normal', genre: 'moving-on', date: new Date('2025-08-05'), poem: `this is normal now
the me without you part
the sunday afternoons alone part
the answering how are you single part

it took a while to fit
but it fits` },

  // === thomaswalker_ additional poems (to reach 30 total) ===
  { username: 'thomaswalker_', title: 'The Fox', genre: 'animal', date: new Date('2025-04-12'), poem: `the fox crossed the field at noon
which is unusual
i watched it from the truck
not moving

it didn't look at me
it didn't need to` },

  { username: 'thomaswalker_', title: 'Shoreline', genre: 'ocean', date: new Date('2025-05-07'), poem: `the shoreline is always moving
they measured it once
and then had to measure again
because it had moved

i find that honest
the shoreline doesn't pretend to be fixed` },

  { username: 'thomaswalker_', title: 'Soil', genre: 'nature', date: new Date('2025-05-25'), poem: `a handful of soil
contains more living things
than there are people on earth

i think about that
when people say nature needs to be saved
it saves itself
we're the problem` },

  { username: 'thomaswalker_', title: 'Geese', genre: 'birds', date: new Date('2025-06-10'), poem: `geese are rude
and loud
and will chase you across a parking lot
for no reason

i respect them enormously` },

  { username: 'thomaswalker_', title: 'Summer Rain', genre: 'rain', date: new Date('2025-06-28'), poem: `summer rain on a hot afternoon
everything steams
the smell of it
the way it makes the air

summer rain is the earth
exhaling` },

  { username: 'thomaswalker_', title: 'The Wetlands', genre: 'environment', date: new Date('2025-07-15'), poem: `the wetlands filter everything
take in what's dirty
give back what's clean
do it without asking

we drained half of them
which tells you something
about how we treat things
that work quietly` },

  { username: 'thomaswalker_', title: 'The Meadow', genre: 'nature', date: new Date('2025-07-30'), poem: `the meadow in july
is full of things i can't name
insects and grasses and the particular silence
that comes from everything being busy

i sat in it for an hour
doing nothing that counted
except being there` },

  { username: 'thomaswalker_', title: 'Oyster', genre: 'ocean', date: new Date('2025-08-14'), poem: `an oyster filters fifty gallons a day
cleans the water
builds itself a shell

does it know it's beautiful
probably not
beauty isn't the point for an oyster
the filtering is the point` },

  { username: 'thomaswalker_', title: 'Fire Season', genre: 'climate-change', date: new Date('2025-09-01'), poem: `fire season used to be a season
now it's most of the year
in some places

the word season
implies it ends
i'm not sure that's still accurate` },

  { username: 'thomaswalker_', title: 'Ice', genre: 'winter', date: new Date('2025-09-20'), poem: `ice on the pond this morning
first of the year
paper thin
you wouldn't trust it

but it's there
doing what ice does
without waiting for permission` },

  // === dadof3writes additional poems (to reach ~28 total) ===
  { username: 'dadof3writes', title: 'The Game', genre: 'father', date: new Date('2025-06-08'), poem: `i went to every game
even the ones i couldn't afford to miss work for
i missed work
i went to the games

he doesn't know this
i'm not going to tell him
that's not why i did it` },

  { username: 'dadof3writes', title: 'Dinner Table', genre: 'family', date: new Date('2025-06-25'), poem: `we ate at the table every night
when they were small
phones not allowed
which they hated at the time

my daughter texted me last week
she eats at the table
with her roommate
she said it felt right` },

  { username: 'dadof3writes', title: 'Old Photos', genre: 'memory', date: new Date('2025-07-09'), poem: `i was young in these photos
younger than i remember being
and smiling in a way
that was easy then

everyone in old photos
looks younger than they felt at the time` },

  { username: 'dadof3writes', title: 'Camping', genre: 'nostalgia', date: new Date('2025-07-24'), poem: `we camped every summer until they were thirteen
after that they didn't want to
i understood

we still have the tent
it's in the garage
i keep meaning to use it again` },

  { username: 'dadof3writes', title: 'Driving Lesson', genre: 'father', date: new Date('2025-08-07'), poem: `i taught him to drive
in the empty church parking lot
on a sunday morning

he hit the curb twice
i didn't flinch
or i tried not to
he was watching for it` },

  { username: 'dadof3writes', title: 'Sunday Morning', genre: 'family', date: new Date('2025-08-20'), poem: `sunday morning and everyone
is somewhere else now
the house is quiet
in a way it wasn't for twenty years

i make one cup of coffee
and drink it slow
which is also something` },

  { username: 'dadof3writes', title: 'What I See in You', genre: 'family', date: new Date('2025-09-05'), poem: `i see my mother in her laugh
my father in her stubbornness
myself in her worry
her mother in the way she holds her hands

she is made of all of us
and somehow entirely herself
that's the whole thing
that's the miracle part` },

  { username: 'dadof3writes', title: 'Homework Help', genre: 'school', date: new Date('2025-09-22'), poem: `the math has changed
i can't help with the math anymore
they do it differently now

i sit with her anyway
i hand her things
i make snacks
i'm still useful, just differently` },

  { username: 'dadof3writes', title: 'Birthday Cake', genre: 'birthday', date: new Date('2025-10-06'), poem: `i made the same cake every year
chocolate with the lopsided frosting
they never let me forget it was lopsided

they asked for it again this year
lopsided and everything
i made it lopsided on purpose` },

  { username: 'dadof3writes', title: 'When I\'m Gone', genre: 'father', date: new Date('2025-10-25'), poem: `when i'm gone
i want them to remember
the camping
the dinners
the games

not the times i was too busy
not the times i got it wrong

i'm trying to make more of the first kind
while there's still time to make them` },

  // === angryquill additional poems (to reach 25 total) ===
  { username: 'angryquill', title: 'The News', genre: 'social-commentaries', date: new Date('2025-05-15'), poem: `i had to stop watching the news
not because i stopped caring
because i was drowning in caring
without any place to put it

i came back with a plan
and earplugs
and a list of things i can actually do` },

  { username: 'angryquill', title: 'Burnout', genre: 'anger', date: new Date('2025-06-02'), poem: `activist burnout is real
and nobody in the movement talks about it
because we're afraid
of what it means

it means we're human
it means we need rest
which is not surrender
which is strategy` },

  { username: 'angryquill', title: 'Showing Up', genre: 'strength', date: new Date('2025-06-18'), poem: `showing up is the whole thing
not perfectly
not loudly
just showing up
again
and then again

the work is long
we were always going to be tired
we show up tired` },

  { username: 'angryquill', title: 'The Table', genre: 'social-justice', date: new Date('2025-07-05'), poem: `they keep saying a seat at the table
but i'm not interested in the table
as it currently exists

the table was built to keep us out
maybe we need a different table
maybe we need to talk about
who gets to design it` },

  { username: 'angryquill', title: 'To White Friends', genre: 'racism-and-discrimination', date: new Date('2025-07-22'), poem: `to my white friends who get it:
good
now tell the other ones
i'm tired of explaining
what you already understand` },

  { username: 'angryquill', title: 'What Progress Looks Like', genre: 'social-justice', date: new Date('2025-08-08'), poem: `progress looks slow
because it is slow
and also because
the people who benefit from nothing changing
have more resources than we do

we're still gaining
i want to be honest about slow
and still here` },

  { username: 'angryquill', title: 'Care Work', genre: 'gender-and-feminism', date: new Date('2025-08-25'), poem: `care work is work
raising children is work
tending to the sick is work
holding community together is work

it is rarely paid
it is rarely counted
it is the infrastructure
everything else runs on` },

  { username: 'angryquill', title: 'Environmental Justice', genre: 'climate-change', date: new Date('2025-09-10'), poem: `the toxic sites
are not in the wealthy neighborhoods
they never have been

the climate crisis
lands hardest on the people
who did the least
to cause it

this is not a coincidence
this is a pattern
with a name` },

  { username: 'angryquill', title: 'Rest is Resistance', genre: 'strength', date: new Date('2025-09-28'), poem: `i sleep eight hours now
i protect my weekends
i cook meals and eat them slowly

they wanted us exhausted
they needed us too tired to organize
i rest on purpose
i rest like it matters

it does` },

  { username: 'angryquill', title: 'The Strike', genre: 'social-justice', date: new Date('2025-10-15'), poem: `the workers went on strike
and people said
you can't do this
and they did it anyway

turns out you can do most things
when enough people
do them together` },

  // === coffeeshopverses additional (to reach 14 total) ===
  { username: 'coffeeshopverses', title: 'Zoom Call', genre: 'work', date: new Date('2025-01-15'), poem: `you're on mute
you're on mute
you're still on mute

this is forty percent of my job now
the rest is waiting for the share screen to load` },

  { username: 'coffeeshopverses', title: 'Sick Day', genre: 'work', date: new Date('2025-03-04'), poem: `i took a sick day
and spent it answering emails
which defeats the whole point

but there was this meeting
that only i could cover
so i covered it
sick
in my pajamas
which was at least honest` },

  { username: 'coffeeshopverses', title: 'The Park at Noon', genre: 'city', date: new Date('2025-05-08'), poem: `the park at noon in summer
is a different city
office workers on benches
everyone squinting at their phones

ten blocks from the office
an entirely different world
for forty-five minutes
then back` },

  { username: 'coffeeshopverses', title: 'Counting Down', genre: 'work', date: new Date('2025-07-11'), poem: `fourteen minutes until the meeting ends
i am tracking it in the corner of my screen
like a countdown to something good
which it is

fourteen minutes
now twelve
this is how i spend my days` },

  { username: 'coffeeshopverses', title: 'Not My Bag', genre: 'humor', date: new Date('2025-09-18'), poem: `i picked up the wrong bag at the airport once
got halfway to the taxi
before i noticed

inside: someone else's life
neatly folded
labeled
going somewhere

mine was still on the belt
going in circles
which is accurate` },

  // === jesusismyrock_ additional (to reach 13 total) ===
  { username: 'jesusismyrock_', title: 'New Year', genre: 'new-year', date: new Date('2025-01-30'), poem: `every new year i ask god
what this one is for
i don't always get an answer right away

but i ask
and i show up
and the year unfolds
usually with something worth showing up for` },

  { username: 'jesusismyrock_', title: 'Christmas Morning', genre: 'christmas', date: new Date('2025-03-15'), poem: `christmas morning before everyone wakes
i sit with my coffee
and my bible
and the quiet

this is the gift i give myself
every year
before the beautiful noise starts` },

  { username: 'jesusismyrock_', title: 'The Hymn', genre: 'spiritual', date: new Date('2025-05-20'), poem: `the old hymns use words
nobody uses anymore
which is part of why i love them

they belong to another time
a slower time
a time that believed
in the value of a long held note` },

  { username: 'jesusismyrock_', title: 'Getting Older in Faith', genre: 'aging', date: new Date('2025-07-25'), poem: `i am older in my faith now
less certain about some things
more certain about the important ones

the important ones:
i am loved
i am not alone
this is not all there is` },

  { username: 'jesusismyrock_', title: 'Community', genre: 'religion', date: new Date('2025-09-11'), poem: `these people have watched me grieve
and celebrate
and doubt
and come back

that's what a church is
not the building
the watching
the coming back` },

  // === queerpoetrybabe additional (to reach 13 total) ===
  { username: 'queerpoetrybabe', title: 'Found Family', genre: 'lgbtq', date: new Date('2025-02-08'), poem: `found family is a thing
when your actual family
doesn't quite fit

i found mine
in the bar on 7th
in a group chat
at a pride picnic

they're mine as much as anyone is` },

  { username: 'queerpoetrybabe', title: 'The Word', genre: 'identity', date: new Date('2025-04-15'), poem: `i found the word for what i am
when i was twenty-two
and everything shifted

not because i changed
but because i had a word
and words make things
easier to carry` },

  { username: 'queerpoetrybabe', title: 'Pride Month vs Real Life', genre: 'lgbtq', date: new Date('2025-06-22'), poem: `pride month is parades and rainbow logos
and companies that don't care
eleven months of the year

real pride is the other eleven months
showing up anyway
being visible on a tuesday
when nobody is watching` },

  { username: 'queerpoetrybabe', title: 'Soft Power', genre: 'self-love', date: new Date('2025-08-30'), poem: `i used to think softness was weakness
that to survive
i had to be sharp and armored

turns out softness is the harder thing
to maintain
under pressure

i work on soft every day
it's the stronger choice` },

  // === ryaninnature additional (to reach 11 total) ===
  { username: 'ryaninnature', title: 'Winter Wren', genre: 'birds', date: new Date('2025-02-22'), poem: `the winter wren is tiny
and sounds enormous
for something that size
it fills the whole forest

i think about people like that
small in the world
but filling the room` },

  { username: 'ryaninnature', title: 'Composting', genre: 'garden', date: new Date('2025-05-15'), poem: `i compost everything
coffee grounds and eggshells
the wilted lettuce i meant to eat
last tuesday

it all becomes soil
which becomes tomatoes
which become dinner

this is the best loop i know` },

  { username: 'ryaninnature', title: 'The Creek', genre: 'nature', date: new Date('2025-08-10'), poem: `the creek is lower this summer
than last summer
i've been coming here since i was a kid

the rocks the creek used to cover
are showing now
dry and pale
like something not meant to be seen` },

  // === teenwrites_ additional (to reach 10 total) ===
  { username: 'teenwrites_', title: 'College Apps', genre: 'school', date: new Date('2025-03-10'), poem: `describe yourself in 250 words
be authentic but also impressive
show your growth but also your passion
also be concise

i've written it fourteen times
each one sounds like
someone performing being me` },

  { username: 'teenwrites_', title: 'Comparison', genre: 'teen', date: new Date('2025-06-05'), poem: `she got into her first choice
and i'm happy for her
genuinely
and also something else
that i don't want to name
but is definitely there` },

  { username: 'teenwrites_', title: 'Summer Plans', genre: 'growing-up', date: new Date('2025-08-18'), poem: `this is my last summer before everything changes
people keep saying that
i'm trying to feel it
i mostly feel like it's july
and i have work at six` },

  // === oceandeep99 additional (to reach 12 total) ===
  { username: 'oceandeep99', title: 'The Bay', genre: 'ocean', date: new Date('2025-02-16'), poem: `the bay at low tide
is a different bay
smaller and less dramatic
and full of things the high tide hid

i like low tide for this
the revealed parts
the honest version` },

  { username: 'oceandeep99', title: 'Storm at Sea', genre: 'rain', date: new Date('2025-05-03'), poem: `in a storm at sea
there is nothing to do
but wait
and keep the bow pointed
into the waves

that's all you can do
point toward the thing
and wait for it to pass` },

  { username: 'oceandeep99', title: 'Lost Luggage', genre: 'travel', date: new Date('2025-08-01'), poem: `my luggage went to lisbon
i went to oslo
we were reunited
four days later

i bought one shirt
wore it three days
ate everything
had the best week of the year` },

  // === GrumpyGrandpa additional (to reach 9 total) ===
  { username: 'GrumpyGrandpa', title: 'Not What I Expected', genre: 'aging', date: new Date('2025-02-04'), poem: `i expected to feel old
i don't feel old
i feel like me
inside this old thing

the body does its thing
i do mine
we coexist
not always happily` },

  { username: 'GrumpyGrandpa', title: 'My Garden', genre: 'garden', date: new Date('2025-06-14'), poem: `i grew tomatoes for thirty years
she did the flowers
it was our agreement

now i grow both
the tomatoes are fine
the flowers are a mess
but they're mine
and she'd have something to say about them` },

  // === lostinlove23 additional (to reach 14 total) ===
  { username: 'lostinlove23', title: 'The Photo', genre: 'romantic', date: new Date('2025-02-14'), poem: `the photo of us from that trip
is my lock screen still
four years later
my coworker noticed and didn't say anything

the right call on her part
the photo stays` },

  { username: 'lostinlove23', title: 'What I Forgot', genre: 'missing-you', date: new Date('2025-04-01'), poem: `i forgot what your voice sounds like
exactly
i remember the shape of it
the feeling of it
but the actual sound

it scares me sometimes
that memory does this
replaces the real thing
with the idea of it` },

  { username: 'lostinlove23', title: 'Good Morning', genre: 'romantic', date: new Date('2025-06-17'), poem: `you say good morning
before anything else
every single day
without fail
without being asked

i didn't know how much that mattered
until i had it
now i do
now i know` },

  { username: 'lostinlove23', title: 'Still', genre: 'love', date: new Date('2025-08-09'), poem: `still here
still yours
still surprised
that this is where i landed

of all the places
this one
you
yes` },

  { username: 'lostinlove23', title: 'Love Note', genre: 'love', date: new Date('2025-10-01'), poem: `i left you a note
on the mirror
which you'll see before i'm awake

it says something true
that i'm better at writing down
than saying out loud

you'll see it
that's enough` },

  // === spiritualfire additional (to reach 11 total) ===
  { username: 'spiritualfire', title: 'Fasting', genre: 'religion', date: new Date('2025-03-28'), poem: `i fast to remember
what it feels like to wait
to want something
and choose to wait

the hunger reminds me
i am not in charge of everything
which is a relief
honestly` },

  { username: 'spiritualfire', title: 'The Altar', genre: 'spiritual', date: new Date('2025-06-11'), poem: `i keep a small altar
on my dresser
a candle
a photo
a stone from the river
where i was baptized

it's not about the objects
it's about the looking
the remembering to look` },

  { username: 'spiritualfire', title: 'Surrender', genre: 'faith', date: new Date('2025-09-03'), poem: `surrender doesn't mean giving up
it means giving over
to something bigger
than the plan you had

i've surrendered many plans
what came instead
was better
every time
which is how i know to keep doing it` },

  // === silentscream additional (to reach 13 total) ===
  { username: 'silentscream', title: 'Quiet Day', genre: 'mental-health', date: new Date('2025-02-27'), poem: `today was a quiet day
not good not bad
just quiet
which is different from numb

quiet is okay
quiet means the volume turned down
not the signal gone` },

  { username: 'silentscream', title: 'The Waiting Room', genre: 'anxiety', date: new Date('2025-05-04'), poem: `the waiting room at the clinic
i've been coming here two years
the magazines are still from 2019
the chair still makes that sound

i feel okay here
which took a long time
to feel okay about` },

  { username: 'silentscream', title: 'Shame', genre: 'depression', date: new Date('2025-07-16'), poem: `the shame was the hardest part
harder than the feeling itself
the feeling of the feeling
being wrong

i'm working on the shame
with professional help
which is also something
i used to be ashamed of` },

  { username: 'silentscream', title: 'Onward', genre: 'healing', date: new Date('2025-09-30'), poem: `onward is not a victory
it's just: still going
which is what it looks like
most of the time

still going
not fine necessarily
but still
going` },

  // === momlife_poems additional (to reach 10 total) ===
  { username: 'momlife_poems', title: 'Lost Tooth', genre: 'childhood', date: new Date('2025-01-25'), poem: `she lost a tooth at school
kept it in a tiny envelope
the nurse provided
specifically for this

i put the envelope in a box
with the others
the small archive
of things she's outgrown` },

  { username: 'momlife_poems', title: 'Sports Day', genre: 'family', date: new Date('2025-04-19'), poem: `sports day was a disaster
she came last in three events
first in one
she told me the one she won
twice on the way home

i asked about the others
she shrugged
good instincts honestly` },

  { username: 'momlife_poems', title: 'The Last Baby', genre: 'baby', date: new Date('2025-07-28'), poem: `i knew she was my last baby
while she was still a baby
something in the holding
was more deliberate
more memorizing

i tried to hold the weight of her
in my arms and in my memory
at the same time` },

  // === historybuff42 additional (to reach 9 total) ===
  { username: 'historybuff42', title: 'The Library of Congress', genre: 'history-and-politics', date: new Date('2025-03-22'), poem: `the library of congress holds
every book published in america
since 1870
every thought anyone thought worth printing

walking through it
i felt small
in the right way` },

  { username: 'historybuff42', title: 'Reconstruction', genre: 'history-and-politics', date: new Date('2025-07-04'), poem: `reconstruction almost worked
twelve years
and then it didn't
and we've been living in that failure
ever since

the history they don't teach you
is usually the important part` },

  // === wintermuse additional (to reach 12 total) ===
  { username: 'wintermuse', title: 'Equinox', genre: 'autumn', date: new Date('2025-02-28'), poem: `the equinox arrives
without announcement
equal dark and light
for exactly one day

i wait for it every year
like a small ceremony
nobody else is celebrating` },

  { username: 'wintermuse', title: 'Frost', genre: 'winter', date: new Date('2025-05-14'), poem: `frost on the window
fern patterns
natural and exact
the cold making art

i didn't wipe it away until noon
which made me late
which was worth it` },

  { username: 'wintermuse', title: 'The Bare Tree', genre: 'trees', date: new Date('2025-07-30'), poem: `the bare tree in february
is more beautiful than the full one
structure visible
each branch exact
nothing to hide behind

i like things bare
at their most themselves` },

  { username: 'wintermuse', title: 'Winter Sun', genre: 'winter', date: new Date('2025-09-16'), poem: `winter sun is different
low and sideways
it comes through windows
at angles summer sun ignores

it finds corners
that stay dark all summer
and lights them briefly
this is the gift winter keeps mostly to itself` },

  // === galaxypoet additional (to reach 11 total) ===
  { username: 'galaxypoet', title: 'Meteor Shower', genre: 'stars', date: new Date('2025-03-05'), poem: `i set an alarm for 3am
for the meteor shower
saw eleven of them
in twenty minutes

made eleven wishes
which is probably too many wishes for one night
but the sky was offering
and i took them` },

  { username: 'galaxypoet', title: 'Rocket', genre: 'space', date: new Date('2025-06-19'), poem: `a rocket is mostly fuel
the payload tiny at the top
almost everything burned away
just to lift the small thing

i think about what i carry
what i burn through
just to get the small thing
where it's going` },

  { username: 'galaxypoet', title: 'The Void', genre: 'space', date: new Date('2025-09-08'), poem: `the void between galaxies
is not actually empty
it's full of dark matter
of things we can't see
but know are there

the void is not nothing
the void is a kind of full
we don't have the instruments for yet` },

  // === workdayblues additional (to reach 8 total) ===
  { username: 'workdayblues', title: 'PTO Request', genre: 'work', date: new Date('2025-03-17'), poem: `i submitted a PTO request
for three days
and felt guilty about it
for a week before i took them

on the first day off
i answered two emails
which defeated the purpose

i'm working on this` },

  { username: 'workdayblues', title: 'End of Year Review', genre: 'work', date: new Date('2025-08-04'), poem: `at the end of year review
i list my accomplishments
which look impressive
on paper

i don't list what they cost
nobody asks
everybody has the same list
nobody says what it cost` }
]

// ============================================================
// RUN
// ============================================================
async function run() {
  await mongoose.connect(MONGODB)
  const User = require('../src/models/User')
  const Poem = require('../src/models/Poem')

  let usersCreated = 0
  let usersSkipped = 0
  let poemsCreated = 0
  let poemsSkipped = 0

  const userMap = {}

  console.log('--- Creating users ---')
  for (const userData of fakeUsers) {
    let user = await User.findOne({ username: userData.username })
    if (user) {
      userMap[userData.username] = user
      usersSkipped++
      continue
    }
    const passwordHash = await bcrypt.hash(PASSWORD, 10)
    user = new User({
      username: userData.username,
      email: userData.email,
      name: userData.name,
      surname: userData.surname,
      picture: userData.picture,
      passwordHash,
      poems: [],
      fake: true
    })
    await user.save()
    userMap[userData.username] = user
    usersCreated++
    console.log(`  Created: ${userData.username}`)
  }

  console.log(`\nUsers: ${usersCreated} created, ${usersSkipped} already existed`)
  console.log('\n--- Creating poems ---')

  for (const poemData of fakePoems) {
    const user = userMap[poemData.username]
    if (!user) {
      console.log(`  SKIP poem (user not found): ${poemData.title}`)
      continue
    }
    const existing = await Poem.findOne({ title: poemData.title, userId: user._id.toString() })
    if (existing) {
      poemsSkipped++
      continue
    }
    const slug = await buildUniqueSlug(poemData.title, user.username, Poem)
    const poem = new Poem({
      poem: maybeCapitalize(poemData.poem, slug),
      title: poemData.title,
      author: `${user.name} ${user.surname}`,
      picture: user.picture,
      genre: poemData.genre,
      origin: 'user',
      likes: [],
      date: poemData.date,
      userId: user._id.toString(),
      slug
    })
    await poem.save()
    poemsCreated++
    if (poemsCreated % 50 === 0) console.log(`  ${poemsCreated} poems created so far...`)
  }

  console.log('\n--- Updating user poem references ---')
  for (const [username, user] of Object.entries(userMap)) {
    const poems = await Poem.find({ userId: user._id.toString() }, '_id')
    user.poems = poems.map(p => p._id)
    await user.save()
  }

  console.log(`\nDone — users: ${usersCreated} created, ${usersSkipped} skipped`)
  console.log(`        poems: ${poemsCreated} created, ${poemsSkipped} skipped`)
  await mongoose.disconnect()
}

run().catch(e => { console.error(e); process.exit(1) })
