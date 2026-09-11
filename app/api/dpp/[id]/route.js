import { NextResponse } from 'next/server';
import product from '../../../../demo_product.json';

export async function GET(request, { params }) {
  const { id } = await params;
  if (id !== product.identity.uniqueProductId) {
    return NextResponse.json({ detail: 'DPP not found' }, { status: 404 });
  }

  return NextResponse.json(product);
}