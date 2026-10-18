import { OrderPaymentPage } from '@features/Checkout/views/pages/OrderPayment.page';
import { redirect } from 'next/navigation';

export default async function OrderRoute({ params }: PageProps<'/order/[gameSlug]'>) {
  const { gameSlug } = await params;
  if (/^JH-\d{8}-[A-F0-9]{6}$/i.test(gameSlug)) return <OrderPaymentPage orderNumber={gameSlug.toUpperCase()} />;
  redirect(`/order?game=${encodeURIComponent(gameSlug)}`);
}
