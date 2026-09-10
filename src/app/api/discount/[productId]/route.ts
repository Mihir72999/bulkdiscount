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

type OptionsValue = {
  id:number,
  option_id:number,
  display_name:string,
}

interface Variant {
  id:number,
  product_id:number,
  sku:string,
  option_values:OptionsValue[]
}

interface Data {
  productId:string,
  quantity:number,
  maxQuantity:number,
  discountType?:string,
  type?:string,
  discount:number,
  label:string
}

type RuleData = {
  quantity_min:number,
  quantity_max:number,
  type:string,
  amount:number
}

function ruleData(
  productId:string,
  response:{data:RuleData[]}){

    const rules = response.data.map((data:RuleData):Data=>{
    const quantity:RuleData['quantity_min'] = data.quantity_min
    const maxQuantity:RuleData['quantity_max'] = data.quantity_max
    const discountType:RuleData['type'] = data.type
    const discount:RuleData['amount'] = data.amount
    const label:string = `${data.amount} % OFF`
    return{
      productId,
      quantity,
      maxQuantity,
      discountType,
      discount,
      label
    }
   })
   
   const quantity:number = 1
   const discountType:string = response.data[0].type
   const discount:number = 0
   const label:string = 'SINGLE'
   rules.unshift({productId,quantity , maxQuantity: quantity, discountType, discount,label})
   
   return rules
  
  }

async function getData(bigcommerce: BigCommerce , productId:string):Promise<[ { data: Variant[] }, { data: RuleData[] } ]> {
return await Promise.all([
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
  const {productId} = await params  
  const domain = getSearchParams(request,'domain')
  const origin = request.headers.get("origin") || "";
 
  if(!origin){
   throw new Error("Origin header is missing"); 
  }
  if(!db || !domain){
    throw new Error("Missing required parameters");
  }


  const [allowedOrigins, store] = await Promise.all([
  getStoreDomain(db),
  getStore(domain, db)
  ]);

 const headers = corsHeaders(normalizeOrigin(origin), allowedOrigins)

  if(!allowedOrigins){
    throw new Error("Origin not allowed");
  }

   if(!productId){
    return NextResponse.json({
      success:false,message:"Missing required parameters"
    },{status:400 , headers})
  }

  try {

if(!store){
  return NextResponse.json({
    success: false,
    rules: [],
  },{status:200 , headers});
}
const storeAccessToken = store?.accessToken;

const storeHash = store?.storeHash;

if(!storeAccessToken || !storeHash){
  return NextResponse.json({
    success: false,
    rules: [],
    message: "Missing required parameters"
  },{status:200 , headers});
}
 
const bigcommerce = bigcommerceClient(storeAccessToken, storeHash);

if(!bigcommerce){
  return NextResponse.json({
    success: false,
    rules: [],
    message: "Failed to initialize BigCommerce client"
  },{status:200 , headers});
}

const [variants, response] = await getData(bigcommerce,productId)

if(!response.data || response.data.length === 0 || !variants.data || variants.data.length === 0){

  return NextResponse.json({
      success: false,
      rules: [],
    },{status:200 , headers});
}

   const rules = ruleData(productId,response)

   if(!rules || rules.length === 0) {
    return NextResponse.json({
      success: false,
      rules: [],
      message: "No valid discount rules found"
    },{status:200 , headers});
   }

   const variantsData = variants?.data ?? []
    return NextResponse.json({
    success:true,
    rules,
    variants:variantsData
   },{headers})

     } catch (error) {

     errorMessage(error , allowedOrigins)
  } 
}




