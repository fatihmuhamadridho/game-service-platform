export type AdminSettingsForm = {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactWhatsapp: string;
  socialLinks: Array<{ label: string; url: string }>;
  businessHours: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  defaultCurrency: 'IDR';
  timezone: string;
};
