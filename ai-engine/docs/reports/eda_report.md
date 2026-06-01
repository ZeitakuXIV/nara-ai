# 📊 Nara Nutrition AI-Engine — Comprehensive EDA & Quality Report

This document contains the automated data quality checks, database row/column metrics, and deep recipe nutrition statistics for the master database.

## 🚀 Database Summary Overview

| Target Database | Total Rows | Total Columns | Duplicate Records | Status |
| :--- | :---: | :---: | :---: | :---: |
| **FoodData.csv** | 184 | 5 | 0 | ⚠️  Incomplete |
| **consumption.csv** | 9,519 | 7 | 0 | ⚠️  Incomplete |
| **master_allergen_dictionary.csv** | 10,322 | 2 | 0 | ✅ Clean |
| **master_nutrition_database.csv** | 3,741 | 36 | 0 | ✅ Clean |
| **master_nutrition_database_imputed.csv** | 3,741 | 36 | 0 | ✅ Clean |
| **master_recipe_database.csv** | 986 | 43 | 0 | ⚠️  Incomplete |
| **housing.csv** | 505 | 1 | 0 | ✅ Clean |
| **indonesian_recipes.csv** | 25 | 4 | 0 | ⚠️  Incomplete |
| **nutrition.csv** | 1,346 | 7 | 0 | ✅ Clean |
| **recipes.csv** | 1,090 | 15 | 0 | ⚠️  Incomplete |
| **test_recipes.csv** | 59 | 11 | 0 | ⚠️  Incomplete |

---

## 🔬 Deep Nutritional Audit: Master Recipe Database

These statistics are compiled by our **Recipe Nutrition Compiler**, which matches parsed ingredients dynamically against the imputed master nutrition catalog.

### Average Recipe Nutrient Metrics (per 100g mixture)
| Metric / Nutrient | Compiled Average Value |
| :--- | :--- |
| **Ingredient Match Rate** | **78.69%** (Fuzzy/Exact successfully linked) |
| **Calories (per 100g)** | 147.49 kcal |
| **Protein (per 100g)** | 5.81 g |
| **Fat (per 100g)** | 6.07 g |
| **Carbohydrates (per 100g)** | 17.9 g |
| **Dietary Fiber (per 100g)** | 1.69 g |

### 🏆 Top 5 Most Nutrient-Dense Recipes Showcase
These recipes are sorted by their **Recipe Nutrition Density score** (beneficial nutrients per calorie):

| Rank | Recipe Title | Cal Value (100g) | Protein (100g) | Iron (mg) | Calcium (mg) | Potassium (mg) | Nutrition Density |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | **Fruity Sweet and Sour Sauce** | 139.7559 kcal | 3.2066g | 0.74mg | 24.1mg | 110.7mg | **2.215** |
| 2 | **Baked Apples** | 35.3898 kcal | 1.5027g | 0.63mg | 17.5mg | 254.9mg | **1.275** |
| 3 | **Air Fryer Lobster Tails with Lemon-Garlic Butter** | 51.8444 kcal | 7.7433g | 0.35mg | 43.3mg | 139.9mg | **1.179** |
| 4 | **Chiles en Nogada (Mexican Stuffed Poblano Peppers in Walnut Sauce)** | 24.0 kcal | 0.9g | 0.70mg | 6.8mg | 155.5mg | **0.978** |
| 5 | **Pepes Tahu Kemangi (Spiced Steamed Tofu in Banana Leaf)** | 77.1818 kcal | 5.5897g | 3.37mg | 210.2mg | 113.5mg | **0.960** |

---

## 📄 Detailed File Quality Breakdown

### File: `datasets/allergen/FoodData.csv`

| Metric | Value |
| :--- | :--- |
| **Rows** | 184 |
| **Columns** | 5 |
| **Total Missing Cells** | 22 |
| **Duplicate Rows** | 0 |

**Columns Staged:**
`Class`, `Type`, `Group`, `Food`, `Allergy`



### File: `datasets/consumption/consumption.csv`

| Metric | Value |
| :--- | :--- |
| **Rows** | 9,519 |
| **Columns** | 7 |
| **Total Missing Cells** | 7 |
| **Duplicate Rows** | 0 |

**Columns Staged:**
`No`, `Tahun`, `Kode Provinsi`, `Provinsi`, `Kelompok Bahan Pangan`, `Komoditas`, `Konsumsi_Pangan`

**Numeric Statistics Summary:**
| Column Name | Mean | Min | Max |
| :--- | :--- | :--- | :--- |
| No | 4760.0 | 1.0 | 9519.0 |
| Tahun | 2021.59 | 2018.0 | 2025.0 |
| Kode Provinsi | 48.88 | 11.0 | 96.0 |
| Konsumsi_Pangan | 17.05 | 0.0 | 306.9 |


### File: `datasets/master/master_allergen_dictionary.csv`

| Metric | Value |
| :--- | :--- |
| **Rows** | 10,322 |
| **Columns** | 2 |
| **Total Missing Cells** | 0 |
| **Duplicate Rows** | 0 |

**Columns Staged:**
`ingredient`, `allergens`



### File: `datasets/master/master_nutrition_database.csv`

| Metric | Value |
| :--- | :--- |
| **Rows** | 3,741 |
| **Columns** | 36 |
| **Total Missing Cells** | 0 |
| **Duplicate Rows** | 0 |

**Columns Staged:**
`food`, `Caloric Value`, `Fat`, `Saturated Fats`, `Monounsaturated Fats`, `Polyunsaturated Fats`, `Carbohydrates`, `Sugars`, `Protein`, `Dietary Fiber`, `Cholesterol`, `Sodium`, `Water`, `Vitamin A`, `Vitamin B1`, `Vitamin B11`, `Vitamin B12`, `Vitamin B2`, `Vitamin B3`, `Vitamin B5`, `Vitamin B6`, `Vitamin C`, `Vitamin D`, `Vitamin E`, `Vitamin K`, `Calcium`, `Copper`, `Iron`, `Magnesium`, `Manganese`, `Phosphorus`, `Potassium`, `Selenium`, `Zinc`, `Nutrition Density`, `image`

**Numeric Statistics Summary:**
| Column Name | Mean | Min | Max |
| :--- | :--- | :--- | :--- |
| Caloric Value | 216.37 | 0.0 | 6077.0 |
| Fat | 9.24 | 0.0 | 550.7 |
| Saturated Fats | 2.15 | -1.0 | 672.0 |
| Monounsaturated Fats | 2.29 | -1.0 | 291.1 |
| Polyunsaturated Fats | 1.02 | -1.0 | 188.0 |
| Carbohydrates | 21.04 | 0.0 | 647.0 |
| Sugars | 2.49 | -1.0 | 291.5 |
| Protein | 12.18 | 0.0 | 560.3 |
| Dietary Fiber | 1.07 | -1.0 | 76.5 |
| Cholesterol | 39.44 | -1.0 | 10509.0 |
| Sodium | -0.17 | -1.0 | 49.4 |
| ... | ... | ... | ... |


### File: `datasets/master/master_nutrition_database_imputed.csv`

| Metric | Value |
| :--- | :--- |
| **Rows** | 3,741 |
| **Columns** | 36 |
| **Total Missing Cells** | 0 |
| **Duplicate Rows** | 0 |

**Columns Staged:**
`food`, `Caloric Value`, `Fat`, `Saturated Fats`, `Monounsaturated Fats`, `Polyunsaturated Fats`, `Carbohydrates`, `Sugars`, `Protein`, `Dietary Fiber`, `Cholesterol`, `Sodium`, `Water`, `Vitamin A`, `Vitamin B1`, `Vitamin B11`, `Vitamin B12`, `Vitamin B2`, `Vitamin B3`, `Vitamin B5`, `Vitamin B6`, `Vitamin C`, `Vitamin D`, `Vitamin E`, `Vitamin K`, `Calcium`, `Copper`, `Iron`, `Magnesium`, `Manganese`, `Phosphorus`, `Potassium`, `Selenium`, `Zinc`, `Nutrition Density`, `image`

**Numeric Statistics Summary:**
| Column Name | Mean | Min | Max |
| :--- | :--- | :--- | :--- |
| Caloric Value | 216.37 | 0.0 | 6077.0 |
| Fat | 9.24 | 0.0 | 550.7 |
| Saturated Fats | 2.94 | 0.0 | 672.0 |
| Monounsaturated Fats | 3.15 | 0.0 | 291.1 |
| Polyunsaturated Fats | 1.71 | 0.0 | 188.0 |
| Carbohydrates | 21.04 | 0.0 | 647.0 |
| Sugars | 4.1 | 0.0 | 291.5 |
| Protein | 12.18 | 0.0 | 560.3 |
| Dietary Fiber | 2.04 | 0.0 | 76.5 |
| Cholesterol | 54.79 | 0.0 | 10509.0 |
| Sodium | 0.31 | 0.0 | 49.4 |
| ... | ... | ... | ... |


### File: `datasets/master/master_recipe_database.csv`

| Metric | Value |
| :--- | :--- |
| **Rows** | 986 |
| **Columns** | 43 |
| **Total Missing Cells** | 1 |
| **Duplicate Rows** | 0 |

**Columns Staged:**
`title`, `ingredients`, `instructions`, `source`, `image_url`, `structured_ingredients`, `Recipe Caloric Value`, `Recipe Fat`, `Recipe Saturated Fats`, `Recipe Monounsaturated Fats`, `Recipe Polyunsaturated Fats`, `Recipe Carbohydrates`, `Recipe Sugars`, `Recipe Protein`, `Recipe Dietary Fiber`, `Recipe Cholesterol`, `Recipe Sodium`, `Recipe Water`, `Recipe Vitamin A`, `Recipe Vitamin B1`, `Recipe Vitamin B11`, `Recipe Vitamin B12`, `Recipe Vitamin B2`, `Recipe Vitamin B3`, `Recipe Vitamin B5`, `Recipe Vitamin B6`, `Recipe Vitamin C`, `Recipe Vitamin D`, `Recipe Vitamin E`, `Recipe Vitamin K`, `Recipe Calcium`, `Recipe Copper`, `Recipe Iron`, `Recipe Magnesium`, `Recipe Manganese`, `Recipe Phosphorus`, `Recipe Potassium`, `Recipe Selenium`, `Recipe Zinc`, `total_weight_g`, `estimated_servings`, `structured_match_rate`, `Recipe Nutrition Density`

**Numeric Statistics Summary:**
| Column Name | Mean | Min | Max |
| :--- | :--- | :--- | :--- |
| total_weight_g | 1599.82 | 25.0 | 12601.8 |
| estimated_servings | 5.34 | 1.0 | 42.0 |
| structured_match_rate | 0.79 | 0.0 | 1.0 |


### File: `datasets/recipe/housing.csv`

| Metric | Value |
| :--- | :--- |
| **Rows** | 505 |
| **Columns** | 1 |
| **Total Missing Cells** | 0 |
| **Duplicate Rows** | 0 |

**Columns Staged:**
` 0.00632  18.00   2.310  0  0.5380  6.5750  65.20  4.0900   1  296.0  15.30 396.90   4.98  24.00`



### File: `datasets/recipe/indonesian_recipes.csv`

| Metric | Value |
| :--- | :--- |
| **Rows** | 25 |
| **Columns** | 4 |
| **Total Missing Cells** | 1 |
| **Duplicate Rows** | 0 |

**Columns Staged:**
`recipe_name`, `ingredients`, `directions`, `img_src`



### File: `datasets/recipe/nutrition.csv`

| Metric | Value |
| :--- | :--- |
| **Rows** | 1,346 |
| **Columns** | 7 |
| **Total Missing Cells** | 0 |
| **Duplicate Rows** | 0 |

**Columns Staged:**
`id`, `calories`, `proteins`, `fat`, `carbohydrate`, `name`, `image`

**Numeric Statistics Summary:**
| Column Name | Mean | Min | Max |
| :--- | :--- | :--- | :--- |
| id | 673.5 | 1.0 | 1346.0 |
| calories | 203.22 | 0.0 | 940.0 |
| proteins | 10.0 | 0.0 | 83.0 |
| fat | 7.58 | 0.0 | 100.0 |
| carbohydrate | 25.39 | 0.0 | 647.0 |


### File: `datasets/recipe/recipes.csv`

| Metric | Value |
| :--- | :--- |
| **Rows** | 1,090 |
| **Columns** | 15 |
| **Total Missing Cells** | 615 |
| **Duplicate Rows** | 0 |

**Columns Staged:**
`Unnamed: 0`, `recipe_name`, `prep_time`, `cook_time`, `total_time`, `servings`, `yield`, `ingredients`, `directions`, `rating`, `url`, `cuisine_path`, `nutrition`, `timing`, `img_src`

**Numeric Statistics Summary:**
| Column Name | Mean | Min | Max |
| :--- | :--- | :--- | :--- |
| Unnamed: 0 | 544.5 | 0.0 | 1089.0 |
| servings | 13.76 | 1.0 | 240.0 |
| rating | 4.53 | 2.0 | 5.0 |


### File: `datasets/recipe/test_recipes.csv`

| Metric | Value |
| :--- | :--- |
| **Rows** | 59 |
| **Columns** | 11 |
| **Total Missing Cells** | 86 |
| **Duplicate Rows** | 0 |

**Columns Staged:**
`Row`, `Name`, `Prep Time`, `Cook Time`, `Total Time`, `Servings`, `Yield`, `Ingredients`, `Directions`, `url`, `Additional Time`

**Numeric Statistics Summary:**
| Column Name | Mean | Min | Max |
| :--- | :--- | :--- | :--- |
| Row | 29.0 | 0.0 | 58.0 |
| Servings | 5.49 | 2.0 | 12.0 |


