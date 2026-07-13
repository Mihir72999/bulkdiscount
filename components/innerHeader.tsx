'use client';

import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from 'next/navigation';
import { useProductList } from '../lib/hooks';
import { TabIds, TabRoutes } from './header';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const InnerHeader = () => {
    const router = useRouter();
    const params = useParams();

    const pid = params.pid as string;

    const { list = [] } = useProductList();

    const { name } =
        list.find((item: any) => item.id === Number(pid)) ?? {};

    const handleBackClick = () => {
        router.push(TabRoutes[TabIds.PRODUCTS]);
    };

    return (
        <div className="mb-10">
            <Button
                variant="ghost"
                onClick={handleBackClick}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
            >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-semibold">
                    Products
                </span>
            </Button>

            {name && (
                <h1 className="text-3xl font-bold mb-6">
                    {name}
                </h1>
            )}
             <Separator />
            <hr className="border-gray-300" />
        </div>
    );
};

export default InnerHeader;