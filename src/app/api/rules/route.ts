import { NextRequest,NextResponse } from "next/server";
import { getSession , bigcommerceClient } from "../../../../lib/auth";


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
    const context = await getSession(req);
                   if(!context?.accessToken){
                 return NextResponse.json({message:'AccessToken Required'}, {status:400})
             }
            return NextResponse.json({message:'ok'})
 } catch (error) {
    
 }   
}
