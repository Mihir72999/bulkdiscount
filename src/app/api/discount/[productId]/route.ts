import { NextRequest, NextResponse  } from "next/server";
import { bigcommerceClient } from "../../../../../lib/auth";
import { getDB } from "../../../../../lib/db";
export const dynamic = 'force-dynamic';
const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Accept, ngrok-skip-browser-warning",
  }
export async function GET(
    request:NextRequest ,
    { params }: { params: Promise<{ productId: string }> }
){
  try {
    
  const {productId} = await params  
  const db = await getDB()
   const domain = request.nextUrl.searchParams.get('domain')

const store = await db.prepare("SELECT accessToken, storeHash FROM stores WHERE domain = ?").bind(domain).first()  as {
  accessToken: string;
  storeHash: string;
};


const sql = `
    SELECT *
    FROM discountedProduct
    WHERE storeHash = ?
    AND productId = ?
    ORDER BY quantity ASC
`;
const values = [store?.storeHash, productId];

const { results: rows } = await db.prepare(sql).bind(values).run();
const bigcommerce = bigcommerceClient(store?.accessToken, store?.storeHash);
const response = await bigcommerce.get(
  `/catalog/products/${productId}/bulk-pricing-rules`
)
if(!response.data || response.data.length === 0){
await db.prepare(`
  DELETE FROM discountedProduct
  WHERE productId = ?
`)
.bind(productId)
.run();
return NextResponse.json({
      success: false,
      rules: [],
    },{status:200 , headers:headers});
}
const match:boolean =
  response.length === rows.length - 1 &&
  response.every((bc:any) =>
    rows.some(db =>
      db.quantity === bc.quantity_min &&
      Number(db.discount) === Number(bc.amount)
    )
  );
 if(match === Boolean(0)) {
   const sql2 = `
  DELETE FROM discountedProduct
  WHERE productId = ?
`;
  await db.prepare(sql2).bind(sql2).run()
  const values1 = response.data.map((rule:any) => [
    store.storeHash,
    Number(productId),
    rule.quantity_min,
    rule.amount,
    rule.type,
    `${rule.amount} % OFF`,
  ])
    if (response.data[0]?.type === "percent") {
  values1.unshift([store.storeHash, Number(productId), 1, 0, "percent", "single"]);
}
  await db.prepare(`INSERT INTO discountedProduct
      (storeHash, productId, quantity, discount, discountType, label) VALUES ? ? ? ? ? ?`).bind(values1).run()
}
    const { results: rules } = await db.prepare(sql).bind(values).run();
   return NextResponse.json({
    succes:true,
    rules
   },{headers})
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


export async function OPTION(){
   return NextResponse.json(null,{ status:204,headers})
}

