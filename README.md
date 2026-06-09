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

### Infrastructure Prerequisites
- Node.js 18.x + pnpm
- Python 3.10+
- Supabase Project (PostgreSQL + Auth)
- Gemini Pro API Key

### Environment Configuration
```bash
# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
PYTHON_MICROSERVICE_URL=http://localhost:8000

# Backend (.env)
DATABASE_URL=your_db_url
GEMINI_API_KEY=your_key
```

### Quick Start
```bash
# 1. Spin up AI Engine
cd ai-engine
python -m pip install -r requirements.txt
python -m uvicorn src.api:app --reload --port 8000

# 2. Launch Client
cd ..
pnpm install
pnpm dev
```

---

## ⚖️ Ethical Responsibility & Safety

N.A.R.A is not a replacement for clinical consultation. It includes an autonomous **Safety Shield** that intercepts high-risk biometric inputs. For profiles indicating severe thinness (BMI < 17) or documented chronic conditions (Type 1 Diabetes, Heart Failure), the system strictly overrides user requests with a "Maintenance Mode" and generates a clinical disclaimer routing the user to a certified medical professional.

---

## 👨‍💻 Engineering Team
- **M Nurrizal Zid Maulana** – AI Engine & Optimization
- **Sammy Farrel Zebua** – Lead Systems Architect
- **Valensius Alven** – Full-Stack & UI/UX Engineering

---
*Developed at Universitas Padjadjaran — Informatics Engineering Study Program.*
