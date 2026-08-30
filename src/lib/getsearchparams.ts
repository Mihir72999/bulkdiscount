import { NextRequest } from "next/server";

export default function getSearchParams(request:NextRequest , search:string | string[]){
 
 let searchParam:string = "";
 const searchParams:string[] = []

 if(typeof search === "string"){
    searchParam = request.nextUrl.searchParams.get(search) || ""
 }else{
    searchParams.push(...search)
 }

return typeof search === "string" ? searchParam : searchParams 
}   