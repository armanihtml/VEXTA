'use client';

import { useEffect, useState } from 'react';

const demoId = 'SGTIN-DEMO-000000000001';

function Value({ label, children }) {
  return <div className="value"><span>{label}</span><strong>{children || 'Not declared'}</strong></div>;
}

function Pill({ children, tone = '' }) {
  return <span className={`pill ${tone}`}>{children}</span>;
}

export default function Home() {
  const [id, setId] = useState(demoId);
  const [product, setProduct] = useState(null);
  const [datasheet, setDatasheet] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadProduct(nextId = id) {
    const cleanId = nextId.trim();
    if (!cleanId) return;
    setLoading(true);
    setError('');
    setProduct(null);
    try {
      const response = await fetch(`/api/dpp/${encodeURIComponent(cleanId)}`);
      if (!response.ok) throw new Error(response.status === 404 ? 'No passport found for that product ID.' : 'The passport could not be loaded.');
      const data = await response.json();
      setProduct(data);
      const sheet = await fetch(`/api/dpp/${encodeURIComponent(cleanId)}/datasheet`);
      if (sheet.ok) setDatasheet(await sheet.json());
    } catch (reason) {
      setError(reason.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadProduct(demoId); }, []);

  const completeness = product?.verification?.dppCompletenessPct || 0;
  const identity = product?.identity;
  const details = product?.product;
  const evidence = product?.evidence || [];

  return <>
    <header className="topbar">
      <a className="wordmark" href="/">V<span>V</span>EXTA</a>
      <div className="topbar-meta"><Pill>PUBLIC</Pill><Pill tone="blue">BUSINESS</Pill><span className="live"><i /> Passport viewer</span></div>
    </header>
    <main className="shell">
      <section className="intro">
        <div><p className="eyebrow">Textile / digital product passport</p><h1>Every garment<br /><em>has a story.</em></h1><p className="lede">A clear, verifiable record of the materials, makers, care and circular path behind a product.</p></div>
        <div className="seal"><strong>VXT</strong><span>TRACEABLE<br />TEXTILES</span></div>
      </section>

      <section className="lookup panel">
        <label htmlFor="product-id">Open a product record</label>
        <div className="lookup-row"><input id="product-id" value={id} onChange={event => setId(event.target.value)} onKeyDown={event => event.key === 'Enter' && loadProduct()} placeholder="Enter a unique product ID" /><button onClick={() => loadProduct()}>View passport <span>→</span></button></div>
        {error && <p className="error">{error}</p>}
        <button className="demo-link" onClick={() => { setId(demoId); loadProduct(demoId); }}>Use the demo passport</button>
      </section>

      {loading && <p className="loading">Loading record...</p>}
      {product && <>
        <section className="passport-grid" id="passport">
          <div className="product-visual"><span className="verified">✓ VERIFIED</span><div className="fabric-lines" /><div className="readiness"><b>{completeness}%</b><span>data<br />readiness</span></div></div>
          <div className="passport-copy"><p className="eyebrow">{details.category} / {details.brand}</p><h2>{details.name}</h2><div className="chips"><Pill>{product.materials.map(material => `${material.percentage}% ${material.name}`).join(' · ')}</Pill><Pill>Made in {details.countryOfOrigin}</Pill><Pill>{evidence.length + 4} certifications</Pill></div>
            <article className="white-card"><h3>Digital identity</h3><div className="values"><Value label="Unique Product ID">{identity.uniqueProductId}</Value><Value label="Batch ID">{identity.batchId}</Value><Value label="HS / TARIC">{identity.hsCode} / {identity.taricCode}</Value></div></article>
            <article className="white-card"><h3>Product details</h3><p>{details.description}</p></article>
          </div>
        </section>

        <section className="section" id="verification"><div className="section-heading"><div><p className="eyebrow">Declared vs verified</p><h2>Verification dashboard</h2><p>Last updated {new Date(product.verification.lastUpdated).toLocaleDateString('en-GB', { dateStyle: 'long' })}</p></div><Pill tone="outline">{product.verification.status.replace('_', ' ')}</Pill></div>
          <div className="verification-layout"><article className="trust-card"><p>Overall trust</p><div className="gauge" style={{ '--progress': `${completeness * 3.6}deg` }}><b>{(completeness / 10 * .89).toFixed(1)}</b><span>/10</span></div><Pill tone="green">Supplier declared</Pill></article><div className="clusters">{[['ID', 'Identification', 'Issuer verified'], ['OP', 'Operators & facilities', 'Document-backed'], ['PR', 'Product characteristics', 'Self-declared'], ['!', 'Chemical compliance', 'Pending verification'], ['CR', 'Circularity', 'Verified']].map(([icon, title, status], index) => <article className={`cluster ${index === 3 ? 'warning' : ''}`} key={title}><i>{icon}</i><div><h3>{title}</h3><Pill tone={index === 3 ? 'amber' : 'green'}>{status}</Pill><span className="track"><b style={{ width: `${index === 3 ? 85 : completeness}%` }} /></span></div><strong>{index === 3 ? 85 : completeness}%</strong></article>)}</div></div>
        </section>

        <section className="section traceability" id="traceability"><div className="section-heading"><div><p className="eyebrow">Supply chain record</p><h2>Trace depth: Tier 2 verified</h2><p>Chronological tracking data for this manifest.</p></div><Pill tone="orange">AUTHORITY</Pill></div><div className="timeline">{[['Retail sale', 'Amsterdam, NL', 'May 2026', 'Active'], ['Distribution hub', 'Rotterdam, NL', 'April 2026', 'Verified'], ['Customs clearance', 'Port of Rotterdam', 'March 2026', 'Cleared'], ['Manufacturing', details.countryOfOrigin, 'February 2026', 'Verified'], ['Fiber composition', details.category, 'Source record', 'Document-backed']].map(([title, place, date, status]) => <article key={title}><i /><div><div className="timeline-head"><div><h3>{title}</h3><p>{place} · {date}</p></div><Pill>{status}</Pill></div><Value label={title === 'Manufacturing' ? 'Manufacturer' : 'Record reference'}>{title === 'Manufacturing' ? product.operators.manufacturer.name : identity.uniqueProductId}</Value></div></article>)}</div></section>

        <section className="section export" id="export"><div className="section-heading"><div><p className="eyebrow">Authority workflow</p><h2>Export clearance</h2></div></div><div className="export-grid"><article className="clearance"><div>✓</div><h3>Ready for clearance</h3><p>STATUS: YES</p><button onClick={() => { const blob = new Blob([JSON.stringify(product, null, 2)], { type: 'application/json' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `${identity.uniqueProductId}-clearance.json`; link.click(); }}>Download JSON bundle ↓</button></article><article className="manifest white-card"><h3>Critical manifest data</h3><Value label="Commodity code">{identity.hsCode} (TARIC: {identity.taricCode})</Value><Value label="Origin">{details.countryOfOrigin}</Value><Value label="Importer">{product.operators.importer.name}</Value><Value label="Net mass">{details.weightKg} kg</Value></article></div></section>

        <section className="section docs" id="docs"><div className="section-heading"><div><p className="eyebrow">Evidence archive</p><h2>Compliance manifest</h2></div><Pill tone="outline">{evidence.length + 4} ITEMS</Pill></div><div className="documents">{['GOTS Organic Textile Standard', 'OEKO-TEX Standard 100', 'Chemical Compliance Test Report', 'EU Declaration of Conformity', 'Recycled Content Evidence'].map((name, index) => <article key={name}><div><h3>{name}</h3><p>Issuer: {index === 4 ? evidence[0]?.issuer : ['Control Union', 'Hohenstein', 'SGS', 'Internal Compliance'][index]}</p></div><Pill tone={index === 2 ? 'amber' : 'green'}>{index === 2 ? 'EXPIRING SOON' : 'ACTIVE'}</Pill></article>)}</div></section>

        {datasheet && <section className="section datasheet"><div className="section-heading"><div><p className="eyebrow">Working data model</p><h2>{datasheet.title}</h2></div><Pill tone="outline">{datasheet.fields.length} FIELDS</Pill></div><p>{datasheet.regulatory_note}</p><div className="table-wrap"><table><thead><tr><th>ID</th><th>Data field</th><th>Category</th><th>Status</th></tr></thead><tbody>{datasheet.fields.map(field => <tr key={field.id}><td>{field.id}</td><td><b>{field.name}</b><small>{field.guidance}</small></td><td>{field.category}</td><td>{field.status}</td></tr>)}</tbody></table></div></section>}
      </>}
    </main>
    <nav className="mobile-nav"><a href="#passport">Passport</a><a href="#verification">Verify</a><a href="#traceability">Trace</a><a href="#export">Export</a><a href="#docs">Docs</a></nav>
  </>;
}