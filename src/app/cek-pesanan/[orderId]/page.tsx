import { OrderTrackingResultPage } from '@features/OrderTracking/views/pages/OrderTrackingResult.page';

export default async function OrderTrackingResultRoute({ params }: PageProps<'/cek-pesanan/[orderId]'>) {
  const { orderId } = await params;
  return <OrderTrackingResultPage orderId={orderId} />;
}
