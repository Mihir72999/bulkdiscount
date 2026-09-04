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
   return new NextResponse(null,{ status:204,headers: corsHeaders(normalizeOrigin(request.headers.get("origin") ||""), await getStoreDomain(await getDB())) })
}


interface WidgetSettings {
  borderColor: string;
  borderRadius: number;
  product_ids: string;
  name: string;
  description: string;
  widget_title: string;
  store_hash: string;
  id: number;
}

async function getWidgetSettings(db:D1Database, storeHash:string, prorduct_id:number):Promise<WidgetSettings | null> {
return await db
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
  
}

export async function GET(req:NextRequest) {
  const db = await getDB()
      const allowedOrigins = await getStoreDomain(db);
        const domain = getSearchParams(req,'domain')
        const origin = req.headers.get("origin") || "";
        const productId = getSearchParams(req,'product_id')
        if(!domain || !productId){
         return NextResponse.json({success:false},{status:404,headers: corsHeaders(normalizeOrigin(origin), allowedOrigins)})
        }
    try {
    const result = await getStore(domain,db)     
    return NextResponse.json({
      success:true,
      data:await getWidgetSettings(db, result?.storeHash, Number(productId)),
    } ,{headers: corsHeaders(normalizeOrigin(origin), allowedOrigins)});

  } catch (error) {

   errorMessage(error , allowedOrigins)
  }
}