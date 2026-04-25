'use client'
import { useEffect, useRef } from 'react'

export default function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*ｦｧｨｩｪｫｬｭｮｯｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ'
    const fontSize = 14
    let W = 0, H = 0
    let drops: number[] = []
    let maskData: ImageData | null = null

    const maskCanvas = document.createElement('canvas')
    const mctx = maskCanvas.getContext('2d')!

    function drawScalesMask(w: number, h: number) {
      maskCanvas.width = w
      maskCanvas.height = h
      mctx.clearRect(0, 0, w, h)
      mctx.strokeStyle = '#ffffff'
      mctx.lineCap = 'round'
      mctx.lineJoin = 'round'

      const cx = w * 0.5
      const cy = h * 0.48
      const s = Math.min(w, h) * 0.38
      const tilt = s * 0.06
      const barY = cy - s * 0.52
      const barW = s * 0.88

      mctx.lineWidth = 22
      mctx.beginPath(); mctx.moveTo(cx, cy + s * 0.72); mctx.lineTo(cx, barY); mctx.stroke()

      mctx.lineWidth = 28
      mctx.beginPath(); mctx.moveTo(cx - s * 0.38, cy + s * 0.72); mctx.lineTo(cx + s * 0.38, cy + s * 0.72); mctx.stroke()

      mctx.lineWidth = 18
      mctx.beginPath(); mctx.moveTo(cx - s * 0.25, cy + s * 0.72); mctx.lineTo(cx - s * 0.38, cy + s * 0.88); mctx.stroke()
      mctx.beginPath(); mctx.moveTo(cx + s * 0.25, cy + s * 0.72); mctx.lineTo(cx + s * 0.38, cy + s * 0.88); mctx.stroke()

      mctx.lineWidth = 18
      mctx.beginPath(); mctx.moveTo(cx - barW * 0.5, barY + tilt); mctx.lineTo(cx + barW * 0.5, barY - tilt); mctx.stroke()

      mctx.lineWidth = 14
      mctx.beginPath(); mctx.arc(cx, barY, s * 0.04, 0, Math.PI * 2); mctx.stroke()

      const lx = cx - barW * 0.5, lTopY = barY + tilt, lPanY = cy + s * 0.18
      mctx.lineWidth = 10
      mctx.beginPath(); mctx.moveTo(lx, lTopY); mctx.lineTo(lx - s * 0.08, lPanY - s * 0.06); mctx.stroke()
      mctx.beginPath(); mctx.moveTo(lx, lTopY); mctx.lineTo(lx + s * 0.08, lPanY - s * 0.06); mctx.stroke()
      mctx.lineWidth = 16
      mctx.beginPath(); mctx.arc(lx, lPanY, s * 0.22, Math.PI * 0.08, Math.PI * 0.92); mctx.stroke()
      mctx.lineWidth = 12
      mctx.beginPath(); mctx.moveTo(lx - s * 0.22, lPanY); mctx.lineTo(lx + s * 0.22, lPanY); mctx.stroke()

      const rx = cx + barW * 0.5, rTopY = barY - tilt, rPanY = cy - s * 0.06
      mctx.lineWidth = 10
      mctx.beginPath(); mctx.moveTo(rx, rTopY); mctx.lineTo(rx - s * 0.08, rPanY - s * 0.06); mctx.stroke()
      mctx.beginPath(); mctx.moveTo(rx, rTopY); mctx.lineTo(rx + s * 0.08, rPanY - s * 0.06); mctx.stroke()
      mctx.lineWidth = 16
      mctx.beginPath(); mctx.arc(rx, rPanY, s * 0.22, Math.PI * 0.08, Math.PI * 0.92); mctx.stroke()
      mctx.lineWidth = 12
      mctx.beginPath(); mctx.moveTo(rx - s * 0.22, rPanY); mctx.lineTo(rx + s * 0.22, rPanY); mctx.stroke()
    }

    function isInScales(x: number, y: number): boolean {
      if (!maskData) return false
      const px = Math.max(0, Math.min(W - 1, Math.floor(x)))
      const py = Math.max(0, Math.min(H - 1, Math.floor(y)))
      return maskData.data[(py * W + px) * 4] > 60
    }

    function setup() {
      W = window.innerWidth; H = window.innerHeight
      canvas!.width = W; canvas!.height = H
      drops = Array(Math.floor(W / fontSize)).fill(1).map(() => Math.floor(Math.random() * H / fontSize))
      drawScalesMask(W, H)
      maskData = mctx.getImageData(0, 0, W, H)
    }

    setup()
    window.addEventListener('resize', setup)

    const interval = setInterval(() => {
      ctx.fillStyle = 'rgba(0,0,0,0.048)'
      ctx.fillRect(0, 0, W, H)
      for (let i = 0; i < drops.length; i++) {
        const x = i * fontSize, y = drops[i] * fontSize
        const inScales = isInScales(x, y)
        const r = Math.random()
        const char = chars[Math.floor(Math.random() * chars.length)]
        if (inScales) {
          ctx.fillStyle = r > 0.97 ? '#88ffaa' : r > 0.82 ? '#00cc33' : r > 0.55 ? '#007722' : '#004411'
        } else {
          ctx.fillStyle = r > 0.985 ? '#ccffcc' : r > 0.93 ? '#00ff41' : r > 0.75 ? '#004410' : '#002208'
        }
        ctx.font = `${fontSize}px monospace`
        ctx.fillText(char, x, y)
        if (y > H && Math.random() > 0.974) drops[i] = 0
        drops[i]++
      }
    }, 48)

    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', setup)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-0 pointer-events-none opacity-[0.13]"
    />
  )
}
