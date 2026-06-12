const COMMENTERS = new Set([
  'angry.quill',
  'queerpoetrybabe',
  'silent_scream',
  'GrumpyGrandpa',
  'historybuff42',
  'lostinlove23',
  'coffeeshop.verses',
  'teen.writes_',
  'warpoet_fred',
  'immigrant.pen'
])

const LURKERS = new Set([
  'ChristmasEve_',
  'DadOf3_Writes',
  'JesusIsMyRock_',
  'MomLife_Poems',
  'SunrisePoet_',
  'Garden_Guru',
  'hopeful.heart',
  'WarmSummer_',
  'SiblingHood',
  'soberlife_',
  'birthdays_hurt',
  'prayer.poems',
  'forgive_and_write',
  'butterfly_soul',
  'SmallTownLife',
  'WinterMuse',
  'StormSurfer',
  'desert_dragon',
  'bookworm.poet',
  'CitySlicker_V'
])

export function activityProfileFor (author) {
  if (COMMENTERS.has(author.username)) {
    return {
      name: 'COMMENTER',
      likeMin: 20,
      likeMax: 30,
      commentProbability: 0.8,
      style: 'longer, opinionated, and sometimes gently challenging'
    }
  }

  if (LURKERS.has(author.username)) {
    return {
      name: 'LURKER',
      likeMin: 35,
      likeMax: 50,
      commentProbability: 0.1,
      style: 'brief, heartfelt, often one striking line'
    }
  }

  return {
    name: 'REGULAR',
    likeMin: 30,
    likeMax: 40,
    commentProbability: 0.4,
    style: 'warm, personal, and conversational in 1 to 3 sentences'
  }
}

export function canReply (author) {
  return activityProfileFor(author).name !== 'LURKER' || Math.random() < 0.05
}
