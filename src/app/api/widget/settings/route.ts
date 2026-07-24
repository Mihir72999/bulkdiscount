import { NextRequest, NextResponse } from "next/server";
import { getDB } from "../../../../../lib/db";
import { getSession } from "../../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {

    try {
    const body = await req.json();
    const context = await getSession(req);
                   if(!context?.storeHash){
                 return NextResponse.json({message:'AccessToken Required'})
             }
         
    const { 
      borderColor, 
      borderRadius,
      product_ids,
      name,
      description,
      widget_title    
    } = body as {
      borderColor:string, 
      borderRadius:number,
      product_ids:string,
      name:string,
      description:string
      widget_title:string
    };

    if (!borderColor || borderRadius || product_ids === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: "borderColor and borderRadius are required.",
        },
        { status: 400 }
      );
    }
   
const db = await getDB()

const storeHash = context?.storeHash
const {results:settings} = await db
  .prepare(
    "SELECT product_ids FROM widget_settings WHERE store_hash = ?"
  )
  .bind(storeHash)
  .all<{product_ids:string}>();
const bodyProductIds = JSON.parse(product_ids);

const bodySet = new Set(bodyProductIds);

const exists = settings.some(row => {
  const dbProductIds = JSON.parse(row.product_ids) as number[];

  return dbProductIds.some(id => bodySet.has(id));
});

if (storeHash && exists) {
 return NextResponse.json({success:false , data:[]}) 
} 
  await db
    .prepare(`
      INSERT INTO widget_settings (
        store_hash,
        border_color,
        border_radius,
        product_ids,
        name,
        description,
        widget_title
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(storeHash, borderColor, borderRadius , product_ids, name, description, widget_title)
    .run();


    return NextResponse.json({
      success: true,
      data: {
        borderColor,
        borderRadius,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong.",
      },
      { status: 500}
    );
  }
}

// await db
//     .prepare(`
//       UPDATE widget_settings
//       SET border_color = ?, border_radius = ?, name = ?, description = ?, widget_title = ?
//       WHERE store_hash = ?
//     `)
//     .bind(borderColor, borderRadius, name, description , widget_title, storeHash )
//     .run();