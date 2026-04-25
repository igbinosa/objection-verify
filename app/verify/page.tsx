'use client'
import { useState } from 'react'
import { SignedCertificate, ConfidenceTier } from '@/types'

const TIER_COLORS: Record<ConfidenceTier, string> = {
  'Strongly Corroborated': 'text-green-400',
  'Corroborated': 'text-green-600',
  'Preliminary': 'text-yellow-600',
  'Insufficient': 'text-red-700',
}

export default function VerifyPage() {
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'valid' | 'invalid' | 'error'>('idle')
  const [cert, setCert] = useState<SignedCertificate | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const handleVerify = async () => {
    setStatus('loading')
    setCert(null)
    setErrorMsg('')
    try {
      const parsed: SignedCertificate = JSON.parse(input.trim())
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ certificate: parsed }),
      })
      const data = await res.json()
      if (data.valid) {
        setStatus('valid')
        setCert(parsed)
      } else {
        setStatus('invalid')
      }
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Could not parse input. Paste the full certificate JSON.')
    }
  }

  return (
    <main>
      <div className="px-15 py-12 pb-8 border-b border-white/5">
        <h1 className="text-2xl text-gray-100 mb-2">
          <span className="text-green-400">&gt;</span> Verify Certificate
        </h1>
        <p className="text-[13px] text-gray-600 leading-relaxed font-sans">
          Paste a certificate JSON below to verify its cryptographic seal.
          Verification is performed against Objection&apos;s public key — no trust required.
        </p>
      </div>

      <div className="px-15 py-12 grid grid-cols-[1fr_300px] gap-16">
        <div>
          <textarea
            value={input}
            onChange={e => { setInput(e.target.value); setStatus('idle') }}
            placeholder='Paste certificate JSON here...'
            className="w-full h-52 bg-black border border-white/10 text-xs text-gray-500 font-mono p-4 resize-none focus:outline-none focus:border-green-400/30 placeholder:text-gray-800"
          />

          <button
            onClick={handleVerify}
            disabled={!input.trim() || status === 'loading'}
            className="w-full mt-4 border border-green-400 text-green-400 py-3 text-xs tracking-[0.15em] uppercase disabled:opacity-30 disabled:cursor-not-allowed hover:bg-green-400/5 transition-colors shadow-[0_0_12px_rgba(0,255,65,0.13)]"
          >
            {status === 'loading' ? '[ Verifying... ]' : '> Verify Seal'}
          </button>

          {/* Result */}
          {status === 'valid' && cert && (
            <div className="mt-6 border border-green-400/20 bg-green-400/[0.03] p-6">
              <p className="text-[11px] text-green-400 tracking-[0.16em] uppercase mb-4 font-mono" style={{ textShadow: '0 0 8px rgba(0,255,65,0.4)' }}>
                &#10003; Cryptographic seal intact
              </p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-[10px] text-gray-700 uppercase tracking-[0.12em] mb-1">Certificate ID</p>
                  <p className="text-xs text-green-400 font-mono">{cert.id}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-700 uppercase tracking-[0.12em] mb-1">Issued</p>
                  <p className="text-xs text-gray-500 font-mono">{new Date(cert.issuedAt).toISOString().slice(0, 19).replace('T', ' ')} UTC</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-700 uppercase tracking-[0.12em] mb-1">Confidence Score</p>
                  <p className="text-xs text-green-400 font-mono">{cert.score}/100</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-700 uppercase tracking-[0.12em] mb-1">Tier</p>
                  <p className={`text-xs font-mono ${TIER_COLORS[cert.tier] ?? 'text-green-400'}`}>{cert.tier}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-gray-700 uppercase tracking-[0.12em] mb-2">Attribution</p>
                <blockquote className="border-l-2 border-green-400 pl-4 text-[13px] text-gray-400 italic leading-relaxed font-sans">
                  {cert.attributionLanguage}
                </blockquote>
              </div>
            </div>
          )}

          {status === 'invalid' && (
            <div className="mt-6 border border-red-500/20 bg-red-500/[0.03] p-6">
              <p className="text-[11px] text-red-500/80 tracking-[0.16em] uppercase font-mono">
                &#10005; Seal invalid — this certificate has been tampered with
              </p>
            </div>
          )}

          {status === 'error' && (
            <p className="text-red-500/70 text-xs mt-4 font-mono border border-red-500/20 px-4 py-3">
              &gt; Error: {errorMsg}
            </p>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          <div className="bg-black/50 border border-white/[0.06] p-5">
            <p className="text-[10px] text-green-400/40 uppercase tracking-[0.15em] mb-4">// How to verify</p>
            <ol className="space-y-3">
              {[
                'Open the certificate you want to verify.',
                'Scroll to the bottom and click "Copy Certificate JSON".',
                'Come back to this page.',
                'Paste it into the box on the left.',
                'Click Verify Seal.',
              ].map((step, i) => (
                <li key={i} className="flex gap-3 text-xs text-gray-500 font-sans leading-relaxed">
                  <span className="text-green-400/50 font-mono flex-shrink-0">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-black/50 border border-white/[0.06] p-5">
            <p className="text-[10px] text-green-400/40 uppercase tracking-[0.15em] mb-3">// What it checks</p>
            <p className="text-xs text-gray-500 font-sans leading-relaxed">
              Every certificate is signed with a private key that only Objection&apos;s server holds.
              If anyone changes even one word — the score, the findings, anything — the signature
              breaks and verification fails.
            </p>
          </div>

          <div className="bg-black/50 border border-white/[0.06] p-5">
            <p className="text-[10px] text-green-400/40 uppercase tracking-[0.15em] mb-3">// Verify without us</p>
            <p className="text-xs text-gray-500 font-sans leading-relaxed">
              You don&apos;t have to trust Objection. Download the public key at{' '}
              <a href="/api/public-key" target="_blank" className="text-green-400/60 hover:text-green-400">/api/public-key</a>{' '}
              and verify any certificate yourself using any Ed25519 tool — no internet required.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
