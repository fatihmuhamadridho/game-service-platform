'use client';

import { useState, type FormEvent } from 'react';
import type { AdminSettingsForm } from '../interfaces/admin-settings.interface';
import { AdminSettingsTemplate } from '../templates/AdminSettings.template';

const initialSettings: AdminSettingsForm = {
  siteName: 'JokiHub',
  siteDescription: 'Solusi top up game, joki, dan kebutuhan digital.',
  contactEmail: 'cs@jokihub.id',
  contactWhatsapp: '+6281234567890',
  instagramUrl: 'https://instagram.com/jokihub',
  maintenanceMode: false,
  allowRegistration: true,
  defaultCurrency: 'IDR',
  timezone: 'Asia/Jakarta',
};

export const AdminSettingsPage = () => {
  const [settings, setSettings] = useState(initialSettings);
  const [saved, setSaved] = useState(false);
  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 3000);
  };
  return <AdminSettingsTemplate settings={settings} onSettingsChange={setSettings} onSave={handleSave} saved={saved} />;
};
