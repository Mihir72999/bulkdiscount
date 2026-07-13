'use client'
import {  useParams } from 'next/navigation';
import ErrorMessage from '../../../../components/error';
import { useOrder } from '../../../../lib/hooks';
import { Order } from '../../../../types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";


const InternalOrderModalPage = (order: Order) => {
    const { billing_address } = order;

    const formatCurrency = (amount: string) =>
        new Intl.NumberFormat(order.customer_locale, { style: 'currency', currency: order.currency_code }).format(parseFloat(amount));
return (
  <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">

    {/* Billing Information */}
    <Card>
      <CardHeader>
        <CardTitle>Billing Information</CardTitle>
      </CardHeader>

      <CardContent>
        <address className="not-italic space-y-1 text-sm text-muted-foreground">
          <p>
            {billing_address.first_name} {billing_address.last_name}
          </p>

          <p>{billing_address.street_1}</p>

          {billing_address.street_2 && (
            <p>{billing_address.street_2}</p>
          )}

          <p>
            {billing_address.city}, {billing_address.state}{" "}
            {billing_address.zip}
          </p>

          <p>{billing_address.country}</p>
        </address>
      </CardContent>
    </Card>

    {/* Payment Details */}
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Payment Details</CardTitle>

        <Badge variant="secondary">
          {order.payment_status}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(order.subtotal_ex_tax)}</span>
        </div>

        <div className="flex justify-between">
          <span>Discount</span>
          <span>
            -{formatCurrency(order.discount_amount)}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Shipping</span>
          <span>
            {formatCurrency(order.shipping_cost_ex_tax)}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Tax</span>
          <span>{formatCurrency(order.total_tax)}</span>
        </div>

        <Separator />

        <div className="flex justify-between font-bold text-lg">
          <span>Grand Total</span>
          <span>
            {formatCurrency(order.total_inc_tax)}
          </span>
        </div>
      </CardContent>
    </Card>

    {/* Order Information */}
    <Card>
      <CardHeader>
        <CardTitle>Order Information</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span>ID</span>
          <span>{order.id}</span>
        </div>

        <div className="flex justify-between">
          <span>Type</span>
          <span className="capitalize">
            {order.order_source}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Status</span>
          <Badge variant="outline">
            {order.status}
          </Badge>
        </div>

        <div className="flex justify-between">
          <span>Total Items</span>
          <span>
            {order.items_total}{" "}
            {order.items_total === 1 ? "item" : "items"}
          </span>
        </div>
      </CardContent>
    </Card>

  </div>
);
};

const OrderModalPage = () => {
    const param = useParams()
    const { orderId } = param;
    const { isLoading, order, error } = useOrder(parseInt(`${orderId}`, 10));

    if (isLoading) {
        return null;
    }

    if (error) {
        return <ErrorMessage error={error} renderPanel={false} />
    }

    return order ? <InternalOrderModalPage {...order} /> : null;
};

export default OrderModalPage;
