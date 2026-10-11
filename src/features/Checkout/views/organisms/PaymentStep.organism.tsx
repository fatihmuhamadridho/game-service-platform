'use client';

import { useEffect, useState } from 'react';
import { Box, Button } from 'rangkaui';
import {
  IconArrowRight,
  IconBuildingBank,
  IconCheck,
  IconClock,
  IconCreditCard,
  IconDeviceGamepad2,
  IconLock,
  IconQrcode,
  IconReceipt,
  IconShieldCheck,
  IconShoppingBag,
  IconWallet,
} from '@tabler/icons-react';
import type { CheckoutService } from '../interfaces/checkout.interface';
import { PanelHeading } from '../atoms/PanelHeading.atom';
import styles from './PaymentStep.module.css';

type PaymentMethod = {
  id: string;
  name: string;
  detail: string;
  group: string;
  icon: typeof IconQrcode;
  color: string;
};
const methods: PaymentMethod[] = [
  {
    id: 'qris',
    name: 'QRIS',
    detail: 'Bayar dengan scan gambar QRIS',
    group: 'Metode Pembayaran',
    icon: IconQrcode,
    color: 'cyan',
  },
  {
    id: 'bca-transfer',
    name: 'Transfer Bank BCA',
    detail: 'Transfer manual ke rekening BCA',
    group: 'Metode Pembayaran',
    icon: IconBuildingBank,
    color: 'bank',
  },
];

type Props = {
  game: string;
  service: CheckoutService;
  quantity: number;
  total: number;
  details: Record<string, string>;
  formatPrice: (value: number) => string;
  onSubmit: () => void;
};

export const PaymentStep = ({ game, service, quantity, total, details, formatPrice, onSubmit }: Props) => {
  const [selected, setSelected] = useState('qris');
  const [promo, setPromo] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [paymentMessage, setPaymentMessage] = useState('');
  const [proofFile, setProofFile] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);
  const groups = [...new Set(methods.map((method) => method.group))];
  const countdown = `${Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, '0')}:${(secondsLeft % 60).toString().padStart(2, '0')}`;

  useEffect(() => {
    const timer = window.setInterval(() => setSecondsLeft((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearInterval(timer);
  }, []);

  function applyPromo() {
    setPromoMessage(
      promo.trim()
        ? 'Kode promo belum dapat diverifikasi karena layanan promo belum terhubung.'
        : 'Masukkan kode promo terlebih dahulu.'
    );
  }

  return (
    <div className={styles.layout}>
      <div className={styles.mainColumn}>
        <Box className={styles.panel} bordered rounded>
          <PanelHeading
            number="1"
            title="Pilih Metode Pembayaran"
            description="Pilih metode pembayaran yang paling nyaman untuk kamu gunakan."
          />
          <fieldset className={styles.methods}>
            <legend className={styles.visuallyHidden}>Metode pembayaran</legend>
            {groups.map((group) => (
              <section className={styles.group} key={group} aria-label={group}>
                <div className={styles.groupTitle}>
                  {group === 'QRIS' ? (
                    <IconQrcode />
                  ) : group === 'E-Wallet' ? (
                    <IconWallet />
                  ) : group === 'Transfer Bank' ? (
                    <IconBuildingBank />
                  ) : (
                    <IconReceipt />
                  )}
                  <strong>{group}</strong>
                  <small>Pembayaran divalidasi manual oleh admin</small>
                </div>
                {methods
                  .filter((method) => method.group === group)
                  .map((method) => {
                    const MethodIcon = method.icon;
                    const active = selected === method.id;
                    return (
                      <label key={method.id} className={`${styles.method} ${active ? styles.selected : ''}`}>
                        <input
                          type="radio"
                          name="payment-method"
                          value={method.id}
                          checked={active}
                          onChange={() => {
                            setSelected(method.id);
                            setPaymentMessage('');
                          }}
                        />
                        <span className={styles.radio} aria-hidden="true" />
                        <span className={`${styles.methodIcon} ${styles[method.color]}`}>
                          <MethodIcon aria-hidden="true" />
                        </span>
                        <span className={styles.methodCopy}>
                          <b>{method.name}</b>
                          <small>{method.detail}</small>
                        </span>
                        <span className={styles.fee}>Validasi manual</span>
                      </label>
                    );
                  })}
              </section>
            ))}
          </fieldset>
        </Box>

        <div className={styles.lowerPanels}>
          <Box className={styles.panel} bordered rounded>
            <h2 className={styles.subheading}>
              <IconCreditCard /> 2. Kode Promo / Voucher
            </h2>
            <p className={styles.panelDescription}>Punya kode promo? Masukkan di sini untuk mendapatkan diskon.</p>
            <form
              className={styles.promoForm}
              onSubmit={(event) => {
                event.preventDefault();
                applyPromo();
              }}
            >
              <label className={styles.visuallyHidden} htmlFor="promo-code">
                Masukkan kode promo
              </label>
              <input
                id="promo-code"
                value={promo}
                onChange={(event) => setPromo(event.target.value)}
                placeholder="Masukkan kode promo"
              />
              <Button type="submit" className={styles.applyButton}>
                Pakai
              </Button>
            </form>
            {promoMessage && (
              <p className={styles.inlineMessage} role="status">
                {promoMessage}
              </p>
            )}
          </Box>
          <Box className={styles.panel} bordered rounded>
            <h2 className={styles.subheading}>
              <IconReceipt /> 3. Instruksi Pembayaran
            </h2>
            <p className={styles.panelDescription}>
              Ikuti instruksi metode yang dipilih. Admin akan memeriksa bukti pembayaran secara manual.
            </p>
            <div className={styles.paymentInstructions}>
              {selected === 'qris' ? (
                <>
                  <div className={styles.qrPlaceholder}>
                    <IconQrcode />
                    <span>Gambar QRIS akan ditampilkan di sini</span>
                  </div>
                  <p>Gambar QRIS belum dikonfigurasi. Jangan transfer sebelum gambar resmi tersedia.</p>
                </>
              ) : (
                <div className={styles.bankPlaceholder}>
                  <IconBuildingBank />
                  <span>
                    <b>Rekening BCA</b>
                    <small>Nomor rekening dan nama pemilik akan ditampilkan di sini setelah dikonfigurasi.</small>
                  </span>
                </div>
              )}
            </div>
            <label className={styles.proofField}>
              <span>Upload Bukti Pembayaran</span>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(event) => {
                  setProofFile(event.target.files?.[0]?.name ?? '');
                  setPaymentMessage('');
                }}
              />
              <small>{proofFile || 'Pilih gambar atau PDF bukti transfer.'}</small>
            </label>
            <ol className={styles.instructions}>
              <li>
                <span>1</span>Pilih QRIS atau transfer BCA.
              </li>
              <li>
                <span>2</span>Bayar sesuai nominal dan instruksi.
              </li>
              <li>
                <span>3</span>Unggah bukti pembayaran.
              </li>
              <li>
                <span>4</span>Tunggu validasi manual dari admin.
              </li>
            </ol>
          </Box>
        </div>
      </div>

      <aside className={styles.sideColumn}>
        <Box className={`${styles.panel} ${styles.paymentCard}`} bordered rounded>
          <div className={styles.timer}>
            <span className={styles.clockIcon}>
              <IconClock />
            </span>
            <span>
              <small>Batas waktu pembayaran (simulasi)</small>
              <strong>{countdown}</strong>
              <em>Timer tampilan; pembatalan otomatis belum terhubung.</em>
            </span>
          </div>
          {secondsLeft === 0 && (
            <p className={styles.expired} role="status">
              Waktu simulasi habis. Provider pembayaran belum terhubung.
            </p>
          )}
          <h2>Ringkasan Order</h2>
          <div className={styles.gameRow}>
            <span className={styles.gameIcon}>
              <IconDeviceGamepad2 />
            </span>
            <strong>{game}</strong>
          </div>
          <dl className={styles.orderDetails}>
            <div>
              <dt>Layanan</dt>
              <dd>{service.name}</dd>
            </div>
            <div>
              <dt>Estimasi</dt>
              <dd>{service.estimate}</dd>
            </div>
            {details.account && (
              <div>
                <dt>Username / User ID</dt>
                <dd>{details.account}</dd>
              </div>
            )}
            {details.server && (
              <div>
                <dt>Server</dt>
                <dd>{details.server}</dd>
              </div>
            )}
            <div>
              <dt>Metode</dt>
              <dd>{methods.find((method) => method.id === selected)?.name}</dd>
            </div>
            {quantity > 1 && (
              <div>
                <dt>Jumlah</dt>
                <dd>{quantity}</dd>
              </div>
            )}
          </dl>
          <div className={styles.amounts}>
            <div>
              <span>Harga Layanan</span>
              <b>{formatPrice(total)}</b>
            </div>
            <div>
              <span>Biaya Metode</span>
              <b>Belum ditentukan</b>
            </div>
            <div>
              <span>Diskon Voucher</span>
              <b>—</b>
            </div>
          </div>
          <div className={styles.total}>
            <span>Total sementara</span>
            <strong>{formatPrice(total)}</strong>
            <small>Biaya metode belum ditentukan.</small>
          </div>
          <Button className={styles.payButton} disabled={secondsLeft === 0} onClick={onSubmit}>
            <IconShieldCheck /> Kirim Bukti Pembayaran <IconArrowRight />
          </Button>
          {paymentMessage && (
            <p className={styles.inlineMessage} role="status">
              {paymentMessage}
            </p>
          )}
          <p className={styles.secure}>
            <IconLock /> Pembayaran menunggu pemeriksaan manual admin.
          </p>
        </Box>
        <Box className={styles.panel} bordered rounded>
          <h2 className={styles.subheading}>
            <IconShieldCheck /> Garansi &amp; Keamanan
          </h2>
          <ul className={styles.securityList}>
            <li>
              <IconCheck /> Jangan bagikan password atau kode OTP.
            </li>
            <li>
              <IconCheck /> Periksa metode dan ringkasan pesanan sebelum membayar.
            </li>
            <li>
              <IconCheck /> Status pembayaran diperbarui setelah admin memvalidasi bukti.
            </li>
          </ul>
          <small className={styles.securityNote}>Ketentuan layanan mengikuti kebijakan yang berlaku.</small>
        </Box>
      </aside>
      <div className={styles.mobilePayBar}>
        <div>
          <small>Total sementara</small>
          <strong>{formatPrice(total)}</strong>
        </div>
        <Button disabled={secondsLeft === 0} onClick={onSubmit}>
          Kirim Bukti <IconArrowRight />
        </Button>
      </div>
    </div>
  );
};
