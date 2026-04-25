'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { SignedCertificate, EvidenceStrength } from '@/types'

const TIER_COLORS: Record<string, string> = {
  'Strongly Corroborated': 'text-green-400',
  'Corroborated': 'text-green-600',
  'Preliminary': 'text-yellow-600',
  'Insufficient': 'text-red-700',
}

const DOT_COLORS: Record<EvidenceStrength, string> = {
  strong: 'bg-green-400 shadow-[0_0_6px_#00ff41]',
  corroborating: 'bg-green-600 shadow-[0_0_5px_#00aa33]',
  pending: 'bg-gray-700',
}

export default function CertificatePage() {
  const { id } = useParams<{ id: string }>()
  const [cert, setCert] = useState<SignedCertificate | null>(null)
  const [copied, setCopied] = useState(false)
  const [sealValid, setSealValid] = useState<boolean | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(`cert-${id}`)
    if (!stored) return
    const parsed: SignedCertificate = JSON.parse(stored)
    setCert(parsed)
    fetch('/api/check', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ certificate: parsed }),
    })
      .then(r => r.json())
      .then(d => setSealValid(d.valid))
      .catch(() => setSealValid(false))
  }, [id])

  const copyAttribution = () => {
    if (!cert) return
    navigator.clipboard.writeText(cert.attributionLanguage)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!cert) {
    return (
      <main className="px-15 py-20">
        <p className="text-xs text-gray-700 font-mono">
          &gt; Certificate not found. <Link href="/submit" className="text-green-400/60 hover:text-green-400">Submit a new package.</Link>
        </p>
      </main>
    )
  }

  const issued = new Date(cert.issuedAt)
  const issuedStr = `${issued.toISOString().replace('T', ' - ').slice(0, 22)} UTC`

  return (
    <main className="px-15 py-12">
      <div className="max-w-2xl mx-auto border border-white/[0.08] bg-[rgba(2,5,2,0.97)] shadow-[0_0_60px_rgba(0,255,65,0.05)]">

        {/* Header */}
        <div className="px-10 py-7 border-b border-white/[0.06] flex justify-between items-center">
          <div>
            <p className="text-xs text-green-400 tracking-[0.18em] uppercase" style={{ textShadow: '0 0 10px rgba(0,255,65,0.4)' }}>Objection</p>
            <p className="text-[11px] text-gray-700 mt-1 tracking-[0.04em]">Evidence Verification Certificate</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-green-400 tracking-[0.1em]">{cert.id}</p>
            <p className="text-[10px] text-gray-700 mt-1">{issuedStr}</p>
            <div className="mt-2">
              {sealValid === null && <p className="text-[10px] text-gray-700 font-mono">verifying seal...</p>}
              {sealValid === true && (
                <p className="text-[10px] text-green-400 font-mono" style={{ textShadow: '0 0 6px rgba(0,255,65,0.4)' }}>&#10003; cryptographic seal intact</p>
              )}
              {sealValid === false && <p className="text-[10px] text-red-500/70 font-mono">&#10005; seal invalid</p>}
            </div>
          </div>
        </div>

        {/* Score */}
        <div className="px-10 py-8 border-b border-white/[0.06] flex items-center gap-10 bg-green-400/[0.03]">
          <div>
            <span className="text-[68px] leading-none text-green-400" style={{ textShadow: '0 0 28px rgba(0,255,65,0.47)' }}>
              {cert.score}
            </span>
            <span className="text-2xl text-gray-800">/100</span>
          </div>
          <div>
            <p className={`text-[11px] tracking-[0.16em] uppercase mb-2 ${TIER_COLORS[cert.tier] ?? 'text-green-400'}`}>
              &#9679; {cert.tier}
            </p>
            <p className="text-[13px] text-gray-600 leading-relaxed max-w-xs font-sans">{cert.tierDescription}</p>
          </div>
        </div>

        {/* Evidence breakdown */}
        <div className="px-10 py-8 border-b border-white/[0.06]">
          <p className="text-[10px] text-gray-700 uppercase tracking-[0.16em] mb-5">
            // Evidence breakdown - {cert.evidenceBreakdown.filter(e => !e.isPending).length} documents &middot; {cert.evidenceBreakdown.filter(e => e.isPending).length > 0 ? `${cert.evidenceBreakdown.filter(e => e.isPending).length} pending` : 'no pending media'}
          </p>
          {cert.evidenceBreakdown.map((ev, i) => (
            <div key={i} className="flex gap-4 py-4 border-b border-white/[0.04] last:border-0 items-start">
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${DOT_COLORS[ev.strength]}`} />
              <div className="w-40 flex-shrink-0">
                <p className="text-[11px] text-green-400/55 tracking-[0.03em]">{ev.type}</p>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600 leading-relaxed font-sans">{ev.assessment}</p>
                {!ev.isPending && ev.hashPrefix && (
                  <p className="text-[10px] text-gray-800 mt-1.5 font-mono">sha256: {ev.hashPrefix}...</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Key findings */}
        <div className="px-10 py-8 border-b border-white/[0.06]">
          <p className="text-[10px] text-gray-700 uppercase tracking-[0.16em] mb-5">// Key findings</p>
          {cert.keyFindings.map((finding, i) => (
            <p key={i} className="text-[13px] text-gray-500 leading-relaxed py-2 pl-5 relative font-sans">
              <span className="absolute left-0 text-green-400 font-mono">&gt;</span>
              {finding}
            </p>
          ))}
        </div>

        {/* Attribution */}
        <div className="px-10 py-8 border-b border-white/[0.06]">
          <p className="text-[10px] text-gray-700 uppercase tracking-[0.16em] mb-5">// Publication-ready attribution</p>
          <blockquote className="border-l-2 border-green-400 pl-6 py-5 bg-green-400/[0.04] text-[13px] text-gray-300 leading-relaxed italic mb-4 font-sans shadow-[inset_0_0_20px_rgba(0,255,65,0.03)]">
            {cert.attributionLanguage}
          </blockquote>
          <button
            onClick={copyAttribution}
            className="text-[10px] text-gray-600 uppercase tracking-[0.12em] border border-white/10 px-4 py-2 hover:border-green-400/30 hover:text-green-400 transition-all"
          >
            {copied ? '[ Copied ]' : '[ Copy Attribution ]'}
          </button>
        </div>

        {/* Footer */}
        <div className="px-10 py-5 border-t border-white/[0.04] flex justify-between items-end">
          <div>
            <p className="text-[10px] text-gray-600 font-mono truncate max-w-xs">
              pkg: sha256:{cert.packageHash.slice(0, 40)}...
            </p>
            {cert.signature && (
              <p className="text-[10px] text-gray-600 font-mono mt-1">
                sig: {cert.signature.slice(0, 48)}...
              </p>
            )}
          </div>
          <p className="text-[10px] text-gray-700 flex-shrink-0 ml-4">objection.ai/verify/{cert.id}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto mt-6 text-center">
        <Link href="/submit" className="text-[11px] text-gray-700 hover:text-gray-500 tracking-[0.08em] transition-colors">
          &larr; Submit another package
        </Link>
      </div>
    </main>
  )
}
