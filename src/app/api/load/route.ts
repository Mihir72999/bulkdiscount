import { NextRequest, NextResponse } from 'next/server';
import {
    encodePayload,
    getBCVerify,
    setSession
} from '../../../../lib/auth';
import { getEnv } from '../../../../lib/env';

const buildRedirectUrl = (
    url: string,
    encodedContext: string
) => {
    const [path, query = ''] = url.split('?');

    const queryParams = new URLSearchParams(
        `context=${encodedContext}&${query}`
    );

    return `${path}?${queryParams}`;
};

export async function GET(req: NextRequest) {
    const env  = await getEnv()

    const APP_URL = env.APP_URL;

    if (!APP_URL) {
        throw new Error('APP_URL not found');
    }

    try {
        const query = Object.fromEntries(
            req.nextUrl.searchParams.entries()
        );

        const session = await getBCVerify(query);

        const encodedContext = encodePayload(session);

        await setSession(session);

        await fetch(
            `${APP_URL}/api/script?context=${encodedContext}`
        ).then(res=>res.json());


        return NextResponse.redirect(
            new URL(
            buildRedirectUrl(
                session.url,
                encodedContext
            ) , env.APP_URL),
            { status: 302 }
        );
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