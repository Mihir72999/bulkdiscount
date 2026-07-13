'use client'
import ErrorMessage from '../../../../components/error';
import Loading from '../../../../components/loading';
import { useShippingAndProductsInfo } from '../../../../lib/hooks';
import { BillingAddress, OrderProduct, ShippingAndProductsInfo } from '../../../../types';
import { notFound , useParams } from 'next/navigation';

const InternalOrderPage = (order: ShippingAndProductsInfo) => {
    const { shipping_addresses = [], products = [] } = order
    const items = shipping_addresses.map(address => {
        const addressProducts = products.filter(({ order_address_id }) => order_address_id === address.id);

        return { address, addressProducts }
    });

    const Address = (address: BillingAddress) => (
        <>
  <p className="m-0">
    {address.first_name} {address.last_name}
  </p>

  <p className="m-0">
    {address.street_1} {address.street_2}
  </p>

  <p className="m-0">
    {address.city}, {address.state} {address.zip}
  </p>
</>
    );

    const renderOrderProducts = (addressProducts: OrderProduct[]) => (
        <>
            {addressProducts.map(product => <p key={product.id}>{product.name}</p>)}
        </>
    );

    const renderOrderProductsQuantities = (addressProducts: OrderProduct[]) => (
        <>
            {addressProducts.map(product => <p key={product.id}>{product.quantity}</p>)}
        </>
    );

    return (
        <>
<div>
  {/* Header */}
  <div className="flex justify-between items-center mb-6">
    <h1 className="text-3xl font-bold">
      Order details
    </h1>

    <button
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
    >
      Create shipment
    </button>
  </div>

  {/* Table */}
  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ship to
            </th>

            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Products
            </th>

            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantity
            </th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {items.map(({ address, addressProducts },index) => (
            <tr key={index}>
              <td className="px-6 py-4 align-top">
                <Address {...address} />
              </td>

              <td className="px-6 py-4 align-top">
                {renderOrderProducts(addressProducts)}
              </td>

              <td className="px-6 py-4 align-top">
                {renderOrderProductsQuantities(addressProducts)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</div>
        </>
    );
};

const OrderPage = () => {
    const param = useParams()
    const { orderId } = param;
    const { isLoading, order, error }= useShippingAndProductsInfo(parseInt(`${orderId}`, 10));
     if(!order){
        notFound();
     }
    if (isLoading) return <Loading />;

    if (error) return <ErrorMessage error={error} />;

    return <InternalOrderPage 
            shipping_addresses={order?.shipping_addresses ?? []}
            products={order?.products ?? []}
    />;
};

export default OrderPage;
