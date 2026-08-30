import { NextRequest, NextResponse  } from "next/server";
import { bigcommerceClient } from "../../../../lib/auth";
import { getDB } from "../../../../lib/db";
import corsHeaders from "@/lib/corsheaaders";
import normalizeOrigin from "@/lib/normalizeorigin";
import getStoreDomain from "@/lib/storedomain";
import getStore from "@/lib/getstore";
import getSearchParams from "@/lib/getsearchparams";
import errorMessage from '@/lib/errorMessage'
export const dynamic = 'force-dynamic';


export async function OPTIONS(
request: NextRequest 
) {
  const db = await getDB()
  const allowedOrigins = await getStoreDomain(db);
   const origin = request.headers.get("origin") || "";

   return new NextResponse(null,{ status:204,headers: corsHeaders(normalizeOrigin(origin), allowedOrigins) })
}


export async function GET(request:NextRequest){
  const db = await getDB()
  const [domain , igId] = getSearchParams(request,['domain', 'igId'])
    //  const igId = getSearchParams(request,'igId')
    console.log(domain , 'domain')
    console.log(igId, 'idId')
     const ignoreId = JSON.parse(igId || '[]') as number[]
    const origin = request.headers.get("origin") || "";
  const allowedOrigins = await getStoreDomain(db);
  if(!ignoreId || ignoreId.length <= 0){
    return NextResponse.json({
       success:true, 
       rules:[]  
    } ,{status:200 , headers:corsHeaders(normalizeOrigin(origin), allowedOrigins)})
  }      
  try{
  const store = await getStore(domain , db)  
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

return NextResponse.json({
      success: true,
      rules: rule,
    },{status:200 , headers:corsHeaders(normalizeOrigin(origin), allowedOrigins)});
      } catch (error) {
      errorMessage(error , allowedOrigins) 
      }
}

