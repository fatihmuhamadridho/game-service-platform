import { RouteErrorState } from '@common-ui/organisms/RouteErrorState/RouteErrorState';

export default function Forbidden() {
  return <RouteErrorState code={403} />;
}
