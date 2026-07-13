import { NextRequest, NextResponse } from "next/server";
import { getBCVerify, removeDataStore } from "../../../../lib/auth";

export async function GET(req: NextRequest) {
    try {
        // Equivalent of req.query
        const query = Object.fromEntries(
            req.nextUrl.searchParams.entries()
        );

        const session = await getBCVerify(query);

        await removeDataStore(session);

        return new NextResponse(null, {
            status: 200,
        });
    } catch (error) {
        const { message, response } = error as {
            message: string;
            response?: { status?: number };
        };

        return NextResponse.json(
            { message },
            {
                status: response?.status ?? 500,
            }
        );
    }
}