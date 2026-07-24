import { NextRequest,NextResponse } from "next/server";
import { bigcommerceClient, getSession } from "../../../../../lib/auth";

export async function POST(req:NextRequest , { params }: { params: Promise<{ productId: string }> }){
  const {productId} = await params
    try {
          const context = await getSession(req);
                if(!context?.accessToken){
              return NextResponse.json({message:'AccessToken Required'})
          }
           const body = await req.json() as {
           quantity_min: number,
           quantity_max: number,
           type: string,
           amount: number       
           };
          const bigcommerce = bigcommerceClient(context?.accessToken as string, context?.storeHash as string, 'v3');
                       const { data } = await bigcommerce.post(
      `/catalog/products/${productId}/bulk-pricing-rules`,
      {
        quantity_min: body.quantity_min,
        quantity_max: body.quantity_max,
        type: body.type,      // "percent" | "fixed" | "price"
        amount: body.amount,
      }
    );
                   return NextResponse.json(data,{status:200})
               } catch (error) {
  const { message, response } = error as {
       message: string;
       response?: { status?: number };
     };
 
     return NextResponse.json(
       { message },
       { status: response?.status ?? 500 }
     );
               }   
}

export async function PUT(req:NextRequest , { params }: { params: Promise<{ productId: string }> }){
  const {productId} = await params
 try {
    const context = await getSession(req);
                if(!context?.accessToken){
              return NextResponse.json({message:'AccessToken Required'})
          }
     const bigcommerce = bigcommerceClient(context?.accessToken as string, context?.storeHash as string, 'v3');     
    const { data: rules } = await bigcommerce.get(
  `/catalog/products/${productId}/bulk-pricing-rules`
);
  const ruleId = rules[0]?.id
  const body = await req.json()
    const {  quantity_min, quantity_max, type, amount } = body as {
           quantity_min: number,
           quantity_max: number,
           type: string,
           amount: number       
           };
       const { data } = await bigcommerce.put(
      `/catalog/products/${productId}/bulk-pricing-rules/${ruleId}`,
      {
        quantity_min,
        quantity_max,
        type,
        amount,
      }
    );      
     return NextResponse.json(data, { status: 200 });  
 } catch (error) {
     const { message, response } = error as {
      message: string;
      response?: { status?: number };
    };

    return NextResponse.json(
      { message },
      { status: response?.status ?? 500 }
    );
 }
}


export async function GET(req:NextRequest, { params }: { params: Promise<{ productId: string }> } ){
   const {productId} = await params
    try {
    const context = await getSession(req);
                   if(!context?.accessToken){
                 return NextResponse.json({message:'AccessToken Required'}, {status:400})
             }
           const bigcommerce = bigcommerceClient(
                                    context?.accessToken,
                                    context?.storeHash,
                                    "v3"
                                );   
           const { data } = await bigcommerce.get(
                    `/catalog/products/${productId}/bulk-pricing-rules`
                );                     
            return NextResponse.json(data)
    }catch (error) {
            const { message, response } = error as {
            message: string;
            response?: { status?: number };
            };

            return NextResponse.json(
            { message },
            { status: response?.status ?? 500 }
            );
        }   
}