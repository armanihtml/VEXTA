import { NextResponse } from 'next/server';
import { getDemoProduct } from '../../../lib/demo-products';

export async function GET(request, { params }) {
  const { id } = await params;
  const product = getDemoProduct(id);
  if (!product) {
    return NextResponse.json({ detail: 'DPP not found' }, { status: 404 });
  }

  return NextResponse.json(product);
}