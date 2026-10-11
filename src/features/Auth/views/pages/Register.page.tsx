import { RegisterForm } from '../organisms/RegisterForm.organism';
import { AuthTemplate } from '../templates/Auth.template';

export function RegisterPage() {
  return (
    <AuthTemplate mode="register">
      <RegisterForm />
    </AuthTemplate>
  );
}
