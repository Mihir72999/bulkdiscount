declare module "node-bigcommerce" {
  export interface ApiConfig {
    apiUrl?: string;
    loginUrl?: string;
  }

  export type BigCommerceConfig = {
    logLevel?: "info" | "warn" | "error" | "debug";
    clientId?: string;
    callback?: string;
    responseType?: "json" | "xml";
    headers?: Record<string, string>;
    secret?: string;
    apiUrl?: string;
    loginUrl?: string;
    apiVersion?: "v2" | "v3" | undefined;
    accessToken?: string;
    storeHash?: string;
  };

  export default class BigCommerce {
    constructor(config: BigCommerceConfig);

    get(
      path: string,
      params?: Record<string, any>
    ): Promise<any>;

    post(
      path: string,
      data?: any
    ): Promise<any>;

    put(
      path: string,
      data?: any
    ): Promise<any>;

    delete(
      path: string
    ): Promise<any>;

    verifyJWT(token: string): Promise<any>;

    authorize(
      query: Record<string, any>
    ): Promise<any>;
  }
}