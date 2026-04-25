import Link from 'next/link'
import TypewriterText from '@/components/TypewriterText'

const EXAMPLE_CERT = {
  id: 'CERT-A7F2B91C',
  score: 87,
  tier: 'Strongly Corroborated',
  issuedAt: '2025-04-28T14:33:07.000Z',
  attribution: '"The exclusions were not random - every one of them moved the numbers in the same direction," said a source whose evidence was independently verified through Objection\'s certification process [CERT-A7F2B91C].',
}

export default function LandingPage() {
  return (
    <main>
      {/* Hero */}
      <section className="px-15 py-20 pb-16 border-b border-white/5">
        <p className="text-[10px] tracking-[0.22em] text-green-400/50 mb-7 uppercase">
          <span className="text-green-400">&gt; </span>
          Objection - Anonymous Source Verification
        </p>
        <h1 className="text-5xl font-normal leading-tight text-gray-100 max-w-2xl mb-5">
          <TypewriterText text="Seek the truth." />
        </h1>
        <p className="text-xl text-green-400/60 font-mono tracking-[0.08em] mb-5">
          Verify your sources.
        </p>
        <p className="text-[15px] text-gray-500 leading-relaxed max-w-xl mb-10 font-sans">
          The integrity of one&apos;s work depends entirely on the accuracy of the evidence.
          We verify documents, provenance, consistency, and corroboration - and issue a
          certificate of guarantee to corroborate your hard work.
        </p>
        <div className="flex items-center gap-0">
          <Link
            href="/submit"
            className="inline-block border border-green-400 text-green-400 px-8 py-3 text-xs tracking-[0.15em] uppercase hover:bg-green-400/5 transition-colors shadow-[0_0_14px_rgba(0,255,65,0.13)]"
          >
            [ Submit Evidence ]
          </Link>
          <Link href="#example" className="text-gray-600 px-6 py-3 text-xs tracking-[0.08em] hover:text-gray-400 transition-colors">
            See example certificate &rarr;
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="px-15 py-14 border-b border-white/5">
        <p className="text-[10px] tracking-[0.2em] uppercase text-green-400/30 mb-8">&gt; How it works</p>
        <div className="grid grid-cols-3 gap-12">
          {[
            { num: '// 01', title: 'Submit your evidence', desc: 'Upload documents, emails, and recordings through an encrypted channel. No account required. No personal information collected.' },
            { num: '// 02', title: 'Provenance, not identity', desc: 'The engine checks document provenance, internal consistency, and temporal coherence across the full evidence package. It never tries to identify the source.' },
            { num: '// 03', title: 'Certificate issued', desc: 'A signed certificate with confidence score, evidence breakdown, and attribution language ready to drop into a story. No source details included.' },
          ].map(step => (
            <div key={step.num}>
              <p className="text-[10px] text-green-400/30 tracking-[0.2em] mb-4">{step.num}</p>
              <h3 className="text-[15px] text-gray-200 mb-3">{step.title}</h3>
              <p className="text-[13px] text-gray-600 leading-relaxed font-sans">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Example certificate preview */}
      <section id="example" className="px-15 py-14">
        <p className="text-[10px] tracking-[0.2em] uppercase text-green-400/30 mb-8">&gt; Example certificate</p>
        <div className="border border-white/10 p-8 max-w-lg bg-black/80 shadow-[0_0_40px_rgba(0,255,65,0.04)]">
          <div className="flex justify-between mb-6 pb-4 border-b border-white/5">
            <div>
              <p className="text-xs text-green-400 tracking-[0.1em]">{EXAMPLE_CERT.id}</p>
              <p className="text-[11px] text-gray-700 mt-1">Evidence Verification Certificate</p>
            </div>
            <p className="text-[11px] text-gray-700 tracking-[0.15em]">OBJECTION</p>
          </div>
          <div className="flex gap-8 mb-5 items-start">
            <div>
              <span className="text-5xl text-green-400 leading-none" style={{ textShadow: '0 0 20px rgba(0,255,65,0.35)' }}>
                {EXAMPLE_CERT.score}
              </span>
              <span className="text-xl text-gray-800">/100</span>
              <p className="text-[10px] text-green-400/55 tracking-[0.15em] uppercase mt-2">&#9679; {EXAMPLE_CERT.tier}</p>
            </div>
            <div className="flex-1 pt-1">
              <p className="text-[10px] text-gray-800 uppercase tracking-[0.12em] mb-1">Evidence items</p>
              <p className="text-[13px] text-gray-500 mb-4 font-sans">4 documents analyzed</p>
              <p className="text-[10px] text-gray-800 uppercase tracking-[0.12em] mb-1">Issued</p>
              <p className="text-[13px] text-gray-500 font-sans">
                {new Date(EXAMPLE_CERT.issuedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} UTC
              </p>
            </div>
          </div>
          <blockquote className="border-l-2 border-green-400 pl-5 py-4 bg-green-400/5 text-[13px] text-gray-400 leading-relaxed italic font-sans">
            {EXAMPLE_CERT.attribution}
          </blockquote>
        </div>
      </section>
    </main>
  )
}
