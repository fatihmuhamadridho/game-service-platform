import { IconDeviceGamepad2 } from '@tabler/icons-react';
import styles from './CatalogHeader.module.css';
export const CatalogHeader = () => (
  <section className={styles.hero}>
    <div className={styles.text}>
      <h1>Daftar Game</h1>
      <p>Pilih game favorit kamu dan temukan layanan joki, top up, dan kebutuhan gaming lainnya.</p>
    </div>
    <div className={styles.art} aria-hidden="true">
      <span className={styles.orb} />
      <span className={styles.pad}>
        <IconDeviceGamepad2 />
      </span>
      <span className={styles.figure}>
        <i />
        <b />
        <em />
      </span>
      <span className={styles.slash} />
    </div>
  </section>
);
