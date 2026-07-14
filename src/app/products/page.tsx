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
const Products = () => {
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const router = useRouter();
    const { error, isLoading, list = [] , meta={}} = useProductList(
      {
      page: String(currentPage),
      limit: String(itemsPerPage),
    }
  );
    // const itemsPerPageOptions = [10, 20, 50, 100];
    const tableItems: TableItem[] = list.map(({ id, inventory_level: stock, name, price }:{id:any,inventory_level:any,name:any,price:any}) => ({
        id,
        name,
        price,
        inventory_level: stock,
    }));
    const totalItems =  meta?.pagination?.total ?? 0;
const totalPages = Math.ceil(totalItems / itemsPerPage);
    const onItemsPerPageChange = (newRange:any) => {
        setCurrentPage(1);
        setItemsPerPage(newRange);
    };

    // const onSort = (newColumnHash: string, newDirection: TableSortDirection) => {
    //     setColumnHash(newColumnHash === 'stock' ? 'inventory_level' : newColumnHash);
    //     setDirection(newDirection);
    // };

    const renderName = (id: number, name: string): ReactElement => (
        <Link href={`/products/${id}`}
           className="font-medium text-primary hover:underline"
        >
            {name}
        </Link>
    );

    const renderPrice = (price: number): string => (
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
    );

    const renderInventoryLevel = (inventory_level: number) =>
  inventory_level > 0 ? (
    <Badge variant="secondary">
      {inventory_level}
    </Badge>
  ) : (
    <Badge variant="destructive">
      Out of stock
    </Badge>
  );

    const renderAction = (id: number) => (
  <DropdownMenu>
    <DropdownMenuTrigger>
      <Button className={'cursor-pointer'} variant="ghost" size="icon">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent className={'bg-white text-gray-700'} align="end">
      <DropdownMenuItem
        onClick={() => router.push(`/products/${id}`)}
      >
        Edit Product
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

    if (isLoading) return <Loading />;
    if (error) return <ErrorMessage error={error} />;

return (
  <Card>
    <CardContent className="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Name</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Price</TableHead>
            <TableHead className="w-[60px]" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {tableItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                {renderName(item.id, item.name)}
              </TableCell>

              <TableCell>
                {renderInventoryLevel(
                  item.inventory_level
                )}
              </TableCell>

              <TableCell>
                {renderPrice(item.price)}
              </TableCell>

              <TableCell className='cursor-pointer'>
                {renderAction(item.id)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>    
      <div className="flex items-center justify-between px-4 py-4">
  <div className="flex items-center gap-2">
    <span className="text-sm text-muted-foreground">
      Rows per page
    </span>

    <Select
      value={String(itemsPerPage)}
      onValueChange={(value:any) => onItemsPerPageChange(value)}
    >
      <SelectTrigger className="w-[90px] cursor-pointer">
        <SelectValue />
      </SelectTrigger>

      <SelectContent className={'dark:bg-white dark:text-gray-700'}>
        <SelectItem value="10">10</SelectItem>
        <SelectItem value="20">20</SelectItem>
        <SelectItem value="50">50</SelectItem>
        <SelectItem value="100">100</SelectItem>
      </SelectContent>
    </Select>
  </div>

  <div className="flex items-center gap-4">
    <span className="text-sm text-muted-foreground">
      Page {currentPage} of {totalPages}
    </span>

    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
          size={'default'}
            onClick={() => {
              if (currentPage > 1) {
                setCurrentPage(currentPage - 1);
              }
            }}
            className={
              currentPage === 1
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
          />
        </PaginationItem>

        <PaginationItem>
          <PaginationNext
          size={'default'}
            onClick={() => {
              if (currentPage < totalPages) {
                setCurrentPage(currentPage + 1);
              }
            }}
            className={
              currentPage === totalPages
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  </div>
</div>  
    </CardContent>
  </Card>
);
};

export default Products;
