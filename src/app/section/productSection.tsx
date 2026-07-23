"use client";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import Loading from "../../../components/loading";

type Product = {  
  id: number;
  name: string;
};

interface ProductSelectorProps {
  products: Product[];
  search: string;
  onSearchChange: (value: string) => void;
  selectedProducts: number[];
  onSelectedProductsChange: (value: number[]) => void;
  isLoading?: boolean;
}

export default function ProductSelector({
  products,
  search,
  onSearchChange,
  selectedProducts,
  onSelectedProductsChange,
  isLoading,
}: ProductSelectorProps) {
 
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleProduct = (id: number) => {
      if (selectedProducts.includes(id)) {
      onSelectedProductsChange(
        selectedProducts.filter((productId) => productId !== id)
      );
    } else {
      onSelectedProductsChange([...selectedProducts, id]);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Products</h3>

      <Input
        placeholder="Search products..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <ScrollArea className="h-72 rounded-md border">
        <div className="p-4 space-y-3">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center space-x-3 rounded-md p-2 hover:bg-muted"
              >
                <Checkbox
                  id={`product-${product.id}`}
                  checked={selectedProducts.includes(product.id)}
                  onCheckedChange={() => toggleProduct(product.id)}
                />

                <Label
                  htmlFor={`product-${product.id}`}
                  className="cursor-pointer flex-1"
                >
                  {product.name}
                </Label>
              </div>
            ))
          ) : isLoading ? <Loading /> : (
            <p className="text-sm text-muted-foreground">
              No products found.
            </p>
          )
          }
        </div>
      </ScrollArea>
    </div>
  );
}