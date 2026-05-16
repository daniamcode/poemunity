/**
 * One-time migration: update fake users with more realistic usernames and varied profile pictures.
 * Matched by email (stable identifier). Also updates picture on their poems.
 *
 * Usage:
 *   NODE_ENV=development node scripts/update-fake-user-profiles.js
 */

require('dotenv/config')
const connectMongo = require('../mongo')
const User = require('../src/models/User')
const Poem = require('../src/models/Poem')

// null = no picture (will show initials avatar)
// picsum = random deterministic photo (landscapes, objects, places)
// pravatar = face photo
const updates = [
  // --- Power users ---
  { email: 'moonwriter23@fakemail.com', username: 'moonwriter23', picture: 'https://i.pravatar.cc/150?img=23' },
  { email: 'versesbysadie@fakemail.com', username: 'VersesBy_Sadie', picture: null },
  { email: 'thomaswalker@fakemail.com', username: 't.walker_outdoors', picture: 'https://picsum.photos/seed/walker/150/150' },
  { email: 'dadof3writes@fakemail.com', username: 'DadOf3_Writes', picture: 'https://i.pravatar.cc/150?img=12' },
  { email: 'angryquill@fakemail.com', username: 'angry.quill', picture: 'https://i.pravatar.cc/150?img=44' },
  // --- Regular users ---
  { email: 'coffeeshopverses@fakemail.com', username: 'coffeeshop.verses', picture: 'https://picsum.photos/seed/coffeeshop/150/150' },
  { email: 'jesusismyrock@fakemail.com', username: 'JesusIsMyRock_', picture: 'https://i.pravatar.cc/150?img=62' },
  { email: 'queerpoetrybabe@fakemail.com', username: 'queerpoetrybabe', picture: 'https://i.pravatar.cc/150?img=15' },
  { email: 'ryaninnature@fakemail.com', username: 'ryan_in_nature', picture: 'https://picsum.photos/seed/ryanforest/150/150' },
  { email: 'teenwrites@fakemail.com', username: 'teen.writes_', picture: 'https://i.pravatar.cc/150?img=9' },
  { email: 'oceandeep99@fakemail.com', username: 'OceanDeep99', picture: 'https://picsum.photos/seed/oceandeep/150/150' },
  { email: 'grumpygrandpa@fakemail.com', username: 'GrumpyGrandpa', picture: 'https://i.pravatar.cc/150?img=53' },
  { email: 'lostinlove23@fakemail.com', username: 'lostinlove23', picture: 'https://i.pravatar.cc/150?img=43' },
  { email: 'spiritualfire@fakemail.com', username: 'spiritual.fire', picture: null },
  { email: 'silentscream@fakemail.com', username: 'silent_scream', picture: null },
  { email: 'momlifepoems@fakemail.com', username: 'MomLife_Poems', picture: 'https://i.pravatar.cc/150?img=49' },
  { email: 'historybuff42@fakemail.com', username: 'historybuff42', picture: 'https://i.pravatar.cc/150?img=57' },
  { email: 'wintermuse@fakemail.com', username: 'WinterMuse', picture: 'https://picsum.photos/seed/snowfield/150/150' },
  { email: 'galaxypoet@fakemail.com', username: 'galaxy.poet', picture: null },
  { email: 'workdayblues@fakemail.com', username: 'workday.blues', picture: 'https://i.pravatar.cc/150?img=36' },
  // --- Casual users ---
  { email: 'sunrisepoet@fakemail.com', username: 'SunrisePoet_', picture: 'https://i.pravatar.cc/150?img=20' },
  { email: 'travelingbard@fakemail.com', username: 'traveling.bard', picture: 'https://picsum.photos/seed/travelbard/150/150' },
  { email: 'broken_but_ok@fakemail.com', username: 'broken_but_ok', picture: null },
  { email: 'gardenguru@fakemail.com', username: 'Garden_Guru', picture: 'https://picsum.photos/seed/gardenflower/150/150' },
  { email: 'cityslickerv@fakemail.com', username: 'CitySlicker_V', picture: 'https://i.pravatar.cc/150?img=27' },
  { email: 'sombersunday@fakemail.com', username: 'SomberSunday', picture: null },
  { email: 'butterflysoul@fakemail.com', username: 'butterfly_soul', picture: 'https://i.pravatar.cc/150?img=25' },
  { email: 'warpoetfred@fakemail.com', username: 'warpoet_fred', picture: 'https://i.pravatar.cc/150?img=54' },
  { email: 'musicismylife@fakemail.com', username: 'MusicIsMyLife', picture: null },
  { email: 'hopefulheart@fakemail.com', username: 'hopeful.heart', picture: 'https://i.pravatar.cc/150?img=7' },
  { email: 'christmaseve@fakemail.com', username: 'ChristmasEve_', picture: 'https://i.pravatar.cc/150?img=60' },
  { email: 'desertdragon@fakemail.com', username: 'desert_dragon', picture: 'https://picsum.photos/seed/desertsand/150/150' },
  { email: 'bookwormpoet@fakemail.com', username: 'bookworm.poet', picture: 'https://i.pravatar.cc/150?img=16' },
  { email: 'stormsurfer@fakemail.com', username: 'StormSurfer', picture: 'https://picsum.photos/seed/stormwave/150/150' },
  { email: 'midnightink@fakemail.com', username: 'midnight.ink_', picture: 'https://i.pravatar.cc/150?img=21' },
  { email: 'smalltownlife@fakemail.com', username: 'SmallTownLife', picture: null },
  { email: 'forgiveandwrite@fakemail.com', username: 'forgive_and_write', picture: 'https://i.pravatar.cc/150?img=35' },
  { email: 'tearsandink@fakemail.com', username: 'tears_and_ink', picture: 'https://i.pravatar.cc/150?img=13' },
  { email: 'futureisnow@fakemail.com', username: 'FutureIsNow_', picture: null },
  { email: 'laughlines@fakemail.com', username: 'LaughLines', picture: 'https://i.pravatar.cc/150?img=34' },
  { email: 'prayerpoems@fakemail.com', username: 'prayer.poems', picture: 'https://i.pravatar.cc/150?img=67' },
  { email: 'twentysomething@fakemail.com', username: 'twenty_something', picture: 'https://i.pravatar.cc/150?img=22' },
  { email: 'divorcepoems@fakemail.com', username: 'divorce.poems', picture: null },
  { email: 'warmsummer@fakemail.com', username: 'WarmSummer_', picture: 'https://picsum.photos/seed/summerlake/150/150' },
  { email: 'wintrywords@fakemail.com', username: 'wintry.words', picture: 'https://i.pravatar.cc/150?img=26' },
  { email: 'siblinghood@fakemail.com', username: 'SiblingHood', picture: 'https://i.pravatar.cc/150?img=38' },
  { email: 'soberlife@fakemail.com', username: 'soberlife_', picture: 'https://i.pravatar.cc/150?img=48' },
  { email: 'birthdayshurt@fakemail.com', username: 'birthdays_hurt', picture: 'https://i.pravatar.cc/150?img=10' },
  { email: 'immigrantpen@fakemail.com', username: 'immigrant.pen', picture: 'https://picsum.photos/seed/citystreet/150/150' },
  { email: 'grievingmom@fakemail.com', username: 'GrievingMom_', picture: 'https://i.pravatar.cc/150?img=64' }
]

async function run () {
  await connectMongo()

  let usersUpdated = 0
  let poemsUpdated = 0

  for (const { email, username, picture } of updates) {
    const user = await User.findOne({ email })
    if (!user) {
      console.log(`  User not found: ${email}`)
      continue
    }

    user.username = username
    user.picture = picture || null
    await user.save()
    usersUpdated++

    const result = await Poem.updateMany(
      { userId: user._id.toString() },
      { $set: { picture: picture || null } }
    )
    poemsUpdated += result.modifiedCount

    const picLabel = picture ? (picture.includes('picsum') ? 'picsum' : 'pravatar') : 'none'
    console.log(`  ${username.padEnd(22)} picture: ${picLabel}`)
  }

  console.log(`\nDone — ${usersUpdated} users updated, ${poemsUpdated} poems updated`)
  process.exit(0)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
