# Get Popular Games

> **Document Type :** Acceptance Criteria  
> **Status :** Draft

## Story

> As a pengunjung JokiHub, I want to melihat daftar game populer yang tersedia agar saya dapat memilih game dan melanjutkan ke layanan yang sesuai.

## Acceptance Criteria

### AC-001 — Menampilkan daftar game populer

> **Given :** Pengunjung membuka beranda dan katalog memiliki game aktif yang ditandai populer  
> **When :** Daftar Game Populer dimuat  
> **Then :**
>
> 1. Sistem menampilkan setiap game pada daftar dengan nama dan ringkasan layanan yang tersedia.
> 2. Setiap kartu game dapat dipilih untuk membuka halaman game terkait.
> 3. Urutan game konsisten dengan urutan yang ditetapkan katalog.

### AC-002 — Membatasi jumlah game pada beranda

> **Given :** Katalog memiliki lebih banyak game populer daripada jumlah yang ditampilkan pada beranda  
> **When :** Pengunjung melihat bagian Game Populer  
> **Then :**
>
> 1. Beranda menampilkan maksimal enam game pada satu halaman daftar.
> 2. Pengunjung dapat memilih “Lihat Semua” untuk membuka daftar layanan lengkap.

### AC-003 — Tidak ada game populer

> **Given :** Katalog tidak memiliki game aktif yang ditandai populer  
> **When :** Daftar Game Populer dimuat  
> **Then :**
>
> 1. Pengunjung tidak melihat kartu game yang tidak tersedia atau tidak aktif.
> 2. Halaman tetap dapat digunakan dan menampilkan keadaan kosong yang informatif.

### AC-004 — Kegagalan memuat daftar

> **Given :** Daftar game populer tidak dapat dimuat  
> **When :** Pengunjung membuka atau memuat ulang beranda  
> **Then :**
>
> 1. Pengunjung melihat pesan bahwa daftar game belum dapat dimuat.
> 2. Pengunjung dapat mencoba memuat ulang daftar.
> 3. Halaman dan bagian lain tetap dapat digunakan.

### AC-005 — Game tidak aktif atau tidak tersedia

> **Given :** Sebuah game tidak aktif atau tidak lagi tersedia di katalog  
> **When :** Daftar game populer ditampilkan  
> **Then :**
>
> 1. Game tersebut tidak ditampilkan sebagai pilihan yang dapat dipesan.
> 2. Game lain yang aktif tetap ditampilkan sesuai urutan katalog.

## Technical Flow

1. Pengunjung membuka beranda JokiHub.
2. Beranda meminta daftar game populer kepada layanan katalog.
3. Layanan katalog memilih game aktif yang ditandai populer dan menerapkan urutan serta batas daftar.
4. Beranda menampilkan kartu game; bila daftar kosong, beranda menampilkan keadaan kosong.
5. Jika pemuatan gagal, beranda menampilkan pesan kegagalan dan pilihan untuk mencoba kembali.
6. Saat pengunjung memilih kartu, JokiHub membuka halaman game terkait.

## Parameters

> **Weight per Parameter :** 15  
> **New Technology :** TBD — perlu konfirmasi pengalaman tim dengan kontrak katalog dinamis  
> **Surrounding Involvement :** TBD — minimal storefront dan layanan katalog; sistem sumber katalog belum dipastikan  
> **Technical Flow :** 6 langkah (skor parameter TBD; rubrik tidak konsisten pada template)  
> **Acceptance Criteria :** 5 AC (rentang skor TBD; template tidak mendefinisikan pembobotan band)  
> **Size :** TBD — menunggu skor parameter dan aturan sizing tim

## Subtask

### Frontend

| Task                                                                                                    | Mandays | Story Point |
| ------------------------------------------------------------------------------------------------------- | ------: | ----------: |
| Menghubungkan bagian Game Populer ke data katalog, menangani loading/kosong/gagal, serta navigasi kartu |     TBD |         TBD |
| **Total**                                                                                               | **TBD** |     **TBD** |

### Backend

| Task                                                                                      | Mandays | Story Point |
| ----------------------------------------------------------------------------------------- | ------: | ----------: |
| Menyediakan API daftar game populer dan membaca data game aktif beserta metadata tampilan |     TBD |         TBD |
| **Total**                                                                                 | **TBD** |     **TBD** |

### Summary

> **FE :** TBD  
> **BE :** TBD  
> **Size Task :** TBD

## Sizing Reference

| SIZE | SCORE RANGE | ESTIMATE COMPLETION | STORY POINT |
| ---- | ----------- | ------------------- | ----------- |
| S    | ≤ 100       | < 2 days            | 1–3         |
| M    | 101–200     | 2–3 days            | 4–6         |
| L    | 201–250     | > 3–5 days          | 7–10        |
| XL   | > 250       | > 5 days            | > 10        |

## Notes

1. Daftar enam game pada HomeV2 saat ini merupakan data ilustratif, bukan konfirmasi katalog produksi.
2. Perhitungan skor, estimasi mandays/story point, ukuran story/task, dan target SLA menunggu rubrik serta estimasi tim yang disetujui.
3. Kartu game saat ini menampilkan nama, ringkasan layanan, artwork, dan mark; metadata tersebut menjadi kebutuhan tampilan selama datanya tersedia dan disetujui katalog.
