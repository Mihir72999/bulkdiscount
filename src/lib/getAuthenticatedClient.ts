import { NextRequest } from "next/server";
import BigCommerce from "node-bigcommerce";
import { bigcommerceClient, getSession } from "../../lib/auth";

export async function getAuthenticatedClient(req: NextRequest): Promise<BigCommerce> {
  const session = await getSession(req);

  if (!session?.accessToken || !session?.storeHash) {
    throw new Error("AccessToken Required");
  }

  const client = bigcommerceClient(session.accessToken, session.storeHash);

  if (!client) {
    throw new Error("Bigcommerce Client Not Found");
  }

  return client;
}
