import { IconBrandApple, IconBrandFacebookFilled, IconBrandGoogleFilled } from '@tabler/icons-react';
import styles from '../templates/Auth.module.css';

export function AuthSocial({ verb }: { verb: 'Masuk' | 'Daftar' }) {
  return (
    <div className={styles.socials}>
      <button type="button" className={styles.socialButton} aria-label={`${verb} dengan Google`}>
        <IconBrandGoogleFilled className={styles.googleIcon} aria-hidden="true" />
        <span>Google</span>
      </button>
      <button type="button" className={styles.socialButton} aria-label={`${verb} dengan Facebook`}>
        <IconBrandFacebookFilled className={styles.facebookIcon} aria-hidden="true" />
        <span>Facebook</span>
      </button>
      <button type="button" className={styles.socialButton} aria-label={`${verb} dengan Apple`}>
        <IconBrandApple aria-hidden="true" />
        <span>Apple</span>
      </button>
    </div>
  );
}
