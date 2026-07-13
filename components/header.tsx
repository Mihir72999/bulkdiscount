'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import InnerHeader from './innerHeader';

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

    const items = [
        { id: TabIds.HOME, title: 'Home', href: '/' },
        { id: TabIds.PRODUCTS, title: 'Products', href: '/products' },
    ];

    return (
        <div className="mb-10 border-b border-gray-200">
            <nav className="flex gap-8">
                {items.map((item) => {
                    const active = pathname === item.href;

                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`pb-4 border-b-2 transition-colors ${
                                active
                                    ? 'border-blue-600 text-blue-600 font-medium'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {item.title}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}