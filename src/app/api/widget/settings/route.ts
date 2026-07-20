import { NextRequest, NextResponse } from "next/server";
import { getDB } from "../../../../../lib/db";
import { getSession } from "../../../../../lib/auth";

export const dynamic = "force-dynamic";
const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Headers": "*"
  }

export async function OPTIONS(){
   return new NextResponse(null,{ status:204,headers})
}


export async function POST(req: NextRequest) {

    try {
    const body = await req.json();
    const context = await getSession(req);
                   if(!context?.storeHash){
                 return NextResponse.json({message:'AccessToken Required'})
             }
    const { borderColor, borderRadius } = body as {borderColor:string , borderRadius:number};

    if (!borderColor || borderRadius === undefined) {
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
const settings = await db
  .prepare(
    "SELECT id FROM widget_settings WHERE store_hash = ?"
  )
  .bind(storeHash)
  .first();

if (storeHash && settings) {
  await db
    .prepare(`
      UPDATE widget_settings
      SET border_color = ?, border_radius = ?
      WHERE store_hash = ?
    `)
    .bind(borderColor, borderRadius, storeHash)
    .run();
} else {
  await db
    .prepare(`
      INSERT INTO widget_settings (
        store_hash,
        border_color,
        border_radius
      )
      VALUES (?, ?, ?)
    `)
    .bind(storeHash, borderColor, borderRadius)
    .run();
}

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

export async function GET(req:NextRequest) {
        const domain = req.nextUrl.searchParams.get('domain')

    try {
 const db = await getDB()
const result = await db.prepare('SELECT storeHash from stores WHERE domain = ?').bind(domain).first<{storeHash:string | null}>()
const storeHash = result?.storeHash
const settings = await db
  .prepare(
    "SELECT id FROM widget_settings WHERE store_hash = ?"
  )
  .bind(storeHash)
  .first();
    return NextResponse.json({
      success: true,
      data: settings,
    } ,{headers});
  } catch (error) {

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong.",
      },
      { status: 500 , headers}
    );
  }
}