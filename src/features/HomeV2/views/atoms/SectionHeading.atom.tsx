import { IconArrowRight } from '@tabler/icons-react';
import styles from './SectionHeading.module.css';

type Props = { title: string; description?: string; href?: string; linkLabel?: string };
export const SectionHeading = ({ title, description, href, linkLabel }: Props) => (
  <div className={styles.heading}>
    <div>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
    {href && linkLabel && (
      <a href={href}>
        {linkLabel}
        <IconArrowRight size={17} />
      </a>
    )}
  </div>
);
