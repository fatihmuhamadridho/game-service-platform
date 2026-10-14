import { NextResponse } from 'next/server';
import { requireAdminApi } from '@backend/shared/admin-auth';
import { getAdminTransaction, toAdminTransactionError } from '@backend/transaction/admin-transaction.service';

export async function GET(request: Request, { params }: { params: Promise<{ transactionId: string }> }) {
  const denied = requireAdminApi('TRXB01001', request);
  if (denied) return denied;
  try {
    const { transactionId } = await params;
    const transaction = await getAdminTransaction(transactionId);
    return NextResponse.json({
      status: { code: 'TRNS00000', message: 'Detail transaksi berhasil diambil.' },
      data: { transaction },
    });
  } catch (error) {
    const failure = toAdminTransactionError(error);
    return NextResponse.json(
      { status: { code: failure.code, message: failure.message }, data: null },
      { status: failure.status }
    );
  }
}
