'use client';

import { apiFetch } from '@services/apiFetch.service';

import { useEffect, useState, type FormEvent } from 'react';
import type { AdminSettingsForm } from '../interfaces/admin-settings.interface';
import { AdminSettingsTemplate } from '../templates/AdminSettings.template';

const initialSettings: AdminSettingsForm = {
  siteName: 'JokiHub',
  siteDescription: 'Solusi top up game, joki, dan kebutuhan digital.',
  contactEmail: '',
  contactWhatsapp: '',
  socialLinks: [],
  businessHours: '',
  maintenanceMode: false,
  allowRegistration: true,
  defaultCurrency: 'IDR',
  timezone: 'Asia/Jakarta',
};

export const AdminSettingsPage = () => {
  const [settings, setSettings] = useState(initialSettings);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    void Promise.resolve().then(async () => {
      try {
        const response = await apiFetch('/api/admin/settings/v1/general', { cache: 'no-store' });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.status?.message ?? 'Gagal memuat pengaturan.');
        const value = payload.data.settings;
        setSettings({
          ...value,
          siteDescription: value.siteDescription ?? '',
          socialLinks: value.socialLinks ?? [],
          businessHours: value.businessHours ?? '',
        });
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Gagal memuat pengaturan.');
      } finally {
        setLoading(false);
      }
    });
  }, []);
  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      const response = await apiFetch('/api/admin/settings/v1/general', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          siteDescription: settings.siteDescription || null,
          businessHours: settings.businessHours || null,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.status?.message ?? 'Gagal menyimpan pengaturan.');
      setSaved(true);
      setSettings({
        ...payload.data.settings,
        siteDescription: payload.data.settings.siteDescription ?? '',
        socialLinks: payload.data.settings.socialLinks ?? [],
        businessHours: payload.data.settings.businessHours ?? '',
      });
      window.setTimeout(() => setSaved(false), 3000);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gagal menyimpan pengaturan.');
    }
  };
  return (
    <AdminSettingsTemplate
      settings={settings}
      onSettingsChange={setSettings}
      onSave={handleSave}
      saved={saved}
      error={error}
      loading={loading}
    />
  );
};
