import { IconArrowRight, IconBolt, IconDiamond, IconShieldCheck } from '@tabler/icons-react';
import Image from 'next/image';
import { Button } from 'rangkaui';
import styles from './HeroSection.module.css';

export const HeroSection = () => (
  <section className={styles.hero}>
    <div className={styles.copy}>
      <span className={styles.eyebrow}>Joki Game &amp; Top Up Terpercaya</span>
      <h1>
        Top Up Game &amp;
        <br />
        Joki <span>Tercepat</span>
      </h1>
      <p>Proses instan, aman, dan harga terbaik untuk semua game favorit kamu. Ribuan pemain sudah percaya JokiHub.</p>
      <div className={styles.trust}>
        <div>
          <i>
            <IconBolt />
          </i>
          <span>
            <b>Proses Cepat</b>
            <small>Mulai dalam hitungan detik</small>
          </span>
        </div>
        <div>
          <i>
            <IconShieldCheck />
          </i>
          <span>
            <b>Aman &amp; Terpercaya</b>
            <small>Data selalu aman</small>
          </span>
        </div>
        <div>
          <i>
            <IconDiamond />
          </i>
          <span>
            <b>Harga Kompetitif</b>
            <small>Lebih hemat</small>
          </span>
        </div>
      </div>
      <div className={styles.actions}>
        <Button
          className={styles.primary}
          onClick={() => document.getElementById('game')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Lihat Semua Layanan <IconArrowRight />
        </Button>
        <Button
          className={styles.secondary}
          variant="outline-secondary"
          onClick={() => document.getElementById('cek-pesanan')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Cek Pesanan
        </Button>
      </div>
    </div>
    <div className={styles.visual}>
      <Image
        src="/images/hero.png"
        alt="Gamer bermain di laptop dengan headset"
        fill
        priority
        sizes="(max-width: 700px) 100vw, 50vw"
        className={styles.illustration}
      />
    </div>
  </section>
);
