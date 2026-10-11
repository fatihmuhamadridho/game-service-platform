export type MemberStatus = 'Aktif' | 'Diblokir';
export type MemberTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
export type MemberView = {
  id: string;
  name: string;
  username: string;
  email: string;
  whatsapp: string;
  tier: MemberTier;
  status: MemberStatus;
  orderCount: number;
  totalSpend: number;
  joinedAt: string;
};
export type MemberStatusFilter = 'Semua Status' | MemberStatus;
export type MemberTierFilter = 'Semua Tier' | MemberTier;
