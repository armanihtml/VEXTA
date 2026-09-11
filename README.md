# VEXTA - Digital Product Passport

## Overview
VEXTA is a Digital Product Passport viewer with QR integration, a FastAPI backend, and a responsive public frontend.

## Project Structure
```
app/main.py              FastAPI application and public DPP routes
app/demo_product.json    Demo product loaded in demo mode
frontend/                Static responsive passport viewer
make_qr.py               QR target generator
```

## Tech Stack
- **Framework**: FastAPI
- **Data source**: Supabase REST API, with bundled demo mode
- **Frontend**: Dependency-free HTML, CSS, and JavaScript
- **QR Codes**: Python `qrcode` utility and backend PNG endpoint

## Features
✅ 49-field Product Data Model
✅ RESTful API endpoints
✅ QR Code → Product ID → API → Frontend flow
✅ Comprehensive data validation
✅ Demo product dataset loading
✅ Error handling & edge cases
✅ Full test coverage
✅ Database migrations

## Quick Start

### Run locally
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Open `http://localhost:8000`. The bundled demo record is loaded automatically when Supabase credentials are not configured.

## Deploy to Cloudflare Pages

This project uses a static Next.js export for the frontend and Cloudflare Pages
Functions for the two public DPP API routes. The Pages Functions keep these URLs
unchanged:

- `/api/dpp/{unique_product_id}`
- `/api/dpp/{unique_product_id}/datasheet`

### Cloudflare dashboard settings

Connect the GitHub repository to Cloudflare Pages with these settings:

| Setting | Value |
| --- | --- |
| Framework preset | Next.js (Static HTML Export) |
| Build command | `npm run build` |
| Build output directory | `out` |
| Root directory | `/` |

Cloudflare automatically deploys the `functions/` directory alongside the
generated `out/` directory. No Python runtime is required for the public viewer
or its demo API routes.

### Deploy from the terminal

Authenticate Wrangler once, then create or select a Pages project and deploy:

```bash
npx wrangler login
npm run pages:deploy -- --project-name vexta
```

For local Pages behavior, build first and run:

```bash
npm run build
npm run pages:dev
```

The `functions/` directory is intentionally separate from `app/` because Next
static export does not bundle Next.js route handlers into Cloudflare Pages.

## API Endpoints

### Products
- `GET /api/dpp/{unique_product_id}` - Retrieve a public product passport
- `GET /api/dpp/{unique_product_id}/datasheet` - Retrieve the backend datasheet
- `GET /dpp/{unique_product_id}` - Server-rendered passport fallback
- `GET /api/dpp/{unique_product_id}/qr-target` - Resolve a QR target URL

### QR Integration
- `GET /health` - API health check
- `GET /docs` - FastAPI API documentation
- `GET /api/dpp/{unique_product_id}/qr` - Generate a QR image for a passport

Generate the demo QR code from the command line:
```bash
python make_qr.py --base-url http://localhost:8000 --output sample_product_qr.png
```

### Health
- `GET /health` - API health check
- `GET /api/stats` - Database statistics

## Testing
```bash
pytest tests/ -v --cov=app --cov-report=html
```

## Database Schema
The product table includes 49 fields organized in these categories:
- **Basic Info**: ID, Name, Description, SKU, Brand
- **Product Details**: Category, Type, Size, Color, Weight
- **Fiber Composition**: Primary fiber, percentage, origin
- **Certifications**: ISO, Fair Trade, OEKO-TEX, etc.
- **Manufacturing**: Factory location, production date, batch
- **Care Instructions**: Washing, drying, ironing, storage
- **Sustainability**: Recyclability, carbon footprint, water usage
- **Compliance**: CE marking, regulatory status, compliance date
- **Supply Chain**: Supplier info, material sources, traceability
- **Metadata**: Created at, updated at, version

## Development Notes
- Use `.env` for sensitive configuration
- Database migrations: See `migrations/`
- Demo data: See `migrations/demo_data.json`
- Add new fields to schema in `schemas/product_schema.py`
- All endpoints return JSON with standardized error responses
