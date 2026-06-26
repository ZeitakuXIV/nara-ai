# N.A.R.A (Nutrition Adaptive Reasoning Agent)
### Enterprise-Grade Expert System for Precision Dietetics

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Production-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/Supabase-Persistence-3ECF8E?logo=supabase)](https://supabase.com/)
[![XAI](https://img.shields.io/badge/AI-Explainable-Evergreen)](https://en.wikipedia.org/wiki/Explainable_artificial_intelligence)

N.A.R.A is a high-performance **5-Layer Expert Reasoning System** designed to solve the critical gap in generic dietary planning: the lack of clinical safety, regional commodity awareness, and real-time portion scaling. Built with a decoupled microservice architecture, N.A.R.A orchestrates over 13,000+ local Indonesian recipes into medically safe, hyper-personalized nutritional frameworks.

---

## 🏗 System Architecture

N.A.R.A is engineered for high-availability and extreme precision, utilizing a modern tech stack to ensure sub-100ms inference times.

- **Client Layer:** Next.js 14 Progressive Web App (PWA) utilizing **Zustand** for transient state management and **Framer Motion** for high-fidelity interactive feedback.
- **Inference Layer:** Python 3.11 microservice powered by **FastAPI**. Implements a multi-objective optimization function using **NumPy** matrix operations.
- **Data Layer:** **Supabase (PostgreSQL)** serves as the single source of truth for biometric telemetry and persisted meal schedules. **Redis/LocalStorage** caching layer for "On-Demand" responsiveness.
- **Cognitive Agent:** **Gemini 2.5 Flash** integration for Explainable AI (XAI) rationale generation.

---

## 🧠 The 5-Layer Reasoning Engine

The core of N.A.R.A is its sequential inference pipeline, which converts raw biometric telemetry into clinically validated meal plans.

1.  **Clinical Safety & Bio-Targeting:** Enforces strict "Do No Harm" protocols. Automatically applies **Adjusted Body Weight (ABW)** for BMI ≥ 25 and executes hard-cutoff overrides for severe clinical risks (Anorexia, CKD, Gout).
2.  **Vectorized Allergen Filtration:** Executes categorical exact-match purges across a map of 10,322+ ingredients, guaranteeing 100% exclusion of systemic allergens before the scoring phase.
3.  **Multi-Objective Heuristic Scoring:** Ranks 12,000+ candidates using a composite objective function balancing:
    - **Macro Balance (30%)**: Precise P/F/C distribution.
    - **Caloric Proximity (25%)**: Minimal target deviation.
    - **Regional Alignment (25%)**: BPS commodity index matching.
    - **Nutrition Density (20%)**: Micronutrient-to-calorie yield.
4.  **CSP Diversity Optimization:** Employs a **Constraint Satisfaction Problem (CSP)** framework with a greedy search to prevent nutritional monotony, capping food categories at 3 occurrences per cycle.
5.  **Dynamic Adaptive Scaling:** Real-time recalculation of recipe portions (0.5x – 2.5x) and intelligent carbohydrate staple pairing (e.g., BPS-aligned white rice vs. sagu) to close caloric gaps within ±5% accuracy.

---

## 📊 Performance Benchmarks

In comparative stress tests against traditional greedy matchers, N.A.R.A demonstrated statistically significant superiority:

- **Clinical Safety Compliance:** **100.0%** (vs. 28.6% baseline)
- **Caloric Accuracy:** **97.7%** (within ±45kcal variance)
- **Regional Commodity Fit:** **49.9%** (vs. 0.5% baseline)
- **Inference Latency:** **~45ms** (on a dataset of 13,453 entries)

---

## 🚀 Deployment & Development

### Prerequisites
- Node.js >= 18, pnpm, Python >= 3.12
- Supabase Project (PostgreSQL + Auth)
- Gemini Pro API Key

### Quick Start

```bash
# 1. Clone & install frontend
git clone https://github.com/ZeitakuXIV/nara-ai.git
cd nara-ai
pnpm install

# 2. Setup AI Engine
cd ai-engine
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 3. Run locally (two terminals)
# Terminal 1: AI Engine
cd ai-engine && python src/api.py    # port 8000

# Terminal 2: Frontend
cd nara-ai && pnpm dev               # port 3000
```

### Environment Configuration

```bash
# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_AI_ENGINE_URL=http://127.0.0.1:8000

# Backend (ai-engine/.env)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
GOOGLE_CLOUD_PROJECT=your-gcp-project
DATABASE_URL=postgresql://user:pass@host:5432/nara_sessions
INDONESIAN_ONLY=true
```

> **Note:** Encryption key is server-side only — delivered via `/api/crypto-key`. No frontend env needed.

### Database Setup
Run these SQL statements in your Supabase SQL Editor:

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT, gender TEXT, age INTEGER,
  height NUMERIC, weight NUMERIC,
  activity_level TEXT, location TEXT,
  allergies TEXT[], dietary_goal TEXT
);

CREATE TABLE meal_plans (
  user_id UUID PRIMARY KEY REFERENCES user_profiles(id),
  target_calories NUMERIC,
  plan_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

Enable Row Level Security (RLS) so users can only access their own data.

### Deployment
- Push to the `development` branch triggers auto-deploy via GitHub Actions to Vercel.
- Set all environment variables in the Vercel Dashboard.
- AI Engine is deployed as a separate Python microservice.

---

## ⚖️ Ethical Responsibility & Safety

N.A.R.A is not a replacement for clinical consultation. It includes an autonomous **Safety Shield** that intercepts high-risk biometric inputs:

- **Red-Line Conditions:** CKD, CHF, sirosis hati, diabetes tipe 1, asam urat akut
- **BMI Guardrails:** Cutting diblok jika BMI < 18.5; Bulking diblok jika BMI ≥ 30
- **Ethical Calorie Floor:** Target kalori tidak pernah di bawah BMR atau 1200 kkal
- **Severe Thinness Cutoff:** BMI < 17 dilarang cutting dalam kondisi apapun

Additional safeguards:
- **AES-GCM 256-bit encryption** untuk data biometrics di localStorage (key server-side via `/api/crypto-key`)
- **Data portability (UU PDP):** Unduh data kapan saja dalam format JSON
- **Chatbot isolation:** NARA chatbot tidak memiliki akses ke data biometrics pengguna

---

## 📊 Dataset & Bias Analysis

NARA AI menggunakan dataset publik yang diverifikasi. Analisis bias dilakukan pada lima titik dalam pipeline:

| Bias | Temuan | Dampak |
|---|---|---|
| **Cookpad Contributor** | Papua 8, Kalimantan 10 vs Padang 174 | Representasi timpang Indonesia Timur |
| **Non-TKPI Data Dominance** | 64% data mikronutrien lengkap vs 36% estimasi | Presisi gizi bahan TKPI (Indonesia) lebih rendah |
| **Ingredient Match Rate** | Mean 74.6%, 25% fallback kategori | ~1/4 nutrisi per resep adalah estimasi kategori |
| **Imputation Uncertainty** | 9 foods (0.24%) ambiguous → dihapus dari database | Tidak berdampak (0 resep mereferensikannya) |
| **Regional Consumption Gap** | 39 provinsi, 9 kelompok pangan agregat | RAS terbatas pada scoring, bukan filtering |

### Dataset Sources
| Dataset | Source |
|---|---|
| Food Recipes (Cookpad) | [Kaggle — Food Recipes Dataset](https://www.kaggle.com/datasets/albertnathaniel12/food-recipes-dataset) |
| Food Composition (Indonesia) | [TKPI / Panganku.org](https://www.panganku.org/id-ID/semua_nutrisi) |
| Allergen Dictionary | [Kaggle — Food Ingredients and Allergens](https://www.kaggle.com/datasets/uom190346a/food-ingredients-and-allergens) |
| Provincial Consumption | [Badan Pangan Nasional](https://data.badanpangan.go.id/datasetpublications/x1y/konsumsi-provinsi) |
| Nutrient Retention Factors | [USDA Release 6](https://www.ars.usda.gov/arsuserfiles/80400530/pdf/retn06.pdf), [FAO](https://www.fao.org/uploads/media/bognar_bfe-r-02-03.pdf) |

### Interactive Notebook
Full bias analysis with code, visualizations, and verifiable claims:
[`docs/nara_dataset_bias_analysis.ipynb`](docs/nara_dataset_bias_analysis.ipynb)

---

## 👨‍💻 Engineering Team
- **M Nurrizal Zid Maulana** – AI Engine & Optimization
- **Sammy Farrel Zebua** – Lead Systems Architect
- **Valensius Alven** – Full-Stack & UI/UX Engineering

---
