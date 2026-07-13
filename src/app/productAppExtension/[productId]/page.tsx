'use client'
import {useParams } from "next/navigation";
import ErrorMessage from "../../../../components/error";
import Loading from "../../../../components/loading";
import { useProductInfo } from "../../../../lib/hooks";
import { notFound } from "next/navigation";

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
        <>
<div className="space-y-4">

  {/* Basic Information */}
  <div className="bg-white border border-gray-200 rounded-lg p-6">
    <h2 className="text-xl font-semibold mb-6">
      Basic Information
    </h2>

    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-600 mb-1">
          Product name
        </h4>
        <p className="text-gray-900">{name}</p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-600 mb-1">
          Product type
        </h4>
        <p className="text-gray-900">{typeCapitalized}</p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-600 mb-1">
          Default price (excluding tax)
        </h4>
        <p className="text-gray-900">${price}</p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-600 mb-1">
          Visible on storefront
        </h4>
        <p className="text-gray-900">{isVisibleString}</p>
      </div>
    </div>
  </div>

  {/* Description */}
  <div className="bg-white border border-gray-200 rounded-lg p-6">
    <h2 className="text-xl font-semibold mb-6">
      Description
    </h2>

    <div>
      <h4 className="text-sm font-semibold text-gray-600 mb-1">
        Description
      </h4>

      <p className="text-gray-900 whitespace-pre-wrap">
        {description || 'No description available'}
      </p>
    </div>
  </div>

</div>
        </>
    );
};

export default ProductAppExtension;
