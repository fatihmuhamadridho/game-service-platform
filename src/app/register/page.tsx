import type { Metadata } from 'next';
import { RegisterPage } from '@features/Auth/views/pages/Register.page';
import { notFound } from 'next/navigation';
import { FEATURE_REGISTER } from '@configs/base.config';

export const metadata: Metadata = {
  title: 'Daftar Akun | JokiHub',
  description: 'Buat akun JokiHub untuk mengakses layanan gaming.',
};

export default function RegisterRoute() {
  if (!FEATURE_REGISTER) notFound();

  return <RegisterPage />;
}
