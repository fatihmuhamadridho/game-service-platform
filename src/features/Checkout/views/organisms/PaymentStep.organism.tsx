import { Box } from 'rangkaui';
import Image from 'next/image';
import { IconBuildingBank, IconCircleCheck, IconClock, IconQrcode, IconShieldCheck } from '@tabler/icons-react';
import type { CheckoutService } from '../interfaces/checkout.interface';
import { PanelHeading } from '../atoms/PanelHeading.atom';
import styles from './PaymentStep.module.css';

type Instructions = {
  qrImageUrl: string | null;
  bankName: string | null;
  accountNumber: string | null;
  accountHolder: string | null;
  reference: string | null;
};

type Props = {
  game: string;
  service: CheckoutService;
  quantity: number;
  total: number;
  formatPrice: (value: number) => string;
  paymentMethod: string;
  instructions?: Instructions;
  expiresAt?: string;
  orderNumber: string;
  reportingPayment: boolean;
  paymentReported: boolean;
  reportMessage: string;
  onReportPaid: () => void;
};

export const PaymentStep = ({
  game,
  service,
  quantity,
  total,
  formatPrice,
  paymentMethod,
  instructions,
  expiresAt,
  orderNumber,
  reportingPayment,
  paymentReported,
  reportMessage,
  onReportPaid,
}: Props) => {
  return (
    <div className={styles.layout}>
      <div className={styles.mainColumn}>
        <Box className={styles.panel} bordered rounded>
          {paymentReported ? (
            <div className={styles.reportedState} role="status">
              <span className={styles.reportedIcon}>
                <IconCircleCheck />
              </span>
              <p className={styles.reportedEyebrow}>Konfirmasi terkirim</p>
              <h2>Pembayaran dilaporkan</h2>
              <p>Admin akan memeriksa pembayaran secara manual. Status pesanan berubah setelah pemeriksaan selesai.</p>
              <strong>Menunggu validasi admin</strong>
            </div>
          ) : (
            <>
              <PanelHeading
                number="2"
                title="Instruksi Pembayaran"
                description="Gunakan instruksi resmi dari pesanan yang dibuat."
              />
              <div className={styles.paymentInstructions}>
                {paymentMethod === 'QRIS' ? (
                  instructions?.qrImageUrl ? (
                    <div className={styles.qrFrame}>
                      <Image
                        src={instructions.qrImageUrl}
                        alt="Kode QR pembayaran"
                        width={320}
                        height={400}
                        unoptimized
                      />
                    </div>
                  ) : (
                    <p>
                      <IconQrcode /> Instruksi QRIS belum dikonfigurasi.
                    </p>
                  )
                ) : instructions?.accountNumber ? (
                  <div className={styles.bankPlaceholder}>
                    <IconBuildingBank />
                    <span>
                      <b>{instructions.bankName}</b>
                      <small>
                        {instructions.accountNumber} · {instructions.accountHolder}
                      </small>
                    </span>
                  </div>
                ) : (
                  <p>
                    <IconBuildingBank /> Instruksi transfer belum dikonfigurasi.
                  </p>
                )}
              </div>
              <p className={styles.inlineMessage}>
                <IconShieldCheck /> Setelah bayar, tekan “Sudah Bayar” untuk validasi admin.
              </p>
            </>
          )}
        </Box>
      </div>
      <aside className={styles.sideColumn}>
        <Box className={styles.panel} bordered rounded>
          <h2 className={styles.summaryTitle}>Ringkasan pembayaran</h2>
          <dl className={styles.orderFacts}>
            <div>
              <dt>Nomor pesanan</dt>
              <dd>{orderNumber}</dd>
            </div>
            <div>
              <dt>Game</dt>
              <dd>{game}</dd>
            </div>
            <div>
              <dt>Layanan</dt>
              <dd>{service.name}</dd>
            </div>
            <div>
              <dt>Jumlah</dt>
              <dd>{quantity}</dd>
            </div>
            {instructions?.reference && (
              <div>
                <dt>Referensi</dt>
                <dd>{instructions.reference}</dd>
              </div>
            )}
          </dl>
          {expiresAt && (
            <p className={styles.expiry}>
              <IconClock /> Bayar sebelum {new Date(expiresAt).toLocaleString('id-ID')}
            </p>
          )}
          <div className={styles.total}>
            <span>Total yang harus dibayar</span>
            <strong>{formatPrice(total)}</strong>
          </div>
          {!paymentReported && (
            <button className={styles.payButton} type="button" disabled={reportingPayment} onClick={onReportPaid}>
              {reportingPayment ? 'Mengirim konfirmasi…' : 'Sudah Bayar'}
            </button>
          )}
          {reportMessage && (
            <p className={styles.inlineMessage} role={paymentReported ? 'status' : 'alert'}>
              {reportMessage}
            </p>
          )}
          <p className={styles.manualReview}>Pesanan diproses setelah admin memvalidasi pembayaran.</p>
        </Box>
      </aside>
    </div>
  );
};
