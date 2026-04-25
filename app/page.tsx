import Link from 'next/link'
import TypewriterText from '@/components/TypewriterText'

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
          The integrity of your work depends entirely on the authenticity of evidence.
          We verify documents, provenance, consistency, and corroboration, and issue a
          certificate of guarantee that stands behind your hard work.
        </p>
        <div className="flex items-center gap-0">
          <Link
            href="/submit"
            className="inline-block border border-green-400 text-green-400 px-8 py-3 text-xs tracking-[0.15em] uppercase hover:bg-green-400/5 transition-colors shadow-[0_0_14px_rgba(0,255,65,0.13)]"
          >
            [ Submit Evidence ]
          </Link>
          <Link href="/example" className="text-gray-600 px-6 py-3 text-xs tracking-[0.08em] hover:text-gray-400 transition-colors">
            See example certificate &rarr;
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="px-15 py-14">
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
    </main>
  )
}
