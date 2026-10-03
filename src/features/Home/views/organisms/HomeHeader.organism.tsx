import { Box } from 'rangkaui';
import styles from './HomeHeader.module.css';

type HomeHeaderProps = {
  title: string;
  subtitle: string;
  userName: string;
  userRole: string;
  avatarSrc?: string;
  avatarLabel: string;
};

export const HomeHeader = ({ title, subtitle, userName, userRole, avatarSrc, avatarLabel }: HomeHeaderProps) => {
  return (
    <header className={styles.header}>
      <Box className={styles.inner}>
        <Box className={styles.titleGroup}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </Box>

        <Box className={styles.userGroup}>
          {avatarSrc ? (
            <img src={avatarSrc} alt={userName} className={styles.avatar} />
          ) : (
            <span className={styles.avatarFallback}>{avatarLabel}</span>
          )}
          <Box className={styles.userMeta}>
            <p className={styles.userName}>{userName}</p>
            <p className={styles.userRole}>{userRole}</p>
          </Box>
        </Box>
      </Box>
    </header>
  );
};
