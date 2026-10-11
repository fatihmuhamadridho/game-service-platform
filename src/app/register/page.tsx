import type { Metadata } from 'next';
import { RegisterPage } from '@features/Auth/views/pages/Register.page';

export const metadata: Metadata = {
  title: 'Daftar Akun | JokiHub',
  description: 'Buat akun JokiHub untuk mengakses layanan gaming.',
};

export default function RegisterRoute() {
  return <RegisterPage />;
}
