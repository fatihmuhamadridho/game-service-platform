import type { Metadata } from 'next';
import { ForgotPasswordPage } from '@features/Auth/views/pages/ForgotPassword.page';
import { notFound } from 'next/navigation';
import { FEATURE_PASSWORD_RECOVERY } from '@configs/base.config';

export const metadata: Metadata = {
  title: 'Pulihkan Password | JokiHub',
  description: 'Pulihkan akses ke akun JokiHub kamu.',
};

export default function ForgotPasswordRoute() {
  if (!FEATURE_PASSWORD_RECOVERY) notFound();

  return <ForgotPasswordPage />;
}
