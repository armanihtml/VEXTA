const demoId = 'SGTIN-DEMO-000000000001';
const input = document.querySelector('#product-id');
const error = document.querySelector('#lookup-error');
const loading = document.querySelector('#loading');
const passport = document.querySelector('#passport');
const datasheet = document.querySelector('#datasheet');

function esc(value) {
  return String(value ?? 'Not declared').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[char]));
}

function render(data) {
  const product = data.product || {};
  const identity = data.identity || {};
  const verification = data.verification || {};
  const circularity = data.circularity || {};
  const materials = data.materials || [];
  const max = Math.max(...materials.map(item => Number(item.percentage) || 0), 1);
  const manufacturer = data.operators?.manufacturer?.name;
  const care = data.care || {};
  passport.innerHTML = `<section class="passport-head"><div><p class="kicker">${esc(product.category || 'Textile product')} / ${esc(product.brand || 'Unbranded')}</p><h2>${esc(product.name || 'Digital Product Passport')}</h2><p>${esc(product.description)}</p></div><span class="status">${esc(verification.status || 'unverified')}</span></section>
    <div class="passport-actions"><a class="action-button" href="/api/dpp/${encodeURIComponent(identity.uniqueProductId)}/qr" download="${esc(identity.uniqueProductId)}.png">Download QR <span aria-hidden="true">&darr;</span></a><a class="action-button quiet" href="/api/dpp/${encodeURIComponent(identity.uniqueProductId)}/datasheet" target="_blank" rel="noreferrer">Open datasheet <span aria-hidden="true">&rarr;</span></a></div>
    <div class="passport-grid"><article class="passport-card wide"><h3 class="card-title">Material composition <span>${materials.length} materials</span></h3>${materials.length ? materials.map(item => `<div class="material"><b>${esc(item.name)}</b><div class="bar"><span style="width:${Math.min(100, (Number(item.percentage) || 0) / max * 100)}%"></span></div><b>${esc(item.percentage)}%</b></div>`).join('') : '<p class="copy">No material data provided.</p>'}</article>
    <article class="passport-card"><h3 class="card-title">Impact profile <span>01</span></h3><div class="metric-grid"><div class="metric"><strong>${esc(product.recyclabilityScore)}</strong><small>Recyclability</small></div><div class="metric"><strong>${esc(product.robustnessScore)}</strong><small>Robustness</small></div><div class="metric"><strong>${esc(product.environmentalFootprintPerformance)}</strong><small>Footprint class</small></div></div></article>
    <article class="passport-card"><h3 class="card-title">Circularity <span>02</span></h3><div class="details"><div><span class="detail-label">Recycled content</span><span class="detail-value">${esc(circularity.recycledContentPct)}%</span></div><div><span class="detail-label">Origin</span><span class="detail-value">${esc(product.countryOfOrigin)}</span></div><div><span class="detail-label">Weight</span><span class="detail-value">${esc(product.weightKg)} kg</span></div><div><span class="detail-label">Warranty</span><span class="detail-value">${esc(product.warrantyMonths)} months</span></div></div></article>
    <article class="passport-card wide"><h3 class="card-title">Product identity <span>03</span></h3><div class="details"><div><span class="detail-label">Unique product ID</span><span class="detail-value mono">${esc(identity.uniqueProductId)}</span></div><div><span class="detail-label">Batch</span><span class="detail-value mono">${esc(identity.batchId)}</span></div><div><span class="detail-label">Manufacturer</span><span class="detail-value">${esc(manufacturer)}</span></div><div><span class="detail-label">Last updated</span><span class="detail-value">${esc(verification.lastUpdated)}</span></div></div></article>
    <article class="passport-card wide"><h3 class="card-title">Care & repair <span>04</span></h3><p class="copy"><b>Care:</b> ${esc(care.careInstructions)}</p><p class="copy"><b>Repair:</b> ${esc(care.repairInstructions)}</p></article></div>`;
  passport.hidden = false;
  loadDatasheet(identity.uniqueProductId);
}

async function loadDatasheet(id) {
  try {
    const response = await fetch(`/api/dpp/${encodeURIComponent(id)}/datasheet`);
    if (!response.ok) throw new Error('Datasheet unavailable');
    const data = await response.json();
    const fields = data.fields || [];
    datasheet.innerHTML = `<div class="datasheet-head"><div><p class="kicker">Working data model</p><h2>${esc(data.title || 'DPP datasheet')}</h2></div><span class="status">${fields.length} fields</span></div><p class="datasheet-note">${esc(data.regulatory_note)}</p><div class="table-wrap"><table><thead><tr><th>ID</th><th>Data field</th><th>Category</th><th>Type</th><th>Access</th><th>Status</th></tr></thead><tbody>${fields.map(field => `<tr><td class="mono">${esc(field.id)}</td><td><b>${esc(field.name)}</b><small>${esc(field.guidance)}</small></td><td>${esc(field.category)}</td><td>${esc(field.type)}${field.unit ? ` (${esc(field.unit)})` : ''}</td><td>${esc(field.access)}</td><td>${esc(field.status)}</td></tr>`).join('')}</tbody></table></div>`;
    datasheet.hidden = false;
  } catch (reason) {
    datasheet.hidden = true;
  }
}

async function loadProduct(id) {
  const cleanId = id.trim();
  if (!cleanId) return;
  error.textContent = '';
  passport.hidden = true;
  datasheet.hidden = true;
  loading.hidden = false;
  try {
    const response = await fetch(`/api/dpp/${encodeURIComponent(cleanId)}`);
    if (!response.ok) throw new Error(response.status === 404 ? 'No passport found for that product ID.' : 'The passport could not be loaded.');
    render(await response.json());
  } catch (reason) { error.textContent = reason.message; } finally { loading.hidden = true; }
}

document.querySelector('#load-product').addEventListener('click', () => loadProduct(input.value));
document.querySelector('#load-demo').addEventListener('click', () => { input.value = demoId; loadProduct(demoId); });
input.addEventListener('keydown', event => { if (event.key === 'Enter') loadProduct(input.value); });
loadProduct(demoId);