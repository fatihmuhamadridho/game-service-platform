import styles from './PanelHeading.module.css';
type Props = { number: string; title: string; description: string };
export const PanelHeading = ({ number, title, description }: Props) => (
  <div className={styles.heading}>
    <span>{number}.</span>
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  </div>
);
