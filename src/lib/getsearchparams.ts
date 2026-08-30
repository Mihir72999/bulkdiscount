import { NextRequest } from "next/server";

export default function getSearchParams(request:NextRequest , search:string | string[]){
 
 let searchParam:string = "";
 const searchParams:(string | null)[] = []

 if(typeof search === "string"){
    searchParam = request.nextUrl.searchParams.get(search) || ""
 }else{      
  const value =  search.length > 0 ? search.map(s => request.nextUrl.searchParams.get(s)) : []
    searchParams.push(...value)
 }

return typeof search === "string" ? searchParam : searchParams 
}   