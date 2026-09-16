
// app/api/widget-settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDB } from "../../../../../lib/db";
import { getSingleDomain } from "@/lib/storedomain";
import normalizeOrigin from "@/lib/normalizeorigin";
import { corsHeader } from "@/lib/corsheaaders";
import getSearchParams from "@/lib/getsearchparams";
import { errorMessages } from "@/lib/errorMessage";
import getStore from "@/lib/getstore";

export const dynamic = "force-dynamic";

// ======================
// 1. Types & Interfaces
// ======================

interface WidgetSettings {
  id: number;
  name: string;
  description: string;
  widget_title: string;
  borderColor: string;
  borderRadius: number;
  product_ids: string;
  store_hash: string;
}

interface StoreCredentials {
  accessToken: string;
  storeHash: string;
}

/**
 * Abstraction for widget settings data access (Dependency Inversion)
 */
interface WidgetSettingsRepository {
  findByStoreAndProduct(
    storeHash: string,
    productId: number
  ): Promise<WidgetSettings | null>;
}

// ======================
// 2. Concrete Implementation (Single Responsibility)
// ======================

class D1WidgetSettingsRepository implements WidgetSettingsRepository {
  constructor(private db: D1Database) {}

  async findByStoreAndProduct(
    storeHash: string,
    productId: number
  ): Promise<WidgetSettings | null> {
    return this.db
      .prepare(
        `
        SELECT *
        FROM widget_settings
        WHERE store_hash = ?
          AND EXISTS (
            SELECT 1
            FROM json_each(product_ids)
            WHERE CAST(value AS INTEGER) = ?
          )
        LIMIT 1
      `
      )
      .bind(storeHash, productId)
      .first<WidgetSettings>();
  }
}

// ======================
// 3. Validation Helpers (small & focused)
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

function requireProductId(productId: string | null): string {
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
// 4. Shared helpers (used by both OPTIONS & GET)
// ======================

async function resolveStoreAndOrigin(domain: string) {
  const db = await getDB();

  const [allowedOrigins, store] = await Promise.all([
    getSingleDomain(db, domain),
    getStore(domain, db),
  ]);

  return {
    db,
    allowedOrigin: requireAllowedOrigin(allowedOrigins),
    store: requireStore(store),
  };
}

// ======================
// 5. Service Layer (business logic)
// ======================

class WidgetSettingsService {
  constructor(private repository: WidgetSettingsRepository) {}

  async getSettings(storeHash: string, productId: number): Promise<WidgetSettings> {
    const settings = await this.repository.findByStoreAndProduct(
      storeHash,
      productId
    );

    if (!settings) {
      throw new Error("Widget settings not found");
    }

    return settings;
  }
}

// ======================
// 6. Route Handlers (thin orchestration only)
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

export async function GET(request: NextRequest) {
  const domain = requireDomain(getSearchParams(request, "domain"));
  const { db, allowedOrigin, store } = await resolveStoreAndOrigin(domain);

  try {
    const origin = requireOrigin(request.headers.get("origin"));
    const headers = corsHeader(normalizeOrigin(origin), allowedOrigin);

    const productId = requireProductId(getSearchParams(request, "product_id"));

    // Dependency Injection
    const repository = new D1WidgetSettingsRepository(db);
    const service = new WidgetSettingsService(repository);

    const widgetSettings = await service.getSettings(
      store.storeHash,
      Number(productId)
    );

    return NextResponse.json(
      {
        success: true,
        data: widgetSettings,
      },
      { headers }
    );
  } catch (error) {
    return errorMessages(error, allowedOrigin);
  }
}


// import { NextRequest, NextResponse } from "next/server";
// import { getDB } from "../../../../../lib/db";
// import { getSingleDomain } from "@/lib/storedomain";
// import normalizeOrigin from "@/lib/normalizeorigin";
// import { corsHeader } from "@/lib/corsheaaders";
// import getSearchParams from "@/lib/getsearchparams";
// import { errorMessages } from "@/lib/errorMessage";
// import getStore from "@/lib/getstore";


// export const dynamic = 'force-dynamic';

// export async function OPTIONS(request: NextRequest){ 
//   const db = await getDB()
//   const doma = getSearchParams(request,'domain')
//   const domain = domainValidation(doma)
//   const allowedOrigins = await getSingleDomain(db, domain);
//   const origin = request.headers.get("origin") || "";
//    return new NextResponse(null,{ status:204,headers: corsHeader(normalizeOrigin(origin), allowedOrigins) })
// }


// interface WidgetSettings {
//   borderColor: string;
//   borderRadius: number;
//   product_ids: string;
//   name: string;
//   description: string;
//   widget_title: string;
//   store_hash: string;
//   id: number;
// }

// async function getWidgetSettings(db:D1Database, storeHash:string, prorduct_id:number):Promise<WidgetSettings | null> {
// return await db
//   .prepare(`
//       SELECT *
//       FROM widget_settings
//       WHERE store_hash = ?
//         AND EXISTS (
//           SELECT 1
//           FROM json_each(product_ids)
//           WHERE CAST(value AS INTEGER) = ?
//         )
//       LIMIT 1
//     `)
//   .bind(storeHash, prorduct_id)
//   .first();
  
// }

// async function getStorePromises(db:D1Database, domain:string){
//   return await Promise.all([
//     getSingleDomain(db, domain),
//     getStore(domain, db)
//   ]);
// }



// function dataValidation(data:WidgetSettings | null){
//   if(!data){
//     throw new Error("Widget settings not found");
//   }
//   return data
// }

// function validateStore(store:{accessToken: string , storeHash: string }){
//   if(!store?.storeHash || !store?.accessToken){
//     throw new Error("Store not found");
//   }
//   return store;
// }

// function validationOrigin(allowedOrigins:string){
//   if(!allowedOrigins){
//     throw new Error("Origin not allowed");
//   }
//   return allowedOrigins
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

// function validateId(productId:string | null){
//   if(!productId){
//     throw new Error("Product ID is required");
//   }
// return productId
// }

// export async function GET(req:NextRequest) {
  
//   const db = await getDB()

//   const domains = getSearchParams(req,'domain')
  
//   const domain = domainValidation(domains)
  
//   const [allowedOrigins, result] = await getStorePromises(db, domain);
  
//   const allowedOrigin = validationOrigin(allowedOrigins)
  
//   const origins = req.headers.get("origin");
  
//   const origin = validateOrigin(origins)

//   const product_id = getSearchParams(req,'product_id')

//   const productId = validateId(product_id)
          
//   const headers = corsHeader(normalizeOrigin(origin), allowedOrigin)

//     try {

//     const { storeHash } = validateStore(result)

//     const success:boolean = !!storeHash 

//     const data = await getWidgetSettings(db, storeHash, Number(productId));
    
//     const widgetSettings = dataValidation(data)

//     return NextResponse.json({
//       success,
//       data: widgetSettings,
//     } ,{headers});

//   } catch (error) {

//    errorMessages(error , allowedOrigin)
//   }
// }