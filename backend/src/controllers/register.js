const bcrypt = require('bcryptjs')
const registerRouter = require('express').Router()
const Author = require('../models/Author')
const { slugifyAuthor } = require('../utils/slugUtils')

async function buildUniqueSlug (name) {
  const base = slugifyAuthor(name) || 'author'
  let slug = base
  let counter = 2
  while (await Author.exists({ slug })) {
    slug = `${base}-${counter++}`
  }
  return slug
}

registerRouter.post('/', async (req, res) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email and password are required', code: '0' })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format', code: '0' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const authorExists = await Author.findOne({ $or: [{ username }, { email }] })
    if (authorExists) {
      if (authorExists.username === username) {
        return res.status(401).send({ error: 'This username already exists. Please try with another one', code: '1' })
      } else if (authorExists.email === email) {
        return res.status(401).send({ error: 'This email already exists. Please try with another one', code: '2' })
      } else {
        return res.status(401).send({ error: 'This is an unknown error', code: '3' })
      }
    }

    const slug = await buildUniqueSlug(username)

    const newAuthor = new Author({
      name: username,
      slug,
      username,
      email,
      passwordHash,
      picture: null,
      type: 'user',
      fake: false
    })

    const savedAuthor = await newAuthor.save()
    res.json(savedAuthor)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Registration failed' })
  }
})

module.exports = registerRouter
