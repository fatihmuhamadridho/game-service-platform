import { CheckoutPage } from '@features/Checkout/views/pages/Checkout.page';

export default async function OrderSelectionRoute({ searchParams }: PageProps<'/order'>) {
  const query = await searchParams;
  const game = typeof query.game === 'string' ? query.game : '';
  return <CheckoutPage initialGameSlug={game} />;
}
