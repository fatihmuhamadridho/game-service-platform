import type { HomeBenefit } from '../interfaces/homeV2.interface';
import { SectionHeading } from '../atoms/SectionHeading.atom';
import { BenefitCard } from '../molecules/BenefitCard.molecule';
import styles from './Benefits.module.css';

export const Benefits = ({ items }: { items: HomeBenefit[] }) => (
  <section className={styles.section}>
    <SectionHeading title="Kenapa Pilih JokiHub?" />
    <div className={styles.grid}>
      {items.map((item) => (
        <BenefitCard item={item} key={item.title} />
      ))}
    </div>
  </section>
);
