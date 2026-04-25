'use client'
import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Certificate } from '@/types'

const ACCEPTED = '.txt,.pdf,.docx,.doc,.mp3,.wav,.png,.jpg,.jpeg'

function fileTag(name: string): string {
  const ext = name.split('.').pop()?.toUpperCase() ?? 'FILE'
  return ext
}

function isPendingFile(name: string): boolean {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  return ['mp3', 'wav', 'png', 'jpg', 'jpeg'].includes(ext)
}

export default function SubmitPage() {
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const addFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name))
      const next = Array.from(incoming).filter(f => !existing.has(f.name))
      return [...prev, ...next].slice(0, 10)
    })
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    addFiles(e.dataTransfer.files)
  }, [addFiles])

  const removeFile = (name: string) => setFiles(prev => prev.filter(f => f.name !== name))

  const handleSubmit = async () => {
    if (files.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const form = new FormData()
      files.forEach(f => form.append('files', f))
      const res = await fetch('/api/verify', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Verification failed')
      const cert: Certificate = data.certificate
      sessionStorage.setItem(`cert-${cert.id}`, JSON.stringify(cert))
      router.push(`/certificate/${cert.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <main>
      <div className="px-15 py-12 pb-8 border-b border-white/5">
        <h1 className="text-2xl text-gray-100 mb-2">
          <span className="text-green-400">&gt;</span> Submit Evidence Package
        </h1>
        <p className="text-[13px] text-gray-600 leading-relaxed font-sans">
          No account required. Files are hashed on receipt and discarded after analysis.
          The certificate contains no source-identifying information.
        </p>
      </div>

      <div className="px-15 py-12 grid grid-cols-[1fr_300px] gap-16">
        {/* Upload area */}
        <div>
          <div
            className="border border-dashed border-white/10 p-14 text-center mb-6 cursor-pointer hover:border-green-400/40 hover:bg-green-400/[0.03] transition-all"
            onDrop={onDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
          >
            <p className="text-2xl text-gray-800 mb-4">&#8679;</p>
            <p className="text-[13px] text-gray-600 mb-2 font-sans">Drop files here or click to upload</p>
            <p className="text-[10px] text-gray-800 tracking-[0.08em]">
              Accepted: .txt .pdf .docx .mp3 .wav .png .jpg
            </p>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={ACCEPTED}
              className="hidden"
              onChange={e => addFiles(e.target.files)}
            />
          </div>

          {files.length > 0 && (
            <div className="mb-8">
              {files.map(f => (
                <div key={f.name} className="flex items-center gap-4 py-3 border-b border-white/[0.04]">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isPendingFile(f.name) ? 'bg-gray-700' : 'bg-green-400 shadow-[0_0_5px_#00ff41]'}`} />
                  <span className="text-xs text-gray-400 flex-1 font-mono">{f.name}</span>
                  <span className={`text-[10px] border px-2 py-0.5 tracking-[0.06em] ${isPendingFile(f.name) ? 'text-gray-700 border-white/5' : 'text-gray-600 border-white/[0.08]'}`}>
                    {isPendingFile(f.name) ? `${fileTag(f.name)} - flagged for review` : fileTag(f.name)}
                  </span>
                  <button onClick={() => removeFile(f.name)} className="text-gray-800 hover:text-gray-500 text-xs ml-1">&#10005;</button>
                </div>
              ))}
            </div>
          )}

          {error && (
            <p className="text-red-500/70 text-xs mb-4 font-mono border border-red-500/20 px-4 py-3">&gt; Error: {error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={files.length === 0 || loading}
            className="w-full border border-green-400 text-green-400 py-3 text-xs tracking-[0.15em] uppercase disabled:opacity-30 disabled:cursor-not-allowed hover:bg-green-400/5 transition-colors shadow-[0_0_12px_rgba(0,255,65,0.13)]"
          >
            {loading ? '[ Analyzing... ]' : '> Verify Evidence Package'}
          </button>
          {loading && (
            <p className="text-[11px] text-gray-700 mt-3 text-center font-mono">
              Running cross-document coherence analysis. This may take 20-30 seconds.
            </p>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          {[
            { title: '// Privacy', body: 'No account. Files are hashed on arrival and discarded after analysis. The certificate contains no names, affiliations, or identifying metadata.' },
            { title: '// What gets analyzed', list: ['Document provenance & timestamps', 'Cross-document consistency', 'Corroboration across sources', 'Internal plausibility', 'Temporal coherence'] },
            { title: '// Audio & media files', body: 'Hashed and flagged for manual review. Automated transcription available in the production pipeline.' },
          ].map(card => (
            <div key={card.title} className="bg-black/50 border border-white/[0.06] p-5">
              <p className="text-[10px] text-green-400/40 uppercase tracking-[0.15em] mb-3">{card.title}</p>
              {card.body && <p className="text-xs text-gray-600 leading-relaxed font-sans">{card.body}</p>}
              {card.list && (
                <ul className="text-xs text-gray-600 leading-loose font-sans list-disc pl-4">
                  {card.list.map(item => <li key={item}>{item}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
