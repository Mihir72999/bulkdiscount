import { NextRequest, NextResponse  } from "next/server";
import { bigcommerceClient } from "../../../../lib/auth";
import { getDB } from "../../../../lib/db";
import corsHeaders, { corsHeader } from "@/lib/corsheaaders";
import normalizeOrigin from "@/lib/normalizeorigin";
import getStore from "@/lib/getstore";
import getSearchParams from "@/lib/getsearchparams";
import { errorMessages } from '@/lib/errorMessage'
import getStoreDomain,{getSingleDomain} from "@/lib/storedomain";
export const dynamic = 'force-dynamic';


export async function OPTIONS(
request: NextRequest 
) {
  const db = await getDB()
  const allowedOrigins = await getStoreDomain(db);
   const origin = request.headers.get("origin") || "";

   return new NextResponse(null,{ status:204,headers: corsHeaders(normalizeOrigin(origin), allowedOrigins) })
}

async function getStorePromises(db:D1Database, domain:string | null){
  return await Promise.all([
    getSingleDomain(db , domain || ""),
    getStore(domain, db)
  ]);
}

export async function GET(request:NextRequest){
  const db = await getDB()
  const domain = getSearchParams(request,'domain')
   const igId = getSearchParams(request,'igId')
   const ignoreId = JSON.parse(igId || '[]') as number[]
   const origin = request.headers.get("origin") || "";
  if(!origin){
   throw new Error("Origin header is missing"); 
  }
   const [allowedOrigins , store] = await getStorePromises(db, domain)
   if(!db || !domain || !igId){
     throw new Error("Missing required parameters");
   } 
  if(!ignoreId || ignoreId.length <= 0){
    return NextResponse.json({
       success:true, 
       rules:[]  
    } ,{status:200 , headers:corsHeader(normalizeOrigin(origin), allowedOrigins)})
  }      
  try{ 
const bigcommerce = bigcommerceClient(store?.accessToken, store?.storeHash , 'v2');
if(!bigcommerce){
  return NextResponse.json({
    success:false,
    message:"Failed to initialize BigCommerce client"
  },{status:500 , headers:corsHeader(normalizeOrigin(origin), allowedOrigins)})
}
const coupons = await bigcommerce.get('/coupons')
const couponId = coupons[0]?.id
if(!couponId){
  return NextResponse.json({
    success:false,
    message:"No valid coupon found"
  },{status:404 , headers:corsHeader(normalizeOrigin(origin), allowedOrigins)})
}
const promotion = {
  applies_to: {
    entity: 'products',
    ids: ignoreId
  }
};
const rule = await bigcommerce.put(`/coupons/${couponId}` , promotion);
if(!rule){
  return NextResponse.json({
    success:false,
    message:"Failed to update coupon"
  },{status:500 , headers:corsHeader(normalizeOrigin(origin), allowedOrigins)})
}
return NextResponse.json({
      success: true,
      rules: rule,
    },{status:200 , headers:corsHeader(normalizeOrigin(origin), allowedOrigins)});
      } catch (error) {
      errorMessages(error , allowedOrigins) 
      }
}

