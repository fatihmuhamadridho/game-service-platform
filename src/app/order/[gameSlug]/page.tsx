import { CheckoutPage } from '@features/Checkout/views/pages/Checkout.page';

export default async function OrderRoute({ params }: PageProps<'/order/[gameSlug]'>) {
  const { gameSlug } = await params;
  return <CheckoutPage gameSlug={gameSlug} />;
}
