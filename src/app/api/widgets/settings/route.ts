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

function validateParams(param:string){
  if(!param || param.trim() === ""){
         throw new Error("Missing required parameters");
    }
    return param;
}

function dataValidation(data:WidgetSettings | null){
  if(!data){
    throw new Error("Widget settings not found");
  }
  return data
}

function validateStore(store:{accessToken: string , storeHash: string }){
  if(!store?.storeHash || !store?.accessToken){
    throw new Error("Store not found");
  }
  return store;
}

function validateAllowedOrigins(allowedOrigins:string){
  if(!allowedOrigins){
    throw new Error("Origin not allowed");
  }
  return allowedOrigins;
}

export async function GET(req:NextRequest) {
  
  const db = await getDB()

  const domains = getSearchParams(req,'domain')
  
  const domain = validateParams(domains || "")
  
  const [allowedOrigin, result] = await getStorePromises(db, domain);
  
  const allowedOrigins = validateAllowedOrigins(allowedOrigin)
  
  const origins = req.headers.get("origin") || "";
  
  const origin = normalizeOrigin(origins)

  const product_id = getSearchParams(req,'product_id')

  const productId = validateParams(product_id || "")
          
  const headers = corsHeader(normalizeOrigin(origin), allowedOrigins)

    try {

    const { storeHash } = validateStore(result)

    const success:boolean = storeHash ? true : false;  

    const data = await getWidgetSettings(db, storeHash, Number(productId));
    
    const widgetSettings = dataValidation(data)

    return NextResponse.json({
      success,
      data: widgetSettings,
    } ,{headers});

  } catch (error) {

   errorMessages(error , allowedOrigins)
  }
}