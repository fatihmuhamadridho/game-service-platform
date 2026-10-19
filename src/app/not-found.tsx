import { RouteErrorState } from '@common-ui/organisms/RouteErrorState/RouteErrorState';

export default function NotFound() {
  return <RouteErrorState code={404} />;
}
