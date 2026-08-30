import { Store } from "../../types";
export default async function getStoreDomain(db: D1Database){
  const {results} = await db.prepare("SELECT domain FROM stores").all<Store>()
  const allowedOrigins = results.map((row:Store) => row.domain);
return allowedOrigins
}