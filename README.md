# VEXTA - Digital Product Passport Backend API

## Overview
VEXTA is a comprehensive Digital Product Passport (DPP) system with QR code integration, real-time product data management, and mobile frontend support.

## Project Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── config.py
│   ├── models.py
│   ├── database.py
│   └── routes/
│       ├── __init__.py
│       ├── products.py
│       ├── qr.py
│       └── health.py
├── schemas/
│   ├── __init__.py
│   └── product_schema.py
├── services/
│   ├── __init__.py
│   ├── product_service.py
│   ├── qr_service.py
│   └── validation_service.py
├── migrations/
│   └── demo_data.json
├── tests/
│   ├── __init__.py
│   ├── test_products.py
│   ├── test_qr_integration.py
│   └── test_validation.py
├── requirements.txt
├── .env.example
├── run.py
└── wsgi.py
```

## Tech Stack
- **Framework**: Flask with Flask-RESTful
- **Database**: SQLAlchemy ORM (SQLite for dev, PostgreSQL for prod)
- **QR Codes**: qrcode + pyzbar
- **Validation**: Marshmallow + Pydantic
- **Testing**: pytest + pytest-cov
- **API Documentation**: Flask-RESTX with Swagger UI

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

### 1. Installation
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Environment Setup
```bash
cp .env.example .env
```

### 3. Initialize Database
```bash
python -c "from app import create_app, db; app = create_app(); db.create_all()"
python -c "from app.services.product_service import ProductService; ProductService.load_demo_data()"
```

### 4. Run Server
```bash
python run.py
```

API will be available at `http://localhost:5000`
Swagger UI: `http://localhost:5000/api/docs`

## API Endpoints

### Products
- `GET /api/products/{product_id}` - Retrieve product by ID
- `GET /api/products/qr/{qr_code}` - Retrieve product by QR code
- `GET /api/products` - List all products (paginated)
- `POST /api/products` - Create new product (admin)
- `PUT /api/products/{product_id}` - Update product (admin)
- `DELETE /api/products/{product_id}` - Delete product (admin)

### QR Integration
- `GET /api/qr/validate/{qr_code}` - Validate QR code
- `POST /api/qr/generate/{product_id}` - Generate QR code for product
- `GET /api/qr/scan` - Scan and retrieve product data

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
