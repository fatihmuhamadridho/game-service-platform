import { Box } from 'rangkaui';
import type { CheckoutService } from '../interfaces/checkout.interface';
import { PanelHeading } from '../atoms/PanelHeading.atom';
import { ServiceOption } from '../molecules/ServiceOption.molecule';
import styles from './ServicePicker.module.css';
type Props = {
  services: CheckoutService[];
  selected: number;
  formatPrice: (value: number) => string;
  onSelect: (index: number) => void;
};
export const ServicePicker = ({ services, selected, formatPrice, onSelect }: Props) => (
  <Box className={styles.panel} bordered rounded>
    <PanelHeading number="2" title="Pilih Layanan" description="Pilih layanan joki yang kamu butuhkan." />
    <div className={styles.list} role="radiogroup" aria-label="Pilih layanan">
      {services.map((service, index) => (
        <ServiceOption
          key={service.name}
          service={service}
          selected={selected === index}
          priceLabel={service.price ? formatPrice(service.price) : ''}
          onSelect={() => onSelect(index)}
        />
      ))}
    </div>
  </Box>
);
