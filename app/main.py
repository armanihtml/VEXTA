import json
import io
import os
from pathlib import Path
from typing import Any

import httpx
import qrcode
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, HTMLResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.dpp_datasheet import DPP_DATASHEET


BASE = Path(__file__).resolve().parent
FRONTEND = BASE.parent / "frontend"

DEMO = json.loads(
    (BASE / "demo_product.json").read_text(encoding="utf-8")
)


app = FastAPI(
    title="Textile DPP Backend API",
    version="1.0.0",
    description="Backend API for Product → QR → Digital Product Passport."
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=False,
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=FRONTEND), name="static")


SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY", "")
FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL", "")


def verification_label(status: str) -> str:
    labels = {
        "verified": "Verified",
        "supplier_declared": "Supplier declared",
        "unverified": "Unverified",
        "expired": "Expired",
        "rejected": "Rejected",
    }

    return labels.get(
        status,
        status.replace("_", " ").title()
    )


async def load_public_dpp(
    unique_product_id: str
) -> dict[str, Any]:

    # -----------------------------------------
    # DEMO MODE
    # -----------------------------------------

    if not SUPABASE_URL or not SUPABASE_KEY:

        if unique_product_id != DEMO["identity"]["uniqueProductId"]:
            raise HTTPException(
                status_code=404,
                detail="DPP not found"
            )

        return DEMO


    # -----------------------------------------
    # SUPABASE MODE
    # -----------------------------------------

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }

    async with httpx.AsyncClient(timeout=15) as client:

        summary_url = (
            f"{SUPABASE_URL}/rest/v1/public_dpp_summary"
        )

        params = {
            "unique_product_id":
                f"eq.{unique_product_id}",

            "select": "*",
            "limit": "1"
        }

        response = await client.get(
            summary_url,
            headers=headers,
            params=params
        )

        if response.status_code >= 400:
            raise HTTPException(
                status_code=502,
                detail=f"Supabase error: {response.text}"
            )

        rows = response.json()

        if not rows:
            raise HTTPException(
                status_code=404,
                detail="DPP not found"
            )

        x = rows[0]


        # -------------------------------------
        # FIND PRODUCT
        # -------------------------------------

        product_response = await client.get(

            f"{SUPABASE_URL}/rest/v1/products",

            headers=headers,

            params={
                "model_id": f"eq.{x['model_id']}",
                "select":
                    "product_id,"
                    "product_weight_kg,"
                    "updated_at",

                "limit": "1"
            }
        )


        product_rows = (

            product_response.json()

            if product_response.status_code < 400

            else []
        )


        # -------------------------------------
        # GET MATERIAL COMPOSITION
        # -------------------------------------

        fibres = []

        if product_rows:

            product_id = product_rows[0]["product_id"]

            fibre_response = await client.get(

                f"{SUPABASE_URL}/rest/v1/fibre_composition",

                headers=headers,

                params={
                    "product_id":
                        f"eq.{product_id}",

                    "select":
                        "fibre_name,percentage",

                    "order":
                        "percentage.desc"
                }
            )


            if fibre_response.status_code < 400:

                fibres = [

                    {
                        "name": f["fibre_name"],
                        "percentage":
                            float(f["percentage"])
                    }

                    for f in fibre_response.json()
                ]


        # -------------------------------------
        # STRUCTURED API RESPONSE
        # -------------------------------------

        return {

            "identity": {

                "uniqueProductId":
                    x.get("unique_product_id"),

                "batchId":
                    x.get("batch_id"),

                "modelId":
                    x.get("model_id"),

                "hsCode":
                    x.get("hs_code"),

                "taricCode":
                    x.get("taric_code")
            },


            "product": {

                "name":
                    x.get("espr_product_category")
                    or "Textile Product",

                "brand": None,

                "description": None,

                "category":
                    x.get("espr_product_category"),

                "pefcrCategory":
                    x.get("pefcr_product_category"),

                "countryOfOrigin":
                    x.get("country_of_origin"),

                "weightKg":
                    float(
                        product_rows[0]["product_weight_kg"]
                    )
                    if (
                        product_rows
                        and product_rows[0].get(
                            "product_weight_kg"
                        )
                    )
                    else None,

                "robustnessScore":
                    x.get("robustness_score"),

                "recyclabilityScore":
                    x.get("recyclability_score"),

                "environmentalFootprintPerformance":
                    x.get(
                        "environmental_footprint_performance"
                    ),

                "euEcolabel":
                    x.get("eu_ecolabel_status"),

                "warrantyMonths":
                    x.get("warranty_months")
            },


            "materials": fibres,


            "operators": {

                "manufacturer": {

                    "id":
                        x.get("manufacturer_id"),

                    "name":
                        x.get("manufacturer_name")
                },


                "importer": (

                    {
                        "id":
                            x.get("importer_id"),

                        "name":
                            x.get("importer_name")
                    }

                    if x.get("importer_id")

                    else None
                )
            },


            "circularity": {

                "recycledContentPct":
                    x.get("recycled_content_pct"),

                "recycledContentOriginType":
                    x.get(
                        "recycled_content_origin_type"
                    ),

                "organicContentPct":
                    x.get("organic_content_pct"),

                "endOfLife":
                    None
            },


            "care": {

                "careInstructions":
                    x.get("care_instructions"),

                "repairInstructions":
                    x.get("repair_instructions"),

                "safeUseInstructions":
                    None
            },


            "verification": {

                "status":
                    "unverified",

                "dppCompletenessPct":
                    None,

                "lastUpdated":
                    product_rows[0].get(
                        "updated_at"
                    )
                    if product_rows
                    else None,

                "schemaVersion":
                    1
            },


            "evidence": []
        }



# ---------------------------------------------
# HEALTH CHECK
# ---------------------------------------------

@app.get("/health")
async def health():

    return {

        "ok": True,

        "mode":
            "supabase"
            if SUPABASE_URL and SUPABASE_KEY
            else "demo"
    }



# ---------------------------------------------
# PUBLIC JSON API
# ---------------------------------------------

@app.get("/api/dpp/{unique_product_id}")
async def api_dpp(
    unique_product_id: str
):

    return await load_public_dpp(
        unique_product_id
    )


# ---------------------------------------------
# FULL DATASHEET API
# ---------------------------------------------

@app.get("/api/dpp/{unique_product_id}/datasheet")
async def api_datasheet(
    unique_product_id: str
):
    product = await load_public_dpp(unique_product_id)
    return {
        **DPP_DATASHEET,
        "productId": unique_product_id,
        "product": product,
    }



# ---------------------------------------------
# QR TARGET API
# ---------------------------------------------

@app.get(
    "/api/dpp/{unique_product_id}/qr-target"
)
async def qr_target(
    unique_product_id: str,
    request: Request
):

    await load_public_dpp(
        unique_product_id
    )


    if FRONTEND_BASE_URL:

        target = (
            f"{FRONTEND_BASE_URL.rstrip('/')}"
            f"/dpp/{unique_product_id}"
        )

    else:

        target = (

            str(request.base_url).rstrip("/")

            + f"/dpp/{unique_product_id}"
        )


    return {

        "uniqueProductId":
            unique_product_id,

        "url":
            target
    }


@app.get("/api/dpp/{unique_product_id}/qr")
async def qr_image(
    unique_product_id: str,
    request: Request
):
    target = (await qr_target(unique_product_id, request))["url"]
    image = qrcode.make(target)
    output = io.BytesIO()
    image.save(output, format="PNG")
    output.seek(0)
    return Response(output.getvalue(), media_type="image/png")



# ---------------------------------------------
# MOBILE DIGITAL PRODUCT PASSPORT
# ---------------------------------------------

@app.get(
    "/dpp/{unique_product_id}",
    response_class=HTMLResponse
)
async def public_passport(
    unique_product_id: str
):

    d = await load_public_dpp(
        unique_product_id
    )


    identity = d["identity"]
    product = d["product"]


    materials = "".join(

        f"""
        <div class="row">
            <span>{m['name']}</span>
            <b>{m['percentage']:g}%</b>
        </div>
        """

        for m in d.get(
            "materials",
            []
        )

    ) or """

    <div class="muted">
        No material data provided
    </div>

    """


    importer = (
        d.get(
            "operators",
            {}
        )
        .get(
            "importer"
        )
    )


    importer_html = (

        f"""
        <div class="row">
            <span>Importer</span>
            <b>{importer['name']}</b>
        </div>
        """

        if importer

        else ""
    )


    verification = d.get(
        "verification",
        {}
    )


    status = verification_label(

        verification.get(
            "status",
            "unverified"
        )
    )


    completeness = verification.get(
        "dppCompletenessPct"
    )


    completeness_html = (

        f"""
        <div class="pill">
            Data readiness {completeness}%
        </div>
        """

        if completeness is not None

        else ""
    )


    recycled = (

        d.get(
            "circularity",
            {}
        )
        .get(
            "recycledContentPct"
        )
    )


    recycled_html = (

        f"""
        <div class="row">
            <span>Recycled content</span>
            <b>{recycled:g}%</b>
        </div>
        """

        if recycled is not None

        else ""
    )


    origin = (
        product.get(
            "countryOfOrigin"
        )
        or "Not declared"
    )


    return f"""
<!doctype html>

<html>

<head>

<meta charset="utf-8">

<meta name="viewport"
content="width=device-width,initial-scale=1">

<title>
{product.get('name') or 'Digital Product Passport'}
</title>


<style>

:root {{

    --bg:#f5f7fa;
    --card:#ffffff;
    --text:#171a1f;
    --muted:#65707c;
    --line:#e1e6eb;
    --accent:#0d5bd7;

}}

* {{
    box-sizing:border-box;
}}

body {{

    margin:0;

    background:var(--bg);

    color:var(--text);

    font:
    15px/1.5
    system-ui,
    -apple-system,
    Segoe UI,
    sans-serif;

}}

main {{

    max-width:720px;

    margin:auto;

    padding:20px;

}}

header {{

    display:flex;

    justify-content:
    space-between;

    align-items:center;

    margin-bottom:22px;

}}

.logo {{

    font-weight:800;

    font-size:20px;

}}

.pill {{

    border:
    1px solid #cfd8e3;

    background:white;

    border-radius:999px;

    padding:6px 10px;

    font-size:12px;

}}

h1 {{

    font-size:30px;

    line-height:1.1;

    margin:8px 0;

}}

.eyebrow {{

    color:var(--muted);

    font-size:12px;

    text-transform:uppercase;

    letter-spacing:.08em;

}}

.card {{

    background:
    var(--card);

    border:
    1px solid var(--line);

    border-radius:14px;

    padding:18px;

    margin:14px 0;

}}

.row {{

    display:flex;

    justify-content:
    space-between;

    gap:16px;

    border-bottom:
    1px solid #eef1f4;

    padding:10px 0;

}}

.row:last-child {{
    border:0;
}}

.row span {{
    color:var(--muted);
}}

.mono {{

    font-family:
    ui-monospace,
    SFMono-Regular,
    Menlo,
    monospace;

    font-size:13px;

    word-break:
    break-all;

}}

.grid {{

    display:grid;

    grid-template-columns:
    1fr 1fr;

    gap:10px;

}}

.metric {{

    background:#f7f9fb;

    border-radius:10px;

    padding:12px;

}}

.metric b {{

    display:block;

    font-size:22px;

}}

.muted {{
    color:var(--muted);
}}

@media(max-width:520px) {{

    .grid {{
        grid-template-columns:1fr;
    }}

}}

</style>

</head>


<body>

<main>


<header>

<div class="logo">
Textile DPP
</div>

<div class="pill">
{status}
</div>

</header>


<div class="eyebrow">

{product.get('category') or 'Textile apparel'}

</div>


<h1>

{product.get('name')
or product.get('category')
or 'Textile Product'}

</h1>


<p class="muted">

{product.get('description')
or 'Digital Product Passport sample record.'}

</p>


{completeness_html}


<section class="card">

<b>Digital identity</b>


<div class="row">

<span>
Unique Product ID
</span>

<b class="mono">
{identity.get('uniqueProductId')}
</b>

</div>


<div class="row">

<span>
Batch ID
</span>

<b class="mono">
{identity.get('batchId')}
</b>

</div>


<div class="row">

<span>
Model ID
</span>

<b class="mono">
{identity.get('modelId')}
</b>

</div>


<div class="row">

<span>
HS Code
</span>

<b class="mono">
{identity.get('hsCode')}
</b>

</div>


<div class="row">

<span>
TARIC
</span>

<b class="mono">
{identity.get('taricCode')}
</b>

</div>

</section>



<section class="card">

<b>
Materials
</b>

{materials}

</section>



<section class="card">

<b>
Sustainability & Circularity
</b>


<div class="grid">


<div class="metric">

<span class="muted">
Robustness
</span>

<b>
{
product.get('robustnessScore')
if product.get('robustnessScore') is not None
else '—'
}
</b>

</div>


<div class="metric">

<span class="muted">
Recyclability
</span>

<b>
{
product.get('recyclabilityScore')
if product.get('recyclabilityScore') is not None
else '—'
}
</b>

</div>


<div class="metric">

<span class="muted">
Footprint class
</span>

<b>
{
product.get(
    'environmentalFootprintPerformance'
)
or '—'
}
</b>

</div>


<div class="metric">

<span class="muted">
Origin
</span>

<b>
{origin}
</b>

</div>


</div>


{recycled_html}


</section>



<section class="card">

<b>
Responsible operators
</b>


<div class="row">

<span>
Manufacturer
</span>

<b>
{
d['operators']
['manufacturer']
['name']
}
</b>

</div>


{importer_html}


</section>



<section class="card">

<b>
Care & End of Life
</b>


<p>

<b>
Care:
</b>

{
d.get(
    'care',
    {}
).get(
    'careInstructions'
)
or 'Not provided'
}

</p>


<p>

<b>
Repair:
</b>

{
d.get(
    'care',
    {}
).get(
    'repairInstructions'
)
or 'Not provided'
}

</p>


<p>

<b>
End of life:
</b>

{
d.get(
    'circularity',
    {}
).get(
    'endOfLife'
)
or 'Not provided'
}

</p>


</section>


</main>

</body>

</html>
"""



# ---------------------------------------------
# ROOT
# ---------------------------------------------

@app.get("/")
async def root():

    demo_id = (
        DEMO["identity"]
        ["uniqueProductId"]
    )

    return FileResponse(
        FRONTEND / "index.html",
        headers={"X-Demo-Product": demo_id},
    )
