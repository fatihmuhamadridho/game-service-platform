'use client';

import { useEffect, useMemo, useState } from 'react';
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

export const CheckoutPage = ({ gameSlug }: { gameSlug: string }) => {
  const [games, setGames] = useState<CheckoutGame[]>([]);
  const [services, setServices] = useState<CheckoutService[]>([]);
  const [selectedGame, setSelectedGame] = useState('');
  const [selectedService, setSelectedService] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [orderDetails, setOrderDetails] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiMessage, setApiMessage] = useState('');
  const [createdOrder, setCreatedOrder] = useState<CheckoutCreatedOrder | null>(null);
  const [reportingPayment, setReportingPayment] = useState(false);
  const [paymentReported, setPaymentReported] = useState(false);
  const [reportMessage, setReportMessage] = useState('');
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
        const initial = mapped.find((game) => game.slug === gameSlug);
        if (!initial) throw new Error('Game tidak tersedia di katalog.');
        setSelectedGame(initial.name);
        setServices(await fetchServices(initial.slug));
        setSelectedService(0);
      } catch (error) {
        if (alive) setApiMessage(error instanceof Error ? error.message : 'Katalog tidak dapat dimuat.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [gameSlug]);

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
    setOrderDetails(values);
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
      const result = (await response.json()) as CheckoutApiResponse<CheckoutCreatedOrder>;
      if (!response.ok || !result.data) throw new Error(result.status.message);
      setCreatedOrder(result.data);
      setPaymentReported(false);
      setReportMessage('');
      setStep(3);
    } catch (error) {
      setApiMessage(error instanceof Error ? error.message : 'Pesanan tidak dapat dibuat.');
    } finally {
      setSubmitting(false);
    }
  };

  const reportPaid = async () => {
    if (!createdOrder) return;
    setReportingPayment(true);
    setReportMessage('');
    const whatsapp = orderDetails.phone.startsWith('+')
      ? orderDetails.phone
      : `+62${orderDetails.phone.replace(/^0/, '')}`;
    try {
      const response = await fetch(
        `/api/orders/v1/payments/${encodeURIComponent(createdOrder.payment.id)}/report-paid`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderNumber: createdOrder.order.orderNumber, whatsapp }),
        }
      );
      const result = (await response.json()) as CheckoutApiResponse<{ paymentStatus: string }>;
      if (!response.ok || !result.data) throw new Error(result.status.message);
      setPaymentReported(true);
      setReportMessage('');
    } catch (error) {
      setReportMessage(error instanceof Error ? error.message : 'Konfirmasi pembayaran gagal dikirim.');
    } finally {
      setReportingPayment(false);
    }
  };

  return (
    <CheckoutTemplate
      games={games}
      services={services}
      selectedGame={selectedGame}
      selectedService={selectedService}
      quantity={quantity}
      step={step}
      loading={loading}
      submitting={submitting}
      apiMessage={apiMessage}
      createdOrder={createdOrder}
      paymentMethod={paymentMethod}
      onPaymentMethod={setPaymentMethod}
      errors={errors}
      total={total}
      formatPrice={formatPrice}
      onGameSelect={(game) => {
        setSelectedGame(game);
        const match = games.find((candidate) => candidate.name === game);
        if (match)
          void fetchServices(match.slug)
            .then((nextServices) => {
              setServices(nextServices);
              setSelectedService(0);
            })
            .catch((error: unknown) =>
              setApiMessage(error instanceof Error ? error.message : 'Layanan tidak dapat dimuat.')
            );
      }}
      onServiceSelect={setSelectedService}
      onQuantity={setQuantity}
      onContinue={continueOrder}
      reportingPayment={reportingPayment}
      paymentReported={paymentReported}
      reportMessage={reportMessage}
      onReportPaid={reportPaid}
      onDetailsChange={() => setErrors([])}
    />
  );
};
