import { NextRequest, NextResponse } from "next/server";
import { getDB } from "../../../../../lib/db";

const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Headers": "*"
  }

export async function OPTIONS(){
   return new NextResponse(null,{ status:204,headers})
}

export async function GET(req:NextRequest) {
        const domain = req.nextUrl.searchParams.get('domain')

    try {
 const db = await getDB()
const result = await db.prepare('SELECT storeHash from stores WHERE domain = ?').bind(domain).first<{storeHash:string | null}>()
const storeHash = result?.storeHash
const settings = await db
  .prepare(
    "SELECT * FROM widget_settings WHERE store_hash = ?"
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