export type EvidenceStrength = 'strong' | 'corroborating' | 'pending'

export interface EvidenceItem {
  fileIndex: number
  fileName: string       // used internally only - never sent to client
  type: string           // human label e.g. "Email correspondence"
  strength: EvidenceStrength
  assessment: string     // privacy-preserving text from Claude
  hashPrefix: string     // first 20 chars of sha256
  fullHash: string       // full sha256 - used for package hash
  isPending: boolean     // true for audio/image - not AI-analyzed
}

export type ConfidenceTier =
  | 'Insufficient'
  | 'Preliminary'
  | 'Corroborated'
  | 'Strongly Corroborated'

export interface Certificate {
  id: string                        // CERT-XXXXXXXX
  issuedAt: string                  // ISO timestamp, server-generated
  score: number                     // 0-100
  tier: ConfidenceTier
  tierDescription: string
  evidenceBreakdown: EvidenceItem[]
  keyFindings: string[]
  attributionLanguage: string
  packageHash: string               // sha256 of all file hashes concatenated
}

export interface ExtractedFile {
  originalName: string
  mimeType: string
  text: string | null               // null for audio/image
  hash: string                      // sha256 hex
  isPending: boolean
}

export interface ClaudeAnalysis {
  confidenceScore: number
  tier: ConfidenceTier
  tierDescription: string
  evidenceBreakdown: Array<{
    fileIndex: number
    type: string
    strength: EvidenceStrength
    assessment: string
  }>
  keyFindings: string[]
  attributionLanguage: string
}
