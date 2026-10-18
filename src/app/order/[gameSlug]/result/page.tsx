import { OrderTrackingResultPage } from '@features/OrderTracking/views/pages/OrderTrackingResult.page';

export default async function OrderPaymentResultRoute({ params }: PageProps<'/order/[gameSlug]/result'>) {
  const { gameSlug } = await params;
  return <OrderTrackingResultPage orderId={gameSlug.toUpperCase()} checkoutResult />;
}
