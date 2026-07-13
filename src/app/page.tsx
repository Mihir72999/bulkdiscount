'use client'
import ErrorMessage from '../../components/error';
import Loading from '../../components/loading';
import { useProducts } from '../../lib/hooks';

export default function Home(){
		interface ProductSummary {
	  inventory_count: number;
	  variant_count: number;
	  primary_category_name: string;
	}
    const { error, isLoading, summary } = useProducts();

    if (isLoading) return <Loading />;
	if(!summary) return <ErrorMessage error={error} />; 
    if (error) return <ErrorMessage error={error} />;
   const typeSummary = summary as ProductSummary
    return (  
        <div className="border border-gray-200 rounded-lg p-6 bg-white">
  <h2 className="text-xl font-semibold mb-6">Homepage</h2>

  <div className="flex gap-6">
    <div className="min-w-40 border border-gray-200 rounded-lg p-4">
      <h4 className="text-gray-600 text-sm font-medium mb-2">
        Inventory count
      </h4>
      <h1 className="text-3xl font-bold">
        {typeSummary?.inventory_count}
      </h1>
    </div>

    <div className="min-w-40 border border-gray-200 rounded-lg p-4">
      <h4 className="text-gray-600 text-sm font-medium mb-2">
        Variant count
      </h4>
      <h1 className="text-3xl font-bold">
        {typeSummary?.variant_count}
      </h1>
    </div>

    <div className="min-w-40 border border-gray-200 rounded-lg p-4">
      <h4 className="text-gray-600 text-sm font-medium mb-2">
        Primary category
      </h4>
      <h1 className="text-3xl font-bold">
        {typeSummary?.primary_category_name}
      </h1>
    </div>
  </div>
</div>
    );
};

