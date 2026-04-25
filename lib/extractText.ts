import crypto from 'crypto'
import { ExtractedFile } from '@/types'

export type FileClass = 'text' | 'pdf' | 'docx' | 'pending'

export function hashBuffer(buf: Buffer): string {
  return crypto.createHash('sha256').update(buf).digest('hex')
}

export function classifyFile(name: string, mime: string): FileClass {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'txt' || mime.startsWith('text/')) return 'text'
  if (ext === 'pdf' || mime === 'application/pdf') return 'pdf'
  if (ext === 'docx' || mime.includes('wordprocessingml')) return 'docx'
  return 'pending'
}

export async function extractText(
  name: string,
  mime: string,
  buf: Buffer
): Promise<ExtractedFile> {
  const hash = hashBuffer(buf)
  const kind = classifyFile(name, mime)

  if (kind === 'text') {
    return { originalName: name, mimeType: mime, text: buf.toString('utf-8'), hash, isPending: false }
  }

  if (kind === 'pdf') {
    try {
      const pdfParse = (await import('pdf-parse')).default
      const data = await pdfParse(buf)
      return { originalName: name, mimeType: mime, text: data.text, hash, isPending: false }
    } catch {
      return { originalName: name, mimeType: mime, text: null, hash, isPending: true }
    }
  }

  if (kind === 'docx') {
    try {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer: buf })
      return { originalName: name, mimeType: mime, text: result.value || null, hash, isPending: false }
    } catch {
      return { originalName: name, mimeType: mime, text: null, hash, isPending: true }
    }
  }

  return { originalName: name, mimeType: mime, text: null, hash, isPending: true }
}
