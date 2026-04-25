import Link from 'next/link'

const EXAMPLE_CERT = {
  id: 'CERT-A7F2B91C',
  score: 87,
  tier: 'Strongly Corroborated',
  issuedAt: '2025-04-28T14:33:07.000Z',
  tierDescription: 'Multiple independent documents with consistent timelines, quantifiable discrepancies, and cross-document corroboration.',
  evidenceBreakdown: [
    { type: 'Quantitative discrepancy analysis', strength: 'strong', assessment: 'Provides specific numerical comparisons between raw and published data; every discrepancy inflates reported efficacy, indicating a unidirectional pattern inconsistent with random error.' },
    { type: 'Personal contemporaneous notes', strength: 'strong', assessment: 'Dated entries spanning February - April record concerns as they arose in real time, matching the quantitative memo across all discrepancy categories.' },
    { type: 'Journalist intake notes', strength: 'corroborating', assessment: 'Documents independent assessment of source credibility and chain of custody for materials.' },
    { type: 'Audio recording', strength: 'pending', assessment: 'File received and hashed. Audio transcription requires production pipeline review.' },
  ],
  keyFindings: [
    'All quantitative discrepancies move in the same direction, consistently inflating reported treatment efficacy.',
    'A second independent witness corroborates behavioral data anomalies without apparent coordination.',
    'The stated justification for excluding one dose group applies equally to groups that were retained.',
  ],
  attribution: '"The published values are systematically higher than the raw data," said a source whose evidence was independently verified through Objection\'s certification process [CERT-A7F2B91C].',
  packageHash: 'a3f2b91c4d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2',
}

const STRENGTH_COLORS: Record<string, string> = {
  strong: 'bg-green-400 shadow-[0_0_6px_#00ff41]',
  corroborating: 'bg-green-600',
  pending: 'bg-gray-700',
}

export default function ExamplePage() {
  const issued = new Date(EXAMPLE_CERT.issuedAt)
  const issuedStr = `${issued.toISOString().replace('T', ' - ').slice(0, 22)} UTC`

  return (
    <main className="px-15 py-12">
      <p className="text-[10px] text-gray-700 uppercase tracking-[0.16em] mb-6 font-mono">
        &gt; Example certificate - for illustration only
      </p>

      <div className="max-w-2xl mx-auto border border-white/[0.08] bg-[rgba(2,5,2,0.97)] shadow-[0_0_60px_rgba(0,255,65,0.05)]">

        {/* Header */}
        <div className="px-10 py-7 border-b border-white/[0.06] flex justify-between items-center">
          <div>
            <p className="text-xs text-green-400 tracking-[0.18em] uppercase" style={{ textShadow: '0 0 10px rgba(0,255,65,0.4)' }}>Objection</p>
            <p className="text-[11px] text-gray-700 mt-1 tracking-[0.04em]">Evidence Verification Certificate</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-green-400 tracking-[0.1em]">{EXAMPLE_CERT.id}</p>
            <p className="text-[10px] text-gray-700 mt-1">{issuedStr}</p>
            <p className="text-[10px] text-green-400/50 font-mono mt-2">&#10003; cryptographic seal intact</p>
          </div>
        </div>

        {/* Score */}
        <div className="px-10 py-8 border-b border-white/[0.06] flex items-center gap-10 bg-green-400/[0.03]">
          <div>
            <span className="text-[68px] leading-none text-green-400" style={{ textShadow: '0 0 28px rgba(0,255,65,0.47)' }}>
              {EXAMPLE_CERT.score}
            </span>
            <span className="text-2xl text-gray-800">/100</span>
          </div>
          <div>
            <p className="text-[11px] tracking-[0.16em] uppercase mb-2 text-green-400">
              &#9679; {EXAMPLE_CERT.tier}
            </p>
            <p className="text-[13px] text-gray-600 leading-relaxed max-w-xs font-sans">{EXAMPLE_CERT.tierDescription}</p>
          </div>
        </div>

        {/* Evidence breakdown */}
        <div className="px-10 py-8 border-b border-white/[0.06]">
          <p className="text-[10px] text-gray-700 uppercase tracking-[0.16em] mb-5">
            // Evidence breakdown - {EXAMPLE_CERT.evidenceBreakdown.filter(e => e.strength !== 'pending').length} documents &middot; 1 pending
          </p>
          {EXAMPLE_CERT.evidenceBreakdown.map((ev, i) => (
            <div key={i} className="flex gap-4 py-4 border-b border-white/[0.04] last:border-0 items-start">
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${STRENGTH_COLORS[ev.strength]}`} />
              <div className="w-40 flex-shrink-0">
                <p className="text-[11px] text-green-400/55 tracking-[0.03em]">{ev.type}</p>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600 leading-relaxed font-sans">{ev.assessment}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Key findings */}
        <div className="px-10 py-8 border-b border-white/[0.06]">
          <p className="text-[10px] text-gray-700 uppercase tracking-[0.16em] mb-5">// Key findings</p>
          {EXAMPLE_CERT.keyFindings.map((finding, i) => (
            <p key={i} className="text-[13px] text-gray-500 leading-relaxed py-2 pl-5 relative font-sans">
              <span className="absolute left-0 text-green-400 font-mono">&gt;</span>
              {finding}
            </p>
          ))}
        </div>

        {/* Attribution */}
        <div className="px-10 py-8 border-b border-white/[0.06]">
          <p className="text-[10px] text-gray-700 uppercase tracking-[0.16em] mb-5">// Publication-ready attribution</p>
          <blockquote className="border-l-2 border-green-400 pl-6 py-5 bg-green-400/[0.04] text-[13px] text-gray-300 leading-relaxed italic font-sans shadow-[inset_0_0_20px_rgba(0,255,65,0.03)]">
            {EXAMPLE_CERT.attribution}
          </blockquote>
        </div>

        {/* Footer */}
        <div className="px-10 py-5 flex justify-between items-center">
          <p className="text-[10px] text-gray-800 font-mono truncate max-w-xs">
            pkg: sha256:{EXAMPLE_CERT.packageHash.slice(0, 40)}...
          </p>
          <p className="text-[10px] text-gray-700 flex-shrink-0 ml-4">objection.ai/verify/{EXAMPLE_CERT.id}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto mt-6 flex justify-between items-center">
        <Link href="/" className="text-[11px] text-gray-700 hover:text-gray-500 tracking-[0.08em] transition-colors">
          &larr; Back to home
        </Link>
        <Link href="/submit" className="text-[11px] text-green-400/60 hover:text-green-400 tracking-[0.08em] transition-colors">
          Submit your evidence &rarr;
        </Link>
      </div>
    </main>
  )
}
