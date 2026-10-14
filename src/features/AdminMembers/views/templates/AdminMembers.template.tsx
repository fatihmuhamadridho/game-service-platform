'use client';

import { useState, type ChangeEvent } from 'react';
import { Box } from 'rangkaui';
import { IconEye, IconHeart, IconSearch, IconX } from '@tabler/icons-react';
import { AdminHeader } from '@common-ui/organisms/AdminDashboard/AdminHeader';
import { AdminSidebar } from '@common-ui/organisms/AdminDashboard/AdminSidebar';
import type {
  MemberStatus,
  MemberStatusFilter,
  MemberTierFilter,
  MemberView,
} from '../interfaces/admin-member.interface';
import styles from '../pages/AdminMembers.module.css';

type Props = {
  members: MemberView[];
  filteredMembers: MemberView[];
  query: string;
  onQueryChange: (value: string) => void;
  statusFilter: MemberStatusFilter;
  onStatusFilterChange: (value: MemberStatusFilter) => void;
  tierFilter: MemberTierFilter;
  onTierFilterChange: (value: MemberTierFilter) => void;
  detailTarget: MemberView | null;
  onView: (member: MemberView) => void;
  onCloseDetail: () => void;
  onStatusChange: (id: string, status: MemberStatus) => void;
  formatRupiah: (amount: number) => string;
  loading: boolean;
  error: string;
};
const tiers: MemberTierFilter[] = ['Semua Tier', 'Bronze', 'Silver', 'Gold', 'Platinum'];
const statuses: MemberStatusFilter[] = ['Semua Status', 'Aktif', 'Diblokir'];
const tierClass = (tier: string) =>
  tier === 'Platinum'
    ? styles.tierPlatinum
    : tier === 'Gold'
      ? styles.tierGold
      : tier === 'Silver'
        ? styles.tierSilver
        : styles.tierBronze;

export const AdminMembersTemplate = ({
  members,
  filteredMembers,
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  tierFilter,
  onTierFilterChange,
  detailTarget,
  onView,
  onCloseDetail,
  onStatusChange,
  formatRupiah,
  loading,
  error,
}: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const activeCount = members.filter((member) => member.status === 'Aktif').length;
  const totalOrders = members.reduce((sum, member) => sum + member.orderCount, 0);
  const averageSpend = members.length
    ? Math.round(members.reduce((sum, member) => sum + member.totalSpend, 0) / members.length)
    : 0;
  const initials = (name: string) =>
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  return (
    <main className={styles.page}>
      <AdminHeader query={query} onQueryChange={onQueryChange} onMenuOpen={() => setMenuOpen(true)} />
      <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} activeItem="Member" />
      <div className={styles.main}>
        <div className={styles.heading}>
          <div>
            <p className={styles.breadcrumb}>
              Dashboard <span>/</span> Pengguna <span>/</span> <b>Member</b>
            </p>
            <h1>Manajemen Member</h1>
            <p>Pantau tier, aktivitas pesanan, dan status keanggotaan pengguna.</p>
          </div>
        </div>
        <section className={styles.metrics} aria-label="Ringkasan member">
          <Box className={styles.metric} bordered rounded>
            <span>Total Member</span>
            <b>{members.length}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Member Aktif</span>
            <b className={styles.successValue}>{activeCount}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Total Pesanan Member</span>
            <b className={styles.accentValue}>{totalOrders}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Rata-rata Belanja</span>
            <b>{formatRupiah(averageSpend)}</b>
          </Box>
        </section>
        <Box className={styles.panel} bordered rounded>
          <div className={styles.toolbar}>
            <div>
              <h2>Daftar Member</h2>
              <small>
                {filteredMembers.length} dari {members.length} member ditampilkan
              </small>
            </div>
            <label className={styles.search}>
              <IconSearch />
              <input
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Cari nama, username, email..."
                aria-label="Cari member"
              />
            </label>
          </div>
          {error && (
            <p role="alert" className={styles.demoNote}>
              {error}
            </p>
          )}
          {loading && (
            <p role="status" className={styles.demoNote}>
              Memuat data member…
            </p>
          )}
          <div className={styles.filters}>
            <label className={styles.filter}>
              <span>Tier Member</span>
              <select
                value={tierFilter}
                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                  onTierFilterChange(event.target.value as MemberTierFilter)
                }
              >
                {tiers.map((tier) => (
                  <option key={tier}>{tier}</option>
                ))}
              </select>
            </label>
            <label className={styles.filter}>
              <span>Status</span>
              <select
                value={statusFilter}
                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                  onStatusFilterChange(event.target.value as MemberStatusFilter)
                }
              >
                {statuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </label>
          </div>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Tier</th>
                  <th>Pesanan</th>
                  <th>Total Belanja</th>
                  <th>Status</th>
                  <th>Bergabung</th>
                  <th>
                    <span className={styles.visuallyHidden}>Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <span className={styles.memberCell}>
                        <i>{initials(member.name)}</i>
                        <span>
                          <b>{member.name}</b>
                          <small>
                            @{member.username} · {member.email}
                          </small>
                        </span>
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.tier} ${tierClass(member.tier)}`}>{member.tier}</span>
                    </td>
                    <td>{member.orderCount}</td>
                    <td className={styles.amount}>{formatRupiah(member.totalSpend)}</td>
                    <td>
                      <span
                        className={`${styles.status} ${member.status === 'Aktif' ? styles.statusActive : styles.statusBlocked}`}
                      >
                        <i />
                        {member.status}
                      </span>
                    </td>
                    <td>{member.joinedAt}</td>
                    <td>
                      <button
                        className={styles.detailButton}
                        onClick={() => onView(member)}
                        aria-label={`Detail ${member.name}`}
                      >
                        <IconEye /> Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && !filteredMembers.length && (
              <div className={styles.empty}>
                <IconHeart />
                <b>Member tidak ditemukan</b>
                <span>Coba kata kunci atau filter lain.</span>
              </div>
            )}
          </div>
          <p className={styles.demoNote}>
            Ringkasan belanja menjumlahkan nilai pesanan berstatus lunas sesuai mata uang tersimpan.
          </p>
        </Box>
      </div>
      {detailTarget && (
        <div
          className={styles.overlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onCloseDetail();
          }}
        >
          <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="member-detail-title">
            <div className={styles.dialogHeading}>
              <div>
                <h2 id="member-detail-title">Detail Member</h2>
                <p>Profil dan ringkasan aktivitas member.</p>
              </div>
              <button className={styles.closeButton} aria-label="Tutup" onClick={onCloseDetail}>
                <IconX />
              </button>
            </div>
            <div className={styles.profile}>
              <i>{initials(detailTarget.name)}</i>
              <div>
                <b>{detailTarget.name}</b>
                <span>@{detailTarget.username}</span>
                <em className={`${styles.tier} ${tierClass(detailTarget.tier)}`}>{detailTarget.tier}</em>
              </div>
            </div>
            <dl className={styles.details}>
              <div>
                <dt>Email</dt>
                <dd>{detailTarget.email}</dd>
              </div>
              <div>
                <dt>WhatsApp</dt>
                <dd>{detailTarget.whatsapp}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{detailTarget.status}</dd>
              </div>
              <div>
                <dt>Bergabung</dt>
                <dd>{detailTarget.joinedAt}</dd>
              </div>
              <div>
                <dt>Total Pesanan</dt>
                <dd>{detailTarget.orderCount}</dd>
              </div>
              <div>
                <dt>Total Belanja</dt>
                <dd>{formatRupiah(detailTarget.totalSpend)}</dd>
              </div>
            </dl>
            <label className={styles.statusSelect}>
              Status Keanggotaan
              <select
                value={detailTarget.status}
                onChange={(event) => onStatusChange(detailTarget.id, event.target.value as MemberStatus)}
              >
                <option>Aktif</option>
                <option>Diblokir</option>
              </select>
            </label>
            <p className={styles.formNote}>Perubahan status member tersimpan di server dan masuk riwayat status.</p>
            <div className={styles.dialogActions}>
              <button className={styles.createButton} onClick={onCloseDetail}>
                Tutup
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};
