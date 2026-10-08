import type { HomeCategory } from '../interfaces/homeV2.interface';
import { SectionHeading } from '../atoms/SectionHeading.atom';
import { CategoryCard } from '../molecules/CategoryCard.molecule';
import styles from './ServiceCategories.module.css';

export const ServiceCategories = ({ categories }: { categories: HomeCategory[] }) => (
  <section className={styles.section} id="kategori">
    <SectionHeading title="Kategori Layanan" description="Berbagai kebutuhan gaming & digital dalam satu tempat." />
    <div className={styles.grid}>
      {categories.map((item) => (
        <CategoryCard item={item} key={item.title} />
      ))}
    </div>
  </section>
);
