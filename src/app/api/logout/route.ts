import { NextRequest, NextResponse } from "next/server";
import { getSession, logoutUser } from "../../../../lib/auth";

export async function POST(req: NextRequest) {
    try {
        const session = await getSession(req);
          if (!session) {
       return NextResponse.json(
        { message: "Session not found" },
        { status: 401 }
        );
       }

        await logoutUser(session);

        return new NextResponse(null, { status: 200 });
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