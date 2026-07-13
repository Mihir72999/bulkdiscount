'use client'
import {useParams } from "next/navigation";
import ErrorMessage from "../../../../components/error";
import Loading from "../../../../components/loading";
import { useProductInfo } from "../../../../lib/hooks";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

const ProductAppExtension = () => {
    const params = useParams()
    const productId = Number(params?.productId);
    const { error, isLoading, product } = useProductInfo(productId);
    const { description, is_visible: isVisible, name, price, type } = product ?? {};   
    const typeCapitalized = type?.replace(/^\w/, (c: string) => c.toUpperCase());
    const isVisibleString = isVisible ? 'True' : 'False';
    if(!product) return notFound()
    if (isLoading) return <Loading />;
    if (error) return <ErrorMessage error={error} />;
  
   return (
  <div className="space-y-6">
    {/* Basic Information */}
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">
            Product Name
          </p>

          <p className="font-medium">
            {name}
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            Product Type
          </p>

          <Badge variant="outline">
            {typeCapitalized}
          </Badge>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            Default Price (excluding tax)
          </p>

          <p className="font-medium">
            ${price}
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            Visible on Storefront
          </p>

          <Badge
            variant={isVisible ? "default" : "secondary"}
          >
            {isVisible ? "Visible" : "Hidden"}
          </Badge>
        </div>
      </CardContent>
    </Card>

    {/* Description */}
    <Card>
      <CardHeader>
        <CardTitle>Description</CardTitle>
      </CardHeader>

      <CardContent>
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
          {description || "No description available"}
        </p>
      </CardContent>
    </Card>
  </div>
);
};

export default ProductAppExtension;
