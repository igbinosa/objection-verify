import { generateCertId, buildPackageHash, scoreTier, assembleCertificate } from '@/lib/buildCertificate'
import { ClaudeAnalysis, ExtractedFile } from '@/types'

describe('generateCertId', () => {
  it('returns CERT- prefix with 8 uppercase alphanumeric chars', () => {
    const id = generateCertId()
    expect(id).toMatch(/^CERT-[A-Z0-9]{8}$/)
  })

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateCertId()))
    expect(ids.size).toBe(100)
  })
})

describe('buildPackageHash', () => {
  it('returns a 64-char hex string', () => {
    const hash = buildPackageHash(['abc123', 'def456'])
    expect(hash).toHaveLength(64)
    expect(hash).toMatch(/^[a-f0-9]+$/)
  })

  it('is deterministic for same input order', () => {
    expect(buildPackageHash(['a', 'b'])).toBe(buildPackageHash(['a', 'b']))
  })
})

describe('scoreTier', () => {
  it('maps 81-100 to Strongly Corroborated', () => {
    expect(scoreTier(87)).toBe('Strongly Corroborated')
  })
  it('maps 66-80 to Corroborated', () => {
    expect(scoreTier(72)).toBe('Corroborated')
  })
  it('maps 41-65 to Preliminary', () => {
    expect(scoreTier(55)).toBe('Preliminary')
  })
  it('maps 0-40 to Insufficient', () => {
    expect(scoreTier(30)).toBe('Insufficient')
  })
})
