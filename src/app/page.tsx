'use client'
import ErrorMessage from '../../components/error';
import Loading from '../../components/loading';
import { useProducts } from '../../lib/hooks';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
interface ProductSummary {
inventory_count: number;
variant_count: number;
primary_category_name: string;
}
export default function Home(){
    const { error, isLoading, summary } = useProducts();

    if (isLoading) return <Loading />;
	if(!summary) return <ErrorMessage error={error} />; 
    if (error) return <ErrorMessage error={error} />;
   const typeSummary = summary as ProductSummary
   return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Homepage</h2>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inventory Count
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">
              {typeSummary.inventory_count}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Variant Count
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">
              {typeSummary.variant_count}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Primary Category
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">
              {typeSummary.primary_category_name}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

