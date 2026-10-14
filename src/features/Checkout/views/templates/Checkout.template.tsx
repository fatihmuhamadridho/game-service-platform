import type { CheckoutGame, CheckoutService } from '../interfaces/checkout.interface';
import type { CheckoutCreatedOrder } from '../interfaces/checkout.interface';
import { CheckoutHeader } from '../organisms/CheckoutHeader.organism';
import { GamePicker } from '../organisms/GamePicker.organism';
import { ServicePicker } from '../organisms/ServicePicker.organism';
import { OrderDetailsForm } from '../organisms/OrderDetailsForm.organism';
import { OrderSummary } from '../organisms/OrderSummary.organism';
import { SecurityChecklist } from '../molecules/SecurityChecklist.molecule';
import { Footer } from '@common-ui/organisms/Footer/Footer';
import { StickyCheckout } from '../organisms/StickyCheckout.organism';
import { PaymentStep } from '../organisms/PaymentStep.organism';
import styles from './Checkout.module.css';
type Props = {
  games: CheckoutGame[];
  services: CheckoutService[];
  selectedGame: string;
  selectedService: number;
  quantity: number;
  step: number;
  loading: boolean;
  submitting: boolean;
  apiMessage: string;
  createdOrder: CheckoutCreatedOrder | null;
  paymentMethod: string;
  onPaymentMethod: (method: string) => void;
  errors: string[];
  total: number;
  formatPrice: (price: number) => string;
  onGameSelect: (game: string) => void;
  onServiceSelect: (index: number) => void;
  onQuantity: (quantity: number) => void;
  onContinue: () => void;
  reportingPayment: boolean;
  paymentReported: boolean;
  reportMessage: string;
  onReportPaid: () => void;
  onDetailsChange: () => void;
};
export const CheckoutTemplate = ({
  games,
  services,
  selectedGame,
  selectedService,
  quantity,
  step,
  loading,
  submitting,
  apiMessage,
  createdOrder,
  paymentMethod,
  onPaymentMethod,
  errors,
  total,
  formatPrice,
  onGameSelect,
  onServiceSelect,
  onQuantity,
  onContinue,
  reportingPayment,
  paymentReported,
  reportMessage,
  onReportPaid,
  onDetailsChange,
}: Props) => {
  const service = services[selectedService];
  return (
    <main className={styles.page}>
      <CheckoutHeader game={selectedGame} step={step} />
      {step === 3 ? (
        createdOrder ? (
          <PaymentStep
            game={selectedGame}
            service={service}
            quantity={createdOrder.order.quantity}
            total={createdOrder.order.totalAmount}
            formatPrice={formatPrice}
            paymentMethod={createdOrder.payment.method}
            instructions={createdOrder.payment.instructions}
            expiresAt={createdOrder.order.expiresAt}
            orderNumber={createdOrder.order.orderNumber}
            reportingPayment={reportingPayment}
            paymentReported={paymentReported}
            reportMessage={reportMessage}
            onReportPaid={onReportPaid}
          />
        ) : (
          <p role="alert">Detail pembayaran pesanan tidak tersedia. Periksa kembali status pesanan.</p>
        )
      ) : (
        <div className={styles.layout}>
          {apiMessage && <p role="alert">{apiMessage}</p>}
          {loading && <p role="status">Memuat katalog game dan layanan…</p>}
          <div className={styles.formColumn}>
            <GamePicker games={games} selected={selectedGame} onSelect={onGameSelect} />
            <ServicePicker
              services={services}
              selected={selectedService}
              formatPrice={formatPrice}
              onSelect={onServiceSelect}
            />
            <OrderDetailsForm errors={errors} onChange={onDetailsChange} />
          </div>
          <aside className={styles.summaryColumn}>
            <OrderSummary
              game={selectedGame}
              service={service}
              quantity={quantity}
              total={total}
              step={step}
              formatPrice={formatPrice}
              onQuantity={onQuantity}
              onContinue={onContinue}
              disabled={loading || submitting || !service}
              submitting={submitting}
              paymentMethod={paymentMethod}
              onPaymentMethod={onPaymentMethod}
            />
            <SecurityChecklist />
          </aside>
        </div>
      )}
      <Footer />
      {step < 3 && service && (
        <StickyCheckout
          totalLabel={service.price ? formatPrice(total) : 'Tanya Admin'}
          onContinue={onContinue}
          disabled={loading || submitting}
        />
      )}
    </main>
  );
};
