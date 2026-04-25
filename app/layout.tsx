import type { Metadata } from 'next'
import './globals.css'
import MatrixBackground from '@/components/MatrixBackground'

export const metadata: Metadata = {
  title: 'Objection - Source Verification',
  description: 'Anonymous evidence verification for journalists.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-gray-300 relative">
        <MatrixBackground />
        <div className="relative z-20">
          {children}
        </div>
      </body>
    </html>
  )
}