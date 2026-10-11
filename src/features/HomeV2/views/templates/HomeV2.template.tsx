import type { HomeBenefit, HomeCategory, HomeGame } from '../interfaces/homeV2.interface';
import { HeroSection } from '../organisms/HeroSection.organism';
import { PopularGames } from '../organisms/PopularGames.organism';
import { ServiceCategories } from '../organisms/ServiceCategories.organism';
import { PromoBanner } from '../organisms/PromoBanner.organism';
import { Benefits } from '../organisms/Benefits.organism';
import { Footer } from '@common-ui/organisms/Footer/Footer';
import { Header } from '@common-ui/organisms/Header/Header';
import styles from './HomeV2.module.css';

type Props = {
  games: HomeGame[];
  categories: HomeCategory[];
  benefits: HomeBenefit[];
};
export const HomeV2Template = ({ games, categories, benefits }: Props) => (
  <main className={styles.page}>
    <Header activePage="home" />
    <div className={styles.content} id="home">
      <HeroSection />
      <PopularGames games={games} />
      <ServiceCategories categories={categories} />
      <PromoBanner />
      <Benefits items={benefits} />
    </div>
    <Footer />
  </main>
);
