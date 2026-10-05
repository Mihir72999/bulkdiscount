import { NextRequest, NextResponse } from "next/server";
import { getDB } from "../lib/db";
import normalizeOrigin from "@/lib/normalizeorigin";
import getStore from "@/lib/getstore";
import { getSession } from "../lib/auth";

export async function proxy(request: NextRequest) {
  const headers = new Headers(request.headers); 

  const origin = request.headers.get("origin");
  const db = await getDB();
  // Same-origin / server-to-server / no Origin header
  if (!origin) {
    const session = await getSession(request);
  headers.set("x-store-hash", session?.storeHash || "");
  headers.set("x-access-token", session?.accessToken || "");    
    return NextResponse.next();
  }
  
  const appOrigin = request.nextUrl.origin;
  
  // Same-origin request
  if (normalizeOrigin(origin) === normalizeOrigin(appOrigin)) {
    const session = await getSession(request);
    headers.set("x-store-hash", session?.storeHash || "");
    headers.set("x-access-token", session?.accessToken || "");
    return NextResponse.next();
  }

  // Cross-origin request
  const store = await getStore(origin , db);
  const valid = validateOrigin(store)
  
  if (!valid) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "Invalid store origin",
      }),
      {

        status: 403,
        headers: {
          "content-type": "application/json",
        },
      }
    );
  }
 
  headers.set("x-store-hash", store.storeHash);
  headers.set("x-access-token", store.accessToken);
  return NextResponse.next();
}

function validateOrigin(store:{storeHash:string, accessToken:string} | null){
 return !!store
}


export const config = {
  matcher: [ "/api/discounts/:path*" ],
}

            // "/api/cart/*", 
            // "/api/widgets/*", 
            // "/api/widget/*" , 
            // "/api/products/*", 
            // "/api/orders/*" , 
            // "/api/rules/*",
            // "/api/script/*",
            // "/api/uninstall/*",