import { Box, Button } from 'rangkaui';
import { IconArrowRight, IconBuildingBank, IconCheck, IconDeviceGamepad2, IconQrcode } from '@tabler/icons-react';
import type { CheckoutService } from '../interfaces/checkout.interface';
import { QuantityControl } from '../molecules/QuantityControl.molecule';
import styles from './OrderSummary.module.css';
type Props = {
  game: string;
  service?: CheckoutService;
  quantity: number;
  total: number;
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
        <dd>{service?.name ?? (game === 'Pilih game' ? 'Pilih game dan layanan' : 'Memuat layanan…')}</dd>
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
    <fieldset className={styles.paymentMethod}>
      <legend>Metode pembayaran</legend>
      <label className={`${styles.paymentOption} ${paymentMethod === 'QRIS' ? styles.paymentOptionSelected : ''}`}>
        <input
          type="radio"
          name="payment-method"
          value="QRIS"
          checked={paymentMethod === 'QRIS'}
          onChange={() => onPaymentMethod('QRIS')}
        />
        <span className={styles.paymentIcon}>
          <IconQrcode />
        </span>
        <span className={styles.paymentCopy}>
          <b>QRIS</b>
          <small>Bayar dengan aplikasi QRIS</small>
        </span>
        <IconCheck className={styles.paymentCheck} aria-hidden="true" />
      </label>
      <label
        className={`${styles.paymentOption} ${paymentMethod === 'BCA_TRANSFER' ? styles.paymentOptionSelected : ''}`}
      >
        <input
          type="radio"
          name="payment-method"
          value="BCA_TRANSFER"
          checked={paymentMethod === 'BCA_TRANSFER'}
          onChange={() => onPaymentMethod('BCA_TRANSFER')}
        />
        <span className={`${styles.paymentIcon} ${styles.bankIcon}`}>
          <IconBuildingBank />
        </span>
        <span className={styles.paymentCopy}>
          <b>Transfer Bank BCA</b>
          <small>Transfer manual ke rekening BCA</small>
        </span>
        <IconCheck className={styles.paymentCheck} aria-hidden="true" />
      </label>
    </fieldset>
    <div className={styles.total}>
      <span>Total Pembayaran</span>
      <strong>{service?.price ? formatPrice(total) : '—'}</strong>
    </div>
    <Button className={styles.button} onClick={onContinue} disabled={disabled || !service}>
      {submitting ? 'Membuat Pesanan…' : 'Lanjut Pembayaran'} <IconArrowRight />
    </Button>
  </Box>
);
