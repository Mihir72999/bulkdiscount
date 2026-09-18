import { NextRequest,NextResponse } from "next/server";
import { bigcommerceClient, getSession } from "../../../../../lib/auth";
import { messageError } from "@/lib/errorMessage";
import { getAuthenticatedClient } from "@/lib/getAuthenticatedClient";
import BigCommerce from "node-bigcommerce";

interface BodyData {
quantity_min:number
quantity_max:number
type:string
amount:number
}

interface BulkPricingRuleInput {
  quantity_min: number;
  quantity_max: number;
  type: "percent" | "fixed" | "price";
  amount: number;
}

interface PricingRuleClient {

  createBulkPricingRule(
    productId: string,
    rule: BulkPricingRuleInput
  ): Promise<BodyData>;
}

interface PricingRuleClientPut{
    createBulkPricingRule(
    productId: string,
    ruleId:string,
    rule: BulkPricingRuleInput
  ): Promise<BodyData>;
}

class BigCommercePricingRuleClient implements PricingRuleClient {
  constructor(private client: BigCommerce) {}

  async createBulkPricingRule(
    productId: string,
    rule: BulkPricingRuleInput
  ): Promise<BodyData> {
    const response = await this.client.post(
      `/catalog/products/${productId}/bulk-pricing-rules`,
      {
        quantity_min: rule.quantity_min,
        quantity_max: rule.quantity_max,
        type: rule.type,
        amount: rule.amount,
      }
    );

    return response.data;
  }
}
 async function getBulkPricingRule(productId: string , client:BigCommerce){
 return await client.get(
  `/catalog/products/${productId}/bulk-pricing-rules`
);
  }

class BigCommercePricingRulePostClient implements PricingRuleClientPut {
  constructor(private client: BigCommerce) {} 

  async createBulkPricingRule(
    productId: string,
    ruleId:string,
    rule: BulkPricingRuleInput
  ): Promise<BodyData> {
    const response = await this.client.put(
      `/catalog/products/${productId}/bulk-pricing-rules/${ruleId}`,
      {
        quantity_min: rule.quantity_min,
        quantity_max: rule.quantity_max,
        type: rule.type,
        amount: rule.amount,
      }
    );

    return response.data;
  }
}

class BulkPricingRulePutService {
  constructor(private client: PricingRuleClientPut) {}

  /**
   * Creates multiple bulk pricing rules for a product.
   * Uses Promise.all for better performance.
   */

  async createRules(
    productId: string,
    ruleId:string,
    rules: BulkPricingRuleInput[],

  ): Promise<BodyData[]> {
    const promises = rules.map((rule) =>
      this.client.createBulkPricingRule(productId, ruleId, rule)
    );

    return Promise.all(promises);
  }
}

class BulkPricingRuleService {
  constructor(private client: PricingRuleClient) {}

  /**
   * Creates multiple bulk pricing rules for a product.
   * Uses Promise.all for better performance.
   */

  async createRules(
    productId: string,
    rules: BulkPricingRuleInput[]
  ): Promise<BodyData[]> {
    const promises = rules.map((rule) =>
      this.client.createBulkPricingRule(productId, rule)
    );

    return Promise.all(promises);
  }
}

export async function POST(req:NextRequest , { params }: { params: Promise<{ productId: string }> }){
  const {productId} = await params
    try {
           const bigcommerce = await getAuthenticatedClient(req)
   
           const body = await req.json() as BulkPricingRuleInput[];
   
           const pricingClient = new BigCommercePricingRuleClient(bigcommerce);
   
           const service = new BulkPricingRuleService(pricingClient); 
   
           const results = await service.createRules(productId, body);              
   
           return NextResponse.json(results,{status:200})

               } catch (error) {

                return messageError(error)
               
              }   
}

export async function PUT(req:NextRequest , { params }: { params: Promise<{ productId: string }> }){
  const {productId} = await params
 try {
    const bigcommerce = await getAuthenticatedClient(req);

    const { data: rules } = await getBulkPricingRule(productId, bigcommerce)
  const ruleId = rules[0]?.id
  const body = await req.json() as BulkPricingRuleInput[]
  const pricingClient = new BigCommercePricingRulePostClient(bigcommerce)
  const service = new BulkPricingRulePutService(pricingClient)
   const datas =  service.createRules(productId,ruleId,body)
     return NextResponse.json(datas, { status: 200 });  
 } catch (error) {
     return messageError(error)
 }
}


export async function GET(req:NextRequest, { params }: { params: Promise<{ productId: string }> } ){
   const {productId} = await params
    try {
            const bigcommerce = await getAuthenticatedClient(req);
           const { data } = await getBulkPricingRule(productId,bigcommerce)                    
            return NextResponse.json(data)
         } catch (error) {
           messageError(error)
        }   
}