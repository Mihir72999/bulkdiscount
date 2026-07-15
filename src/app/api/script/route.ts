// app/api/script/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth";
import { installScript } from "../../../../lib/installScript";

export async function GET(request: NextRequest) {
    const context = request.nextUrl.searchParams.get("context");

    if (!context) {
        return NextResponse.json(
            {
                success: false,
                message: "Missing context",
            },
            {
                status: 400,
            }
        );
    }

    try {
        const { accessToken, storeHash } = await getSession(request) as {accessToken:string, storeHash: string};

        const result = await installScript(
            accessToken,
            storeHash
        );

        return NextResponse.json(result);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to install script",
            },
            {
                status: 500,
            }
        );
    }
}