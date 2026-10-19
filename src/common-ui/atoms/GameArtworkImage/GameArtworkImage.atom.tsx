import Image from 'next/image';
import styles from './GameArtworkImage.module.css';

type Props = {
  src: string;
  sizes: string;
};

export const GameArtworkImage = ({ src, sizes }: Props) => (
  <Image src={src} alt="" fill sizes={sizes} className={styles.image} />
);
