import { forbidden } from 'next/navigation';

export default function ForbiddenRoute(): never {
  forbidden();
}
