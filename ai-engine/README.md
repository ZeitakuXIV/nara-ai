# Nara Nutrition AI-Engine 🍲

Welcome to the **Nara Nutrition AI-Engine**, the data science and core intelligence pipeline that powers the AI-driven nutrition and recipe application. 

This engine is structured as a **modular data engineering pipeline** designed to ingest, clean, standardize, impute, and parse food, recipe, and allergen data into high-quality production databases.

---

## 📁 Modular Pipeline Architecture

The codebase has been refactored into a modular pipeline structure, keeping the root directory clean and utilizing a central CLI orchestrator:

```
ai-engine/
├── datasets/                 # Staging & Production Datasets (Preserved for compatibility)
│   ├── raw/                  # Staging for raw, unprocessed source files
│   ├── allergen/             # Raw allergen records
│   ├── recipe/               # Raw recipe source files
│   └── master/               # Master databases (imputed & standardized)
├── docs/                     # Product, Architecture, & EDA Documentation
│   ├── assets/               # Architecture JPEGs, flowcharts, and app diagrams
│   └── reports/              # Markdown & JSON reports (EDA results, Gemini report)
├── src/                      # Source Code (Modularized Pipeline Steps)
│   ├── __init__.py           # Package marker
│   ├── ingestion/            # Step 1: Data scraping & external data gathering
│   ├── preprocessing/        # Step 2: Cleaning, merging, and allergen standardization
│   ├── imputation/           # Step 3: Rules-based nutritional imputation
│   ├── parsing/              # Step 4: Core NLP recipe parsing algorithms
│   └── analysis/             # Step 5: Exploratory data analysis & quality checks
├── tests/                    # Pipeline validation & automated test suites
├── requirements.txt          # Pip dependencies (pandas, scikit-learn, numpy, etc.)
├── README.md                 # Unified setup, architecture walkthrough, & run instructions
└── main.py                   # Central orchestrator CLI (production entry point)
```

---

## 🚀 Getting Started & Execution

Rather than running isolated scripts individually, a central orchestrator **`main.py`** at the root provides a clean command-line interface. All scripts run in the root working context, guaranteeing relative file paths do not break.

### 1. Installation
Install the necessary python dependencies:
```bash
pip install -r requirements.txt
```

### 2. Usage Examples

#### Run the entire end-to-end production pipeline:
This executes Ingestion ➜ Preprocessing ➜ Imputation ➜ Recipe Parsing ➜ Quality EDA sequentially:
```bash
python main.py --all
```

#### Run rules-based expert imputation:
Imputes 1,346 incomplete Indonesian food items with realistic, biologically validated micronutrients:
```bash
python main.py --impute
```

#### Run legacy KNN statistical baseline:
```bash
python main.py --impute-knn
```

#### Run Exploratory Data Analysis & quality checks:
Generates descriptive statistics and validates the master databases:
```bash
python main.py --eda
```

#### Run database preprocessing & compilation:
Standardizes allergen records and compiles staging databases:
```bash
python main.py --preprocess
```

---

## 🛠️ Pipeline Stages Explained

### 1. Ingestion (`src/ingestion/`)
* **`scraping.py`**: Performs web scraping and external API queries to ingest initial recipe and food ingredient data into staging folders.

### 2. Preprocessing (`src/preprocessing/`)
* **`build_master_allergen.py` & `standardize_allergen.py`**: Standardizes textual allergen entries into normalized dictionaries.
* **`build_master_nutrition.py` & `build_master_recipe.py`**: Merges raw data splits, resolves schema differences, and builds compiled staging databases.

### 3. Imputation (`src/imputation/`)
* **`impute_expert.py`**: A rules-based expert system that performs high-precision, row-by-row imputation on 1,346 Indonesian food items based on category taxonomy (Organ meats, Leafy greens, Soy, Bony/Dried fish, etc.). Enforces biological constraints ($\text{Sat}+\text{Mon}+\text{Poly} \le \text{total Fat}$, plant cholesterol = 0, water bounds).
* **`impute_nutrition.py`**: A statistical baseline statistical KNN model used for benchmark comparisons.

### 4. Parsing (`src/parsing/`)
* **`recipe_advanced_parser.py`**: A core NLP algorithm that parses raw recipe directions, extracts quantitative ingredients, and measures preparation times.

### 5. Analysis (`src/analysis/`)
* **`run_eda.py` & `convert_report.py`**: Executes data quality audits, compiles validation metrics, and converts JSON logs into markdown reports.

---

## 🛡️ Biological Validation Guarantees

All master outputs compiled under `datasets/master/` are programmatically verified to satisfy these rules:
1. **Non-Negativity**: All nutrient values are $\ge 0$.
2. **Plant Restrictions**: Plant-based items strictly have $0.0\text{ mg}$ of Cholesterol and $0.0\text{ mcg}$ of Vitamin B12 (except fermented soy).
3. **Fat Breakdown**: Saturated + Monounsaturated + Polyunsaturated Fats do not exceed total Fat.
4. **Water content**: Strictly constrained to physical limits $[0.0\text{g}, 95.0\text{g}]$ and calculated dynamically via macro balance ($100 - \text{Protein} - \text{Fat} - \text{Carbs} - \text{Ash}$).
5. **Integrity**: Original complete database rows are untouched.
