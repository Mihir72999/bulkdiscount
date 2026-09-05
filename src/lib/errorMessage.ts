import { NextResponse } from "next/server";
import corsHeaders, { corsHeader } from "@/lib/corsheaaders";
import normalizeOrigin from "@/lib/normalizeorigin";

export default function errorMessage(error:unknown , allowedOrigins:string[]){
       const { message, response } = error as {
          message: string;
          response?: { status?: number };
        };
    
        return NextResponse.json(
          { message },
          { status: response?.status ?? 500 , headers:corsHeaders(normalizeOrigin(origin), allowedOrigins)}
        ); 
}

export  function errorMessages(error:unknown , allowedOrigins:string){
       const { message, response } = error as {
          message: string;
          response?: { status?: number };
        };
    
        return NextResponse.json(
          { message },
          { status: response?.status ?? 500 , headers:corsHeader(normalizeOrigin(origin), allowedOrigins)}
        ); 
}