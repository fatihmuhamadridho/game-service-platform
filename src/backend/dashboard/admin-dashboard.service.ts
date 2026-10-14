import { db } from '@prisma/db';

export class AdminDashboardError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

const statusLabels: Record<string, string> = {
  PENDING_PAYMENT: 'Menunggu',
  PENDING_VALIDATION: 'Menunggu Validasi',
  PROCESSING: 'Diproses',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
};
const money = (value: unknown) => Number(String(value ?? 0)) || 0;
const within = (date: Date, start: Date, end: Date) => date >= start && date <= end;
const startOfDay = (date: Date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
const bucketDate = (date: Date, granularity: string) => {
  const result = startOfDay(date);
  if (granularity === 'weekly') result.setUTCDate(result.getUTCDate() - result.getUTCDay());
  if (granularity === 'monthly') result.setUTCDate(1);
  return result;
};

export async function getAdminDashboardOverview(start: Date, end: Date, granularity: 'daily' | 'weekly' | 'monthly') {
  const [orders, transactions, users, services, activity] = await Promise.all([
    db.orm.customer_order.include('items').all(),
    db.orm.financial_transaction.all(),
    db.orm.user_account.all(),
    db.orm.game_service.all(),
    db.orm.activity_log.all(),
  ]);
  const duration = end.getTime() - start.getTime() + 86400000;
  const previousStart = new Date(start.getTime() - duration);
  const previousEnd = new Date(start.getTime() - 1);
  const periodOrders = orders.filter((row) => within(row.created_at, start, end));
  const previousOrders = orders.filter((row) => within(row.created_at, previousStart, previousEnd));
  const periodTransactions = transactions.filter(
    (row) =>
      within(row.created_at, start, end) &&
      row.type === 'PAYMENT' &&
      ['SUCCESS', 'SETTLED', 'COMPLETED'].includes(row.status)
  );
  const previousTransactions = transactions.filter(
    (row) =>
      within(row.created_at, previousStart, previousEnd) &&
      row.type === 'PAYMENT' &&
      ['SUCCESS', 'SETTLED', 'COMPLETED'].includes(row.status)
  );
  const revenue = periodTransactions.reduce((sum, row) => sum + money(row.amount), 0);
  const previousRevenue = previousTransactions.reduce((sum, row) => sum + money(row.amount), 0);
  const change = (current: number, previous: number) =>
    previous ? Math.round(((current - previous) / previous) * 100) : 0;
  const buckets = new Map<string, { label: string; orders: number; revenue: number }>();
  const addBucket = (date: Date) => {
    const bucket = bucketDate(date, granularity);
    const key = bucket.toISOString().slice(0, 10);
    if (!buckets.has(key)) buckets.set(key, { label: key, orders: 0, revenue: 0 });
    return buckets.get(key)!;
  };
  for (const order of periodOrders) addBucket(order.created_at).orders++;
  for (const transaction of periodTransactions) addBucket(transaction.created_at).revenue += money(transaction.amount);
  const statusCounts = new Map<string, number>();
  for (const order of periodOrders)
    statusCounts.set(
      statusLabels[order.order_status] ?? order.order_status,
      (statusCounts.get(statusLabels[order.order_status] ?? order.order_status) ?? 0) + 1
    );
  const gameCounts = new Map<string, { count: number; revenue: number }>();
  const orderGame = new Map<string, string>();
  for (const order of periodOrders) {
    const first = order.items[0];
    const name = first?.game_name_snapshot ?? 'Game';
    orderGame.set(String(order._id), name);
    const item = gameCounts.get(name) ?? { count: 0, revenue: 0 };
    item.count++;
    gameCounts.set(name, item);
  }
  for (const transaction of periodTransactions) {
    const name = orderGame.get(String(transaction.order_id));
    if (name) gameCounts.get(name)!.revenue += money(transaction.amount);
  }
  const maxGameCount = Math.max(1, ...[...gameCounts.values()].map((entry) => entry.count));
  const maxGameRevenue = Math.max(1, ...[...gameCounts.values()].map((entry) => entry.revenue));
  const paymentMethods = new Map<string, { count: number; amount: number }>();
  for (const row of periodTransactions) {
    const entry = paymentMethods.get(row.method) ?? { count: 0, amount: 0 };
    entry.count++;
    entry.amount += money(row.amount);
    paymentMethods.set(row.method, entry);
  }
  const formatTransactionMethod = (method: string) => (method === 'BCA_TRANSFER' ? 'Transfer Bank' : method);
  const recentOrders = [...orders]
    .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
    .slice(0, 5)
    .map((order) => {
      const item = order.items[0];
      return {
        id: order.order_number,
        date: order.created_at.toISOString(),
        user: order.customer_name,
        game: item?.game_name_snapshot ?? 'Game',
        service: item?.service_name_snapshot ?? 'Layanan',
        total: money(order.total_amount),
        status: statusLabels[order.order_status] ?? order.order_status,
      };
    });
  const recentActivity = [...activity]
    .sort((a, b) => b.occurred_at.getTime() - a.occurred_at.getTime())
    .slice(0, 5)
    .map((row) => ({
      id: String(row._id),
      title: row.action_label,
      detail: row.target_reference ?? row.target_type,
      occurredAt: row.occurred_at.toISOString(),
      category: row.category,
    }));
  return {
    from: start.toISOString(),
    to: end.toISOString(),
    granularity,
    metrics: {
      orderCount: periodOrders.length,
      orderChangePercent: change(periodOrders.length, previousOrders.length),
      revenue,
      revenueChangePercent: change(revenue, previousRevenue),
      userCount: users.filter((row) => !row.deleted_at).length,
      serviceCount: services.filter((row) => row.is_active && !row.deleted_at).length,
    },
    series: [...buckets.values()].sort((a, b) => a.label.localeCompare(b.label)),
    statusDistribution: [...statusCounts.entries()].map(([status, count]) => ({
      status,
      count,
      percent: periodOrders.length ? Math.round((count / periodOrders.length) * 100) : 0,
    })),
    popularGames: [...gameCounts.entries()]
      .map(([name, entry]) => ({ name, count: entry.count, percent: Math.round((entry.count / maxGameCount) * 100) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    gameRevenue: [...gameCounts.entries()]
      .map(([name, entry]) => ({
        name,
        amount: entry.revenue,
        percent: Math.round((entry.revenue / maxGameRevenue) * 100),
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5),
    paymentMethods: [...paymentMethods.entries()].map(([method, entry]) => ({
      method: formatTransactionMethod(method),
      count: entry.count,
      amount: entry.amount,
    })),
    recentOrders,
    recentActivity,
  };
}

export function toAdminDashboardError(error: unknown) {
  if (error instanceof AdminDashboardError) return error;
  return new AdminDashboardError('DSHT03001', 'Ringkasan dashboard sementara tidak tersedia.', 500);
}
