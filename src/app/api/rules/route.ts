import { NextRequest,NextResponse } from "next/server";
import { getSession , bigcommerceClient } from "../../../../lib/auth";
import { getDB } from "../../../../lib/db";


export async function POST(req: NextRequest) {
  try {
    const context = await getSession(req);

    if (!context?.accessToken) {
      return NextResponse.json(
        { message: "AccessToken Required" },
        { status: 401 }
      );
    }

    const { productIds } = (await req.json()) as {
      productIds: number[];
    };

    const bigcommerce = bigcommerceClient(
      context.accessToken,
      context.storeHash,
      "v3"
    );

    const pricingRules: Record<number, boolean> = {};

    for (const productId of productIds) {
      try {
        const { data } = await bigcommerce.get(
          `/catalog/products/${productId}/bulk-pricing-rules`
        );

        pricingRules[productId] = data.length > 0;
      } catch {
        // If the request fails, treat it as having no rules
        pricingRules[productId] = false;
      }
    }

    return NextResponse.json(pricingRules);
  } catch (error) {
    const { message, response } = error as {
      message: string;
      response?: { status?: number };
    };

    return NextResponse.json(
      { message },
      { status: response?.status ?? 500 }
    );
  }
}

export async function GET(req:NextRequest){
 try {
   const db = await getDB()
    const context = await getSession(req);
                   if(!context?.accessToken){
                 return NextResponse.json({message:'AccessToken Required'}, {status:400})
             }
   const bigcommerce = bigcommerceClient(
      context.accessToken,
      context.storeHash,
      "v3"
    );     
      const {results} = await db.prepare('select * from widget_settings where store_hash = ?').bind(context?.storeHash).run()
 const productSettings = await Promise.all(
  results.map(async (val) => {
    const productIds: number[] = JSON.parse(val.product_ids as string);
   const ruleDatas = await Promise.all(
      productIds.map(async(productId) =>
        await bigcommerce.get(`/catalog/products/${productId}/bulk-pricing-rules`)
      )
    );
  
    const product = await productResult(productIds);
  
    return {
      ...val,
      product,
      rules:ruleDatas
    };
  })
);


async function productResult(productIds:number[]){
  const response = await bigcommerce.get(
      `/catalog/products?id:in=${productIds.join(",")}&include_fields=id,name`
  );
  return response.data
}


  return NextResponse.json(productSettings)
 } catch (error) {
    const { message, response } = error as {
      message: string;
      response?: { status?: number };
    };

    return NextResponse.json(
      { message },
      { status: response?.status ?? 500 }
    );
 }   
}
