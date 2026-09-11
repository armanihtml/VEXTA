import product from '../../demo_product.json';

export function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      ...init.headers,
    },
  });
}

export function getProduct(id) {
  return id === product.identity.uniqueProductId ? product : null;
}

export { product };