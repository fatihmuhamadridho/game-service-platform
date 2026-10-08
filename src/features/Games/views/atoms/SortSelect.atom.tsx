import styles from './SortSelect.module.css';
type Props = { value: string; onChange: (value: string) => void };
export const SortSelect = ({ value, onChange }: Props) => (
  <label className={styles.sort}>
    Urutkan
    <select value={value} onChange={(event) => onChange(event.target.value)}>
      <option>Paling Populer</option>
      <option>Rating Tertinggi</option>
      <option>Nama A–Z</option>
    </select>
  </label>
);
