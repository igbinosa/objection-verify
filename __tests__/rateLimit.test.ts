import { createRateLimiter, clientIp } from '@/lib/rateLimit'

describe('createRateLimiter', () => {
  it('allows requests up to the limit, then blocks', () => {
    const rl = createRateLimiter(3, 60_000)
    expect(rl.check('a', 0).allowed).toBe(true)
    expect(rl.check('a', 1).allowed).toBe(true)
    expect(rl.check('a', 2).allowed).toBe(true)
    expect(rl.check('a', 3).allowed).toBe(false)
  })

  it('reports seconds until the window resets', () => {
    const rl = createRateLimiter(1, 60_000)
    rl.check('a', 0)
    expect(rl.check('a', 30_000).retryAfterSeconds).toBe(30)
  })

  it('opens again once the window has passed', () => {
    const rl = createRateLimiter(1, 60_000)
    rl.check('a', 0)
    expect(rl.check('a', 59_999).allowed).toBe(false)
    expect(rl.check('a', 60_000).allowed).toBe(true)
  })

  it('counts each client separately', () => {
    const rl = createRateLimiter(1, 60_000)
    expect(rl.check('a', 0).allowed).toBe(true)
    expect(rl.check('b', 0).allowed).toBe(true)
    expect(rl.check('a', 1).allowed).toBe(false)
  })
})

describe('clientIp', () => {
  it('takes the first x-forwarded-for entry', () => {
    expect(clientIp(new Headers({ 'x-forwarded-for': '1.2.3.4, 10.0.0.1' }))).toBe('1.2.3.4')
  })

  it('falls back to x-real-ip', () => {
    expect(clientIp(new Headers({ 'x-real-ip': '5.6.7.8' }))).toBe('5.6.7.8')
  })
})
