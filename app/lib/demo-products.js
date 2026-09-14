import baseProduct from '../../demo_product.json';
import { demoPassports } from './demo-ids';

const variantDetails = [
  ['Recycled Fleece Hoodie', '70% recycled polyester and 30% organic cotton.', 'TR', 0.45, 70],
  ['Organic Cotton Shirt', '100% certified organic cotton.', 'PT', 0.28, 0],
  ['Regenerated Nylon Jacket', '100% regenerated nylon made from recovered waste.', 'IT', 0.62, 100],
  ['Linen Blend Trousers', '55% European linen and 45% recycled cotton.', 'LT', 0.48, 45],
  ['Recycled Denim Jeans', '80% recycled cotton, 18% organic cotton and 2% elastane.', 'TN', 0.72, 80],
  ['Merino Wool Cardigan', '85% certified merino wool and 15% recycled polyamide.', 'RO', 0.39, 15],
  ['Hemp Canvas Overshirt', '55% hemp and 45% organic cotton.', 'NL', 0.51, 0],
  ['Recycled Swim Shorts', '88% recycled polyester and 12% elastane.', 'ES', 0.19, 88],
  ['Tencel Jersey Dress', '95% Tencel lyocell and 5% elastane.', 'AT', 0.31, 0],
  ['Recycled Workwear Vest', '65% recycled polyester and 35% recycled cotton.', 'DE', 0.58, 100],
];

function cloneProduct() {
  return JSON.parse(JSON.stringify(baseProduct));
}

export const demoProducts = Object.fromEntries(demoPassports.map((passport, index) => {
  const product = cloneProduct();
  if (index > 0) {
    const [name, description, countryOfOrigin, weightKg, recycledContentPct] = variantDetails[index - 1];
    product.identity.uniqueProductId = passport.id;
    product.identity.batchId = `BATCH-DEMO-2026-${String(index + 1).padStart(3, '0')}`;
    product.identity.modelId = `GTIN-DEMO-${String(871234567890 + index)}`;
    product.product.name = name;
    product.product.description = description;
    product.product.countryOfOrigin = countryOfOrigin;
    product.product.weightKg = weightKg;
    product.circularity.recycledContentPct = recycledContentPct;
    product.verification.lastUpdated = `2026-08-${String(23 - index).padStart(2, '0')}T07:43:00+02:00`;
    product.operators.manufacturer.name = `${name} Manufacturing Ltd.`;
    product.operators.importer.name = `Demo Apparel Import ${countryOfOrigin} BV`;
  }
  return [passport.id, product];
}));

export function getDemoProduct(id) {
  return demoProducts[id];
}

export function getDatasheet(id) {
  const product = getDemoProduct(id);
  if (!product) return null;

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
    ['MAT-001', 'Fibre Composition', 'Materials', product.materials.map(material => `${material.percentage}% ${material.name}`).join('; ')],
    ['REC-002', 'Recycled Content', 'Recycling', `${product.circularity.recycledContentPct}%`],
    ['CAR-001', 'Care Instructions', 'Care', product.care.careInstructions],
    ['REC-005', 'End of Life', 'Recycling', product.circularity.endOfLife],
  ];

  return {
    title: 'Textile DPP Datasheet',
    productId: id,
    regulatory_note: 'A working dataset for the textile digital product passport.',
    fields: fields.map(([fieldId, name, category, value]) => ({
      id: fieldId,
      name,
      category,
      type: 'Text',
      access: 'Public',
      status: 'Declared',
      guidance: value,
    })),
  };
}