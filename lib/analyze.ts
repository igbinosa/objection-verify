import Anthropic from '@anthropic-ai/sdk'
import { ClaudeAnalysis, ExtractedFile } from '@/types'

const client = new Anthropic()

export async function analyzeEvidence(files: ExtractedFile[]): Promise<ClaudeAnalysis> {
  const analyzable = files.filter(f => !f.isPending && f.text)
  const pending = files.filter(f => f.isPending)

  const evidenceBlocks = analyzable.map((f, i) => (
    `--- EVIDENCE ITEM ${i} (${f.originalName}) ---\n${f.text}\n`
  )).join('\n')

  const prompt = `You are an evidence verification analyst for a journalism platform. You have received an anonymous evidence package containing ${analyzable.length} document(s) and ${pending.length} pending file(s) (audio/media - not yet transcribed).

Your job is to assess the credibility and coherence of the evidence WITHOUT identifying or exposing the source. You must never include names of individuals, institutions, or any identifying information in your output.

EVIDENCE PACKAGE:
${evidenceBlocks}

Analyze the evidence package and return a JSON object with this exact structure:
{
  "confidenceScore": <integer 0-100>,
  "tier": <"Insufficient" | "Preliminary" | "Corroborated" | "Strongly Corroborated">,
  "tierDescription": <one sentence describing the overall quality of corroboration>,
  "evidenceBreakdown": [
    {
      "fileIndex": <index matching the order above, 0-based>,
      "type": <short human label like "Email correspondence" or "Personal notes" or "Quantitative analysis">,
      "strength": <"strong" | "corroborating" | "pending">,
      "assessment": <2-3 sentences: what this document contributes, any consistency notes, any flags. NO names or identifiers.>
    }
  ],
  "keyFindings": [
    <3-5 strings, each a single key finding. Privacy-preserving - no names, no institutions.>
  ],
  "attributionLanguage": <A single publication-ready sentence a journalist can quote directly. Format: "Direct quote from evidence," said a source whose evidence was independently verified through Objection's certification process [CERT-XXXXXXXX]. Use NO real names.>
}

Scoring guide:
- 81-100 Strongly Corroborated: Multiple independent documents with consistent timelines, quantifiable discrepancies, and cross-document corroboration
- 66-80 Corroborated: Documents are consistent and support the allegation but corroboration is partial
- 41-65 Preliminary: Some consistency but limited independent corroboration or significant interpretive ambiguity
- 0-40 Insufficient: Contradictions, implausibility, or too little material to assess

For temporal coherence: check that dates, event sequences, and references across documents are internally consistent. Flag anachronisms.
For directional analysis: if quantitative claims exist, note whether discrepancies are unidirectional (all inflate or all deflate a metric) - this is significant.

Return ONLY the JSON object. No preamble, no explanation.`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

  // Extract JSON object even if Claude includes preamble text
  const jsonMatch = responseText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON object found in Claude response')
  const analysis = JSON.parse(jsonMatch[0]) as ClaudeAnalysis

  pending.forEach((f, i) => {
    analysis.evidenceBreakdown.push({
      fileIndex: analyzable.length + i,
      type: f.originalName.endsWith('.mp3') || f.originalName.endsWith('.wav')
        ? 'Audio recording'
        : 'Media file',
      strength: 'pending',
      assessment: 'File received and hashed. Audio transcription requires production pipeline review.',
    })
  })

  return analysis
}
