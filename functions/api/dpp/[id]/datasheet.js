import { getProduct, json } from '../../../_lib/product.js';

export function onRequestGet({ params }) {
  const product = getProduct(params.id);

  if (!product) {
    return json({ detail: 'DPP not found' }, { status: 404 });
  }

  const fields = [
    ['PRD-001', 'Unique Product ID', 'Product', product.identity.uniqueProductId],
    ['PRD-002', 'Batch ID', 'Product', product.identity.batchId],
    ['PRD-003', 'Model ID', 'Product', product.identity.modelId],
    ['PRD-004', 'Product Category', 'Product', product.product.category],
    ['PRD-006', 'HS Commodity Code', 'Product', product.identity.hsCode],
    ['PRD-007', 'TARIC Commodity Code', 'Product', product.identity.taricCode],
    ['PRD-008', 'Manufacturer', 'Operators', product.operators.manufacturer.name],
    ['PRD-013', 'Importer', 'Operators', product.operators.importer.name],
    ['PRD-019', 'Country of Origin', 'Product', product.product.countryOfOrigin],
    ['PRD-021', 'Product Weight', 'Product', `${product.product.weightKg} kg`],
    ['MAT-001', 'Fibre Composition', 'Materials', '70% Recycled polyester; 30% Cotton'],
    ['REC-002', 'Recycled Content', 'Recycling', `${product.circularity.recycledContentPct}%`],
    ['CAR-001', 'Care Instructions', 'Care', product.care.careInstructions],
    ['REC-005', 'End of Life', 'Recycling', product.circularity.endOfLife],
  ];

  return json({
    title: 'Textile DPP Datasheet',
    productId: params.id,
    regulatory_note: 'A working dataset for the textile digital product passport.',
    fields: fields.map(([id, name, category, value]) => ({
      id,
      name,
      category,
      type: 'Text',
      access: 'Public',
      status: 'Declared',
      guidance: value,
    })),
  });
}