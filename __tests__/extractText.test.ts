import { extractText, hashBuffer, classifyFile } from '@/lib/extractText'

describe('hashBuffer', () => {
  it('returns a 64-char hex sha256', () => {
    const buf = Buffer.from('hello world')
    const hash = hashBuffer(buf)
    expect(hash).toHaveLength(64)
    expect(hash).toMatch(/^[a-f0-9]+$/)
  })

  it('is deterministic', () => {
    const buf = Buffer.from('test')
    expect(hashBuffer(buf)).toBe(hashBuffer(buf))
  })
})

describe('classifyFile', () => {
  it('classifies txt files as text', () => {
    expect(classifyFile('notes.txt', 'text/plain')).toBe('text')
  })
  it('classifies pdf files', () => {
    expect(classifyFile('doc.pdf', 'application/pdf')).toBe('pdf')
  })
  it('classifies docx files', () => {
    expect(classifyFile('doc.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')).toBe('docx')
  })
  it('classifies mp3 as pending', () => {
    expect(classifyFile('audio.mp3', 'audio/mpeg')).toBe('pending')
  })
  it('classifies jpg as pending', () => {
    expect(classifyFile('photo.jpg', 'image/jpeg')).toBe('pending')
  })
})
