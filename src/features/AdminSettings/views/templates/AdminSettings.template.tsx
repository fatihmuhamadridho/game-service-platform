'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Box } from 'rangkaui';
import {
  IconAdjustments,
  IconDeviceFloppy,
  IconMail,
  IconMessageCircle,
  IconPlus,
  IconTrash,
  IconWorld,
} from '@tabler/icons-react';
import { AdminHeader } from '@common-ui/organisms/AdminDashboard/AdminHeader';
import { AdminSidebar } from '@common-ui/organisms/AdminDashboard/AdminSidebar';
import type { AdminSettingsForm } from '../interfaces/admin-settings.interface';
import styles from '../pages/AdminSettings.module.css';

type Props = {
  settings: AdminSettingsForm;
  onSettingsChange: (updater: (current: AdminSettingsForm) => AdminSettingsForm) => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  saved: boolean;
  error?: string;
  loading?: boolean;
};

const SOCIAL_PLATFORMS = ['Discord', 'Instagram', 'TikTok', 'YouTube'] as const;

export const AdminSettingsTemplate = ({
  settings,
  onSettingsChange,
  onSave,
  saved,
  error = '',
  loading = false,
}: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const updateField = <K extends keyof AdminSettingsForm>(field: K, value: AdminSettingsForm[K]) =>
    onSettingsChange((current) => ({ ...current, [field]: value }));
  return (
    <main className={styles.page}>
      <AdminHeader query="" onQueryChange={() => undefined} onMenuOpen={() => setMenuOpen(true)} />
      <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} activeItem="Pengaturan Umum" />
      <div className={styles.main}>
        <div className={styles.heading}>
          <div>
            <p className={styles.breadcrumb}>
              Dashboard <span>/</span> Pengaturan <span>/</span> <b>Pengaturan Umum</b>
            </p>
            <h1>Pengaturan Umum</h1>
            <p>Kelola informasi dasar, kontak, dan preferensi platform.</p>
          </div>
        </div>
        <form onSubmit={onSave}>
          <Box className={styles.panel} bordered rounded>
            <div className={styles.sectionTitle}>
              <i>
                <IconWorld />
              </i>
              <div>
                <h2>Informasi Platform</h2>
                <p>Informasi yang ditampilkan kepada pengguna.</p>
              </div>
            </div>
            <div className={styles.fields}>
              <label>
                Nama Platform
                <input
                  required
                  value={settings.siteName}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('siteName', event.target.value)}
                />
              </label>
              <label>
                Deskripsi Platform
                <textarea
                  rows={3}
                  value={settings.siteDescription}
                  onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                    updateField('siteDescription', event.target.value)
                  }
                />
              </label>
            </div>
          </Box>
          <Box className={styles.panel} bordered rounded>
            <div className={styles.sectionTitle}>
              <i>
                <IconMessageCircle />
              </i>
              <div>
                <h2>Kontak & Media Sosial</h2>
                <p>Saluran bantuan resmi untuk pengguna.</p>
              </div>
            </div>
            <div className={styles.fields}>
              <label>
                Email Bantuan
                <span className={styles.inputWithIcon}>
                  <IconMail />
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('contactEmail', event.target.value)}
                  />
                </span>
              </label>
              <label>
                WhatsApp Bantuan
                <input
                  value={settings.contactWhatsapp}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    updateField('contactWhatsapp', event.target.value)
                  }
                />
              </label>
              <label>
                Jam Operasional
                <input
                  maxLength={160}
                  value={settings.businessHours}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('businessHours', event.target.value)}
                  placeholder="Senin–Minggu, 08.00–24.00 WIB"
                />
              </label>
              <div className={styles.socialLinks}>
                <div className={styles.socialLinksHeading}>
                  <b>Media Sosial</b>
                  <button
                    type="button"
                    className={styles.addSocialLink}
                    disabled={settings.socialLinks.length >= SOCIAL_PLATFORMS.length}
                    onClick={() => {
                      const nextPlatform = SOCIAL_PLATFORMS.find(
                        (platform) => !settings.socialLinks.some((link) => link.label === platform)
                      );

                      if (nextPlatform) {
                        updateField('socialLinks', [...settings.socialLinks, { label: nextPlatform, url: '' }]);
                      }
                    }}
                  >
                    <IconPlus /> Tambah tautan
                  </button>
                </div>
                {settings.socialLinks.map((link, index) => (
                  <div className={styles.socialLinkRow} key={index}>
                    <label>
                      Platform
                      <select
                        required
                        value={link.label}
                        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                          updateField(
                            'socialLinks',
                            settings.socialLinks.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, label: event.target.value } : item
                            )
                          )
                        }
                      >
                        {SOCIAL_PLATFORMS.map((platform) => (
                          <option
                            key={platform}
                            value={platform}
                            disabled={settings.socialLinks.some(
                              (item, itemIndex) => itemIndex !== index && item.label === platform
                            )}
                          >
                            {platform}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      URL
                      <input
                        required
                        type="url"
                        maxLength={255}
                        value={link.url}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                          updateField(
                            'socialLinks',
                            settings.socialLinks.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, url: event.target.value } : item
                            )
                          )
                        }
                        placeholder="https://..."
                      />
                    </label>
                    <button
                      type="button"
                      className={styles.removeSocialLink}
                      aria-label={`Hapus tautan ${link.label || index + 1}`}
                      onClick={() =>
                        updateField(
                          'socialLinks',
                          settings.socialLinks.filter((_, i) => i !== index)
                        )
                      }
                    >
                      <IconTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Box>
          <Box className={styles.panel} bordered rounded>
            <div className={styles.sectionTitle}>
              <i>
                <IconAdjustments />
              </i>
              <div>
                <h2>Preferensi Platform</h2>
                <p>Atur perilaku dasar dan format regional.</p>
              </div>
            </div>
            <div className={styles.fields}>
              <label>
                Mata Uang Default
                <select value={settings.defaultCurrency} onChange={() => updateField('defaultCurrency', 'IDR')}>
                  <option value="IDR">Rupiah Indonesia (IDR)</option>
                </select>
              </label>
              <label>
                Zona Waktu
                <select
                  value={settings.timezone}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) => updateField('timezone', event.target.value)}
                >
                  <option value="Asia/Jakarta">WIB — Asia/Jakarta</option>
                  <option value="Asia/Makassar">WITA — Asia/Makassar</option>
                  <option value="Asia/Jayapura">WIT — Asia/Jayapura</option>
                </select>
              </label>
            </div>
            <div className={styles.toggles}>
              <label>
                <span>
                  <b>Mode pemeliharaan</b>
                  <small>Batasi akses storefront saat ada pemeliharaan.</small>
                </span>
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    updateField('maintenanceMode', event.target.checked)
                  }
                />
              </label>
              <label>
                <span>
                  <b>Pendaftaran pengguna</b>
                  <small>Izinkan pengguna membuat akun baru.</small>
                </span>
                <input
                  type="checkbox"
                  checked={settings.allowRegistration}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    updateField('allowRegistration', event.target.checked)
                  }
                />
              </label>
            </div>
          </Box>
          <div className={styles.actions}>
            <span>{saved ? 'Pengaturan tersimpan untuk sesi ini.' : 'Perubahan belum disimpan.'}</span>
            <button className={styles.saveButton} type="submit">
              <IconDeviceFloppy /> Simpan Pengaturan
            </button>
          </div>
          {(error || loading) && (
            <p role={error ? 'alert' : 'status'} className={styles.demoNote}>
              {error || 'Memuat pengaturan…'}
            </p>
          )}
        </form>
      </div>
    </main>
  );
};
