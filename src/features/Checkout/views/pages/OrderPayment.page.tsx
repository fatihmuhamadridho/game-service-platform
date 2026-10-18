'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Footer } from '@common-ui/organisms/Footer/Footer';
import { CheckoutHeader } from '../organisms/CheckoutHeader.organism';
import { PaymentStep } from '../organisms/PaymentStep.organism';
import type { CheckoutApiResponse, CheckoutService } from '../interfaces/checkout.interface';
import styles from '../templates/Checkout.module.css';

type PaymentData = {
  order: {
    orderNumber: string;
    paymentStatus: string;
    totalAmount: number;
    expiresAt: string | null;
    game: string;
    service: string;
    quantity: number;
  };
  payment: {
    id: string;
    method: string;
    amount: number;
    instructions: {
      qrImageUrl: string | null;
      bankName: string | null;
      accountNumber: string | null;
      accountHolder: string | null;
      reference: string | null;
    };
  };
};

const formatPrice = (price: number) => `Rp ${price.toLocaleString('id-ID')}`;
const recoveryUrl = (orderNumber: string, returnTo: string) =>
  `/cek-pesanan?orderNumber=${encodeURIComponent(orderNumber)}&returnTo=${encodeURIComponent(returnTo)}`;

export const OrderPaymentPage = ({ orderNumber }: { orderNumber: string }) => {
  const router = useRouter();
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reporting, setReporting] = useState(false);
  const [message, setMessage] = useState('');
  const [reportMessage, setReportMessage] = useState('');
  const paymentUrl = `/order/${encodeURIComponent(orderNumber)}`;
  const resultUrl = `${paymentUrl}/result`;

  const loadPayment = useCallback(async () => {
    const token = sessionStorage.getItem(`jokihub-tracking:${orderNumber}`);
    if (!token) {
      router.replace(recoveryUrl(orderNumber, paymentUrl));
      return;
    }
    try {
      const response = await fetch(`/api/orders/v1/tracking/${encodeURIComponent(orderNumber)}/payment`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const result = (await response.json()) as CheckoutApiResponse<PaymentData>;
      if (response.status === 401) {
        sessionStorage.removeItem(`jokihub-tracking:${orderNumber}`);
        router.replace(recoveryUrl(orderNumber, paymentUrl));
        return;
      }
      if (!response.ok || !result.data) throw new Error(result.status.message);
      if (['PENDING_REVIEW', 'PAID'].includes(result.data.order.paymentStatus)) {
        router.replace(resultUrl);
        return;
      }
      setPayment(result.data);
      setMessage('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Detail pembayaran tidak dapat dimuat.');
    } finally {
      setLoading(false);
    }
  }, [orderNumber, paymentUrl, resultUrl, router]);

  useEffect(() => {
    queueMicrotask(() => void loadPayment());
  }, [loadPayment]);

  const reportPaid = async () => {
    const token = sessionStorage.getItem(`jokihub-tracking:${orderNumber}`);
    if (!token) {
      router.replace(recoveryUrl(orderNumber, paymentUrl));
      return;
    }
    setReporting(true);
    setReportMessage('');
    try {
      const response = await fetch(`/api/orders/v1/tracking/${encodeURIComponent(orderNumber)}/payment`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = (await response.json()) as CheckoutApiResponse<{ paymentStatus: string }>;
      if (response.status === 401) {
        sessionStorage.removeItem(`jokihub-tracking:${orderNumber}`);
        router.replace(recoveryUrl(orderNumber, paymentUrl));
        return;
      }
      if (!response.ok || !result.data) throw new Error(result.status.message);
      router.push(resultUrl);
    } catch (error) {
      setReportMessage(error instanceof Error ? error.message : 'Konfirmasi pembayaran gagal dikirim.');
    } finally {
      setReporting(false);
    }
  };

  const service: CheckoutService | undefined = payment
    ? { id: '', name: payment.order.service, estimate: '', price: payment.order.totalAmount }
    : undefined;

  return (
    <main className={styles.page}>
      <CheckoutHeader game={payment?.order.game ?? 'Pesanan'} stage="payment" />
      {loading ? (
        <p className={styles.paymentMessage} role="status">
          Memuat detail pembayaran…
        </p>
      ) : message ? (
        <section className={styles.paymentMessage}>
          <p role="alert">{message}</p>
          <Link href={recoveryUrl(orderNumber, paymentUrl)}>Verifikasi lewat Cek Pesanan</Link>
        </section>
      ) : payment && service ? (
        <PaymentStep
          game={payment.order.game}
          service={service}
          quantity={payment.order.quantity}
          total={payment.order.totalAmount}
          formatPrice={formatPrice}
          paymentMethod={payment.payment.method}
          instructions={payment.payment.instructions}
          expiresAt={payment.order.expiresAt ?? undefined}
          orderNumber={payment.order.orderNumber}
          reportingPayment={reporting}
          paymentReported={false}
          reportMessage={reportMessage}
          onReportPaid={reportPaid}
        />
      ) : null}
      <Footer />
    </main>
  );
};
