import { NextRequest,NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth";


export async function GET(req:NextRequest){
 try {
    const context = await getSession(req);
                   if(!context?.accessToken){
                 return NextResponse.json({message:'AccessToken Required'}, {status:400})
             }
            return NextResponse.json({message:'ok'})
 } catch (error) {
    
 }   
}
