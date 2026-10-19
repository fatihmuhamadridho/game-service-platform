import type { Metadata } from 'next';
import { ResetPasswordPage } from '@features/Auth/views/pages/ResetPassword.page';
import { notFound } from 'next/navigation';
import { FEATURE_PASSWORD_RECOVERY } from '@configs/base.config';

export const metadata: Metadata = {
  title: 'Atur Password Baru | JokiHub',
  description: 'Atur password baru untuk akun JokiHub kamu.',
};

export default function ResetPasswordRoute() {
  if (!FEATURE_PASSWORD_RECOVERY) notFound();

  return <ResetPasswordPage />;
}
