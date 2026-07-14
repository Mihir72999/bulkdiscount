import { NextRequest, NextResponse } from "next/server";
import { bigcommerceClient, getSession } from "../../../../lib/auth";

export async function GET(req:NextRequest){
   try {
               const context = await getSession(req);
                       if(!context?.accessToken){
                     return NextResponse.json({message:'AccessToken Required'})
                 }
                 const bigcommerce = bigcommerceClient(context?.accessToken as string, context?.storeHash as string);
           const { data } = await bigcommerce.get('/catalog/summary');
       return NextResponse.json(data ,{status:200})
      } catch (error) {
          const { message, response } = error as {message:string, response:any};
          return NextResponse.json({ message },{status:response?.status || 500});
      }
}