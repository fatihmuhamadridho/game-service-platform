import { ForgotPasswordForm } from '../organisms/ForgotPasswordForm.organism';
import { AuthTemplate } from '../templates/Auth.template';

export function ForgotPasswordPage() {
  return (
    <AuthTemplate mode="recovery">
      <ForgotPasswordForm />
    </AuthTemplate>
  );
}
