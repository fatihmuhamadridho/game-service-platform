import { LoginForm } from '../organisms/LoginForm.organism';
import { AuthTemplate } from '../templates/Auth.template';

export function LoginPage() {
  return (
    <AuthTemplate mode="login">
      <LoginForm />
    </AuthTemplate>
  );
}
