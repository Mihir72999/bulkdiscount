// lib/installScript.ts
import { bigcommerceClient } from "./auth";
import { getDB } from "./db";
import { getEnv } from "./env";
export async function installScript(
  accessToken: string,
  storeHash: string
) {
   const env = await getEnv()
    
  const { APP_URL }= env

  if (!APP_URL) {
    throw new Error("APP_URL environment variable is not defined");
  }

  const bigcommerce = bigcommerceClient(
    accessToken,
    storeHash
  );

  // Get existing scripts
  const { data: scripts } = await bigcommerce.get(
    "/content/scripts"
  );

  const existingScript = scripts.find(
    (script: any) => script.name === "Variant Enhancer"
  );

  if (existingScript) {
    return {
      success: true,
      message: "Script already installed.",
      script: existingScript,
    };
  }

  // Create Script Manager entry
  const { data: createdScript } = await bigcommerce.post(
    "/content/scripts",
    {
      name: "Variant Enhancer",
      description: "Quantity Discount Widget",
      kind: "src",
      src: `${APP_URL}/widget.js`,
      auto_uninstall: true,
      load_method: "default",
      location: "footer",
      visibility: "storefront",
    }
  );

  return {
    success: true,
    message: "Script installed successfully.",
    script: createdScript,
  };
}

export async function getAccessTokenByStoreHash(
  storeHash: string
) {
  const db = await getDB()  
  const rows = await db.prepare(
    `SELECT accessToken
     FROM stores
     WHERE storeHash = ?`
    ).bind(storeHash)
    .first<{accessToken:string}>()
    ;

  if (!rows) {
    throw new Error("Store session not found");
  }

  return rows?.accessToken;
}