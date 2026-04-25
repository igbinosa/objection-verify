'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

function ScalesIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 40 44"
      fill="none"
      stroke="#00ff41"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ filter: 'drop-shadow(0 0 4px rgba(0,255,65,0.5))' }}
    >
      {/* Pillar */}
      <line x1="20" y1="40" x2="20" y2="7" strokeWidth="2.5" />
      {/* Base */}
      <line x1="11" y1="40" x2="29" y2="40" strokeWidth="3" />
      {/* Base feet */}
      <line x1="11" y1="40" x2="8" y2="44" strokeWidth="2" />
      <line x1="29" y1="40" x2="32" y2="44" strokeWidth="2" />
      {/* Crossbar - tilted slightly */}
      <line x1="4" y1="9" x2="36" y2="6" strokeWidth="2" />
      {/* Hub */}
      <circle cx="20" cy="7.5" r="1.5" strokeWidth="1.5" />
      {/* Left chain */}
      <line x1="4" y1="9" x2="3" y2="18" strokeWidth="1.5" />
      <line x1="4" y1="9" x2="5" y2="18" strokeWidth="1.5" />
      {/* Left pan */}
      <path d="M0 18 Q3.5 24 7 18" strokeWidth="2" />
      <line x1="0" y1="18" x2="7" y2="18" strokeWidth="1.5" />
      {/* Right chain */}
      <line x1="36" y1="6" x2="35" y2="14" strokeWidth="1.5" />
      <line x1="36" y1="6" x2="37" y2="14" strokeWidth="1.5" />
      {/* Right pan */}
      <path d="M33 14 Q36.5 20 40 14" strokeWidth="2" />
      <line x1="33" y1="14" x2="40" y2="14" strokeWidth="1.5" />
    </svg>
  )
}

export default function Nav() {
  const pathname = usePathname()

  const links = [
    { href: '/', label: 'Home' },
    { href: '/submit', label: 'Submit Evidence' },
    { href: '/verify', label: 'Verify Certificate' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-black/95 border-b border-white/[0.06] backdrop-blur-sm">
      <div className="px-15 flex items-center gap-8 h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
          <ScalesIcon />
          <span
            className="text-[11px] tracking-[0.22em] text-green-400 uppercase font-mono"
            style={{ textShadow: '0 0 8px rgba(0,255,65,0.4)' }}
          >
            Objection
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-6 ml-auto">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[11px] tracking-[0.1em] uppercase transition-colors font-mono ${
                pathname === link.href
                  ? 'text-green-400'
                  : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              {pathname === link.href && <span className="text-green-400 mr-1">&gt;</span>}
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
