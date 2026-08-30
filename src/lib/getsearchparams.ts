import { NextRequest } from "next/server";

export default function getSearchParams(request:NextRequest , search:string){
 
    return request.nextUrl.searchParams.get(search)
 
}   