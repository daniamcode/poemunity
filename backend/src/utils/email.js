// Sends a transactional email through the Resend HTTP API.
//
// When RESEND_API_KEY is not configured (tests / local dev without setup),
// this is a no-op that logs and resolves without any network call — the SDK
// is never even required. This mirrors the lazy-require + graceful-fallback
// pattern used by storePicture (@vercel/blob) in ../controllers/users.js and
// keeps the test suite hermetic.
async function sendEmail ({ to, subject, html, text }) {
  if (!process.env.RESEND_API_KEY) {
    console.log('RESEND_API_KEY not set — skipping email send (no-op fallback)')
    return
  }

  // Lazy-require so environments without email configured (tests / local dev)
  // never load the resend SDK at module load time.
  const { Resend } = require('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)

  return resend.emails.send({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
    text
  })
}

module.exports = { sendEmail }
