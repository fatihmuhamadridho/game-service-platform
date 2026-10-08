'use client';

import { useMemo, useState } from 'react';
import { Box, Button } from 'rangkaui';
import {
  IconArrowRight,
  IconBrandWhatsapp,
  IconChevronDown,
  IconChevronRight,
  IconCreditCard,
  IconDeviceGamepad2,
  IconFileText,
  IconHeadset,
  IconLock,
  IconMessageCircle,
  IconSearch,
  IconShieldCheck,
  IconTag,
  IconWallet,
} from '@tabler/icons-react';
import { Header } from '@common-ui/Header/Header';
import { Footer } from '@common-ui/Footer/Footer';
import styles from './Help.module.css';

const topics = [
  {
    name: 'Pemesanan',
    description: 'Panduan order dan manajemen pesanan.',
    count: 12,
    icon: <IconFileText />,
    tone: 'blue',
  },
  {
    name: 'Pembayaran',
    description: 'Metode pembayaran, konfirmasi, dan refund.',
    count: 10,
    icon: <IconWallet />,
    tone: 'purple',
  },
  {
    name: 'Layanan Game',
    description: 'Informasi layanan dan proses pengerjaan.',
    count: 18,
    icon: <IconDeviceGamepad2 />,
    tone: 'cyan',
  },
  {
    name: 'Akun & Keamanan',
    description: 'Login, keamanan akun, dan data pribadi.',
    count: 8,
    icon: <IconShieldCheck />,
    tone: 'green',
  },
  {
    name: 'Promo & Voucher',
    description: 'Cara menggunakan voucher dan promo.',
    count: 5,
    icon: <IconTag />,
    tone: 'orange',
  },
  { name: 'Lainnya', description: 'Pertanyaan umum lainnya.', count: 7, icon: <IconMessageCircle />, tone: 'slate' },
];

const articles = [
  {
    title: 'Cara Melakukan Pemesanan',
    description: 'Panduan lengkap langkah demi langkah untuk melakukan pemesanan layanan.',
    topic: 'Pemesanan',
    icon: <IconFileText />,
    tone: 'blue',
  },
  {
    title: 'Cara Cek Status Pesanan',
    description: 'Pelajari cara mengecek status pesanan kamu dengan mudah.',
    topic: 'Pemesanan',
    icon: <IconShieldCheck />,
    tone: 'green',
  },
  {
    title: 'Metode Pembayaran yang Tersedia',
    description: 'Daftar metode pembayaran yang bisa kamu gunakan.',
    topic: 'Pembayaran',
    icon: <IconCreditCard />,
    tone: 'orange',
  },
  {
    title: 'Estimasi Waktu Pengerjaan',
    description: 'Informasi estimasi waktu untuk setiap jenis layanan.',
    topic: 'Layanan Game',
    icon: <IconMessageCircle />,
    tone: 'purple',
  },
  {
    title: 'Kebijakan Refund',
    description: 'Syarat dan ketentuan untuk pengajuan refund.',
    topic: 'Pembayaran',
    icon: <IconLock />,
    tone: 'red',
  },
];

const questions = [
  {
    question: 'Berapa lama proses pengerjaan layanan?',
    answer:
      'Estimasi pengerjaan bergantung pada jenis layanan dan detail pesanan. Periksa estimasi yang tercantum pada layanan sebelum memesan.',
  },
  {
    question: 'Apakah akun saya aman?',
    answer:
      'Jangan pernah membagikan password atau kode OTP melalui formulir umum. Ikuti instruksi keamanan yang tercantum pada layanan.',
  },
  {
    question: 'Bisa request hero atau game mode tertentu?',
    answer:
      'Kebutuhan khusus dapat dicantumkan di bagian detail tambahan. Ketersediaannya perlu dikonfirmasi oleh admin.',
  },
  {
    question: 'Bagaimana jika terjadi kendala saat proses?',
    answer:
      'Simpan nomor pesanan dan detail transaksi. Kanal dukungan akan membantu setelah kontak resmi dikonfigurasi.',
  },
  {
    question: 'Apakah bisa refund?',
    answer:
      'Ketentuan refund bergantung pada kebijakan layanan. Pastikan membaca syarat yang berlaku sebelum membuat pesanan.',
  },
  {
    question: 'Apakah ada garansi?',
    answer: 'Ketentuan garansi perlu dikonfirmasi pada detail setiap layanan sebelum pemesanan.',
  },
  {
    question: 'Bagaimana cara menggunakan voucher?',
    answer: 'Masukkan kode voucher pada bagian yang disediakan saat pemesanan, jika opsi tersebut tersedia.',
  },
];

export const HelpPage = () => {
  const [search, setSearch] = useState('');
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [adminNotice, setAdminNotice] = useState(false);
  const query = search.trim().toLowerCase();
  const visibleArticles = useMemo(
    () =>
      articles.filter(
        (article) =>
          (!activeTopic || article.topic === activeTopic) &&
          (!query || `${article.title} ${article.description} ${article.topic}`.toLowerCase().includes(query))
      ),
    [activeTopic, query]
  );
  const visibleQuestions = useMemo(
    () =>
      questions.filter(
        (item) =>
          (!query || `${item.question} ${item.answer}`.toLowerCase().includes(query)) &&
          (!activeTopic ||
            item.question.toLowerCase().includes(activeTopic.toLowerCase()) ||
            item.answer.toLowerCase().includes(activeTopic.toLowerCase()))
      ),
    [activeTopic, query]
  );

  return (
    <main className={styles.page}>
      <Header />
      <div className={styles.content}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <a href="/homepagev2">Beranda</a>
          <IconChevronRight />
          <b>Bantuan</b>
        </nav>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <h1>
              Pusat Bantuan <span>JokiHub</span>
            </h1>
            <p>
              Temukan jawaban untuk pertanyaan kamu seputar pemesanan, pembayaran, proses pengerjaan, dan layanan
              lainnya.
            </p>
            <form className={styles.search} onSubmit={(event) => event.preventDefault()}>
              <IconSearch />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Cari pertanyaan atau kata kunci"
                placeholder="Cari pertanyaan atau kata kunci..."
              />
              <Button type="submit" className={styles.searchButton}>
                Cari
              </Button>
            </form>
            <small className={styles.searchHint}>Contoh: cara top up, status pesanan, refund, jenis layanan</small>
          </div>
          <div className={styles.heroArt} aria-hidden="true">
            <span className={styles.blueShape} />
            <span className={styles.questionBubble}>?</span>
            <span className={styles.chatBubble}>•••</span>
            <div className={styles.person}>
              <i />
              <b />
              <em />
            </div>
          </div>
        </section>

        <section className={styles.topicsSection}>
          <div className={styles.sectionHeading}>
            <div>
              <h2>Pilih Topik Bantuan</h2>
              <p>Pilih kategori yang sesuai dengan kebutuhan kamu.</p>
            </div>
            <button onClick={() => setActiveTopic(null)}>
              Lihat Semua Topik <IconArrowRight />
            </button>
          </div>
          <div className={styles.topicGrid}>
            {topics.map((topic) => (
              <button
                key={topic.name}
                className={`${styles.topicCard} ${activeTopic === topic.name ? styles.topicActive : ''}`}
                onClick={() => setActiveTopic(activeTopic === topic.name ? null : topic.name)}
              >
                <span className={`${styles.topicIcon} ${styles[topic.tone]}`}>{topic.icon}</span>
                <b>{topic.name}</b>
                <small>{topic.description}</small>
                <em>{topic.count} artikel</em>
              </button>
            ))}
          </div>
        </section>

        <div className={styles.infoGrid}>
          <section className={styles.articleSection}>
            <div className={styles.sectionHeading}>
              <div>
                <h2>Artikel Populer</h2>
                <p>Artikel yang paling sering dicari oleh pengguna JokiHub.</p>
              </div>
              <a href="#artikel">
                Lihat Semua <IconArrowRight />
              </a>
            </div>
            <div className={styles.articleList}>
              {visibleArticles.length ? (
                visibleArticles.map((article) => (
                  <a href="#artikel" className={styles.article} key={article.title}>
                    <span className={`${styles.articleIcon} ${styles[article.tone]}`}>{article.icon}</span>
                    <span className={styles.articleText}>
                      <b>{article.title}</b>
                      <small>{article.description}</small>
                    </span>
                    <IconChevronRight className={styles.articleArrow} />
                  </a>
                ))
              ) : (
                <p className={styles.empty}>Tidak ada artikel yang cocok. Coba kata kunci lain.</p>
              )}
            </div>
          </section>
          <section className={styles.faqSection}>
            <div className={styles.sectionHeading}>
              <div>
                <h2>Pertanyaan Umum (FAQ)</h2>
                <p>Pertanyaan yang sering ditanyakan oleh pengguna.</p>
              </div>
              <a href="#faq">
                Lihat Semua FAQ <IconArrowRight />
              </a>
            </div>
            <div className={styles.faqList}>
              {visibleQuestions.length ? (
                visibleQuestions.map((item) => (
                  <details className={styles.faq} key={item.question}>
                    <summary>
                      {item.question}
                      <IconChevronDown />
                    </summary>
                    <p>{item.answer}</p>
                  </details>
                ))
              ) : (
                <p className={styles.empty}>Tidak ada pertanyaan yang cocok.</p>
              )}
            </div>
          </section>
        </div>

        <section className={styles.support}>
          <span className={styles.supportIcon}>
            <IconHeadset />
          </span>
          <div>
            <h2>Masih Butuh Bantuan?</h2>
            <p>Tim bantuan siap membantu menjawab pertanyaan kamu.</p>
          </div>
          <div className={styles.supportArt} aria-hidden="true">
            <IconMessageCircle />
            <IconHeadset />
            <IconMessageCircle />
          </div>
          <Button className={styles.adminButton} onClick={() => setAdminNotice(!adminNotice)}>
            <IconBrandWhatsapp /> Hubungi Admin <IconArrowRight />
          </Button>
          {adminNotice && (
            <small className={styles.adminNotice} role="status">
              Kanal admin belum dikonfigurasi. Silakan coba kembali nanti.
            </small>
          )}
        </section>
      </div>
      <Footer />
    </main>
  );
};
