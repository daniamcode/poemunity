// Mock the resend SDK so no real network call can ever happen and we can
// assert exactly when (and how) it is invoked.
const mockSend = jest.fn().mockResolvedValue({ id: 'mock-email-id' })
const MockResend = jest.fn().mockImplementation(() => ({
  emails: { send: mockSend }
}))

jest.mock('resend', () => ({ Resend: MockResend }))

const { sendEmail } = require('../utils/email')
const { resetPassword, verifyEmail } = require('../utils/emailTemplates')

describe('sendEmail', () => {
  const ORIGINAL_ENV = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...ORIGINAL_ENV }
  })

  afterEach(() => {
    process.env = ORIGINAL_ENV
  })

  test('no-key path resolves without throwing and never touches the SDK/network', async () => {
    delete process.env.RESEND_API_KEY

    await expect(
      sendEmail({
        to: 'test@example.com',
        subject: 'Hi',
        html: '<p>Hi</p>',
        text: 'Hi'
      })
    ).resolves.toBeUndefined()

    // Proof the network was never hit: the Resend constructor and its send
    // method were never invoked on the no-key path.
    expect(MockResend).not.toHaveBeenCalled()
    expect(mockSend).not.toHaveBeenCalled()
  })

  test('key-present path sends via the SDK with the right fields', async () => {
    process.env.RESEND_API_KEY = 'test-key'
    process.env.EMAIL_FROM = 'no-reply@example.com'

    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'Subject line',
      html: '<p>Body</p>',
      text: 'Body'
    })

    expect(MockResend).toHaveBeenCalledWith('test-key')
    expect(mockSend).toHaveBeenCalledTimes(1)
    expect(mockSend).toHaveBeenCalledWith({
      from: 'no-reply@example.com',
      to: 'test@example.com',
      subject: 'Subject line',
      html: '<p>Body</p>',
      text: 'Body'
    })
    expect(result).toEqual({ id: 'mock-email-id' })
  })
})

describe('email templates', () => {
  const link = 'https://example.com/action?token=abc123'

  test('resetPassword includes the link in html and text and has a subject', () => {
    const { subject, html, text } = resetPassword(link)

    expect(subject).toBeTruthy()
    expect(html).toContain(`href="${link}"`)
    expect(text).toContain(link)
  })

  test('verifyEmail includes the link in html and text and has a subject', () => {
    const { subject, html, text } = verifyEmail(link)

    expect(subject).toBeTruthy()
    expect(html).toContain(`href="${link}"`)
    expect(text).toContain(link)
  })
})
