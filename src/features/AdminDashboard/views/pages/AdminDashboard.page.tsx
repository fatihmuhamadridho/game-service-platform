'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box } from 'rangkaui';
import {
  IconActivity,
  IconArrowUpRight,
  IconCalendar,
  IconChevronDown,
  IconChevronRight,
  IconCreditCard,
  IconDeviceGamepad2,
  IconDots,
  IconReceipt,
  IconUsers,
  IconWallet,
} from '@tabler/icons-react';
import { AdminHeader } from '@common-ui/organisms/AdminDashboard/AdminHeader';
import { AdminSidebar } from '@common-ui/organisms/AdminDashboard/AdminSidebar';
import styles from './AdminDashboard.module.css';

type Overview = {
  metrics: {
    orderCount: number;
    orderChangePercent: number;
    revenue: number;
    revenueChangePercent: number;
    userCount: number;
    serviceCount: number;
  };
  series: Array<{ label: string; orders: number; revenue: number }>;
  statusDistribution: Array<{ status: string; count: number; percent: number }>;
  popularGames: Array<{ name: string; count: number; percent: number }>;
  gameRevenue: Array<{ name: string; amount: number; percent: number }>;
  paymentMethods: Array<{ method: string; count: number; amount: number }>;
  recentOrders: Array<{
    id: string;
    date: string;
    user: string;
    game: string;
    service: string;
    total: number;
    status: string;
  }>;
  recentActivity: Array<{ id: string; title: string; detail: string; occurredAt: string; category: string }>;
};
const formatRupiah = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
const gameTone = (name: string) =>
  name.toLowerCase().includes('mobile legends')
    ? 'ml'
    : name.toLowerCase().includes('free fire')
      ? 'ff'
      : name.toLowerCase().includes('roblox')
        ? 'roblox'
        : name.toLowerCase().includes('valorant')
          ? 'valo'
          : name.toLowerCase().includes('genshin')
            ? 'genshin'
            : 'ml';
const statusTone = (status: string) =>
  status === 'Selesai' ? 'green' : status === 'Dibatalkan' ? 'slate' : status === 'Diproses' ? 'orange' : 'slate';
const relativeTime = (value: string) => {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
  return minutes < 60
    ? `${minutes} menit lalu`
    : minutes < 1440
      ? `${Math.floor(minutes / 60)} jam lalu`
      : `${Math.floor(minutes / 1440)} hari lalu`;
};
const gameSlug = (value: string) => value.toLowerCase().replaceAll(' ', '-');

export const AdminDashboardPage = () => {
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [period, setPeriod] = useState('Harian');
  const [dateRange, setDateRange] = useState('7');
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState('');
  const [chartType, setChartType] = useState<'Pendapatan' | 'Pesanan'>('Pendapatan');
  const load = useCallback(async () => {
    const to = new Date();
    const from = new Date(to);
    from.setUTCDate(from.getUTCDate() - Number(dateRange) + 1);
    const granularity = period === 'Mingguan' ? 'weekly' : period === 'Bulanan' ? 'monthly' : 'daily';
    const params = new URLSearchParams({
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
      granularity,
    });
    try {
      const response = await fetch(`/api/admin/dashboard/v1/overview?${params}`, { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.status?.message ?? 'Gagal memuat dashboard.');
      setOverview(payload.data.overview as Overview);
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gagal memuat dashboard.');
    }
  }, [dateRange, period]);
  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);
  const data = overview;
  const metrics = [
    {
      label: 'Total Pesanan',
      value: String(data?.metrics.orderCount ?? 0),
      change: `${data?.metrics.orderChangePercent ?? 0}%`,
      icon: <IconReceipt />,
      tone: 'blue',
    },
    {
      label: 'Total Pendapatan',
      value: formatRupiah(data?.metrics.revenue ?? 0),
      change: `${data?.metrics.revenueChangePercent ?? 0}%`,
      icon: <IconWallet />,
      tone: 'violet',
    },
    {
      label: 'Total User',
      value: String(data?.metrics.userCount ?? 0),
      change: '—',
      icon: <IconUsers />,
      tone: 'cyan',
    },
    {
      label: 'Total Layanan',
      value: String(data?.metrics.serviceCount ?? 0),
      change: '—',
      icon: <IconDeviceGamepad2 />,
      tone: 'blue',
    },
  ];
  const orders = useMemo(
    () =>
      data?.recentOrders.map((order) => ({
        ...order,
        date: new Date(order.date).toLocaleString('id-ID'),
        total: formatRupiah(order.total),
        tone: statusTone(order.status),
      })) ?? [],
    [data]
  );
  const popular = data?.popularGames.map((game) => ({ ...game, tone: gameTone(game.name) })) ?? [];
  const incomes =
    data?.gameRevenue.map(
      (game) => [game.name, formatRupiah(game.amount), `${game.percent}%`, gameTone(game.name)] as const
    ) ?? [];
  const payments =
    data?.paymentMethods.map((row) => [row.method, String(row.count), formatRupiah(row.amount)] as const) ?? [];
  const activities =
    data?.recentActivity.map(
      (item) => [item.id, item.title, item.detail, relativeTime(item.occurredAt), gameTone(item.category)] as const
    ) ?? [];
  const statusTotals = data?.statusDistribution ?? [];
  const orderTotal = data?.metrics.orderCount ?? 0;
  const donutColors = ['#168aff', '#ffc857', '#8a98a8', '#ef566a', '#8b86ff'];
  const donutStops = statusTotals
    .reduce<{ value: number; stops: string[] }>(
      (acc, item, index) => {
        const start = acc.value;
        acc.value += item.percent;
        acc.stops.push(`${donutColors[index % donutColors.length]} ${start}% ${acc.value}%`);
        return acc;
      },
      { value: 0, stops: [] }
    )
    .stops.join(', ');
  const chartValues = data?.series.map((item) => (chartType === 'Pendapatan' ? item.revenue : item.orders)) ?? [];
  const chartMax = Math.max(1, ...chartValues);
  const chartPoints =
    chartValues.length < 2
      ? 'M42 150 L720 150'
      : chartValues
          .map((value, index) => {
            const x = 42 + index * (678 / (chartValues.length - 1));
            const y = 150 - (value / chartMax) * 125;
            return `${index ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
          })
          .join(' ');
  const xLabels =
    data?.series.map((item) =>
      new Date(`${item.label}T00:00:00Z`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    ) ?? [];
  const yLabels = [1, 0.75, 0.5, 0.25, 0].map((part) =>
    chartType === 'Pendapatan' ? formatRupiah(chartMax * part) : Math.round(chartMax * part).toLocaleString('id-ID')
  );
  const filteredOrders = useMemo(
    () =>
      orders.filter((order) =>
        `${order.id} ${order.user} ${order.game} ${order.service} ${order.status}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [query, orders]
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
              <option value="7">7 hari terakhir</option>
              <option value="30">30 hari terakhir</option>
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
                <select
                  aria-label="Jenis grafik"
                  value={chartType}
                  onChange={(event) => setChartType(event.target.value as 'Pendapatan' | 'Pesanan')}
                >
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
                {yLabels.map((value, index) => (
                  <span key={index}>{value}</span>
                ))}
              </div>
              <svg viewBox="0 0 760 180" preserveAspectRatio="none" aria-label={`Grafik ${chartType.toLowerCase()}`}>
                <defs>
                  <linearGradient id="incomeFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#087cff" stopOpacity=".35" />
                    <stop offset="100%" stopColor="#087cff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={`${chartPoints} L720 160 L42 160 Z`} fill="url(#incomeFill)" />
                <path d={chartPoints} fill="none" stroke="#0782ff" strokeWidth="3" />
                {chartValues.map((value, index) => (
                  <circle
                    key={index}
                    cx={chartValues.length < 2 ? 42 : 42 + index * (678 / (chartValues.length - 1))}
                    cy={150 - (value / chartMax) * 125}
                    r="4"
                    fill="#168aff"
                    stroke="#05264a"
                    strokeWidth="2"
                  />
                ))}
              </svg>
              <div className={styles.xAxis}>
                {xLabels.map((label, index) => (
                  <span key={`${label}-${index}`}>{label}</span>
                ))}
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
              <div
                className={styles.donut}
                style={donutStops ? { background: `conic-gradient(${donutStops})` } : undefined}
              >
                <div>
                  <b>{orderTotal.toLocaleString('id-ID')}</b>
                  <small>Pesanan</small>
                </div>
              </div>
              <ul>
                {statusTotals.map((item, index) => (
                  <li key={item.status}>
                    <i className={[styles.blueDot, styles.yellowDot, styles.grayDot, styles.redDot][index % 4]} />
                    {item.status}
                    <b>{item.count}</b>
                    <small>{item.percent}%</small>
                  </li>
                ))}
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
                        <a href={`/order?game=${encodeURIComponent(gameSlug(order.game))}`}>
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
              {activities.map(([id, title, detail, time, tone]) => (
                <div className={styles.activity} key={id}>
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
        {error && (
          <p role="alert" className={styles.demoNote}>
            {error}
          </p>
        )}
      </div>
    </main>
  );
};

const IconArrowRightIcon = ({ size = 14 }: { size?: number }) => <IconChevronRight width={size} height={size} />;
