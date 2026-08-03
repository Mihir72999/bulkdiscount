import { NextRequest, NextResponse  } from "next/server";
import { bigcommerceClient } from "../../../../../lib/auth";
import { getDB } from "../../../../../lib/db";
export const dynamic = 'force-dynamic';
const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Headers": "*"
  }

export async function OPTIONS(){
   return new NextResponse(null,{ status:204,headers})
}

export async function GET(
    request:NextRequest ,
    { params }: { params: Promise<{ productId: string }> }
){
  try {
    
  const {productId} = await params  
  const db = await getDB()
   const domain = request.nextUrl.searchParams.get('domain')

const store = await db.prepare("SELECT accessToken, storeHash FROM stores WHERE domain = ?").bind(domain).first()  as {
  accessToken: string;
  storeHash: string;
};

const bigcommerce = bigcommerceClient(store?.accessToken, store?.storeHash);

const [variants, response] = await Promise.all([
  bigcommerce.get(`/catalog/products/${productId}/variants`),
  bigcommerce.get(`/catalog/products/${productId}/bulk-pricing-rules`)
]);

if(!response.data || response.data.length === 0){

return NextResponse.json({
      success: false,
      rules: [],
    },{status:200 , headers:headers});
}

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
    return NextResponse.json({
    succes:true,
    rules,
    variants : variants?.data
   },{headers})

     } catch (error) {

    const { message, response } = error as {
      message: string;
      response?: { status?: number };
    };

    return NextResponse.json(
      { message },
      { status: response?.status ?? 500 , headers}
    ); 
  } 
}




