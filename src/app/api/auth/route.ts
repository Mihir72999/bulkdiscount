import { NextRequest, NextResponse } from "next/server";
import {
  encodePayload,
  getBCAuth,
  setSession,
} from "../../../../lib/auth";

export async function GET(req: NextRequest) {
  try {
    // Convert query params to object (replacement for req.query)
    const query = Object.fromEntries(
      req.nextUrl.searchParams.entries()
    );

    // Authenticate app installation
    const session = await getBCAuth(query);

    // Create signed context JWT
    const encodedContext = encodePayload(session);

    // Store session
    await setSession(session);

    // Redirect to app homepage
    return NextResponse.redirect(
      `/?context=${encodedContext}`,
      { status: 302 }
    );
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