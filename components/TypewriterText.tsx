'use client'
import { useEffect, useState } from 'react'

interface Props {
  text: string
  delayMs?: number
  charMs?: number
  className?: string
}

export default function TypewriterText({ text, delayMs = 400, charMs = 75, className }: Props) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    let i = 0
    const startTimeout = setTimeout(function type() {
      if (i <= text.length) {
        setDisplayed(text.slice(0, i))
        i++
        if (i <= text.length) {
          setTimeout(type, charMs + Math.random() * 40)
        } else {
          setDone(true)
        }
      }
    }, delayMs)
    return () => clearTimeout(startTimeout)
  }, [text, delayMs, charMs])

  return (
    <span className={className}>
      {displayed}
      <span
        className="text-green-400"
        style={{ animation: 'blink 0.75s step-end infinite' }}
      >
        |
      </span>
    </span>
  )
}
