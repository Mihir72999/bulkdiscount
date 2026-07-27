'use client'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactElement , useState } from 'react';
import ErrorMessage from '../../../components/error';
import Loading from '../../../components/loading';
import { useProductList } from '../../../lib/hooks';
import { TableItem } from '../../../types';
import { MoreHorizontal } from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from '../section/statCards';
import { BitcoinBagIcon, ChartAverageFreeIcons, Coins01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';



const Products = () => {
  
return (
  <div>
    <Card className="p-6">
    <div className="flex items-center justify-between">

        <div>
            <h1 className="text-3xl font-bold">
                Kaching Bundles
            </h1>

            <Badge
              variant="secondary"
              className="mt-3"
            >
                ● Store widget enabled
            </Badge>
        </div>

        <Button>
            Create bundle deal
        </Button>

    </div>
</Card>
<div className="grid gap-4 md:grid-cols-3">

    <StatsCard
        title="Added revenue"
        value="₹0"
        subtitle="24 hours"
        icon={<HugeiconsIcon icon={Coins01Icon} />}
    />

    <StatsCard
        title="Average order value"
        value="₹0"
        subtitle="24 hours"
        icon={<HugeiconsIcon icon={ChartAverageFreeIcons} />}
    />

    <StatsCard
        title="Orders with bundles"
        value="0%"
        subtitle="24 hours"
        icon={<HugeiconsIcon icon={BitcoinBagIcon} />}
    />

</div>
  </div>
)
};

export default Products;
