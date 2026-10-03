'use client';

import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useUserContext } from '@contexts/user.context';
import { useGetDetailUser } from '@core/infrastructure/user.hook';
import { useGetProducts } from '@features/Home/infrastructure/product.hook';
import type { ProductCardView } from '../interfaces/product.interface';
import { HomeTemplate } from '../templates/Home.template';

type PaginationMeta = {
  totalPages: number;
  totalItems: number;
};

const HomePage = () => {
  const { state, setState } = useUserContext();
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data, isLoading, isFetching, isError, error } = useGetProducts({ limit, page });
  const { data: userData } = useGetDetailUser({ id: '1' });
  const products: ProductCardView[] =
    data?.data?.map((product) => ({
      id: product.id,
      title: product.title,
      description: product.description,
      category: product.category,
      price: product.price,
      stock: product.stock,
      thumbnail: product.thumbnail,
      images: product.images,
    })) ?? [];
  const paginationMeta: PaginationMeta = data?.meta ?? {
    totalPages: 0,
    totalItems: 0,
  };
  const fullName = `${state?.data?.firstName ?? ''} ${state?.data?.lastName ?? ''}`.trim() || 'Guest User';
  const avatarSrc = state?.data?.image;
  const avatarLabel = `${state?.data?.firstName?.[0] ?? ''}${state?.data?.lastName?.[0] ?? ''}`.trim() || 'GU';
  const userRole = state?.data?.role ?? 'Member';

  useEffect(() => {
    if (userData) {
      setState(userData);
    }
  }, [setState, userData]);

  return (
    <>
      <Head>
        <title>Home | nextjs-boilerplate</title>
        <meta name="description" content="Home page with product listing from Fake Store API" />
      </Head>
      <HomeTemplate
        headerTitle="Home"
        headerSubtitle="Product listing shell"
        userName={fullName}
        userRole={userRole}
        avatarSrc={avatarSrc}
        avatarLabel={avatarLabel}
        products={products}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        errorMessage={error instanceof Error ? error.message : undefined}
        currentPage={page}
        totalPages={paginationMeta.totalPages}
        totalItems={paginationMeta.totalItems}
        onPageChange={setPage}
      />
    </>
  );
};

export default HomePage;
