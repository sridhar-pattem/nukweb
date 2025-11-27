# Backend Build Size Optimization Guide

## Current Situation

**Railway Build Size:** 8 GB
**Local venv Size:** 1.0 GB
**Root Cause:** Semantic search dependencies (sentence-transformers)

---

## Size Analysis

### Package Breakdown

| Package | Size | Purpose | Required for Semantic Search |
|---------|------|---------|------------------------------|
| torch | 385M | PyTorch deep learning framework | Yes |
| transformers | 177M | Hugging Face transformers library | Yes |
| scipy | 98M | Scientific computing | Yes |
| sympy | 72M | Symbolic mathematics | No (dependency of scipy) |
| numpy | 56M | Array computing | Yes |
| sklearn | 47M | Machine learning utilities | Yes |
| **Total** | **835M** | | |

### Model Cache

| Location | Size | Description |
|----------|------|-------------|
| `~/.cache/torch/sentence_transformers/sentence-transformers_all-MiniLM-L6-v2` | 758M | Pre-trained model weights |
| `~/.cache/huggingface/` | 5.1G | Other Hugging Face models (unrelated) |

**Total Semantic Search Footprint:** ~1.6 GB (packages + model)

---

## Why Railway Shows 8 GB

Railway's build includes:
1. **Base Python packages:** 1.0 GB
2. **Model downloads during build:** 758M (all-MiniLM-L6-v2)
3. **Build artifacts:** Temporary files, pip cache, compilation artifacts
4. **Multiple Python versions:** If Railway auto-detects wrong Python version
5. **Docker layer overhead:** Each layer adds metadata

The 8GB likely includes unoptimized Docker layers and build cache.

---

## Optimization Options

### Option 1: CPU-Only PyTorch (Recommended)

Replace full PyTorch with CPU-only version. This removes CUDA dependencies.

**Impact:**
- Size reduction: ~200-300 MB
- Performance: No change (server likely doesn't have GPU anyway)
- Effort: Low

**Implementation:**

```bash
# requirements.txt
# Replace:
# sentence-transformers==2.2.2

# With:
--extra-index-url https://download.pytorch.org/whl/cpu
torch==2.0.1+cpu
torchvision==0.15.2+cpu
sentence-transformers==2.2.2
```

---

### Option 2: Create .dockerignore File

Prevent Railway from copying unnecessary files into the build.

**Impact:**
- Size reduction: ~100-500 MB (depends on project)
- Effort: Low

**Implementation:**

Create `/backend/.dockerignore`:

```
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
ENV/
.venv

# IDEs
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Git
.git/
.gitignore

# Testing
.pytest_cache/
.coverage
htmlcov/

# Logs
*.log
logs/

# Environment
.env
.env.local

# Model cache (these will download at runtime)
models/
*.model
*.bin
.cache/
```

---

### Option 3: Use Lighter Model

Switch from `all-MiniLM-L6-v2` to a smaller model.

**Impact:**
- Size reduction: ~300-400 MB
- Performance: Slightly lower accuracy
- Effort: Low

**Available Models:**

| Model | Dimensions | Size | Speed | Accuracy |
|-------|-----------|------|-------|----------|
| all-MiniLM-L6-v2 (current) | 384 | 758M | Fast | High |
| paraphrase-MiniLM-L3-v2 | 384 | 400M | Faster | Medium-High |
| all-MiniLM-L12-v2 | 384 | 1.1G | Slower | Higher |

**Implementation:**

```python
# backend/app/utils/semantic_search.py

# Replace line 15:
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

# With:
model = SentenceTransformer('sentence-transformers/paraphrase-MiniLM-L3-v2')
```

**Required:** Update database to regenerate embeddings:
```sql
TRUNCATE book_embeddings;
```

Then run:
```python
from app.utils.semantic_search import backfill_missing_embeddings
backfill_missing_embeddings()
```

---

### Option 4: Multi-Stage Docker Build

Create optimized Dockerfile that doesn't include build artifacts.

**Impact:**
- Size reduction: ~1-2 GB
- Effort: Medium

**Implementation:**

Create `/backend/Dockerfile`:

```dockerfile
# Stage 1: Build stage
FROM python:3.12-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Runtime stage
FROM python:3.12-slim

WORKDIR /app

# Install runtime dependencies only
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages from builder
COPY --from=builder /root/.local /root/.local

# Copy application code
COPY . .

# Make sure scripts are in PATH
ENV PATH=/root/.local/bin:$PATH

# Download model at build time (cached in layer)
RUN python3 -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"

# Run with gunicorn
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5001", "app:create_app()"]
```

Create `/backend/.dockerignore`:
```
venv/
__pycache__/
*.pyc
.git/
.env
```

---

### Option 5: Pre-Generate Embeddings Offline (Most Aggressive)

Generate all embeddings offline and disable runtime embedding generation.

**Impact:**
- Size reduction: ~1.5 GB (removes torch, transformers, sentence-transformers)
- Trade-off: Cannot generate embeddings for new books without manual process
- Effort: High

**Implementation:**

1. Generate embeddings locally:
```bash
python3 << EOF
from app.utils.semantic_search import backfill_missing_embeddings
backfill_missing_embeddings()
EOF
```

2. Export embeddings:
```bash
psql -d nuk_library -c "COPY book_embeddings TO '/tmp/book_embeddings.csv' CSV HEADER;"
```

3. Remove semantic search dependencies from `requirements.txt`:
```bash
# Remove:
# sentence-transformers==2.2.2
# huggingface-hub==0.19.4
```

4. Modify `semantic_search.py` to only do searches (no embedding generation):
```python
# Remove import:
# from sentence_transformers import SentenceTransformer

# Remove model loading
# model = None

# Modify semantic_search() to only query existing embeddings
# Remove backfill_missing_embeddings() function
```

5. Import embeddings in production:
```bash
psql -d nuk_library -c "COPY book_embeddings FROM '/path/to/book_embeddings.csv' CSV HEADER;"
```

**Maintenance:** When adding new books, generate embeddings locally and upload to production database.

---

## Recommended Strategy

For immediate deployment, combine:

1. **Option 1 (CPU-Only PyTorch):** Reduces size by ~300 MB
2. **Option 2 (.dockerignore):** Reduces size by ~200-500 MB
3. **Option 4 (Multi-Stage Build):** Reduces size by ~1-2 GB

**Expected Final Size:** 2-3 GB (down from 8 GB)

### Implementation Steps

1. Create `.dockerignore` file in `/backend/`
2. Modify `requirements.txt` to use CPU-only PyTorch
3. Create optimized `Dockerfile` in `/backend/`
4. Configure Railway to use the Dockerfile

---

## Railway-Specific Configuration

### Using Dockerfile Deployment

In Railway dashboard:
1. Go to **Settings**
2. Under **Build & Deploy**
3. Set **Build Command:** (leave empty, Dockerfile handles it)
4. Set **Start Command:** (leave empty, Dockerfile CMD handles it)
5. Set **Dockerfile Path:** `backend/Dockerfile`

### Environment Variables

Ensure these are set in Railway:
```bash
DATABASE_URL=postgresql://...
JWT_SECRET_KEY=...
SECRET_KEY=...
CORS_ORIGINS=https://yourdomain.com
FLASK_ENV=production
PORT=5001
```

---

## Long-Term Optimization (Optional)

### Microservice Architecture

If semantic search becomes a bottleneck or size remains an issue:

1. **Separate semantic search service:**
   - Dedicated Railway service for semantic search only
   - Main backend calls semantic search service via internal API
   - Benefits: Independent scaling, smaller main backend

2. **Serverless semantic search:**
   - Use AWS Lambda, Google Cloud Functions, or similar
   - Embed model in serverless function
   - Cold start penalty (~30s) but zero cost when not in use

---

## Monitoring Build Size

After implementing optimizations, monitor Railway build logs:

```bash
# Railway will show build size in logs
# Look for:
"Image size: X MB"
"Build completed in X minutes"
```

Compare before/after to verify optimizations worked.

---

## Quick Win: Test Locally First

Before deploying, test optimized build locally:

```bash
cd /Users/sridharpattem/Projects/nuk-library/backend

# Create Dockerfile (see Option 4)
# Create .dockerignore (see Option 2)

# Build
docker build -t nuk-library-backend .

# Check size
docker images nuk-library-backend

# Run
docker run -p 5001:5001 --env-file .env nuk-library-backend

# Test
curl http://localhost:5001/health
```

---

## Summary

**Current:** 8 GB build (unoptimized)
**Target:** 2-3 GB build (optimized)
**Method:** CPU-only PyTorch + .dockerignore + multi-stage Docker build
**Effort:** 30-60 minutes implementation
**Trade-offs:** None (performance unchanged)

Choose the optimization level based on:
- **Low effort, moderate gain:** Options 1-2 (500-800 MB reduction)
- **Medium effort, high gain:** Options 1-2-4 (4-6 GB reduction)
- **High effort, maximum gain:** Option 5 (removes 1.5 GB dependencies but requires manual embedding management)
