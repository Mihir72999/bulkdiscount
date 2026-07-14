import { NextRequest, NextResponse } from "next/server";
import { bigcommerceClient, getSession } from "../../../../../lib/auth";

export async function GET(req:NextRequest){
     try { 
               const context = await getSession(req);
                       if(!context?.accessToken){
                     return NextResponse.json({message:'AccessToken Required'})
                 }
                 const bigcommerce = bigcommerceClient(context?.accessToken as string, context?.storeHash as string);
          const page = req.nextUrl.searchParams.get("page") ?? "1";
       const limit = req.nextUrl.searchParams.get("limit") ?? "20";
       const sort = req.nextUrl.searchParams.get("sort");
       const direction = req.nextUrl.searchParams.get("direction");
         const params = new URLSearchParams({ page, limit, ...(sort && {sort, direction:direction ?? "asc"}) }).toString();
 
         const response = await bigcommerce.get(`/catalog/products?${params}`);
        return NextResponse.json(response,{status:200})
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