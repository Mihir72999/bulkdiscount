import { NextRequest, NextResponse  } from "next/server";
import { bigcommerceClient } from "../../../../lib/auth";
import { getDB } from "../../../../lib/db";

export const dynamic = 'force-dynamic';

function corsHeaders(origin: string | null , allowedOrigins: string[]) {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (origin && allowedOrigins?.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = `https://${origin}`;
  }

  return headers;
}

type Store = {
  domain:string;
}

function normalizeOrigin(origin: string) {
  return new URL(origin).hostname.toLowerCase();
}

async function getStoreDomain(){
const db = await getDB()
  const {results} = await db.prepare("SELECT domain FROM stores").all<Store>()
  const allowedOrigins = results.map((row:Store) => row.domain);
return allowedOrigins
}

export async function OPTIONS(
request: NextRequest 
) {
  const allowedOrigins = await getStoreDomain();
   const origin = request.headers.get("origin") || "";

   return new NextResponse(null,{ status:204,headers: corsHeaders(normalizeOrigin(origin), allowedOrigins) })
}

export async function GET(request:NextRequest){
    const domain = request.nextUrl.searchParams.get('domain')
     const igId = request.nextUrl.searchParams.get('igId')
     const ignoreId = JSON.parse(igId || '[]') as number[]
    const origin = request.headers.get("origin") || "";
  const allowedOrigins = await getStoreDomain();      
  try{
  const db = await getDB()

const store = await db.prepare("SELECT accessToken, storeHash FROM stores WHERE domain = ?").bind(domain).first()  as {
  accessToken: string;
  storeHash: string;
};  
const bigcommerce = bigcommerceClient(store?.accessToken, store?.storeHash , 'v2');
const coupons = await bigcommerce.get('/coupons')

const couponId = coupons[0]?.id
const promotion = {
  applies_to: {
    entity: 'products',
    ids: ignoreId
  }
};
const rule = await bigcommerce.put(`/coupons/${couponId}` , promotion);
console.log("rule",JSON.stringify(rule,null,2))


return NextResponse.json({
      success: true,
      rules: rule,
    },{status:200 , headers:corsHeaders(normalizeOrigin(origin), allowedOrigins)});
      } catch (error) {
    
        const { message, response } = error as {
          message: string;
          response?: { status?: number };
        };
    
        return NextResponse.json(
          { message },
          { status: response?.status ?? 500 , headers:corsHeaders(normalizeOrigin(origin), allowedOrigins)}
        ); 
      }
}
export async function POST(request:NextRequest){
    const domain = request.nextUrl.searchParams.get('domain')
    const getStoreIds = await request.json()
    const origin = request.headers.get("origin") || "";
  const allowedOrigins = await getStoreDomain();      
  try{
  const db = await getDB()

const store = await db.prepare("SELECT accessToken, storeHash FROM stores WHERE domain = ?").bind(domain).first()  as {
  accessToken: string;
  storeHash: string;
};  
const bigcommerce = bigcommerceClient(store?.accessToken, store?.storeHash , 'v2');
const coupons = await bigcommerce.get('/coupons')
console.log("coupons",JSON.stringify(coupons,null,2))
const couponId = coupons[0]?.id
const promotion = {
  applies_to: {
    entity: 'products',
    ids: getStoreIds
  }
};
const rule = await bigcommerce.put(`/coupons/${couponId}` , promotion);
console.log("rule",JSON.stringify(rule,null,2))


return NextResponse.json({
      success: true,
      rules: rule,
    },{status:200 , headers:corsHeaders(normalizeOrigin(origin), allowedOrigins)});
      } catch (error) {
    
        const { message, response } = error as {
          message: string;
          response?: { status?: number };
        };
    
        return NextResponse.json(
          { message },
          { status: response?.status ?? 500 , headers:corsHeaders(normalizeOrigin(origin), allowedOrigins)}
        ); 
      }
}