'use client'
import {  useParams } from 'next/navigation';
import ErrorMessage from '../../../../components/error';
import { useOrder } from '../../../../lib/hooks';
import { Order } from '../../../../types';



const InternalOrderModalPage = (order: Order) => {
    const { billing_address } = order;

    const formatCurrency = (amount: string) =>
        new Intl.NumberFormat(order.customer_locale, { style: 'currency', currency: order.currency_code }).format(parseFloat(amount));

    return (
       <div className="grid gap-12 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">

  {/* Billing Information */}
  <div>
    <h3 className="text-lg font-semibold mb-4">
      Billing information
    </h3>

    <address className="not-italic text-gray-600 space-y-1">
      <div>
        {billing_address.first_name} {billing_address.last_name}
      </div>

      <div>{billing_address.street_1}</div>

      {billing_address.street_2 && (
        <div>{billing_address.street_2}</div>
      )}

      <div>
        {billing_address.city}, {billing_address.state}, {billing_address.zip}
      </div>

      <div>{billing_address.country}</div>
    </address>
  </div>

  {/* Payment Details */}
  <div>
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold">
        Payment details
      </h3>

      <span className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-full">
        {order.payment_status}
      </span>
    </div>

    <dl className="grid grid-cols-[1fr_auto] gap-y-2 text-gray-600">
      <dt>Subtotal</dt>
      <dd>{formatCurrency(order.subtotal_ex_tax)}</dd>

      <dt>Discount</dt>
      <dd>-{formatCurrency(order.discount_amount)}</dd>

      <dt>Shipping</dt>
      <dd>{formatCurrency(order.shipping_cost_ex_tax)}</dd>

      <dt>Tax</dt>
      <dd>{formatCurrency(order.total_tax)}</dd>

      <dt className="font-bold text-black">
        Grand total
      </dt>

      <dd className="font-bold text-black">
        {formatCurrency(order.total_inc_tax)}
      </dd>
    </dl>
  </div>

  {/* Order Information */}
  <div>
    <h3 className="text-lg font-semibold mb-4">
      Order information
    </h3>

    <dl className="grid grid-cols-[1fr_auto] gap-y-2 text-gray-600">
      <dt>ID</dt>
      <dd>{order.id}</dd>

      <dt>Type</dt>
      <dd className="capitalize">
        {order.order_source}
      </dd>

      <dt>Status</dt>
      <dd>{order.status}</dd>

      <dt>Total items</dt>
      <dd>
        {order.items_total > 1
          ? `${order.items_total} items`
          : `${order.items_total} item`}
      </dd>
    </dl>
  </div>

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
