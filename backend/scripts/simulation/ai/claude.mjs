import Anthropic from '@anthropic-ai/sdk'

let client

function getClient () {
  if (!client) client = new Anthropic()
  return client
}

function fakeResponse (task) {
  if (task === 'reply') return 'That reading feels right to me, especially in the way the poem keeps circling what cannot be said plainly.'
  if (task === 'profile-comment') return 'I found myself thinking about one of your images long after I left the page. There is a quiet steadiness in your work that really stays.'
  if (task === 'poem-title') return 'After the Rain'
  return 'The image that stayed with me is the one that feels smallest at first. It gives the whole poem a human weight.'
}

export async function generate (systemPrompt, userPrompt, options = {}) {
  const {
    model = 'claude-haiku-4-5-20251001',
    maxTokens = 512,
    task = 'comment',
    dryRun = false,
    callAi = false
  } = options

  if (dryRun && !callAi) return fakeResponse(task)

  const msg = await getClient().messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }]
  })

  const firstText = msg.content.find(block => block.type === 'text')
  return firstText?.text?.trim() || ''
}
