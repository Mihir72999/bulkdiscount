import { NextRequest, NextResponse } from "next/server";
import { getDB } from "../../../../../lib/db";
import getStoreDomain from "@/lib/storedomain";
import normalizeOrigin from "@/lib/normalizeorigin";
import corsHeaders from "@/lib/corsheaaders";
import getSearchParams from "@/lib/getsearchparams";
import errorMessage from "@/lib/errorMessage";
import getStore from "@/lib/getstore";


export const dynamic = 'force-dynamic';

export async function OPTIONS(request: NextRequest){
  const db = await getDB()
   const allowedOrigins = await getStoreDomain(db);
   const origin = request.headers.get("origin") || "";
   return new NextResponse(null,{ status:204,headers: corsHeaders(normalizeOrigin(origin), allowedOrigins) })
}


interface WidgetSettings {
  borderColor: string;
  borderRadius: number;
  product_ids: string;
  name: string;
  description: string;
  widget_title: string;
  // store_hash: string;
  id: number;
}

async function getWidgetSettings(db:D1Database, storeHash:string, prorduct_id:number):Promise<WidgetSettings | null> {
const settings: WidgetSettings | null = await db
  .prepare(`
      SELECT *
      FROM widget_settings
      WHERE store_hash = ?
        AND EXISTS (
          SELECT 1
          FROM json_each(product_ids)
          WHERE CAST(value AS INTEGER) = ?
        )
      LIMIT 1
    `)
  .bind(storeHash, prorduct_id)
  .first();
  return settings
}

export async function GET(req:NextRequest) {
  const db = await getDB()
      const allowedOrigins = await getStoreDomain(db);
        const domainParam:string = 'domain'
        const domain = getSearchParams(req,domainParam)
        const origin = req.headers.get("origin") || "";
        const productIdParam:string = 'product_id'
        const productId = getSearchParams(req,productIdParam)
        if(!domain || !productId){
         return NextResponse.json({success:false},{status:404,headers: corsHeaders(normalizeOrigin(origin), allowedOrigins)})
        }
    try {
const result = await getStore(domain,db)
const storeHash= result?.storeHash
const prorduct_id = Number(productId)
const settings = await getWidgetSettings(db, storeHash, prorduct_id)
     const data = settings
     const success = data ? true : false
    return NextResponse.json({
      success,
      data,
    } ,{headers: corsHeaders(normalizeOrigin(origin), allowedOrigins)});

  } catch (error) {

   errorMessage(error , allowedOrigins)
  }
}