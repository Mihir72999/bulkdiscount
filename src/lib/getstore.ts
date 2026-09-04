export default async function getStore(
  domain: string | null,
  db: D1Database
) {
  return await db
    .prepare(`
      SELECT storeHash
      FROM stores
      WHERE domain = ?
      LIMIT 1
    `)
    .bind(domain)
    .first<{ storeHash: string , accessToken: string }>();
}