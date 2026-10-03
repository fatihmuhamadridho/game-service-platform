import { Box } from 'rangkaui';
import styles from './Home.module.css';
import { HomeHeader } from '../organisms/HomeHeader.organism';
import { ProductList } from '../organisms/ProductList.organism';
import type { ProductCardView } from '../interfaces/product.interface';

type HomeTemplateProps = {
  headerTitle: string;
  headerSubtitle: string;
  userName: string;
  userRole: string;
  avatarSrc?: string;
  avatarLabel: string;
  products: ProductCardView[];
  isLoading: boolean;
  isFetching?: boolean;
  isError: boolean;
  errorMessage?: string;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
};

export const HomeTemplate = ({
  headerTitle,
  headerSubtitle,
  userName,
  userRole,
  avatarSrc,
  avatarLabel,
  products,
  isLoading,
  isFetching,
  isError,
  errorMessage,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}: HomeTemplateProps) => {
  return (
    <Box className={styles.root}>
      <HomeHeader
        title={headerTitle}
        subtitle={headerSubtitle}
        userName={userName}
        userRole={userRole}
        avatarSrc={avatarSrc}
        avatarLabel={avatarLabel}
      />
      <main className={styles.main}>
        <ProductList
          products={products}
          isLoading={isLoading}
          isFetching={isFetching}
          isError={isError}
          errorMessage={errorMessage}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={onPageChange}
        />
      </main>
    </Box>
  );
};
