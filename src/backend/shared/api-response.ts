import { NextResponse } from 'next/server';

export function apiSuccess<T>(code: string, message: string, data: T, status = 200) {
  return NextResponse.json({ status: { code, message }, data }, { status });
}

export function apiFailure(code: string, message: string, status: number) {
  return NextResponse.json({ status: { code, message }, data: null }, { status });
}

export function apiTechnicalFailure(code = 'GAMT03001', message = 'Layanan katalog sedang tidak tersedia.') {
  return apiFailure(code, message, 500);
}
