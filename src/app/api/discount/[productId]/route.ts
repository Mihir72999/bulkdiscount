
// app/api/products/[productId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { bigcommerceClient } from "../../../../../lib/auth";
import { getDB } from "../../../../../lib/db";
import { errorMessages } from "@/lib/errorMessage";
import { getSingleDomain } from "@/lib/storedomain";
import getSearchParams from "@/lib/getsearchparams";
import normalizeOrigin from "@/lib/normalizeorigin";
import getStore from "@/lib/getstore";
import { corsHeader } from "@/lib/corsheaaders";
import BigCommerce from "node-bigcommerce";

export const dynamic = "force-dynamic";

// ======================
// 1. Types & Interfaces
// ======================

interface OptionValue {
  id: number;
  option_id: number;
  display_name: string;
}

interface Variant {
  id: number;
  product_id: number;
  sku: string;
  option_values: OptionValue[];
}

interface BulkPricingRule {
  quantity_min: number;
  quantity_max: number;
  type: string;
  amount: number;
}

interface DiscountRule {
  productId: string;
  quantity: number;
  maxQuantity: number;
  discountType?: string;
  type?: string;
  discount: number;
  label: string;
}

interface ProductResponse {
  data: Variant[];
}

interface RulesResponse {
  data: BulkPricingRule[];
}

interface StoreCredentials {
  accessToken: string;
  storeHash: string;
}

/**
 * Abstraction for product-related BigCommerce calls (Dependency Inversion)
 */
interface ProductClient {
  getVariants(productId: string): Promise<ProductResponse>;
  getBulkPricingRules(productId: string): Promise<RulesResponse>;
}

// ======================
// 2. Concrete Implementation
// ======================

class BigCommerceProductClient implements ProductClient {
  constructor(private client: BigCommerce) {}

  async getVariants(productId: string): Promise<ProductResponse> {
    return this.client.get(`/catalog/products/${productId}/variants`);
  }

  async getBulkPricingRules(productId: string): Promise<RulesResponse> {
    return this.client.get(`/catalog/products/${productId}/bulk-pricing-rules`);
  }
}

// ======================
// 3. Domain Logic (Single Responsibility)
// ======================

/**
 * Transforms raw bulk pricing rules into the format expected by the frontend.
 * Also injects a default "SINGLE" rule at the beginning.
 */
function mapPricingRules(
  productId: string,
  response: RulesResponse
): DiscountRule[] {
  const rules: DiscountRule[] = response.data.map((rule) => ({
    productId,
    quantity: rule.quantity_min,
    maxQuantity: rule.quantity_max,
    discountType: rule.type,
    discount: rule.amount,
    label: `${rule.amount} % OFF`,
  }));

  // Add default single-unit rule at the start
  rules.unshift({
    productId,
    quantity: 1,
    maxQuantity: 1,
    discountType: response.data[0]?.type,
    discount: 0,
    label: "SINGLE",
  });

  return rules;
}

// ======================
// 4. Validation & Parsing Helpers (kept small)
// ======================

function requireDomain(domain: string | null): string {
  if (!domain) {
    throw new Error("Missing required parameters");
  }
  return domain;
}

function requireOrigin(origin: string | null): string {
  if (!origin) {
    throw new Error("Origin header is missing");
  }
  return origin;
}

function requireProductId(productId: string | undefined): string {
  if (!productId) {
    throw new Error("Product ID is required");
  }
  return productId;
}

function requireStore(store: StoreCredentials | null | undefined): StoreCredentials {
  if (!store?.accessToken || !store?.storeHash) {
    throw new Error("Store not found");
  }
  return store;
}

function requireAllowedOrigin(allowedOrigins: string | null | undefined): string {
  if (!allowedOrigins) {
    throw new Error("Origin not allowed");
  }
  return allowedOrigins;
}

// ======================
// 5. Service Layer (orchestrates data access)
// ======================

class ProductDiscountService {
  constructor(private client: ProductClient) {}

  async getVariantsAndRules(productId: string) {
    const [variantsResponse, rulesResponse] = await Promise.all([
      this.client.getVariants(productId),
      this.client.getBulkPricingRules(productId),
    ]);

    if (!variantsResponse.data?.length) {
      throw new Error("No variants found for the product");
    }

    if (!rulesResponse.data?.length) {
      throw new Error("No valid discount rules found");
    }

    const rules = mapPricingRules(productId, rulesResponse);

    return {
      variants: variantsResponse.data,
      rules,
    };
  }
}

// ======================
// 6. Shared Auth + CORS helpers
// ======================

async function resolveStoreAndOrigin(domain: string) {
  const db = await getDB();

  const [allowedOrigins, store] = await Promise.all([
    getSingleDomain(db, domain),
    getStore(domain, db),
  ]);

  return {
    allowedOrigin: requireAllowedOrigin(allowedOrigins),
    store: requireStore(store),
  };
}

function createBigCommerceClient(store: StoreCredentials): BigCommerce {
  const client = bigcommerceClient(store.accessToken, store.storeHash);

  if (!client) {
    throw new Error("Bigcommerce Client Not Found");
  }

  return client;
}

// ======================
// 7. Route Handlers (thin orchestration only)
// ======================

export async function OPTIONS(request: NextRequest) {
  const domain = requireDomain(getSearchParams(request, "domain"));
  const { allowedOrigin } = await resolveStoreAndOrigin(domain);

  const origin = request.headers.get("origin") || "";

  return new NextResponse(null, {
    status: 204,
    headers: corsHeader(normalizeOrigin(origin), allowedOrigin),
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const domain = requireDomain(getSearchParams(request, "domain"));
  const { allowedOrigin, store } = await resolveStoreAndOrigin(domain);

  try {
    const origin = requireOrigin(request.headers.get("origin"));
    const headers = corsHeader(normalizeOrigin(origin), allowedOrigin);

    const { productId } = await params;
    const validatedProductId = requireProductId(productId);

    // Dependency injection
    const bigCommerce = createBigCommerceClient(store);
    const productClient = new BigCommerceProductClient(bigCommerce);
    const service = new ProductDiscountService(productClient);

    const { variants, rules } = await service.getVariantsAndRules(validatedProductId);

    return NextResponse.json(
      {
        success: true,
        rules,
        variants,
      },
      { headers }
    );
  } catch (error) {
    return errorMessages(error, allowedOrigin);
  }
}

// import { NextRequest, NextResponse  } from "next/server";
// import { bigcommerceClient } from "../../../../../lib/auth";
// import { getDB } from "../../../../../lib/db";
// import { errorMessages } from "@/lib/errorMessage";
// import {getSingleDomain} from "@/lib/storedomain";
// import getSearchParams from "@/lib/getsearchparams";
// import normalizeOrigin from "@/lib/normalizeorigin";
// import getStore from "@/lib/getstore";
// import { corsHeader } from "@/lib/corsheaaders";
// import BigCommerce from "node-bigcommerce";

// export const dynamic = 'force-dynamic';

// type OptionsValue = {
//   id:number,
//   option_id:number,
//   display_name:string,
// }

// interface Variant {
//   id:number,
//   product_id:number,
//   sku:string,
//   option_values:OptionsValue[]
// }

// interface Data {
//   productId:string,
//   quantity:number,
//   maxQuantity:number,
//   discountType?:string,
//   type?:string,
//   discount:number,
//   label:string
// }

// type RuleData = {
//   quantity_min:number,
//   quantity_max:number,
//   type:string,
//   amount:number
// }

// export async function OPTIONS(
// request: NextRequest 
// ) {
//   const db = await getDB()
//   const doma = getSearchParams(request,'domain')
//   const domain = domainValidation(doma)
//   const allowedOrigins = await getSingleDomain(db, domain);
//    const origin = request.headers.get("origin") || "";

//    return new NextResponse(null,{ status:204,headers: corsHeader(normalizeOrigin(origin), allowedOrigins) })
// }

// function ruleData(
//   productId:string,
//   response:{data:RuleData[]}){

//     const rules = response.data.map((data:RuleData):Data=>{
//     const quantity:RuleData['quantity_min'] = data.quantity_min
//     const maxQuantity:RuleData['quantity_max'] = data.quantity_max
//     const discountType:RuleData['type'] = data.type
//     const discount:RuleData['amount'] = data.amount
//     const label:string = `${data.amount} % OFF`
//     return{
//       productId,
//       quantity,
//       maxQuantity,
//       discountType,
//       discount,
//       label
//     }
//    })
   
//    const quantity:number = 1
//    const discountType:string = response.data[0].type
//    const discount:number = 0
//    const label:string = 'SINGLE'
//    rules.unshift({productId,quantity , maxQuantity: quantity, discountType, discount,label})
   
//    return rules
  
//   }

// async function getData(bigcommerce: BigCommerce , productId:string):Promise<[ { data: Variant[] }, { data: RuleData[] } ]> {
// return await Promise.all([
//   bigcommerce.get(`/catalog/products/${productId}/variants`),
//   bigcommerce.get(`/catalog/products/${productId}/bulk-pricing-rules`)
// ]);  
// }


// function validationOrigin(allowedOrigins:string){
//   if(!allowedOrigins){
//     throw new Error("Origin not allowed");
//   }
//   return allowedOrigins
// }

// function validateId(productId:string){
//   if(!productId){
//     throw new Error("Product ID is required");
//   }
// return productId
// }

// function validateBigcommerceClient(bigcommerce: BigCommerce | null){
//   if(!bigcommerce){
//     throw new Error("Bigcommerce Client Not Found");
//   }
// return bigcommerce
// }

// function validateStore(store:{ accessToken: string; storeHash: string }){
//   if(!store.accessToken || !store?.storeHash){
//     throw new Error("Store not found");
//   }
// return store
// }

// function validateOrigin(origin:string | null){
// if(!origin){
//    throw new Error("Origin header is missing"); 
//   }
//   return origin
// }

// function domainValidation( domain:string | null){
//   if(!domain){
//     throw new Error("Missing required parameters");
//   }
//   return domain
// }

// async function parallerPromise(db:D1Database, domain:string){
// return await Promise.all([
//   getSingleDomain(db , domain),
//   getStore(domain, db)
//   ]);
// }

// function validateResponseDate(response:{data:RuleData[]}){
//   if(!response.data || response.data.length === 0){
//     throw new Error("No valid discount rules found");
//   }
// return response
// }

// function validateVariantsData(variants:{data:Variant[]}){
//   if(!variants.data || variants.data.length === 0){
//     throw new Error("No variants found for the product");
//   }
//   return variants
// }

// function validateRulesData(rules:Data[]){
//   if(!rules || rules.length === 0){
//     throw new Error("No valid discount rules found");
//   }
//   return rules
// }

// export async function GET(
//     request:NextRequest ,
//     { params }: { params: Promise<{ productId: string }> }
// ){
//   const db = await getDB()

//   const doma = getSearchParams(request,'domain')

//   const domain = domainValidation(doma)
   
//   const [allowedOrigins, store] = await parallerPromise(db, domain);

//   const allowedOrigin = validationOrigin(allowedOrigins)

//   try {
  
// const origin = validateOrigin(request.headers.get("origin"))

// const headers = corsHeader(normalizeOrigin(origin), allowedOrigin)
 
// const { accessToken: storeAccessToken, storeHash } = validateStore(store)
 
// const bigcommerce = bigcommerceClient(storeAccessToken, storeHash);

// const validatedBigcommerce = validateBigcommerceClient(bigcommerce);

// const {productId} = await params

// const validatedProductId = validateId(productId)

// const [variants, response] = await getData(validatedBigcommerce,validatedProductId)

// const validateVariants = validateVariantsData(variants);

// const responseData = validateResponseDate(response);

// const rules = ruleData(validatedProductId,responseData)

// const ruleDatas = validateRulesData(rules)

// const variantsData = validateVariants.data ?? []
 
//    return NextResponse.json({
//     success:!!ruleDatas && !!variantsData,
//     rules: ruleDatas,
//     variants: variantsData
//    },{headers})

//      } catch (error) {

//    return errorMessages(error , allowedOrigin)
//   } 
// }




