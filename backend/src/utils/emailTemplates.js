// Plain, inline-styled transactional email templates. Each returns
// { subject, html, text }. No external assets or images — the link must
// appear in both the html (as an href) and the plain-text body.

function resetPassword (link) {
  const subject = 'Reset your Poemunity password'
  const html = `
    <div style="font-family: Arial, sans-serif; font-size: 16px; color: #222; line-height: 1.5;">
      <p>We received a request to reset your Poemunity password.</p>
      <p>Click the link below to choose a new password. This link expires soon and can be used once.</p>
      <p><a href="${link}" style="color: #1a73e8;">Reset your password</a></p>
      <p>If you did not request this, you can safely ignore this email.</p>
    </div>
  `
  const text = [
    'We received a request to reset your Poemunity password.',
    'Open the link below to choose a new password. This link expires soon and can be used once.',
    link,
    'If you did not request this, you can safely ignore this email.'
  ].join('\n\n')

  return { subject, html, text }
}

function verifyEmail (link) {
  const subject = 'Verify your Poemunity email'
  const html = `
    <div style="font-family: Arial, sans-serif; font-size: 16px; color: #222; line-height: 1.5;">
      <p>Welcome to Poemunity! Please confirm your email address.</p>
      <p>Click the link below to verify your email.</p>
      <p><a href="${link}" style="color: #1a73e8;">Verify your email</a></p>
      <p>If you did not create this account, you can safely ignore this email.</p>
    </div>
  `
  const text = [
    'Welcome to Poemunity! Please confirm your email address.',
    'Open the link below to verify your email.',
    link,
    'If you did not create this account, you can safely ignore this email.'
  ].join('\n\n')

  return { subject, html, text }
}

module.exports = { resetPassword, verifyEmail }
