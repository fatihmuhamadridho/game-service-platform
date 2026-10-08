import { Button } from 'rangkaui';
import {
  IconDeviceDesktop,
  IconDeviceGamepad2,
  IconDeviceMobile,
  IconShieldCheck,
  IconStarFilled,
  IconUser,
} from '@tabler/icons-react';
import styles from './FilterChip.module.css';

const icons = [
  IconDeviceGamepad2,
  IconDeviceMobile,
  IconDeviceDesktop,
  IconDeviceGamepad2,
  IconShieldCheck,
  IconDeviceGamepad2,
  IconUser,
  IconStarFilled,
  IconStarFilled,
];
type Props = { label: string; index: number; active: boolean; onClick: () => void };
export const FilterChip = ({ label, index, active, onClick }: Props) => {
  const Icon = icons[index] ?? IconStarFilled;
  return (
    <Button
      className={`${styles.chip} ${active ? styles.active : ''}`}
      variant={active ? 'primary' : 'secondary'}
      onClick={onClick}
    >
      <Icon />
      {label}
    </Button>
  );
};
