'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type {
  CheckoutApiResponse,
  CheckoutCreatedOrder,
  CheckoutGame,
  CheckoutService,
} from '../interfaces/checkout.interface';
import { CheckoutTemplate } from '../templates/Checkout.template';
const formatPrice = (price: number) => `Rp ${price.toLocaleString('id-ID')}`;
const fetchServices = async (slug: string) => {
  const response = await fetch(`/api/games/v1/${encodeURIComponent(slug)}/services`);
  const result = (await response.json()) as CheckoutApiResponse<{
    services: Array<{ id: string; name: string; price: number | null; customPrice: boolean; estimate: string }>;
  }>;
  if (!response.ok || !result.data) throw new Error(result.status.message);
  return result.data.services.map((service) => ({
    id: service.id,
    name: service.name,
    estimate: service.estimate,
    price: service.customPrice ? undefined : (service.price ?? undefined),
    custom: service.customPrice,
  }));
};

export const CheckoutPage = ({ initialGameSlug = '' }: { initialGameSlug?: string }) => {
  const router = useRouter();
  const [games, setGames] = useState<CheckoutGame[]>([]);
  const [services, setServices] = useState<CheckoutService[]>([]);
  const [selectedGame, setSelectedGame] = useState('');
  const [selectedService, setSelectedService] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiMessage, setApiMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('QRIS');
  const selected = services[selectedService];
  const total = useMemo(() => (selected?.price ? selected.price * quantity : 0), [selected?.price, quantity]);

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const response = await fetch('/api/games/v1/list?limit=100');
        const result = (await response.json()) as CheckoutApiResponse<{
          games: Array<{ id: string; name: string; slug: string; artworkKey: string | null }>;
        }>;
        if (!response.ok || !result.data) throw new Error(result.status.message);
        const mapped = result.data.games.map((game) => ({
          id: game.id,
          slug: game.slug,
          name: game.name,
          mark: game.name.slice(0, 1),
          art: game.artworkKey ?? game.slug,
        }));
        if (!alive) return;
        setGames(mapped);
        if (initialGameSlug) {
          const initial = mapped.find((game) => game.slug === initialGameSlug);
          if (!initial) throw new Error('Game tidak tersedia di katalog.');
          setSelectedGame(initial.name);
          setServices(await fetchServices(initial.slug));
          setSelectedService(0);
        }
      } catch (error) {
        if (alive) setApiMessage(error instanceof Error ? error.message : 'Katalog tidak dapat dimuat.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [initialGameSlug]);

  const continueOrder = async () => {
    const form = document.getElementById('order-details') as HTMLFormElement | null;
    const formData = form ? new FormData(form) : new FormData();
    const missing = ['name', 'phone', 'account'].filter((key) => !String(formData.get(key) ?? '').trim());
    setErrors(missing);
    if (!selected || selected.custom) {
      document.getElementById('custom-service')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (missing.length) {
      document.getElementById('order-details')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const values = Object.fromEntries(Array.from(formData.entries(), ([key, value]) => [key, String(value)]));
    setSubmitting(true);
    setApiMessage('');
    try {
      const game = games.find((item) => item.name === selectedGame);
      if (!game) throw new Error('Game tidak valid.');
      const key = crypto.randomUUID();
      const response = await fetch('/api/orders/v1/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key },
        body: JSON.stringify({
          gameSlug: game.slug,
          serviceId: selected.id,
          quantity,
          paymentMethod,
          customer: {
            name: values.name,
            whatsapp: values.phone.startsWith('+') ? values.phone : `+62${values.phone.replace(/^0/, '')}`,
          },
          item: { gameAccount: values.account, gameServer: values.server || null, customerNotes: values.notes || null },
        }),
      });
      const result = (await response.json()) as CheckoutApiResponse<
        CheckoutCreatedOrder & { trackingToken: string; trackingTokenExpiresAt: string }
      >;
      if (!response.ok || !result.data) throw new Error(result.status.message);
      if (!result.data.trackingToken) throw new Error('Token akses pesanan tidak tersedia.');
      sessionStorage.setItem(`jokihub-tracking:${result.data.order.orderNumber}`, result.data.trackingToken);
      router.push(`/order/${encodeURIComponent(result.data.order.orderNumber)}`);
    } catch (error) {
      setApiMessage(error instanceof Error ? error.message : 'Pesanan tidak dapat dibuat.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CheckoutTemplate
      games={games}
      services={services}
      selectedGame={selectedGame}
      selectedService={selectedService}
      quantity={quantity}
      loading={loading}
      submitting={submitting}
      apiMessage={apiMessage}
      paymentMethod={paymentMethod}
      onPaymentMethod={setPaymentMethod}
      errors={errors}
      total={total}
      formatPrice={formatPrice}
      onGameSelect={(game) => {
        setSelectedGame(game);
        setServices([]);
        setSelectedService(0);
        setLoading(true);
        setApiMessage('');
        const match = games.find((candidate) => candidate.name === game);
        if (match)
          void fetchServices(match.slug)
            .then((nextServices) => {
              setServices(nextServices);
            })
            .catch((error: unknown) =>
              setApiMessage(error instanceof Error ? error.message : 'Layanan tidak dapat dimuat.')
            )
            .finally(() => setLoading(false));
        router.replace(
          `/order?game=${encodeURIComponent(games.find((candidate) => candidate.name === game)?.slug ?? '')}`
        );
      }}
      onServiceSelect={setSelectedService}
      onQuantity={setQuantity}
      onContinue={continueOrder}
      onDetailsChange={() => setErrors([])}
    />
  );
};
