'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import InnerHeader from './innerHeader';
import {Tabs, TabsList,TabsContent,TabsTrigger} from '@/components/ui/tabs'
export const TabIds = {
    HOME: 'home',
    PRODUCTS: 'products',
};

export const TabRoutes = {
    [TabIds.HOME]: '/',
    [TabIds.PRODUCTS]: '/products',
};

const HeaderlessRoutes = [
    '/orders/[orderId]',
    '/orders/[orderId]/labels',
    '/orders/[orderId]/modal',
    '/productAppExtension/[productId]',
];

const InnerRoutes = [
    '/products/[pid]',
];

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();

    const isHeaderless = HeaderlessRoutes.some(route =>
        pathname.startsWith(route.replace(/\[.*?\]/g, ''))
    );

    const isInner = InnerRoutes.some(route =>
        pathname.startsWith(route.replace(/\[.*?\]/g, '/products/'))
    );

    useEffect(() => {
        router.prefetch('/products');
    }, [router]);

    if (isHeaderless) return null;

    if (isInner) {
        return <InnerHeader />;
    }

  const currentTab =
    pathname.startsWith('/products')
      ? 'Products'
      : 'Home';


    return (
            <div className="mb-8 border-b pb-2">
      <Tabs value={currentTab}>
        <TabsList>
          <TabsTrigger value="Home" >
            <Link href="/">Home</Link>
          </TabsTrigger>

          <TabsTrigger value="Products" >
            <Link href="/products">Products</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
    );
}