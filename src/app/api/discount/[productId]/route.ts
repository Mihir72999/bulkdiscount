import { NextRequest, NextResponse  } from "next/server";
import { bigcommerceClient } from "../../../../../lib/auth";
import { getDB } from "../../../../../lib/db";
import errorMessage from "@/lib/errorMessage";
import getStoreDomain from "@/lib/storedomain";
import getSearchParams from "@/lib/getsearchparams";
import normalizeOrigin from "@/lib/normalizeorigin";
import getStore from "@/lib/getstore";
import corsHeaders from "@/lib/corsheaaders";
import BigCommerce from "node-bigcommerce";

export const dynamic = 'force-dynamic';

function ruleData(
  productId:string,
  response:any){
    
 const rules = response.data.map((data:any)=>{

    return{
      productId,
      quantity: data.quantity_min,
      maxQuantity: data.quantity_max,
      discountType:data.type,
      discount:data.amount,
      label:`${data.amount} % OFF`
    }
   })
   
   rules.unshift({productId,quantity: 1 , discountType:response.data[0].type, discount:0,label:'SINGLE'})
   
   return rules
  
  }

async function getData(bigcommerce: BigCommerce , productId:string){
return await Promise.all([
  bigcommerce.get(`/promotions`),
  bigcommerce.get(`/catalog/products/${productId}/variants`),
  bigcommerce.get(`/catalog/products/${productId}/bulk-pricing-rules`)
]);  
}

export async function OPTIONS(
request: NextRequest 
) {
  const db = await getDB()
  const allowedOrigins = await getStoreDomain(db);
   const origin = request.headers.get("origin") || "";

   return new NextResponse(null,{ status:204,headers: corsHeaders(normalizeOrigin(origin), allowedOrigins) })
}

export async function GET(
    request:NextRequest ,
    { params }: { params: Promise<{ productId: string }> }
){
  const db = await getDB()
  const domain = getSearchParams(request,'domain')
  const origin = request.headers.get("origin") || "";
  const allowedOrigins = await getStoreDomain(db);    
  try {
  const {productId} = await params  

const store = await getStore(domain,db)

const bigcommerce = bigcommerceClient(store?.accessToken, store?.storeHash);

const [promotions, variants, response] = await getData(bigcommerce,productId)

if(!response.data || response.data.length === 0){

  return NextResponse.json({
      success: false,
      rules: [],
    },{status:200 , headers:corsHeaders(normalizeOrigin(origin), allowedOrigins)});
}

   const rules = ruleData(productId,response)
    return NextResponse.json({
    succes:true,
    rules,
    variants : variants?.data,
    promotions
   },{headers:corsHeaders(normalizeOrigin(origin), allowedOrigins)})

     } catch (error) {

     errorMessage(error , allowedOrigins)
  } 
}




