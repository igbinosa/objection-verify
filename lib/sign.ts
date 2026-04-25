import crypto from 'crypto'
import { SignedCertificate } from '@/types'

type UnsignedCert = Omit<SignedCertificate, 'signature'>

// Fixed field order so HMAC is deterministic across JSON roundtrips
function canonicalize(cert: UnsignedCert): string {
  return JSON.stringify({
    id: cert.id,
    issuedAt: cert.issuedAt,
    score: cert.score,
    tier: cert.tier,
    tierDescription: cert.tierDescription,
    evidenceBreakdown: cert.evidenceBreakdown.map(ev => ({
      fileIndex: ev.fileIndex,
      type: ev.type,
      strength: ev.strength,
      assessment: ev.assessment,
      hashPrefix: ev.hashPrefix,
      fullHash: ev.fullHash,
      isPending: ev.isPending,
    })),
    keyFindings: cert.keyFindings,
    attributionLanguage: cert.attributionLanguage,
    packageHash: cert.packageHash,
  })
}

function secret(): string {
  const s = process.env.CERTIFICATE_SECRET
  if (!s) throw new Error('CERTIFICATE_SECRET env var is not set')
  return s
}

export function signCertificate(cert: UnsignedCert): string {
  return crypto.createHmac('sha256', secret()).update(canonicalize(cert)).digest('hex')
}

export function verifyCertificate(cert: SignedCertificate): boolean {
  try {
    const { signature, ...rest } = cert
    const expected = Buffer.from(signCertificate(rest), 'hex')
    const actual = Buffer.from(signature, 'hex')
    if (expected.length !== actual.length) return false
    return crypto.timingSafeEqual(expected, actual)
  } catch {
    return false
  }
}
