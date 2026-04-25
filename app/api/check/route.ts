import { NextRequest, NextResponse } from 'next/server'
import { verifyCertificate } from '@/lib/sign'
import { SignedCertificate } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const { certificate } = await req.json() as { certificate: SignedCertificate }
    if (!certificate || !certificate.signature) {
      return NextResponse.json({ valid: false, reason: 'Missing certificate or signature' }, { status: 400 })
    }
    const valid = verifyCertificate(certificate)
    return NextResponse.json({ valid, id: certificate.id })
  } catch {
    return NextResponse.json({ valid: false, reason: 'Invalid request' }, { status: 400 })
  }
}
