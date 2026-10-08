import styles from './GameTag.module.css';
export const GameTag = ({ children }: { children: string }) => <span className={styles.tag}>{children}</span>;
