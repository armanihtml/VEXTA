import { getProduct, json } from '../../_lib/product.js';

export function onRequestGet({ params }) {
  const product = getProduct(params.id);

  if (!product) {
    return json({ detail: 'DPP not found' }, { status: 404 });
  }

  return json(product);
}