'use client'
import ErrorMessage from '../../../../components/error';
import Loading from '../../../../components/loading';
import { useShippingAndProductsInfo } from '../../../../lib/hooks';
import { BillingAddress, OrderProduct, ShippingAndProductsInfo } from '../../../../types';
import { notFound , useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  <div className="space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold">
        Order Details
      </h1>

      <Button>
        Create Shipment
      </Button>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Order Details</CardTitle>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ship To</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Quantity</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {items.map(({ address, addressProducts },index) => (
              <TableRow key={index}>
                <TableCell className="align-top">
                  <Address {...address} />
                </TableCell>

                <TableCell className="align-top">
                  {renderOrderProducts(addressProducts)}
                </TableCell>

                <TableCell className="align-top">
                  {renderOrderProductsQuantities(addressProducts)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
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
