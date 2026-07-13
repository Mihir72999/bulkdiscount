import { bigcommerceClient, getSession } from '../../../../../../lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest , { params }: { params: Promise<{ orderId: string }> }) {
    const { orderId } = await params;

    try {
        const context = await getSession(req);
              if(!context?.accessToken){
            return NextResponse.json({message:'AccessToken Required'})
        }
        const bigcommerce = bigcommerceClient(context?.accessToken as string, context?.storeHash as string, 'v2');

           const shipping_addresses = await bigcommerce.get(`/orders/${orderId}/shipping_addresses`);
                const products =  await bigcommerce.get(`/orders/${orderId}/products`);

              return NextResponse.json({ shipping_addresses, products },{status:200});

               
    } catch (error) {
        const { message, response } = error as {message:string , response:any};
        return NextResponse.json({ message },{status:response.status || 500});
    }
}

export async function OPTION(req:NextRequest){
 return NextResponse.json({message: `Method ${req.method} is not Allowed`},{status:405, headers:{Allow:'GET'}})
}