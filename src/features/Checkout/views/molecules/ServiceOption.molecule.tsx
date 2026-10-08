import { IconChevronRight } from '@tabler/icons-react';
import type { CheckoutService } from '../interfaces/checkout.interface';
import styles from './ServiceOption.module.css';
type Props = { service: CheckoutService; selected: boolean; priceLabel: string; onSelect: () => void };
export const ServiceOption = ({ service, selected, priceLabel, onSelect }: Props) => (
  <div className={`${styles.row} ${selected ? styles.selected : ''}`}>
    <button className={styles.select} role="radio" aria-checked={selected} onClick={onSelect}>
      <span className={styles.radio} />
      <span className={styles.text}>
        <b>{service.name}</b>
        <small>Estimasi {service.estimate}</small>
      </span>
      {service.price ? <strong>{priceLabel}</strong> : <span className={styles.custom}>Hubungi admin</span>}
    </button>
    {service.custom && selected && (
      <a className={styles.ask} href="#bantuan" id="custom-service">
        Tanya Admin <IconChevronRight />
      </a>
    )}
  </div>
);
