import { OrderTrackingPage } from '@features/OrderTracking/views/pages/OrderTracking.page';

export default async function OrderTrackingRoute({ searchParams }: PageProps<'/cek-pesanan'>) {
  const query = await searchParams;
  return (
    <OrderTrackingPage
      initialOrderNumber={typeof query.orderNumber === 'string' ? query.orderNumber : ''}
      returnTo={typeof query.returnTo === 'string' ? query.returnTo : ''}
    />
  );
}
