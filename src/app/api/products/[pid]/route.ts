import { NextRequest, NextResponse } from "next/server";
import { bigcommerceClient, getSession } from "../../../../../lib/auth";

export async function GET(req:NextRequest, { params }: { params: Promise<{ pid: string }> }){
  const {pid} = await params
   try {
         const context = await getSession(req);
               if(!context?.accessToken){
             return NextResponse.json({message:'AccessToken Required'})
         }
         const bigcommerce = bigcommerceClient(context?.accessToken as string, context?.storeHash as string, 'v2');
 
                  const { data } = await bigcommerce.get(`/catalog/products/${pid}`);
                  
                  return NextResponse.json(data,{status:200})
              } catch (error) {
                  const { message, response } = error as {message:string , response:any};
                  return NextResponse.json({message},{status:response.status || 500})
              }
}

export async function PUT(req:NextRequest, { params }: { params: Promise<{ pid: string }> }) {
    const {pid} = await params
    const body = await req.json()
   try {
         const context = await getSession(req);
               if(!context?.accessToken){
             return NextResponse.json({message:'AccessToken Required'})
         }
         const bigcommerce = bigcommerceClient(context?.accessToken as string, context?.storeHash as string);
 
                  const { data } = await bigcommerce.put(`/catalog/products/${pid}`,body);
                  
                  return NextResponse.json(data,{status:200})
              } catch (error) {
                  const { message, response } = error as {message:string , response:any};
                  return NextResponse.json({message},{status:response.status || 500})
              }    
}