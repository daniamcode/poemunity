/**
 * One-time migration: update seeded fake-user poems to store full name as author
 * instead of username (e.g. "Thomas Walker" instead of "thomaswalker_").
 *
 * Usage:
 *   NODE_ENV=development node scripts/fix-fake-author-names.js
 */

require('dotenv/config')
const connectMongo = require('../mongo')
const Poem = require('../src/models/Poem')
const User = require('../src/models/User')

const fakeUsernames = [
  'moonwriter23', 'versesbysadie', 'thomaswalker_', 'dadof3writes', 'angryquill',
  'coffeeshopverses', 'jesusismyrock_', 'queerpoetrybabe', 'ryaninnature', 'teenwrites_',
  'oceandeep99', 'GrumpyGrandpa', 'lostinlove23', 'spiritualfire', 'silentscream',
  'momlife_poems', 'historybuff42', 'wintermuse', 'galaxypoet', 'workdayblues',
  'sunrisepoet', 'travelingbard', 'broken_but_ok', 'GardenGuru', 'cityslicker_v',
  'SomberSunday', 'butterflysoul', 'warpoet_fred', 'musicismylife', 'hopeful_heart',
  'christmaseve_', 'desertdragon', 'bookwormpoet', 'stormsurfer', 'midnightink_',
  'smalltownlife', 'forgiveandwrite', 'tearsandink', 'futureisnow_', 'laughlines',
  'prayerpoems', 'twentysomething', 'divorcepoems', 'warmsummer_', 'wintrywords',
  'siblinghood', 'soberlife_', 'birthdays_hurt', 'immigrantpen', 'grievingmom_'
]

async function run() {
  await connectMongo()

  let updated = 0
  let skipped = 0

  for (const username of fakeUsernames) {
    const user = await User.findOne({ username })
    if (!user) {
      console.log(`  User not found: ${username}`)
      continue
    }
    const fullName = `${user.name} ${user.surname}`
    const result = await Poem.updateMany(
      { userId: user._id.toString(), author: username },
      { $set: { author: fullName } }
    )
    if (result.modifiedCount > 0) {
      console.log(`  ${username} → "${fullName}" (${result.modifiedCount} poems)`)
      updated += result.modifiedCount
    } else {
      skipped++
    }
  }

  console.log(`\nDone — ${updated} poems updated, ${skipped} users already up to date`)
  process.exit(0)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
