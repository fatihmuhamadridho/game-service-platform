import { Box } from 'rangkaui';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import {
  IconBuildingBank,
  IconCircleCheck,
  IconClock,
  IconQrcode,
  IconShieldCheck,
  IconUpload,
} from '@tabler/icons-react';
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
  featureSprint2: boolean;
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
  proofFile: File | null;
  onProofFileChange: (file: File | null) => void;
  uploadingProof: boolean;
  uploadProgress: number;
  proofUploaded: boolean;
  proofMessage: string;
  onUploadProof: () => void;
  onReportPaid: () => void;
};

export const PaymentStep = ({
  featureSprint2,
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
  proofFile,
  onProofFileChange,
  uploadingProof,
  uploadProgress,
  proofUploaded,
  proofMessage,
  onUploadProof,
  onReportPaid,
}: Props) => {
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (!proofFile) {
      setPreviewUrl('');
      return;
    }
    const url = URL.createObjectURL(proofFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [proofFile]);

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
              {featureSprint2 && (
                <>
                  <p className={styles.inlineMessage}>
                    <IconShieldCheck /> Unggah bukti transfer agar pembayaran dapat diperiksa admin.
                  </p>
                  <div className={styles.proofUpload}>
                    <label className={styles.proofField} htmlFor="payment-proof-file">
                      Bukti pembayaran <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="payment-proof-file"
                      className={styles.proofInput}
                      type="file"
                      accept="image/jpeg,image/png"
                      required
                      disabled={uploadingProof || proofUploaded}
                      onChange={(event) => onProofFileChange(event.currentTarget.files?.[0] ?? null)}
                    />
                    <small className={styles.proofHint}>JPG atau PNG, maksimal 5 MB.</small>
                    {previewUrl && (
                      <div className={styles.proofPreview}>
                        <Image src={previewUrl} alt="Pratinjau bukti pembayaran" width={240} height={180} unoptimized />
                        <span>{proofFile?.name}</span>
                      </div>
                    )}
                    {uploadingProof && (
                      <div
                        className={styles.uploadProgress}
                        role="progressbar"
                        aria-label="Progres unggah bukti pembayaran"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={uploadProgress}
                      >
                        <span style={{ width: `${uploadProgress}%` }} />
                        <small>Mengunggah… {uploadProgress}%</small>
                      </div>
                    )}
                    {!proofUploaded && (
                      <button
                        className={styles.uploadButton}
                        type="button"
                        disabled={!proofFile || uploadingProof}
                        onClick={onUploadProof}
                      >
                        <IconUpload /> {uploadingProof ? 'Mengunggah bukti…' : 'Unggah Bukti Pembayaran'}
                      </button>
                    )}
                    {proofMessage && (
                      <p className={styles.proofMessage} role={proofUploaded ? 'status' : 'alert'}>
                        {proofMessage}
                      </p>
                    )}
                  </div>
                </>
              )}
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
            <button
              className={styles.payButton}
              type="button"
              disabled={reportingPayment || (featureSprint2 && !proofUploaded)}
              onClick={onReportPaid}
            >
              {reportingPayment ? 'Membuka status pesanan…' : 'Sudah Bayar'}
            </button>
          )}
          <p className={styles.manualReview}>Pesanan diproses setelah admin memvalidasi pembayaran.</p>
        </Box>
      </aside>
    </div>
  );
};
