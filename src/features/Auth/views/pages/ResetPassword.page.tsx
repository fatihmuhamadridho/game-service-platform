import { ResetPasswordForm } from '../organisms/ResetPasswordForm.organism';
import { AuthTemplate } from '../templates/Auth.template';

export function ResetPasswordPage() {
  return (
    <AuthTemplate mode="reset">
      <ResetPasswordForm />
    </AuthTemplate>
  );
}
