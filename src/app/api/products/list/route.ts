import { NextRequest, NextResponse } from "next/server";
import { bigcommerceClient, getSession } from "../../../../../lib/auth";
import getSearchParams from "@/lib/getsearchparams";
import { messageError } from "@/lib/errorMessage";
import BigCommerce from "node-bigcommerce";


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
  page:string | undefined, 
  limit:string | undefined, 
  sort?:string | undefined, 
  direction?:string | undefined, 
  keyword?:string | undefined
};

type ValidateTruple =  {
    page: string;
    limit: string;
    sort: string | undefined;
    direction: string;
    keyword: string | undefined;
}

function validatePage(page:string | undefined){
if(!page) return "1"
return page
}

function validateLimit(limit:string | undefined){
  if(!limit) return "20"
  return limit
}

function validateShort(short:string | undefined){
  if(!short) return undefined
  return short
}

function validateDirection(direction:string | undefined){
  if(!direction) return "asc"
  return direction
}

function validateKeyword(keyword:string | undefined){
  if(!keyword) return undefined
  return keyword
}
function validateTruples(truple:ParamsTruple){
const page = validatePage(truple.page)
const limit = validateLimit(truple.limit)
const sort = validateShort(truple.sort)
const direction = validateDirection(truple.direction)
const keyword = validateKeyword(truple.keyword)
return {page, limit, sort, direction, keyword}
}  


function validateParams(truple:ValidateTruple){
  return new URLSearchParams({ page:truple.page, limit:truple.limit,
           ...(truple.keyword ? { keyword: truple.keyword } : {}),
           ...(truple.sort && {sort: truple.sort, direction: truple.direction ?? "asc"}) }).toString();
 
}

function getTruple(req:NextRequest):ParamsTruple{
  return {
              page: getSearchParams(req, "page") ?? "1",
              limit: getSearchParams(req, "limit") ?? "20",
              sort: getSearchParams(req, "sort") || undefined,
              direction: getSearchParams(req, "direction") || "asc",
              keyword: getSearchParams(req, "keyword") || undefined
           }
}

function validateSession(context:{accessToken:string, storeHash:string} | undefined){
  if(!context?.accessToken || !context?.storeHash){
    throw new Error("AccessToken Required")
  }
  return context
}

function validateBigcommerceClient(bigcommerce:BigCommerce | undefined){
  if(!bigcommerce){
    throw new Error("Bigcommerce Client Not Found")
  }
  return bigcommerce
}

function validateProductResponse(response: ProductResponse){
if(!response.data || response.data.length === 0){
  throw new Error('No Products Found')
}
return response
}

export async function GET(req:NextRequest){
     try { 
                
          const truples = getTruple(req)
            
          const truple = validateTruples(truples)
         
          const params = validateParams(truple)

          const validateContext = await getSession(req);

          const {accessToken, storeHash} = validateSession(validateContext)    
                 
          const validateBigcommerce = bigcommerceClient(accessToken, storeHash);
                 
          const bigcommerce = validateBigcommerceClient(validateBigcommerce)

          const responseData: ProductResponse = await bigcommerce.get(`/catalog/products?${params}`);
          
          const response = validateProductResponse(responseData)
         
         return NextResponse.json(response,{status:200})

     } catch (error) {

        messageError(error)
     
      }   
}