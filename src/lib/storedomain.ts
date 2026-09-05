import { Store } from "../../types";
export default async function getStoreDomain(db: D1Database){
  const {results} = await db.prepare("SELECT domain FROM stores").all<Store>()
  const allowedOrigins = results.map((row:Store) => row.domain);
return allowedOrigins
}

export async function getSingleDomain(db: D1Database , domain:string){
  const results = await db.prepare("SELECT domain FROM stores WHERE domain = ?").bind(domain).first<Store>()
  
return results?.domain || ""
}