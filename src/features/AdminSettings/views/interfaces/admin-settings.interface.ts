export type AdminSettingsForm = {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactWhatsapp: string;
  instagramUrl: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  defaultCurrency: 'IDR';
  timezone: string;
};
