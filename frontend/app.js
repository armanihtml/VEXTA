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
  const manufacturer = data.operators?.manufacturer?.name;
  const evidence = data.evidence || [];
  const completeness = Number(verification.dppCompletenessPct) || 0;
  const trust = Math.min(10, (completeness / 10) * (verification.status === 'verified' ? 1 : 0.89));
  const updated = verification.lastUpdated ? new Date(verification.lastUpdated).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : 'Not available';
  const statusLabel = (verification.status || 'unverified').replaceAll('_', ' ');
  const importer = data.operators?.importer?.name || 'Distribution operator not declared';
  const traceEvents = [
    { title: 'Retail Sale', place: 'Amsterdam, NL', date: 'May 2026', status: 'Active', code: identity.uniqueProductId, kind: 'active', label: 'Product ID' },
    { title: 'Distribution Hub', place: 'Rotterdam, NL', date: 'April 2026', status: 'Verified', code: importer, kind: 'verified', label: 'Operator' },
    { title: 'Customs Clearance', place: 'Port of Rotterdam', date: 'March 2026', status: 'Cleared (Ex)', code: identity.taricCode, kind: 'verified', label: 'TARIC Code' },
    { title: 'Manufacturing', place: product.countryOfOrigin || 'Origin not declared', date: 'February 2026', status: 'Verified (Ve)', code: manufacturer, kind: 'verified', label: 'Manufacturer' },
    { title: 'Fiber Composition', place: product.category || 'Textile product', date: 'Source record', status: 'Document-backed', code: `${completeness}% complete`, kind: 'documented', label: 'Record status' }
  ];
  const materialSummary = (data.materials || []).map(item => `${item.percentage}% ${item.name}`).join(', ') || 'Materials not declared';
  const productImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCY44M__7Rs5J2TRHIDuqKcs45b7FAfGB1YYlSeItv9w3boxQ5qkKa5XPmWjZH3LPGT_ux_DNVhohI_754hmmcZMbU__AyycYlUOcmHc-cC9oqRybc7F-Gxson8AEsfEIVr_IE0vfG5bT_5jY5hYgbM-bHLadzgInjZVu8r2JlwMsj0kjGLGGB-7TfQl8WznVOM5CcGevLXL4T0wgv0qdaYKjui5dCHscc3NcfsWxeALEEz11t_rIN8';
  const idRow = (label, value) => `<div class="passport-id-row"><span>${label}</span><div><b>${esc(value)}</b><button class="id-copy" type="button" data-copy="${esc(value)}" aria-label="Copy ${label}">Copy</button></div></div>`;
  const clearanceReady = Boolean(identity.hsCode && identity.taricCode && product.countryOfOrigin && product.weightKg && data.operators?.importer);
  const evidenceItems = [
    ['Origin evidence', Boolean(product.countryOfOrigin)],
    ['Product safety', Boolean(product.robustnessScore)],
    ['REACH compliance', Boolean(data.verification?.status)]
  ];
  const documents = [
    { name: 'GOTS Organic Textile Standard', issuer: 'Control Union', id: 'CU-8921-2023', access: 'Public', status: 'Active', type: 'Certificates' },
    { name: 'OEKO-TEX Standard 100', issuer: 'Hohenstein', id: '21.HIN.45901', access: 'Public', status: 'Active', type: 'Certificates' },
    { name: 'Chemical Compliance Test Report', issuer: 'SGS', id: 'SGS-HK-3329', access: 'Restricted', status: 'Expiring Soon', type: 'Test Reports' },
    { name: 'EU Declaration of Conformity', issuer: 'Internal Compliance', id: '0x9f...a1b2', access: 'Authority Only', status: 'Active', type: 'Declarations' },
    { name: 'Recycled Content Evidence', issuer: data.evidence?.[0]?.issuer || 'Not declared', id: data.evidence?.[0]?.type || 'REC-UNDECLARED', access: 'Business Only', status: data.evidence?.[0]?.status === 'verified' ? 'Active' : 'Declared', type: 'Certificates' }
  ];
  const cluster = (icon, title, label, value, tone = '') => `<article class="verification-cluster ${tone}"><div class="cluster-main"><span class="cluster-icon" aria-hidden="true">${icon}</span><div><h3>${title}</h3><span class="verification-badge ${tone}">${label}</span><span class="completion-track"><i style="width:${value}%"></i></span></div></div><div class="cluster-score"><strong>${value}%</strong><small>${value === 100 ? 'Complete' : 'Partial'}</small></div></article>`;
  const timeline = traceEvents.map(event => `<article class="timeline-item ${event.kind}"><span class="timeline-node" aria-hidden="true"></span><div class="timeline-card"><div class="timeline-card-head"><div><h3>${event.title}</h3><p>${event.place} <span aria-hidden="true">&bull;</span> ${event.date}</p></div><span class="timeline-status">${event.status}</span></div><button class="id-row" type="button" data-copy="${esc(event.code)}"><span><small>${event.label}</small><b>${esc(event.code)}</b></span><span class="copy-label">Copy</span></button></div></article>`).join('');
  passport.innerHTML = `<section class="passport-overview"><div class="product-visual" style="background-image:url('${productImage}')"><span class="passport-status">Verified</span><div class="readiness"><strong>${completeness}%</strong><span>Readiness<br>score</span></div></div><div class="passport-content"><div><p class="kicker">${esc(product.category || 'Apparel')} / ${esc(product.brand || 'Textile')}</p><h2>${esc(product.name || 'Digital Product Passport')}</h2></div><div class="passport-chips"><span>${esc(materialSummary)}</span><span>Made in ${esc(product.countryOfOrigin || 'origin not declared')}</span><span>${evidence.length} certifications</span></div><article class="identity-card"><h3>Digital Identity</h3><div class="passport-id-list">${idRow('Unique Product ID', identity.uniqueProductId)}${idRow('Batch ID', identity.batchId)}${idRow('HS Code', identity.hsCode)}</div></article><article class="product-details"><h3>Product Details</h3><p>${esc(product.description || 'A verifiable textile product with a structured digital record across its lifecycle.')}</p></article></div></section>
    <section class="dashboard-heading"><div><p class="kicker">${esc(product.category || 'Textile product')} / ${esc(product.brand || 'Unbranded')}</p><h2>Verification Dashboard</h2><p>Last updated: ${esc(updated)}</p></div><span class="dashboard-note">Declared vs verified</span></section>
    <div class="dashboard-actions"><a class="action-button" href="/api/dpp/${encodeURIComponent(identity.uniqueProductId)}/qr" download="${esc(identity.uniqueProductId)}.png">Download QR <span aria-hidden="true">&darr;</span></a><a class="action-button quiet" href="/api/dpp/${encodeURIComponent(identity.uniqueProductId)}/datasheet" target="_blank" rel="noreferrer">Open datasheet <span aria-hidden="true">&rarr;</span></a></div>
    <div class="verification-grid"><article class="trust-panel"><h3>Overall Trust</h3><div class="trust-gauge" style="--trust:${trust * 36}deg"><strong>${trust.toFixed(1)}</strong><span>/10</span></div><b>${esc(statusLabel)}</b></article><div class="verification-clusters">${cluster('ID', 'Identification', 'Issuer verified', completeness)}${cluster('OP', 'Operators & facilities', 'Document-backed', completeness)}${cluster('PR', 'Product characteristics', 'Self-declared', completeness)}${cluster('!', 'Chemical compliance', 'Pending verification', Math.min(completeness, 85), 'warning')}${cluster('CR', 'Circularity', 'Verified', completeness)}</div></div>
    <div class="dashboard-foot"><div><b>${esc(product.name || 'Digital Product Passport')}</b><span>${esc(manufacturer || 'Manufacturer not declared')}</span></div><div class="evidence-count"><span aria-hidden="true">&#128206;</span><b>${evidence.length}</b> certs attached</div></div>`;
  passport.insertAdjacentHTML('beforeend', `<section id="traceability" class="traceability"><div class="traceability-heading"><div><p class="kicker">Supply chain record</p><h2>Trace Depth - Tier 2 Verified</h2><p>Chronological tracking data for this manifest.</p></div><span class="access-pill authority">Authority</span></div><div class="timeline">${timeline}</div></section>`);
  passport.insertAdjacentHTML('beforeend', `<section id="export" class="export-view"><div class="export-grid"><div class="export-primary"><article class="clearance-hero"><span class="clearance-icon" aria-hidden="true">&#10003;</span><h2>${clearanceReady ? 'Ready for Clearance' : 'Clearance Incomplete'}</h2><p>Status: ${clearanceReady ? 'YES' : 'REVIEW REQUIRED'}</p></article><div class="export-actions"><button id="download-clearance" type="button">Download Clearance Bundle (JSON)</button><a class="authority-qr" href="/api/dpp/${encodeURIComponent(identity.uniqueProductId)}/qr" target="_blank" rel="noreferrer">Show Authority QR</a></div></div><div class="export-data"><article class="export-card"><div class="export-card-head"><h3>Critical Manifest Data</h3><span class="completion-mini"><i style="width:${clearanceReady ? 100 : 60}%"></i></span></div><div class="manifest-rows">${idRow('Commodity Code', `${identity.hsCode || 'Not declared'} (TARIC: ${identity.taricCode || 'Not declared'})`)}${idRow('Origin', product.countryOfOrigin || 'Not declared')}${idRow('Importer', data.operators?.importer?.id || importer)}${idRow('Net Mass', product.weightKg ? `${product.weightKg} kg` : 'Not declared')}</div></article><article class="export-card"><div class="export-card-head"><h3>Evidence Checklist</h3><span class="check-count">${evidenceItems.filter(item => item[1]).length}/${evidenceItems.length} Confirmed</span></div><div class="evidence-list">${evidenceItems.map(item => `<div class="evidence-row"><span>${item[0]}</span><b class="${item[1] ? 'evidence-ok' : 'evidence-pending'}">${item[1] ? 'Verified' : 'Pending'}</b></div>`).join('')}</div></article></div></div></section>`);
  passport.insertAdjacentHTML('beforeend', `<section id="docs" class="docs-view"><div class="docs-heading"><div><p class="kicker">Evidence archive</p><h2>Compliance Manifest</h2></div><span class="docs-count">${documents.length} items</span></div><div class="docs-tools"><input id="docs-search" type="search" placeholder="Search certificates, reports, hashes..." aria-label="Search documents"><div class="docs-filters"><button class="selected" type="button" data-doc-filter="All">All</button><button type="button" data-doc-filter="Certificates">Certificates</button><button type="button" data-doc-filter="Test Reports">Test Reports</button><button type="button" data-doc-filter="Declarations">Declarations</button></div></div><div id="document-list" class="document-list">${renderDocuments(documents)}</div></section>`);
  passport.hidden = false;
  loadDatasheet(identity.uniqueProductId);
  passport.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', async () => {
    try {
      await navigator.clipboard?.writeText(button.dataset.copy || '');
      button.querySelector('.copy-label').textContent = 'Copied';
    } catch (reason) {
      button.querySelector('.copy-label').textContent = 'Unavailable';
    }
  }));
  passport.querySelector('#download-clearance')?.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${identity.uniqueProductId || 'clearance'}-clearance.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  });
  const documentList = passport.querySelector('#document-list');
  const searchDocuments = () => {
    const query = passport.querySelector('#docs-search').value.toLowerCase();
    const filter = passport.querySelector('.docs-filters .selected').dataset.docFilter;
    documentList.innerHTML = renderDocuments(documents.filter(document => (filter === 'All' || document.type === filter) && `${document.name} ${document.issuer} ${document.id}`.toLowerCase().includes(query)));
  };
  passport.querySelector('#docs-search')?.addEventListener('input', searchDocuments);
  passport.querySelectorAll('[data-doc-filter]').forEach(button => button.addEventListener('click', () => {
    passport.querySelectorAll('[data-doc-filter]').forEach(item => item.classList.remove('selected'));
    button.classList.add('selected');
    searchDocuments();
  }));
}

function renderDocuments(documents) {
  return documents.map(document => `<article class="doc-row"><div><div class="doc-title"><h3>${esc(document.name)}</h3><span class="doc-access">${esc(document.access)}</span></div><p>Issuer: ${esc(document.issuer)} <span aria-hidden="true">&bull;</span> <b>${esc(document.id)}</b></p></div><div class="doc-actions"><span class="doc-status ${document.status === 'Expiring Soon' ? 'amber' : document.status === 'Declared' ? 'neutral' : ''}">${esc(document.status)}</span><button type="button" title="Document preview">View</button></div></article>`).join('') || '<p class="docs-empty">No matching documents.</p>';
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
document.querySelectorAll('.mobile-nav a').forEach(link => link.addEventListener('click', () => {
  document.querySelectorAll('.mobile-nav a').forEach(item => item.classList.remove('active'));
  link.classList.add('active');
}));
loadProduct(demoId);