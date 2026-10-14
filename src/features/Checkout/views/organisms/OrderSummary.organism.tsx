import { Box, Button } from 'rangkaui';
import { IconArrowRight, IconDeviceGamepad2 } from '@tabler/icons-react';
import type { CheckoutService } from '../interfaces/checkout.interface';
import { QuantityControl } from '../molecules/QuantityControl.molecule';
import styles from './OrderSummary.module.css';
type Props = {
  game: string;
  service?: CheckoutService;
  quantity: number;
  total: number;
  step: number;
  formatPrice: (value: number) => string;
  onQuantity: (value: number) => void;
  onContinue: () => void;
  disabled?: boolean;
  submitting?: boolean;
  paymentMethod: string;
  onPaymentMethod: (method: string) => void;
};
export const OrderSummary = ({
  game,
  service,
  quantity,
  total,
  step,
  formatPrice,
  onQuantity,
  onContinue,
  disabled = false,
  submitting = false,
  paymentMethod,
  onPaymentMethod,
}: Props) => (
  <Box className={styles.summary} bordered rounded>
    <h2>Ringkasan Order</h2>
    <div className={styles.game}>
      <span>
        <IconDeviceGamepad2 />
      </span>
      <b>{game}</b>
    </div>
    <dl>
      <div>
        <dt>Layanan</dt>
        <dd>{service?.name ?? 'Memuat layanan…'}</dd>
      </div>
      <div>
        <dt>Estimasi</dt>
        <dd>{service?.estimate ?? '—'}</dd>
      </div>
      <div>
        <dt>Harga</dt>
        <dd className={styles.price}>{service ? (service.price ? formatPrice(service.price) : 'Tanya Admin') : '—'}</dd>
      </div>
    </dl>
    {service?.price && (
      <div className={styles.quantity}>
        <span>Jumlah</span>
        <QuantityControl value={quantity} onChange={onQuantity} />
      </div>
    )}
    <label className={styles.paymentMethod}>
      Metode pembayaran
      <select value={paymentMethod} onChange={(event) => onPaymentMethod(event.target.value)}>
        <option value="QRIS">QRIS</option>
        <option value="BCA_TRANSFER">Transfer Bank BCA</option>
      </select>
    </label>
    <div className={styles.total}>
      <span>Total Pembayaran</span>
      <strong>{service?.price ? formatPrice(total) : '—'}</strong>
    </div>
    <Button className={styles.button} onClick={onContinue} disabled={disabled || !service}>
      {submitting ? 'Membuat Pesanan…' : step === 3 ? 'Lanjut ke Pembayaran' : 'Lanjut Pembayaran'} <IconArrowRight />
    </Button>
    {step === 3 && <p className={styles.notice}>Pesanan dibuat oleh server. Pembayaran belum dikonfirmasi.</p>}
  </Box>
);
