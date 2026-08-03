"use client";

import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, Package, Plus } from "lucide-react";
import {type ProductMenuProps } from "../../../types";

export default function ProductMenu({products}: {products: ProductMenuProps['product']}) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger>
        <Button variant="ghost" className="w-full justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span>Products</span>
          </div>

          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2 ml-6 space-y-1">
        {products.map((product) => (
          <Button
            key={product.id}
            variant="ghost"
            className="w-full justify-start"
          >
            {product.name}
          </Button>
        ))}

        <Button
          variant="outline"
          className="mt-3 w-full justify-start"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </CollapsibleContent>
    </Collapsible>
  );
}