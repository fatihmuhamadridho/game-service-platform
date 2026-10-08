'use client';

import { useMemo, useState } from 'react';
import { Box } from 'rangkaui';
import {
  IconActivity,
  IconArrowUpRight,
  IconCalendar,
  IconChartBar,
  IconChevronDown,
  IconChevronRight,
  IconCreditCard,
  IconDeviceGamepad2,
  IconDots,
  IconFileText,
  IconReceipt,
  IconUsers,
  IconWallet,
} from '@tabler/icons-react';
import { AdminHeader } from '@common-ui/AdminDashboard/AdminHeader';
import { AdminSidebar } from '@common-ui/AdminDashboard/AdminSidebar';
import styles from './AdminDashboard.module.css';

const metrics = [
  { label: 'Total Pesanan', value: '1.248', change: '12%', icon: <IconReceipt />, tone: 'blue' },
  { label: 'Total Pendapatan', value: 'Rp 45.230.000', change: '18%', icon: <IconWallet />, tone: 'violet' },
  { label: 'Total User', value: '3.420', change: '9%', icon: <IconUsers />, tone: 'cyan' },
  { label: 'Total Layanan', value: '128', change: '18%', icon: <IconDeviceGamepad2 />, tone: 'blue' },
];
const orders = [
  {
    id: '#JH12648',
    date: '7 Okt 2026 14:32',
    user: 'budi123',
    game: 'Mobile Legends',
    service: 'Joki Rank Mythic',
    total: 'Rp 85.000',
    status: 'Diproses',
    tone: 'orange',
  },
  {
    id: '#JH12647',
    date: '7 Okt 2026 13:10',
    user: 'santoso98',
    game: 'Free Fire',
    service: 'Top Up Diamond 100',
    total: 'Rp 25.000',
    status: 'Selesai',
    tone: 'green',
  },
  {
    id: '#JH12646',
    date: '7 Okt 2026 12:45',
    user: 'indahputri',
    game: 'Roblox',
    service: 'Top Up Robux 400',
    total: 'Rp 120.000',
    status: 'Selesai',
    tone: 'green',
  },
  {
    id: '#JH12645',
    date: '7 Okt 2026 11:20',
    user: 'rakaaa',
    game: 'Valorant',
    service: 'Joki Rank Silver → Gold',
    total: 'Rp 70.000',
    status: 'Menunggu',
    tone: 'slate',
  },
  {
    id: '#JH12644',
    date: '7 Okt 2026 10:08',
    user: 'dimasaja',
    game: 'Genshin Impact',
    service: 'Top Up Genesis',
    total: 'Rp 150.000',
    status: 'Diproses',
    tone: 'orange',
  },
];
const popular = [
  { name: 'Mobile Legends', count: 428, percent: 34, tone: 'ml' },
  { name: 'Free Fire', count: 312, percent: 25, tone: 'ff' },
  { name: 'Roblox', count: 184, percent: 15, tone: 'roblox' },
  { name: 'Valorant', count: 162, percent: 13, tone: 'valo' },
  { name: 'Genshin Impact', count: 128, percent: 10, tone: 'genshin' },
];
const incomes = [
  ['Mobile Legends', 'Rp 18.420.000', '41%', 'ml'],
  ['Free Fire', 'Rp 9.850.000', '22%', 'ff'],
  ['Roblox', 'Rp 7.320.000', '16%', 'roblox'],
  ['Valorant', 'Rp 5.640.000', '12%', 'valo'],
  ['Genshin Impact', 'Rp 4.000.000', '9%', 'genshin'],
] as const;
const payments = [
  ['Transfer Bank', '520', 'Rp 22.400.000'],
  ['E-Wallet (DANA)', '368', 'Rp 12.850.000'],
  ['E-Wallet (OVO)', '184', 'Rp 6.900.000'],
  ['E-Wallet (GoPay)', '142', 'Rp 5.120.000'],
  ['QRIS', '96', 'Rp 3.960.000'],
] as const;
const activities = [
  ['Pesanan #JH12648 dibuat', 'oleh budi123', '2 menit yang lalu', 'green'],
  ['Pembayaran diterima', 'untuk pesanan #JH12647', '1 jam yang lalu', 'cyan'],
  ['User baru mendaftar', 'santoso98', '2 jam yang lalu', 'blue'],
  ['Layanan baru ditambahkan', 'Top Up Diamond 500 (Free Fire)', '4 jam yang lalu', 'purple'],
  ['Banner homepage diperbarui', 'oleh admin', '6 jam yang lalu', 'orange'],
] as const;
const chartPoints =
  'M42 139 C82 129 97 100 140 107 S202 123 244 96 S308 69 350 78 S420 66 458 51 S505 61 540 34 S590 52 620 24 S680 10 720 28';
const gameSlug = (value: string) => value.toLowerCase().replaceAll(' ', '-');

export const AdminDashboardPage = () => {
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [period, setPeriod] = useState('Harian');
  const [dateRange, setDateRange] = useState('1 Okt 2026 – 7 Okt 2026');
  const filteredOrders = useMemo(
    () =>
      orders.filter((order) =>
        `${order.id} ${order.user} ${order.game} ${order.service} ${order.status}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [query]
  );
  return (
    <main className={styles.page}>
      <AdminHeader query={query} onQueryChange={setQuery} onMenuOpen={() => setMenuOpen(true)} />
      <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className={styles.main}>
        <div className={styles.pageHeading}>
          <div>
            <h1>Dashboard</h1>
            <p>Ringkasan performa JokiHub secara real-time.</p>
          </div>
          <label className={styles.dateSelect}>
            <IconCalendar />
            <select value={dateRange} onChange={(event) => setDateRange(event.target.value)}>
              <option>1 Okt 2026 – 7 Okt 2026</option>
              <option>24 Sep 2026 – 30 Sep 2026</option>
              <option>30 hari terakhir</option>
            </select>
            <IconChevronDown />
          </label>
        </div>
        <section className={styles.metrics}>
          {metrics.map((metric) => (
            <Box className={styles.metric} key={metric.label} bordered rounded>
              <span className={`${styles.metricIcon} ${styles[metric.tone]}`}>{metric.icon}</span>
              <div>
                <small>{metric.label}</small>
                <b>{metric.value}</b>
                <span className={styles.up}>
                  <IconArrowUpRight /> {metric.change}
                  <i>dari periode sebelumnya</i>
                </span>
              </div>
            </Box>
          ))}
        </section>
        <div className={styles.analytics}>
          <Box className={styles.panel} bordered rounded>
            <div className={styles.panelHeading}>
              <div>
                <h2>Grafik Pendapatan</h2>
                <small>Performa pendapatan berdasarkan periode</small>
              </div>
              <div className={styles.chartTools}>
                <select aria-label="Jenis grafik">
                  <option>Pendapatan</option>
                  <option>Pesanan</option>
                </select>
                <div className={styles.period}>
                  {['Harian', 'Mingguan', 'Bulanan'].map((item) => (
                    <button
                      className={period === item ? styles.selected : ''}
                      key={item}
                      onClick={() => setPeriod(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.chart}>
              <div className={styles.yAxis}>
                <span>Rp 10.000.000</span>
                <span>Rp 7.500.000</span>
                <span>Rp 5.000.000</span>
                <span>Rp 2.500.000</span>
                <span>Rp 0</span>
              </div>
              <svg viewBox="0 0 760 180" preserveAspectRatio="none" aria-label="Grafik pendapatan harian">
                <defs>
                  <linearGradient id="incomeFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#087cff" stopOpacity=".35" />
                    <stop offset="100%" stopColor="#087cff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={`${chartPoints} L720 160 L42 160 Z`} fill="url(#incomeFill)" />
                <path d={chartPoints} fill="none" stroke="#0782ff" strokeWidth="3" />
                {[42, 140, 244, 350, 458, 540, 620, 720].map((x, index) => (
                  <circle
                    key={x}
                    cx={x}
                    cy={[139, 107, 96, 78, 51, 34, 24, 28][index]}
                    r={index === 4 ? 6 : 4}
                    fill="#168aff"
                    stroke="#05264a"
                    strokeWidth="2"
                  />
                ))}
              </svg>
              <div className={styles.xAxis}>
                <span>1 Okt</span>
                <span>2 Okt</span>
                <span>3 Okt</span>
                <span>4 Okt</span>
                <span>5 Okt</span>
                <span>6 Okt</span>
                <span>7 Okt</span>
              </div>
            </div>
          </Box>
          <Box className={`${styles.panel} ${styles.statusPanel}`} bordered rounded>
            <div className={styles.panelHeading}>
              <h2>Status Pesanan</h2>
              <select aria-label="Filter status pesanan">
                <option>Semua Layanan</option>
                <option>Top Up</option>
                <option>Joki Rank</option>
              </select>
            </div>
            <div className={styles.donutWrap}>
              <div className={styles.donut}>
                <div>
                  <b>1.248</b>
                  <small>Pesanan</small>
                </div>
              </div>
              <ul>
                <li>
                  <i className={styles.blueDot} />
                  Selesai <b>892</b>
                  <small>72%</small>
                </li>
                <li>
                  <i className={styles.yellowDot} />
                  Diproses <b>184</b>
                  <small>15%</small>
                </li>
                <li>
                  <i className={styles.grayDot} />
                  Menunggu <b>96</b>
                  <small>8%</small>
                </li>
                <li>
                  <i className={styles.redDot} />
                  Dibatalkan <b>48</b>
                  <small>4%</small>
                </li>
              </ul>
            </div>
          </Box>
        </div>
        <div className={styles.middleGrid}>
          <Box className={`${styles.panel} ${styles.ordersPanel}`} bordered rounded>
            <div className={styles.panelHeading}>
              <div>
                <h2>Pesanan Terbaru</h2>
                <small>Daftar pesanan terbaru yang masuk</small>
              </div>
              <a href="#pesanan">
                Lihat Semua <IconArrowRightIcon />
              </a>
            </div>
            <div className={styles.tableScroll}>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tanggal</th>
                    <th>User</th>
                    <th>Game</th>
                    <th>Layanan</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.date}</td>
                      <td>{order.user}</td>
                      <td>
                        <a href={`/order/${gameSlug(order.game)}`}>
                          <span
                            className={`${styles.gameThumb} ${styles[order.game === 'Mobile Legends' ? 'ml' : order.game === 'Free Fire' ? 'ff' : order.game === 'Roblox' ? 'roblox' : order.game === 'Valorant' ? 'valo' : 'genshin']}`}
                          >
                            {order.game.slice(0, 1)}
                          </span>
                          {order.game}
                        </a>
                      </td>
                      <td>{order.service}</td>
                      <td>{order.total}</td>
                      <td>
                        <span className={`${styles.status} ${styles[order.tone]}`}>{order.status}</span>
                      </td>
                      <td>
                        <button className={styles.more} aria-label={`Aksi ${order.id}`}>
                          <IconDots />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!filteredOrders.length && <p className={styles.noOrders}>Tidak ada pesanan yang cocok.</p>}
            </div>
          </Box>
          <Box className={`${styles.panel} ${styles.popularPanel}`} bordered rounded>
            <div className={styles.panelHeading}>
              <h2>Game Terpopuler</h2>
              <a href="/games">
                Lihat Semua <IconArrowRightIcon />
              </a>
            </div>
            <div className={styles.popularList}>
              {popular.map((game, index) => (
                <div className={styles.popularItem} key={game.name}>
                  <span className={styles.rank}>{index + 1}</span>
                  <span className={`${styles.gameThumb} ${styles[game.tone]}`}>{game.name.slice(0, 1)}</span>
                  <b>{game.name}</b>
                  <strong>{game.count}</strong>
                  <span className={styles.bar}>
                    <i style={{ width: `${game.percent * 2.4}%` }} />
                  </span>
                </div>
              ))}
            </div>
          </Box>
        </div>
        <div className={styles.bottomGrid}>
          <Box className={styles.panel} bordered rounded>
            <div className={styles.panelHeading}>
              <h2>Pendapatan per Game</h2>
              <select aria-label="Filter game">
                <option>Semua Game</option>
              </select>
            </div>
            <div className={styles.incomeList}>
              {incomes.map(([name, amount, pct, tone]) => (
                <div className={styles.incomeRow} key={name}>
                  <span className={`${styles.gameThumb} ${styles[tone]}`}>{name.slice(0, 1)}</span>
                  <b>{name}</b>
                  <span className={styles.bar}>
                    <i style={{ width: pct }} />
                  </span>
                  <small>{amount}</small>
                  <em>{pct}</em>
                </div>
              ))}
            </div>
          </Box>
          <Box className={styles.panel} bordered rounded>
            <div className={styles.panelHeading}>
              <h2>Metode Pembayaran</h2>
              <select aria-label="Filter metode">
                <option>Semua Metode</option>
              </select>
            </div>
            <div className={styles.paymentTable}>
              <div>
                <b>Metode</b>
                <b>Jumlah Transaksi</b>
                <b>Total Nominal</b>
              </div>
              {payments.map(([method, count, total]) => (
                <div key={method}>
                  <span>
                    <IconCreditCard />
                    {method}
                  </span>
                  <span>{count}</span>
                  <span>{total}</span>
                </div>
              ))}
            </div>
          </Box>
          <Box className={styles.panel} bordered rounded>
            <div className={styles.panelHeading}>
              <h2>Aktivitas Terbaru</h2>
              <a href="#aktivitas">
                Lihat Semua <IconArrowRightIcon />
              </a>
            </div>
            <div className={styles.activityList}>
              {activities.map(([title, detail, time, tone]) => (
                <div className={styles.activity} key={title}>
                  <span className={`${styles.activityIcon} ${styles[tone]}`}>
                    <IconActivity />
                  </span>
                  <span>
                    <b>{title}</b>
                    <small>{detail}</small>
                  </span>
                  <time>{time}</time>
                </div>
              ))}
            </div>
          </Box>
        </div>
        <p className={styles.demoNote}>Data contoh untuk prototipe dashboard admin.</p>
      </div>
      <nav className={styles.mobileNav}>
        <a className={styles.mobileCurrent} href="/admin">
          <IconChartBar />
          Dashboard
        </a>
        <a href="#pesanan">
          <IconFileText />
          Pesanan
        </a>
        <a href="#layanan">
          <IconDeviceGamepad2 />
          Layanan
        </a>
        <a href="#user">
          <IconUsers />
          User
        </a>
        <a href="#lainnya">
          <IconDots />
          Lainnya
        </a>
      </nav>
    </main>
  );
};

const IconArrowRightIcon = ({ size = 14 }: { size?: number }) => <IconChevronRight width={size} height={size} />;
