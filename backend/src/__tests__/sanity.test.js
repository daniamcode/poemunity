describe('Backend Tests', () => {
  test('Jest is configured correctly', () => {
    expect(true).toBe(true)
  })

  test('Node environment is available', () => {
    expect(process.env.NODE_ENV).toBeDefined()
  })
})
