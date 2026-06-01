# 📊 Nara Nutrition AI-Engine — Comprehensive EDA & Quality Report

This document contains the automated data quality checks, database row/column metrics, and deep recipe nutrition statistics for the master database.

## 🚀 Database Summary Overview

| Target Database | Total Rows | Total Columns | Duplicate Records | Status |
| :--- | :---: | :---: | :---: | :---: |
| **FoodData.csv** | 184 | 5 | 0 | ⚠️  Incomplete |
| **master_allergen_dictionary.csv** | 10,322 | 2 | 0 | ✅ Clean |
| **master_nutrition_database.csv** | 3,741 | 36 | 0 | ✅ Clean |
| **master_nutrition_database_imputed.csv** | 3,741 | 36 | 0 | ✅ Clean |
| **master_recipe_database.csv** | 16,098 | 43 | 0 | ⚠️  Incomplete |
| **housing.csv** | 505 | 1 | 0 | ✅ Clean |
| **nutrition.csv** | 1,346 | 7 | 0 | ✅ Clean |
| **recipes.csv** | 1,090 | 15 | 0 | ⚠️  Incomplete |
| **test_recipes.csv** | 59 | 11 | 0 | ⚠️  Incomplete |

---

## 🔬 Deep Nutritional Audit: Master Recipe Database

These statistics are compiled by our **Recipe Nutrition Compiler**, which matches parsed ingredients dynamically against the imputed master nutrition catalog.

### Average Recipe Nutrient Metrics (per 100g mixture)
| Metric / Nutrient | Compiled Average Value |
| :--- | :--- |
| **Ingredient Match Rate** | **83.76%** (Fuzzy/Exact successfully linked) |
| **Calories (per 100g)** | 132.47 kcal |
| **Protein (per 100g)** | 5.35 g |
| **Fat (per 100g)** | 5.87 g |
| **Carbohydrates (per 100g)** | 14.66 g |
| **Dietary Fiber (per 100g)** | 1.57 g |

### 🏆 Top 5 Most Nutrient-Dense Recipes Showcase
These recipes are sorted by their **Recipe Nutrition Density score** (beneficial nutrients per calorie):

| Rank | Recipe Title | Cal Value (100g) | Protein (100g) | Iron (mg) | Calcium (mg) | Potassium (mg) | Nutrition Density |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | **Jamaican Punch** | 59.4551 kcal | 1.2209g | 0.41mg | 10.9mg | 84.0mg | **2.715** |
| 2 | **Herb Sauteed Green Peppers** | 16.4338 kcal | 0.626g | 0.36mg | 4.8mg | 122.2mg | **2.277** |
| 3 | **Spiced Buttermilk With Coriander And Ginger Recipe** | 2.5 kcal | 0.125g | 0.18mg | 10.2mg | 27.1mg | **2.267** |
| 4 | **How to Blanch Tomatoes Recipe** | 2.5 kcal | 0.15g | 0.10mg | 12.9mg | 34.2mg | **2.238** |
| 5 | **Fruity Sweet and Sour Sauce** | 139.7559 kcal | 3.2066g | 0.74mg | 24.1mg | 110.7mg | **2.215** |

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
| **Rows** | 16,098 |
| **Columns** | 43 |
| **Total Missing Cells** | 15137 |
| **Duplicate Rows** | 0 |

**Columns Staged:**
`title`, `ingredients`, `instructions`, `source`, `image_url`, `structured_ingredients`, `Recipe Caloric Value`, `Recipe Fat`, `Recipe Saturated Fats`, `Recipe Monounsaturated Fats`, `Recipe Polyunsaturated Fats`, `Recipe Carbohydrates`, `Recipe Sugars`, `Recipe Protein`, `Recipe Dietary Fiber`, `Recipe Cholesterol`, `Recipe Sodium`, `Recipe Water`, `Recipe Vitamin A`, `Recipe Vitamin B1`, `Recipe Vitamin B11`, `Recipe Vitamin B12`, `Recipe Vitamin B2`, `Recipe Vitamin B3`, `Recipe Vitamin B5`, `Recipe Vitamin B6`, `Recipe Vitamin C`, `Recipe Vitamin D`, `Recipe Vitamin E`, `Recipe Vitamin K`, `Recipe Calcium`, `Recipe Copper`, `Recipe Iron`, `Recipe Magnesium`, `Recipe Manganese`, `Recipe Phosphorus`, `Recipe Potassium`, `Recipe Selenium`, `Recipe Zinc`, `total_weight_g`, `estimated_servings`, `structured_match_rate`, `Recipe Nutrition Density`

**Numeric Statistics Summary:**
| Column Name | Mean | Min | Max |
| :--- | :--- | :--- | :--- |
| total_weight_g | 1286.66 | 25.0 | 17885.0 |
| estimated_servings | 4.29 | 1.0 | 59.6 |
| structured_match_rate | 0.84 | 0.0 | 1.0 |


### File: `datasets/recipe/housing.csv`

| Metric | Value |
| :--- | :--- |
| **Rows** | 505 |
| **Columns** | 1 |
| **Total Missing Cells** | 0 |
| **Duplicate Rows** | 0 |

**Columns Staged:**
` 0.00632  18.00   2.310  0  0.5380  6.5750  65.20  4.0900   1  296.0  15.30 396.90   4.98  24.00`



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


