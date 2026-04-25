import { PUBLIC_KEY_PEM } from '@/lib/sign'

export async function GET() {
  return new Response(PUBLIC_KEY_PEM, {
    headers: { 'content-type': 'text/plain' },
  })
}
