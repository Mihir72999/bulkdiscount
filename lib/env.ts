import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function getEnv() {
    const { env } = await getCloudflareContext({ async: true });

    return env;
}


export async function getCtx() {
    const { ctx } = await getCloudflareContext({ async: true });

    return ctx;
}