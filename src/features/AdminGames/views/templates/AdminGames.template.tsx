'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Box } from 'rangkaui';
import { IconDeviceGamepad2, IconEdit, IconPlus, IconSearch, IconTrash, IconX } from '@tabler/icons-react';
import { getGameArtworkPath } from '@utils/game-artwork';
import { AdminHeader } from '@common-ui/organisms/AdminDashboard/AdminHeader';
import { AdminSidebar } from '@common-ui/organisms/AdminDashboard/AdminSidebar';
import { GameArtworkImage } from '@common-ui/atoms/GameArtworkImage/GameArtworkImage.atom';
import type {
  AdminGameForm,
  AdminGameFormMode,
  AdminGameStatusFilter,
  AdminGameView,
} from '../interfaces/admin-game.interface';
import styles from '../pages/AdminGames.module.css';

type Props = {
  games: AdminGameView[];
  filteredGames: AdminGameView[];
  query: string;
  onQueryChange: (value: string) => void;
  statusFilter: AdminGameStatusFilter;
  onStatusFilterChange: (value: AdminGameStatusFilter) => void;
  activeCount: number;
  formMode: AdminGameFormMode;
  form: AdminGameForm;
  onFormChange: (updater: (current: AdminGameForm) => AdminGameForm) => void;
  onCreate: () => void;
  onEdit: (game: AdminGameView) => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onCloseForm: () => void;
  deleteTarget: AdminGameView | null;
  onDeleteSelect: (game: AdminGameView | null) => void;
  onDeleteConfirm: () => void;
  loadError?: string;
  actionError: string;
  saving: boolean;
};

export const AdminGamesTemplate = ({
  games,
  filteredGames,
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  activeCount,
  formMode,
  form,
  onFormChange,
  onCreate,
  onEdit,
  onSave,
  onCloseForm,
  deleteTarget,
  onDeleteSelect,
  onDeleteConfirm,
  loadError,
  actionError,
  saving,
}: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const formArtwork = getGameArtworkPath(form.artworkKey || form.slug);
  const updateField = <K extends keyof AdminGameForm>(field: K, value: AdminGameForm[K]) =>
    onFormChange((current) => ({ ...current, [field]: value }));
  const handleNameChange = (value: string) =>
    onFormChange((current) => ({
      ...current,
      name: value,
      slug:
        current.slug ===
          current.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '') || !current.slug
          ? value
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '')
          : current.slug,
    }));

  return (
    <main className={styles.page}>
      <AdminHeader query={query} onQueryChange={onQueryChange} onMenuOpen={() => setMenuOpen(true)} />
      <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} activeItem="Game" />
      <div className={styles.main}>
        <div className={styles.heading}>
          <div>
            <p className={styles.breadcrumb}>
              Dashboard <span>/</span> Produk &amp; Layanan <span>/</span> <b>Game</b>
            </p>
            <h1>Kelola Game</h1>
            <p>Tambah dan atur game yang tersedia di JokiHub.</p>
          </div>
          <button className={styles.createButton} onClick={onCreate}>
            <IconPlus /> Tambah Game
          </button>
        </div>

        <section className={styles.metrics} aria-label="Ringkasan game">
          <Box className={styles.metric} bordered rounded>
            <span>Total Game</span>
            <b>{games.length}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Game Aktif</span>
            <b className={styles.activeValue}>{activeCount}</b>
          </Box>
          <Box className={styles.metric} bordered rounded>
            <span>Game Nonaktif</span>
            <b className={styles.inactiveValue}>{games.length - activeCount}</b>
          </Box>
        </section>

        <Box className={styles.panel} bordered rounded>
          {loadError && (
            <p className={styles.loadError} role="alert">
              {loadError}
            </p>
          )}
          {actionError && (
            <p className={styles.loadError} role="alert">
              {actionError}
            </p>
          )}
          <div className={styles.toolbar}>
            <div>
              <h2>Daftar Game</h2>
              <small>{filteredGames.length} game ditampilkan</small>
            </div>
            <div className={styles.controls}>
              <label className={styles.search}>
                <IconSearch />
                <input
                  value={query}
                  onChange={(event) => onQueryChange(event.target.value)}
                  placeholder="Cari nama atau slug game..."
                  aria-label="Cari game"
                />
              </label>
              <label className={styles.filter}>
                <span className={styles.visuallyHidden}>Filter status</span>
                <select
                  value={statusFilter}
                  onChange={(event) => onStatusFilterChange(event.target.value as AdminGameStatusFilter)}
                >
                  <option>Semua</option>
                  <option>Aktif</option>
                  <option>Nonaktif</option>
                </select>
              </label>
            </div>
          </div>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Game</th>
                  <th>Slug</th>
                  <th>Layanan</th>
                  <th>Status</th>
                  <th>Terakhir Diubah</th>
                  <th>
                    <span className={styles.visuallyHidden}>Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredGames.map((game) => (
                  <tr key={game.id}>
                    <td>
                      <span className={styles.gameName}>
                        <i className={styles.gameThumbnail}>
                          {getGameArtworkPath(game.artworkKey) ? (
                            <GameArtworkImage src={getGameArtworkPath(game.artworkKey)!} sizes="30px" />
                          ) : (
                            <IconDeviceGamepad2 />
                          )}
                        </i>
                        <b>{game.name}</b>
                      </span>
                    </td>
                    <td>
                      <code>{game.slug}</code>
                    </td>
                    <td>{game.serviceCount} layanan</td>
                    <td>
                      <span className={`${styles.status} ${game.active ? styles.statusActive : styles.statusInactive}`}>
                        <i />
                        {game.active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td>{game.updatedAt}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <button aria-label={`Edit ${game.name}`} onClick={() => onEdit(game)}>
                          <IconEdit /> Edit
                        </button>
                        <button
                          className={styles.deleteButton}
                          aria-label={`Hapus ${game.name}`}
                          onClick={() => onDeleteSelect(game)}
                        >
                          <IconTrash /> Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filteredGames.length && (
              <div className={styles.empty}>
                <IconDeviceGamepad2 />
                <b>{games.length ? 'Game tidak ditemukan' : 'Belum ada game'}</b>
                <span>
                  {games.length ? 'Coba kata kunci atau filter status lain.' : 'Belum ada data game di katalog.'}
                </span>
              </div>
            )}
          </div>
        </Box>
      </div>

      {formMode && (
        <div
          className={styles.overlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onCloseForm();
          }}
        >
          <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="game-dialog-title">
            <div className={styles.dialogHeading}>
              <div>
                <h2 id="game-dialog-title">{formMode === 'create' ? 'Tambah Game' : 'Edit Game'}</h2>
                <p>Lengkapi informasi game di bawah.</p>
              </div>
              <button className={styles.closeButton} aria-label="Tutup" onClick={onCloseForm}>
                <IconX />
              </button>
            </div>
            <form onSubmit={onSave}>
              <label>
                Nama Game
                <input
                  required
                  autoFocus
                  value={form.name}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => handleNameChange(event.target.value)}
                  placeholder="Contoh: Mobile Legends"
                />
              </label>
              <label>
                Slug
                <input
                  required
                  value={form.slug}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    updateField(
                      'slug',
                      event.target.value
                        .toLowerCase()
                        .trim()
                        .replace(/[^a-z0-9-]+/g, '-')
                    )
                  }
                  placeholder="mobile-legends"
                />
              </label>
              <label>
                Ringkasan layanan
                <input
                  maxLength={160}
                  value={form.serviceSummary ?? ''}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('serviceSummary', event.target.value)}
                  placeholder="Joki Rank / Top Up"
                />
              </label>
              <label>
                Artwork key atau path lokal
                <input
                  maxLength={160}
                  value={form.artworkKey ?? ''}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('artworkKey', event.target.value)}
                  placeholder="ml atau /images/games/mobile-legends.webp"
                />
                <small>Path lokal harus berada di public/images/games/.</small>
                <div className={styles.artworkPreview} aria-label={`Pratinjau artwork ${form.name || 'game'}`}>
                  {formArtwork ? <GameArtworkImage src={formArtwork} sizes="180px" /> : <IconDeviceGamepad2 />}
                </div>
              </label>
              <label>
                Urutan tampil
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={form.sortOrder}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    updateField('sortOrder', Number(event.target.value))
                  }
                />
              </label>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    onFormChange((current) => ({
                      ...current,
                      active: event.target.checked,
                      popular: event.target.checked ? current.popular : false,
                    }))
                  }
                />
                <span>Game aktif dan tampil di katalog</span>
              </label>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={form.popular}
                  disabled={!form.active}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('popular', event.target.checked)}
                />
                <span>Tampilkan di daftar game populer</span>
              </label>
              <div className={styles.dialogActions}>
                <button type="button" className={styles.cancelButton} onClick={onCloseForm}>
                  Batal
                </button>
                <button type="submit" className={styles.createButton} disabled={saving}>
                  {saving ? 'Menyimpan…' : formMode === 'create' ? 'Simpan Game' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {deleteTarget && (
        <div
          className={styles.overlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onDeleteSelect(null);
          }}
        >
          <section className={styles.dialog} role="alertdialog" aria-modal="true" aria-labelledby="delete-title">
            <div className={styles.dialogHeading}>
              <div>
                <h2 id="delete-title">Hapus {deleteTarget.name}?</h2>
                <p>Game akan ditandai tidak aktif setelah izin administrator diverifikasi.</p>
              </div>
              <button className={styles.closeButton} aria-label="Tutup" onClick={() => onDeleteSelect(null)}>
                <IconX />
              </button>
            </div>
            <div className={styles.dialogActions}>
              <button className={styles.cancelButton} onClick={() => onDeleteSelect(null)}>
                Batal
              </button>
              <button className={`${styles.createButton} ${styles.confirmDelete}`} onClick={onDeleteConfirm}>
                <IconTrash /> Hapus Game
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};
