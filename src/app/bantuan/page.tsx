import { HelpPage } from '@features/Help/views/pages/Help.page';
import { notFound } from 'next/navigation';
import { FEATURE_SPRINT_2 } from '@configs/base.config';

export default function Page() {
  if (!FEATURE_SPRINT_2) notFound();

  return <HelpPage />;
}
