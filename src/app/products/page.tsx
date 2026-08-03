'use client'
import { useRouter } from 'next/navigation';
import { useState , useEffect} from 'react';
import Loading from '../../../components/loading';
import { useGetProductSettings} from '../../../lib/hooks';

import {
  Card,
} from "@/components/ui/card";

import {type ProductMenuProps} from '../../../types/discount';

import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react"; // Accessible icon asset

import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from '../section/statCards';
import { BitcoinBagIcon, ChartAverageFreeIcons, Coins01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';



const Products = () => {
const {setting = [] , isLoading} = useGetProductSettings() as {setting:[] | never[] , isLoading:boolean}
  const [data, setData] = useState([]);
  const [activeBundles, setActiveBundles] = useState<Record<number, boolean>>({});
  const [selectedIds, setSelectedIds] = useState<Record<number, boolean>>({});
  const router = useRouter();

  
 // Active status toggle handler
  const handleToggleActive = (id: number) => {
    setActiveBundles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Individual checkbox change handler
  const handleSelectRow = (id: number) => {
    setSelectedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

   // Global header checkbox change handler
  const isAllSelected = data.length > 0 && data.every((item:ProductMenuProps) => selectedIds[item.id]);
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds({});
    } else {
      const allSelected: Record<number, boolean> = {};
      data.forEach((item:ProductMenuProps) => {
        allSelected[item?.id] = true;
      });
      setSelectedIds(allSelected);
    }
  };


   // Mass deletion action handler
  const handleDeleteSelected = () => {
    const remainingData = data.filter((item:ProductMenuProps) => !selectedIds[item.id]);
    setData(remainingData);
    setSelectedIds({}); // Reset selection state
  }; 
const selectedCount = Object.values(selectedIds).filter(Boolean).length;

  
    useEffect(() => {
      setData(setting);
  },[setting])

if(isLoading) return <Loading/>


return (
  <div className="max-w-5xl mx-auto p-6 space-y-6">
    <Card className="p-3">
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
 <div className="w-full max-w-2xl space-y-4">
      {/* Dynamic Action Toolbar */}
      <div className="flex items-center justify-between min-h-[40px] px-2">
        {selectedCount > 0 ? (
          <>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {selectedCount} item{selectedCount > 1 ? "s" : ""} selected
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
              className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-150"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </>
        ) : (
          <span className="text-sm text-slate-400 dark:text-slate-500 italic">
            Select items to manage
          </span>
        )}
      </div>

      {/* Main Data Container */}
      <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-900">
              <TableHead className="w-[10%] pl-4">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all rows"
                />
              </TableHead>
              <TableHead className="w-[60%] font-semibold text-slate-900 dark:text-slate-50">
                Name
              </TableHead>
              <TableHead className="w-[30%] text-right pr-4 font-semibold text-slate-900 dark:text-slate-50">
                Active
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-slate-400">
                  No bundles found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((bundle:{id:number , name:string}) => (
                <TableRow
                  key={bundle.id}
                  className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/50 ${
                    selectedIds[bundle.id] ? "bg-slate-50 dark:bg-slate-900/40" : ""
                  }`}
                >
                  <TableCell className="pl-4">
                    <Checkbox
                      className="cursor-pointer"
                      checked={!!selectedIds[bundle.id]}
                      onCheckedChange={() => handleSelectRow(bundle.id)}
                      aria-label={`Select row ${bundle.name}`}
                    />
                  </TableCell>
                  <TableCell 
                  onClick={() => router.push(`/products/${bundle.id}`)}
                  className="cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                    {bundle.name}
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    <div className="flex justify-end items-center">
                      <Switch
                        checked={!!activeBundles[bundle.id]}
                        onCheckedChange={() => handleToggleActive(bundle.id)}
                        aria-label={`Toggle active state for ${bundle.name}`}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  </div>
)
};

export default Products;
