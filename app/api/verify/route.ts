import { NextRequest, NextResponse } from 'next/server'
import { extractText } from '@/lib/extractText'
import { analyzeEvidence } from '@/lib/analyze'
import { assembleCertificate } from '@/lib/buildCertificate'
import { signCertificate } from '@/lib/sign'
import { ExtractedFile } from '@/types'
import { createRateLimiter, clientIp } from '@/lib/rateLimit'

export const maxDuration = 60

// Each request makes a paid Claude call. 5 per IP per 10 minutes.
const limiter = createRateLimiter(5, 10 * 60 * 1000)

export async function POST(req: NextRequest) {
  const { allowed, retryAfterSeconds } = limiter.check(clientIp(req.headers))
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Try again in a few minutes.' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
    )
  }

  try {
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]
    const pendingNamesRaw = formData.get('pendingNames')
    const pendingNames: string[] = pendingNamesRaw
      ? JSON.parse(pendingNamesRaw as string)
      : []

    if (files.length === 0 && pendingNames.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    if (files.length + pendingNames.length > 10) {
      return NextResponse.json({ error: 'Maximum 10 files per submission' }, { status: 400 })
    }

    const extracted: ExtractedFile[] = await Promise.all(
      files.map(async (file) => {
        const buf = Buffer.from(await file.arrayBuffer())
        return extractText(file.name, file.type, buf)
      })
    )

    // Pending files (audio/images): not uploaded, just register as stubs
    for (const name of pendingNames) {
      extracted.push({ originalName: name, mimeType: '', text: null, hash: '', isPending: true })
    }

    const hasAnalyzable = extracted.some(f => (f.text && f.text.trim().length > 0) || f.rawPdf)
    if (!hasAnalyzable) {
      return NextResponse.json(
        { error: 'No analyzable content found in uploaded files. Upload .txt, .pdf, or .docx documents.' },
        { status: 422 }
      )
    }

    const analysis = await analyzeEvidence(extracted)

    const certificate = assembleCertificate(analysis, extracted)

    const clientCertificate = {
      ...certificate,
      evidenceBreakdown: certificate.evidenceBreakdown.map(({ fileName: _fn, ...rest }) => rest),
    }

    const signature = signCertificate(clientCertificate)
    return NextResponse.json({ certificate: { ...clientCertificate, signature } })
  } catch (err) {
    // Full detail stays in the server logs; the client gets a generic message.
    console.error('Verify route error:', err)
    return NextResponse.json(
      { error: 'Something went wrong while analyzing your files. Please try again.' },
      { status: 500 }
    )
  }
}
