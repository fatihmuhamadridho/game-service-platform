import type { CheckoutGame, CheckoutService } from '../interfaces/checkout.interface';
import { CheckoutHeader } from '../organisms/CheckoutHeader.organism';
import { GamePicker } from '../organisms/GamePicker.organism';
import { ServicePicker } from '../organisms/ServicePicker.organism';
import { OrderDetailsForm } from '../organisms/OrderDetailsForm.organism';
import { OrderSummary } from '../organisms/OrderSummary.organism';
import { SecurityChecklist } from '../molecules/SecurityChecklist.molecule';
import { Footer } from '@common-ui/organisms/Footer/Footer';
import { StickyCheckout } from '../organisms/StickyCheckout.organism';
import { PaymentStep } from '../organisms/PaymentStep.organism';
import { PaymentSuccess } from '../organisms/PaymentSuccess.organism';
import styles from './Checkout.module.css';
type Props = {
  games: CheckoutGame[];
  services: CheckoutService[];
  selectedGame: string;
  selectedService: number;
  quantity: number;
  step: number;
  paymentSubmitted: boolean;
  errors: string[];
  total: number;
  orderDetails: Record<string, string>;
  formatPrice: (price: number) => string;
  onGameSelect: (game: string) => void;
  onServiceSelect: (index: number) => void;
  onQuantity: (quantity: number) => void;
  onContinue: () => void;
  onPaymentSubmit: () => void;
  onDetailsChange: () => void;
};
export const CheckoutTemplate = ({
  games,
  services,
  selectedGame,
  selectedService,
  quantity,
  step,
  paymentSubmitted,
  errors,
  total,
  orderDetails,
  formatPrice,
  onGameSelect,
  onServiceSelect,
  onQuantity,
  onContinue,
  onPaymentSubmit,
  onDetailsChange,
}: Props) => {
  const service = services[selectedService];
  return (
    <main className={styles.page}>
      <CheckoutHeader game={selectedGame} step={step} />
      {step === 3 ? (
        paymentSubmitted ? (
          <PaymentSuccess game={selectedGame} service={service} total={total} formatPrice={formatPrice} />
        ) : (
          <PaymentStep
            game={selectedGame}
            service={service}
            quantity={quantity}
            total={total}
            details={orderDetails}
            formatPrice={formatPrice}
            onSubmit={onPaymentSubmit}
          />
        )
      ) : (
        <div className={styles.layout}>
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
            />
            <SecurityChecklist />
          </aside>
        </div>
      )}
      <Footer />
      {step < 3 && (
        <StickyCheckout totalLabel={service.price ? formatPrice(total) : 'Tanya Admin'} onContinue={onContinue} />
      )}
    </main>
  );
};
