import crypto from 'crypto'
import { SignedCertificate } from '@/types'

type UnsignedCert = Omit<SignedCertificate, 'signature'>

// Public key is intentionally committed - anyone can use it to verify offline
const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEA6Sod1MH6kFNvvD6PRQTeearM5N1bL2QoPFXwQzKtHp4=
-----END PUBLIC KEY-----`

// Fixed field order so signature is deterministic across JSON roundtrips
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

function loadPrivateKey(): crypto.KeyObject {
  const b64 = process.env.CERTIFICATE_PRIVATE_KEY
  if (!b64) throw new Error('CERTIFICATE_PRIVATE_KEY env var is not set')
  return crypto.createPrivateKey(Buffer.from(b64, 'base64').toString('utf8'))
}

export function signCertificate(cert: UnsignedCert): string {
  const sig = crypto.sign(null, Buffer.from(canonicalize(cert)), loadPrivateKey())
  return sig.toString('base64')
}

export function verifyCertificate(cert: SignedCertificate): boolean {
  try {
    const { signature, ...rest } = cert
    const data = Buffer.from(canonicalize(rest))
    const sig = Buffer.from(signature, 'base64')
    return crypto.verify(null, data, crypto.createPublicKey(PUBLIC_KEY_PEM), sig)
  } catch {
    return false
  }
}

export { PUBLIC_KEY_PEM }
