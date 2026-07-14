import * as jwt from 'jsonwebtoken';
import BigCommerce from "node-bigcommerce";
import { ApiConfig, QueryParams, SessionContextProps, SessionProps } from '../types';
import { deleteStore, deleteUser, getStoreToken, hasStoreUser, setStore, setStoreUser, setUser } from './dbs/mysql';
import { NextRequest } from 'next/server';
import { getEnv } from './env';

// const {env } = await getCloudflareContext({async:true})
const env = await getEnv();
const { API_URL, AUTH_CALLBACK, CLIENT_ID, CLIENT_SECRET, JWT_KEY, LOGIN_URL } = env;

// Used for internal configuration; 3rd party apps may remove
const apiConfig: ApiConfig = {};

if (API_URL && LOGIN_URL) {
    apiConfig.apiUrl = API_URL;
    apiConfig.loginUrl = LOGIN_URL;
}

// Create BigCommerce instance
// https://github.com/bigcommerce/node-bigcommerce/
if(!CLIENT_SECRET) throw new Error('client secret is required ')
const bigcommerce = new BigCommerce({
    logLevel: 'info',
    clientId: CLIENT_ID,
    secret: CLIENT_SECRET,
    callback: AUTH_CALLBACK!,
    responseType: 'json',
    headers: { 'Accept-Encoding': '*' },
    apiVersion: 'v3',
    ...apiConfig,
});
const bigcommerceSigned = new BigCommerce({
    secret: CLIENT_SECRET,
    responseType: 'json',
    // apiVersion: 'v3',
    // ...apiConfig,
});

export function bigcommerceClient(accessToken: string, storeHash: string, apiVersion: 'v2' | 'v3' = 'v3') {
    return new BigCommerce({
        clientId: CLIENT_ID,
        accessToken,
        storeHash,
        responseType: 'json',
        apiVersion,
        ...apiConfig,
    });
}

// Authorizes app on install
export function getBCAuth(query: QueryParams) {
    return bigcommerce.authorize(query);
}
// Verifies app on load/ uninstall
export function getBCVerify({ signed_payload_jwt }: QueryParams) {
    const token = Array.isArray(signed_payload_jwt) ? signed_payload_jwt[0] : signed_payload_jwt;
    if (!token || typeof token !== 'string') {
        throw new Error('signed_payload_jwt is required and must be a string');
    }
    return bigcommerceSigned.verifyJWT(token);
}

export async function setSession(session: SessionProps) {
   await setUser(session);
    await setStore(session);
    await setStoreUser(session);
}

export async function getSession(req: NextRequest) {
    const context = req.nextUrl.searchParams.get('context') || ""
    if (typeof context !== 'string') return;
    const { context: storeHash, user } = decodePayload(context) as SessionProps;
    const hasUser = await hasStoreUser(storeHash, String(user?.id));

    // Before retrieving session/ hitting APIs, check user
    if (!hasUser) {
        throw new Error('User is not available. Please login or ensure you have access permissions.');
    }

    const accessToken = await getStoreToken(storeHash);
    if (!accessToken) {
    throw new Error("Access token not found");
}
    return { accessToken, storeHash, user };
}

// JWT functions to sign/ verify 'context' query param from /api/auth||load
export function encodePayload({ user, owner, ...session }: SessionProps) {
    
    const contextString = session?.context ?? session?.sub;
    const context = contextString.split('/')[1] || '';

    return jwt.sign({ context, user, owner }, JWT_KEY, { expiresIn: '24h' });
}
// Verifies JWT for getSession (product APIs)
export function decodePayload(encodedContext: string) {
    return jwt.verify(encodedContext, JWT_KEY);
}

// Removes store and storeUser on uninstall
export async function removeDataStore(session: SessionProps) {
    await deleteStore(session);
    await deleteUser(session);
}

// Removes users from app - getSession() for user will fail after user is removed
export async function removeUserData(session: SessionProps) {
    await deleteUser(session);
}

// Removes user from storeUsers on logout
export async function logoutUser({ storeHash, user }: SessionContextProps) {
    const session = { context: `store/${storeHash}`, user };
    await deleteUser(session);
}

export async function registeredWebhook(accessToken: string, storeHash: string, scope: string, path: string) {
      const { data } = await bigcommerceClient(accessToken, storeHash).get('/hooks');

  const exists = data.some(
    (hook: any) =>
      hook.scope === scope &&
      hook.destination === path
  );

  if (!exists) {
  return await bigcommerceClient(accessToken, storeHash).post('/hooks', {
      scope,
      destination: path,
      is_active: true,
    });

  }
  
   return exists;   
}
