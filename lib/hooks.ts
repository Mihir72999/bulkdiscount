'use client';
import useSWR from 'swr';
import { useSession } from '../context/session';
import { mockDiscounts } from "../lib/dbs/mokeDiscounts";
import { ErrorProps, ListItem, Order,  QueryParams, ShippingAndProductsInfo } from '../types';

export async function getDiscountRules(productId:number){

    const rules = mockDiscounts.filter(

        item=>item.productId===productId

    );

    return rules.sort(

        (a,b)=>a.quantity-b.quantity

    );

}

async function fetcher<T>([url , query]: [string, string]):Promise<T> {

const APP_URL = "https://bgcom.mihir72999.workers.dev"
    const res = await fetch(`${APP_URL}/${url}?${query}`);
    const text = await res.text() as string;
    // If the status code is not in the range 200-299, throw an error
    if (!res.ok) {
     throw new Error(`HTTP ${res?.status}: ${text}`);
    }

    return JSON.parse(text)
}

// Reusable SWR hooks
// https://swr.vercel.app/
export function useProducts() {
    const { context } = useSession();
    const params = new URLSearchParams({ context }).toString();
    // Request is deduped and cached; Can be shared across components
    const { data, error } = useSWR(context ? ['/api/products', params] : null, fetcher);
    
    return {
        summary: data,
        isLoading: !data && !error,
        error,
    };
}

export function useProductList(query?: QueryParams) {
    

    const { context } = useSession();
    const params = new URLSearchParams({ ...query, context }).toString();

    // Use an array to send multiple arguments to fetcher

    const { data, error, mutate: mutateList } = useSWR<any,ErrorProps>(context ? ['/api/products/list', params] : null, fetcher);

    return {
        list: data?.data,
        meta: data?.meta,
        isLoading: !data && !error,
        error,
        mutateList,
    };
}

export function useProductInfo(pid: number, list?:ListItem[]) {
    const { context } = useSession();
    const params = new URLSearchParams({ context }).toString();

    let product: ListItem | undefined; 

    if (list?.length) { 
       product = list.find(item => item.id === pid);
    }

    // Conditionally fetch product if it doesn't exist in the list (e.g. deep linking)
    const { data, error } = useSWR<any,ErrorProps>(!product && context ? [`/api/products/${pid}`, params] : null, fetcher);

    return {
        product: product ?? data,
        isLoading: product ? false : (!data && !error),
        error,
    };
}

export const useOrder = (orderId: number) => {
    const { context } = useSession();
    const params = new URLSearchParams({ context }).toString();
    const shouldFetch = context && orderId !== undefined;

    // Conditionally fetch orderId is defined
    const { data, error } = useSWR<Order, ErrorProps>(shouldFetch ? [`/api/orders/${orderId}`, params] : null, fetcher);

    return {
        order: data,
        isLoading: !data && !error,
        error,
    };
}

export const useShippingAndProductsInfo = (orderId: number) => {
    const { context } = useSession();
    const params = new URLSearchParams({ context }).toString();
    const shouldFetch = context && orderId !== undefined;

    // Shipping addresses and products are not included in the order data and need to be fetched separately
    const { data, error } = useSWR<ShippingAndProductsInfo, ErrorProps>(
        shouldFetch ? [`/api/orders/${orderId}/shipping_products`, params] : null, fetcher
    );

    return {
        order: data,
        isLoading: !data && !error,
        error,
    };
}

