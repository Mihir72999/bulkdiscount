import { NextRequest, NextResponse } from "next/server";
import { getDB } from "../../../../../lib/db";


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

export async function OPTIONS(request: NextRequest){
   const allowedOrigins = await getStoreDomain();
   const origin = request.headers.get("origin") || "";

   return new NextResponse(null,{ status:204,headers: corsHeaders(normalizeOrigin(origin), allowedOrigins) })
}

export async function GET(req:NextRequest) {
      const allowedOrigins = await getStoreDomain();
        const domain = req.nextUrl.searchParams.get('domain')
        const origin = req.headers.get("origin") || "";
        const productId = req.nextUrl.searchParams.get('product_id')
        if(!domain || !productId){
         return NextResponse.json({success:false},{status:404,headers: corsHeaders(normalizeOrigin(origin), allowedOrigins)})
        }
    try {
 const db = await getDB()
const result = await db.prepare('SELECT storeHash from stores WHERE domain = ?').bind(domain).first<{storeHash:string | null}>()
const storeHash = result?.storeHash
const prorduct_id = Number(productId)
const settings = await db
  .prepare(`
    SELECT *
    FROM widget_settings
    WHERE store_hash = ?
      AND EXISTS (
        SELECT 1
        FROM json_each(product_ids)
        WHERE value = ?
      )
  `)
  .bind(storeHash, prorduct_id)
  .first();

    return NextResponse.json({
      success: true,
      data: settings,
    } ,{headers: corsHeaders(normalizeOrigin(origin), allowedOrigins)});

  } catch (error) {

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong.",
      },
      { status: 500 , headers: corsHeaders(normalizeOrigin(origin), allowedOrigins) }
    );
  }
}