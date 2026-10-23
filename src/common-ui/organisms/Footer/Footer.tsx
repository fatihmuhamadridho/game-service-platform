'use client';

import { apiFetch } from '@services/apiFetch.service';

import { IconBrandDiscord, IconBrandInstagram, IconBrandTiktok, IconBrandYoutube, IconLink } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BrandLogo } from '../Header/BrandLogo';
import { FEATURE_SPRINT_2 } from '@configs/base.config';
import styles from './Footer.module.css';

type Props = { variant?: 'full' | 'compact' };
type PublicSettings = {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactWhatsapp: string;
  socialLinks: Array<{ label: string; url: string }>;
  businessHours: string | null;
};
type ServiceCategory = { name: string; slug: string };

const defaultSettings: PublicSettings = {
  siteName: 'JokiHub',
  siteDescription: '',
  contactEmail: '',
  contactWhatsapp: '',
  socialLinks: [],
  businessHours: null,
};

const SocialIcon = ({ label }: { label: string }) => {
  const normalizedLabel = label.toLowerCase();
  if (normalizedLabel.includes('discord')) return <IconBrandDiscord />;
  if (normalizedLabel.includes('instagram')) return <IconBrandInstagram />;
  if (normalizedLabel.includes('youtube')) return <IconBrandYoutube />;
  if (normalizedLabel.includes('tiktok')) return <IconBrandTiktok />;
  return <IconLink />;
};

export const Footer = ({ variant = 'full' }: Props) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  useEffect(() => {
    let active = true;
    const loadSettings = async () => {
      try {
        const response = await apiFetch('/api/settings/v1/public', { cache: 'no-store' });
        if (!response.ok) return;
        const result = (await response.json()) as { data?: Partial<PublicSettings> | null };
        if (active && result.data) setSettings({ ...defaultSettings, ...result.data });
      } catch {}
    };
    const loadServiceCategories = async () => {
      try {
        const response = await apiFetch('/api/service-categories/v1/list', { cache: 'no-store' });
        if (!response.ok) return;
        const result = (await response.json()) as { data?: { categories?: ServiceCategory[] } };
        if (active) setServiceCategories(result.data?.categories ?? []);
      } catch {}
    };
    void loadSettings();
    void loadServiceCategories();
    return () => {
      active = false;
    };
  }, []);

  const whatsappHref = settings.contactWhatsapp ? `https://wa.me/${settings.contactWhatsapp.replace(/\D/g, '')}` : null;
  const description = settings.siteDescription.trim();
  const year = new Date().getFullYear();

  return variant === 'compact' ? (
    <footer className={styles.compact} id="bantuan">
      <BrandLogo name={settings.siteName} />
      {description && <p>{description}</p>}
      <div className={styles.socials}>
        {settings.socialLinks.map((link) => (
          <a
            key={`${link.label}-${link.url}`}
            href={link.url}
            aria-label={link.label}
            title={link.label}
            target="_blank"
            rel="noreferrer"
          >
            <SocialIcon label={link.label} />
          </a>
        ))}
      </div>
      <small>
        © {year} {settings.siteName}. Semua hak dilindungi.
      </small>
    </footer>
  ) : (
    <footer className={styles.footer} id="bantuan">
      <div className={styles.grid}>
        <div className={styles.brand}>
          <BrandLogo name={settings.siteName} />
          {description && <p>{description}</p>}
          <div className={styles.socials}>
            {settings.socialLinks.map((link) => (
              <a
                key={`${link.label}-${link.url}`}
                href={link.url}
                aria-label={link.label}
                title={link.label}
                target="_blank"
                rel="noreferrer"
              >
                <SocialIcon label={link.label} />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h3>Quick Links</h3>
          <Link href="/">Beranda</Link>
          <a href="/games">Layanan</a>
          <Link href="/cek-pesanan">Cek Pesanan</Link>
          {FEATURE_SPRINT_2 && <a href="/bantuan">Bantuan</a>}
          <a href="#tentang">Tentang Kami</a>
        </div>
        <div>
          <h3>Layanan</h3>
          {serviceCategories.map((category) => (
            <Link key={category.slug} href="/games">
              {category.name}
            </Link>
          ))}
        </div>
        {FEATURE_SPRINT_2 && (
          <div>
            <h3>Bantuan</h3>
            <a href="#bantuan">Pusat Bantuan</a>
            <a href="#syarat">Syarat &amp; Ketentuan</a>
            <a href="#privasi">Kebijakan Privasi</a>
            <a href="/bantuan">Hubungi Kami</a>
          </div>
        )}
        <div>
          <h3>Kontak Kami</h3>
          {settings.contactEmail && <a href={`mailto:${settings.contactEmail}`}>✉ &nbsp;{settings.contactEmail}</a>}
          {whatsappHref && (
            <a href={whatsappHref} target="_blank" rel="noreferrer">
              ◉ &nbsp;{settings.contactWhatsapp}
            </a>
          )}
          {settings.businessHours && <span>◷ &nbsp;{settings.businessHours}</span>}
        </div>
      </div>
      <div className={styles.bottom}>
        <span>
          © {year} {settings.siteName}. Semua hak dilindungi.
        </span>
        <span>
          <a href="#syarat">Syarat &amp; Ketentuan</a>
          <a href="#privasi">Kebijakan Privasi</a>
        </span>
      </div>
    </footer>
  );
};
