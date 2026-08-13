# Objection

Anonymous source verification for journalists. A source uploads their evidence, and the system returns a cryptographically signed certificate assessing how well that evidence holds together, without ever learning or revealing who the source is.

Live at [objection-verify.vercel.app](https://objection-verify.vercel.app).

## The problem

A reporter gets an anonymous document dump. Two things now need to be true at once, and they pull against each other: the reporter has to satisfy an editor that the material is credible, and the source has to stay unidentifiable. Every ordinary verification step, calling to confirm details, naming the institution, quoting a document with identifying context, chips away at the second in order to buy the first.

Objection separates them. It assesses the evidence package on its own internal properties, whether the timelines cohere, whether quantitative discrepancies all point the same direction, whether independent documents corroborate one another, and it does that without attempting to identify anyone. The output is a certificate the reporter can attach to a story, plus a line of attribution language ready to drop into the copy:

> "[verbatim quote]," said a source whose evidence was independently verified through Objection's certification process [CERT-XXXXXXXX].

The certificate is signed. Anyone, including a skeptical editor or a reader, can verify that signature without trusting this site.

## How it works

```
upload  ->  extract + hash  ->  Claude analysis  ->  assemble  ->  Ed25519 sign  ->  certificate
                                                                                        |
                                            /verify  <-  /api/check  <-  paste JSON  <--+
```

**1. Extraction and hashing** ([`lib/extractText.ts`](lib/extractText.ts))
Files are classified by extension and MIME type, then routed: `.txt` read directly, `.docx` through mammoth, `.pdf` through pdf-parse. Every file is SHA-256 hashed on arrival, before anything else happens to it.

Scanned PDFs are the interesting case. When pdf-parse returns empty text, that is not an error, it is an image-only document, and the file falls through to a vision path where the raw PDF bytes are passed to Claude directly. Audio and images are registered as `pending` stubs: acknowledged in the certificate, counted, but explicitly not analyzed rather than silently ignored.

**2. Analysis** ([`lib/analyze.ts`](lib/analyze.ts))
Claude receives the evidence package and a strict JSON schema. The prompt's binding constraint is privacy: no names of individuals, no institutions, no identifying detail may appear anywhere in the output. The assessments that come back describe what a document contributes, never who wrote it.

Scoring runs 0-100 across four tiers (Insufficient, Preliminary, Corroborated, Strongly Corroborated), with two specific analytical asks: check temporal coherence across documents and flag anachronisms, and note whether quantitative discrepancies are unidirectional, since errors that all inflate the same metric mean something errors in both directions do not.

**3. Assembly** ([`lib/buildCertificate.ts`](lib/buildCertificate.ts))
A package hash is computed as the SHA-256 of every file hash concatenated, so the certificate is bound to that exact set of files. Pending stubs, which have no hash, are excluded. Evidence items are filtered against the real file list, so a hallucinated `fileIndex` cannot invent a document that was never uploaded.

**4. Signing** ([`lib/sign.ts`](lib/sign.ts))
The certificate is signed with Ed25519. Two details matter:

The payload is canonicalized with an explicit field order before signing. `JSON.stringify` preserves insertion order, so a certificate that round-trips through a copy-paste, a clipboard, or another parser would otherwise produce a different byte string and fail verification for no real reason. Fixing the field order makes the signature stable.

The public key is committed to this repository on purpose. It is served at [`/api/public-key`](app/api/public-key/route.ts) as `text/plain` so a browser displays it rather than downloading it. That is the whole point of using asymmetric signing here rather than an HMAC: verification must not require trusting or even contacting this server. The private key lives only in `CERTIFICATE_PRIVATE_KEY`.

**5. Verification** ([`/verify`](app/verify/page.tsx))
Paste a certificate JSON. `/api/check` re-canonicalizes it, checks the Ed25519 signature against the public key, and returns valid or not. Changing a single character of the score, a finding, or the attribution language breaks the signature.

## Privacy design

- **No account, no login, nothing stored.** The certificate is returned to the browser and held in localStorage. There is no database.
- **Filenames never reach the client.** `EvidenceItem.fileName` is used server-side to build the certificate and is stripped in [`app/api/verify/route.ts`](app/api/verify/route.ts) before signing. Filenames leak identity more often than people expect.
- **The model is instructed never to output names or institutions**, in the assessments, the findings, or the attribution language.

## Where it can be wrong

Worth stating plainly, because a verification tool that oversells itself is worse than none.

The signature proves a certificate was issued by this service and has not been altered since. It does not prove the underlying documents are authentic. A model assessing internal consistency can be fooled by a package that is internally consistent and entirely fabricated. The confidence score is a judgment about coherence and corroboration, not a provenance guarantee, and the tier names are worded to say so.

The verbatim quote is extracted by the model, which means it can paraphrase despite instruction. Several commits here are exactly that fight, and it is why the quote is a separate schema field rather than something parsed back out of prose.

## Running locally

```bash
npm install
npm run dev
```

Create `.env.local`:

| Variable | What it is |
|---|---|
| `ANTHROPIC_API_KEY` | Read by the Anthropic SDK for the analysis call |
| `CERTIFICATE_PRIVATE_KEY` | Base64-encoded Ed25519 private key in PEM form |

To generate a signing keypair:

```bash
openssl genpkey -algorithm ed25519 -out private.pem
openssl pkey -in private.pem -pubout          # paste this into lib/sign.ts
base64 -i private.pem                          # this goes in CERTIFICATE_PRIVATE_KEY
```

## Tests

```bash
npm test
```

Jest, 15 tests over 2 suites, covering the two pure modules: file classification and hashing in `extractText`, and certificate assembly, tier boundaries, and package hashing in `buildCertificate`. The analysis call is a network round trip to a model and is not unit tested.

## Limits

- 10 files per submission, 60 second route timeout.
- Audio and image files are registered but not transcribed or analyzed.
- Certificates are not persisted server-side, so a lost certificate cannot be recovered, only re-verified if the holder still has the JSON.

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind 4, Anthropic SDK, pdf-parse, mammoth, Node crypto for Ed25519. Deployed on Vercel.
