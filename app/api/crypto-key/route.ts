// Server-only: delivers encryption key without exposing it to client bundle
export async function GET() {
  const key = process.env.NARA_ENCRYPT_SECRET || (process.env.NODE_ENV === 'production'
    ? crypto.randomUUID()
    : 'dev-fallback-key-not-for-production');

  return Response.json({ key });
}
