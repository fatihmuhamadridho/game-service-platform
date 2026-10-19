import { IconBrandDiscord, IconBrandInstagram, IconBrandTiktok, IconBrandYoutube } from '@tabler/icons-react';
import { BrandLogo } from '../Header/BrandLogo';
import { FEATURE_SPRINT_2 } from '@configs/base.config';
import styles from './Footer.module.css';

type Props = { variant?: 'full' | 'compact' };
export const Footer = ({ variant = 'full' }: Props) =>
  variant === 'compact' ? (
    <footer className={styles.compact} id="bantuan">
      <BrandLogo />
      <p>Solusi top up game, joki, dan kebutuhan digital terpercaya, cepat dan aman untuk para gamers.</p>
      <div className={styles.socials}>
        <a href="#discord" aria-label="Discord">
          <IconBrandDiscord />
        </a>
        <a href="#instagram" aria-label="Instagram">
          <IconBrandInstagram />
        </a>
        <a href="#youtube" aria-label="YouTube">
          <IconBrandYoutube />
        </a>
      </div>
      <small>© 2026 JokiHub. Semua hak dilindungi.</small>
    </footer>
  ) : (
    <footer className={styles.footer} id="bantuan">
      <div className={styles.grid}>
        <div className={styles.brand}>
          <BrandLogo />
          <p>Solusi top up game, joki, dan kebutuhan digital terpercaya, cepat dan aman untuk para gamers.</p>
          <div className={styles.socials}>
            <a href="#social" aria-label="Discord">
              <IconBrandDiscord />
            </a>
            <a href="#social" aria-label="Instagram">
              <IconBrandInstagram />
            </a>
            <a href="#social" aria-label="YouTube">
              <IconBrandYoutube />
            </a>
          </div>
        </div>
        <div>
          <h3>Quick Links</h3>
          <a href="/">Beranda</a>
          <a href="/games">Layanan</a>
          <a href="/cek-pesanan">Cek Pesanan</a>
          {FEATURE_SPRINT_2 && <a href="/bantuan">Bantuan</a>}
          <a href="#tentang">Tentang Kami</a>
        </div>
        <div>
          <h3>Layanan</h3>
          <a href="/games">Top Up Game</a>
          <a href="/games">Joki Game</a>
          <a href="/games">Voucher Game</a>
          <a href="/games">Pulsa &amp; Paket Data</a>
          <a href="/games">E-Wallet</a>
        </div>
        {FEATURE_SPRINT_2 && (
          <div>
            <h3>Bantuan</h3>
            <a href="#bantuan">Pusat Bantuan</a>
            <a href="#syarat">Syarat &amp; Ketentuan</a>
            <a href="#privasi">Kebijakan Privasi</a>
            <a href="/bantuan">Hubungi Kami</a>
          </div>
        )}
        <div>
          <h3>Kontak Kami</h3>
          <a href="mailto:cs@jokihub.id">✉ &nbsp;cs@jokihub.id</a>
          <a href="#whatsapp">◉ &nbsp;+62 812-3456-7890</a>
          <span>
            ◷ &nbsp;Senin - Minggu
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;08.00 - 24.00 WIB
          </span>
        </div>
      </div>
      <div className={styles.bottom}>
        <span>© 2026 JokiHub. Semua hak dilindungi.</span>
        <span>
          <a href="#syarat">Syarat &amp; Ketentuan</a>
          <a href="#privasi">Kebijakan Privasi</a>
        </span>
      </div>
    </footer>
  );
