import { NextResponse } from 'next/server';
import { getDatasheet } from '../../../../lib/demo-products';

export async function GET(request, { params }) {
  const { id } = await params;
  const datasheet = getDatasheet(id);
  if (!datasheet) {
    return NextResponse.json({ detail: 'DPP not found' }, { status: 404 });
  }

  return NextResponse.json(datasheet);
}