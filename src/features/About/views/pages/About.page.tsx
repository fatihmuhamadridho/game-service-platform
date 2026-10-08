import { Box } from 'rangkaui';
import {
  IconArrowRight,
  IconBolt,
  IconDeviceGamepad2,
  IconHeartHandshake,
  IconShieldCheck,
  IconSparkles,
  IconTargetArrow,
  IconUsers,
} from '@tabler/icons-react';
import { Header } from '@common-ui/Header/Header';
import { Footer } from '@common-ui/Footer/Footer';
import styles from './About.module.css';

const values = [
  {
    title: 'Cepat dan praktis',
    description: 'Bantu pemain menemukan layanan game dan melakukan pemesanan dengan langkah yang jelas.',
    icon: <IconBolt />,
  },
  {
    title: 'Mengutamakan keamanan',
    description: 'Kami mengingatkan pemain untuk menjaga data akun dan tidak membagikan password atau OTP.',
    icon: <IconShieldCheck />,
  },
  {
    title: 'Dibuat untuk gamers',
    description: 'Pengalaman disusun agar informasi game dan layanan mudah ditemukan di desktop maupun mobile.',
    icon: <IconDeviceGamepad2 />,
  },
];

export const AboutPage = () => (
  <main className={styles.page}>
    <Header />
    <div className={styles.content}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <a href="/homepagev2">Beranda</a>
        <span>/</span>
        <b>Tentang Kami</b>
      </nav>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>
            <IconSparkles /> Tentang JokiHub
          </span>
          <h1>
            Satu tempat untuk
            <br />
            kebutuhan <span>gaming</span> kamu.
          </h1>
          <p>
            JokiHub adalah konsep storefront layanan game yang membantu pemain menemukan pilihan top up, joki, voucher,
            dan kebutuhan digital dalam satu pengalaman.
          </p>
          <a href="/games" className={styles.primary}>
            Jelajahi Game <IconArrowRight />
          </a>
        </div>
        <div className={styles.art} aria-hidden="true">
          <span className={styles.artGlow} />
          <span className={styles.diamond}>
            <IconDeviceGamepad2 />
          </span>
          <span className={styles.orbit} />
          <span className={styles.spark}>✦</span>
        </div>
      </section>

      <section className={styles.story}>
        <div>
          <span className={styles.sectionLabel}>
            <IconHeartHandshake /> Cerita Kami
          </span>
          <h2>Pengalaman gaming yang lebih mudah dimulai dari sini.</h2>
        </div>
        <div className={styles.storyCopy}>
          <p>
            Menemukan layanan yang tepat bisa terasa membingungkan. JokiHub dirancang untuk mengumpulkan berbagai
            kebutuhan gaming dalam tampilan yang ringkas, membantu kamu membandingkan pilihan dan melanjutkan pemesanan
            dengan lebih mudah.
          </p>
          <p>
            Saat ini JokiHub masih berupa prototipe. Katalog, harga, estimasi, jaminan, dan informasi kontak perlu
            dikonfirmasi sebelum digunakan sebagai penawaran resmi.
          </p>
        </div>
      </section>

      <section className={styles.mission}>
        <div className={styles.missionIcon}>
          <IconTargetArrow />
        </div>
        <div>
          <span>Tujuan Kami</span>
          <h2>Membuat layanan gaming terasa mudah dijelajahi dan dipahami.</h2>
          <p>
            Kami ingin setiap pemain bisa menemukan informasi layanan dengan jelas, tahu langkah berikutnya, dan memesan
            dengan nyaman.
          </p>
        </div>
      </section>

      <section className={styles.values}>
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.sectionLabel}>Prinsip Kami</span>
            <h2>Hal yang kami utamakan</h2>
            <p>Nilai yang menjadi arah dalam merancang pengalaman JokiHub.</p>
          </div>
        </div>
        <div className={styles.valueGrid}>
          {values.map((value) => (
            <Box key={value.title} className={styles.valueCard} bordered rounded>
              <span>{value.icon}</span>
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </Box>
          ))}
        </div>
      </section>

      <section className={styles.contact}>
        <div className={styles.contactIcon}>
          <IconUsers />
        </div>
        <div>
          <h2>Ada pertanyaan atau masukan?</h2>
          <p>Tim bantuan dan informasi kontak akan ditampilkan di sini setelah detail resmi tersedia.</p>
        </div>
        <a href="/cek-pesanan">
          Cek Pesanan <IconArrowRight />
        </a>
      </section>
    </div>
    <Footer />
  </main>
);
