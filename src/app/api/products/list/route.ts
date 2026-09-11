import { NextRequest, NextResponse } from "next/server";
import { bigcommerceClient, getSession } from "../../../../../lib/auth";
import getSearchParams from "@/lib/getsearchparams";
import { messageError } from "@/lib/errorMessage";


// {
//         "pagination": {
//             "total": 13,
//             "count": 13,
//             "per_page": 20,
//             "current_page": 1,
//             "total_pages": 1,
//             "links": {
//                 "current": "?page=1&limit=20"
//             },
//             "too_many": false
//         }
//     }

interface Product {
    id: number;
    name: string; 
    sku: string;
    description: string;
    price: string;
    inventory_level: number;
    type: string;
  }

interface Meta {
"pagination": {
    "total": number,
    "count": number,
    "per_page": number,
    "current_page": number,
    "total_pages": number,
    "links": {
        "current": string
    },
    "too_many": boolean
  }
}


type ProductResponse = {
    data: Product[];
    meta: Meta;
  };

type ParamsTruple = {
  page:string, limit:string, sort?:string, direction?:string, keyword?:string};

export async function GET(req:NextRequest){
     try { 
               const context = await getSession(req);
                       if(!context?.accessToken || !context?.storeHash){
                          return NextResponse.json({message:'AccessToken Required'})
                         }
                const accessToken = context?.accessToken;
                const storeHash = context?.storeHash;
                 const bigcommerce = bigcommerceClient(accessToken, storeHash);
                 if(!bigcommerce){
                    return NextResponse.json({message:'Bigcommerce Client Not Found'})
                 }
           const truple: ParamsTruple = {
              page: getSearchParams(req, "page") ?? "1",
              limit: getSearchParams(req, "limit") ?? "20",
              sort: getSearchParams(req, "sort") || undefined,
              direction: getSearchParams(req, "direction") || undefined,
              keyword: getSearchParams(req, "keyword") || undefined
           }
      //     const page = req.nextUrl.searchParams.get("page") ?? "1";
      //  const limit = req.nextUrl.searchParams.get("limit") ?? "20";
      //  const sort = req.nextUrl.searchParams.get("sort");
      //  const direction = req.nextUrl.searchParams.get("direction");
      //    const keyword = req.nextUrl.searchParams.get("keyword");
         const params = new URLSearchParams({ page:truple.page, limit:truple.limit,
           ...(truple.keyword ? { keyword: truple.keyword } : {}),
           ...(truple.sort && {sort: truple.sort, direction: truple.direction ?? "asc"}) }).toString();
 

         const response: ProductResponse = await bigcommerce.get(`/catalog/products?${params}`);
          
         if(!response.data || response.data.length === 0){
            return NextResponse.json({message:'No Products Found'})
         }
         
        return NextResponse.json(response,{status:200})
     } catch (error) {
      messageError(error)
     }   
}