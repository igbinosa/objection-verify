import crypto from 'crypto'
import { Certificate, ClaudeAnalysis, ConfidenceTier, ExtractedFile } from '@/types'

export function generateCertId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const random = crypto.randomBytes(8)
  const suffix = Array.from(random).map(b => chars[b % chars.length]).join('')
  return `CERT-${suffix}`
}

export function buildPackageHash(hashes: string[]): string {
  return crypto.createHash('sha256').update(hashes.join('')).digest('hex')
}

export function scoreTier(score: number): ConfidenceTier {
  if (score >= 81) return 'Strongly Corroborated'
  if (score >= 66) return 'Corroborated'
  if (score >= 41) return 'Preliminary'
  return 'Insufficient'
}

export function assembleCertificate(
  analysis: ClaudeAnalysis,
  files: ExtractedFile[]
): Certificate {
  const id = generateCertId()
  const issuedAt = new Date().toISOString()
  const packageHash = buildPackageHash(files.map(f => f.hash))

  const evidenceBreakdown = analysis.evidenceBreakdown
    .filter(item => item.fileIndex >= 0 && item.fileIndex < files.length)
    .map(item => {
      const file = files[item.fileIndex]
      return {
        fileIndex: item.fileIndex,
        fileName: file.originalName,
        type: item.type,
        strength: item.strength,
        assessment: item.assessment,
        hashPrefix: file.hash.slice(0, 20),
        fullHash: file.hash,
        isPending: file.isPending,
      }
    })

  const attributionLanguage = analysis.attributionLanguage.replace(
    /\[CERT-[A-Z0-9]+\]/,
    `[${id}]`
  )

  return {
    id,
    issuedAt,
    score: analysis.confidenceScore,
    tier: scoreTier(analysis.confidenceScore),
    tierDescription: analysis.tierDescription,
    evidenceBreakdown,
    keyFindings: analysis.keyFindings,
    attributionLanguage,
    packageHash,
  }
}
