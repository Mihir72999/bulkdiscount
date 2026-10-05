export default async function getStore(domain:string | null , db:D1Database){
  if(!domain) return null

const store = await db.prepare("SELECT accessToken, storeHash FROM stores WHERE domain = ?").bind(domain).first()  as {
  accessToken: string;
  storeHash: string;
};  
return store
}