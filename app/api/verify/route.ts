import { NextRequest, NextResponse } from 'next/server'
import { extractText } from '@/lib/extractText'
import { analyzeEvidence } from '@/lib/analyze'
import { assembleCertificate } from '@/lib/buildCertificate'
import { signCertificate } from '@/lib/sign'
import { ExtractedFile } from '@/types'

export const maxDuration = 60

export async function POST(req: NextRequest) {
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

    const hasText = extracted.some(f => f.text && f.text.trim().length > 0)
    if (!hasText) {
      const pdfCount = files.filter(f => f.name.toLowerCase().endsWith('.pdf')).length
      const msg = pdfCount > 0
        ? 'No readable text could be extracted from the uploaded PDFs. They may be scanned images rather than text-based documents. Try copying the text and uploading as .txt files instead.'
        : 'No readable text found in uploaded files. Upload .txt, .pdf, or .docx documents with actual text content.'
      return NextResponse.json({ error: msg }, { status: 422 })
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
    const message = err instanceof Error ? err.message : String(err)
    console.error('Verify route error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
