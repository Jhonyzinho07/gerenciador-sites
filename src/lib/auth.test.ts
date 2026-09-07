import { beforeAll, describe, expect, it } from 'vitest'
import { createSessionToken, verifySessionToken } from './auth'

beforeAll(() => {
  process.env.AUTH_SECRET = 'test-secret-at-least-32-characters-long'
})

describe('session tokens', () => {
  it('round-trips a user id through create and verify', async () => {
    const token = await createSessionToken('user-123')
    await expect(verifySessionToken(token)).resolves.toBe('user-123')
  })

  it('rejects a garbage token', async () => {
    await expect(verifySessionToken('not-a-real-token')).resolves.toBeNull()
  })
})
