import { NextRequest, NextResponse } from "next/server";
import { getDB } from "../../../../../lib/db";
import getStoreDomain, { getSingleDomain } from "@/lib/storedomain";
import normalizeOrigin from "@/lib/normalizeorigin";
import corsHeaders, { corsHeader } from "@/lib/corsheaaders";
import getSearchParams from "@/lib/getsearchparams";
import errorMessage, { errorMessages } from "@/lib/errorMessage";
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

async function getStorePromises(db:D1Database, domain:string){
  return await Promise.all([
    getSingleDomain(db, domain),
    getStore(domain, db)
  ]);
}

export async function GET(req:NextRequest) {
  
  const db = await getDB()
  const domain = getSearchParams(req,'domain') || ""
  const [allowedOrigins, result] = await getStorePromises(db, domain);
        const origin = req.headers.get("origin") || "";
        const productId = getSearchParams(req,'product_id')

        if(!domain || !productId || !origin){
         throw new Error("Missing required parameters");
        }
        if(!allowedOrigins){
          throw new Error("Origin not allowed");
        }
        const headers = corsHeader(normalizeOrigin(origin), allowedOrigins)
         
        if(!result?.storeHash){
          return NextResponse.json({
            success: false, 
            message: "Missing required parameters"
          },{status:400 , headers});
        }

    try {
    const storeHash:string = result?.storeHash;  
    const success:boolean = storeHash ? true : false;  
    const data = await getWidgetSettings(db, storeHash, Number(productId));  
    return NextResponse.json({
      success,
      data,
    } ,{headers});

  } catch (error) {

   errorMessages(error , allowedOrigins)
  }
}