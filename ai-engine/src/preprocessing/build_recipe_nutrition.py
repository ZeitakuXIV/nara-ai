"""
build_recipe_nutrition.py — Recipe Nutrition Compiler (Dict-Optimized).
Matches parsed recipe ingredients against the master nutrition database,
calculates total recipe nutritional profiles, and updates the master recipe catalog.
"""

import os
import sys
import json
import collections
import pandas as pd
import numpy as np

# ──────────────────────────────────────────────
# Paths & Settings
# ──────────────────────────────────────────────

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(BASE_DIR)
NUTRITION_CSV = os.path.join(BASE_DIR, "datasets/master/master_nutrition_database_imputed.csv")
RECIPE_CSV = os.path.join(BASE_DIR, "datasets/master/master_recipe_database.csv")

TARGET_COLS = [
    "Caloric Value", "Fat", "Saturated Fats", "Monounsaturated Fats", "Polyunsaturated Fats",
    "Carbohydrates", "Sugars", "Protein", "Dietary Fiber", "Cholesterol", "Sodium", "Water",
    "Vitamin A", "Vitamin B1", "Vitamin B11", "Vitamin B12", "Vitamin B2", "Vitamin B3", "Vitamin B5", "Vitamin B6",
    "Vitamin C", "Vitamin D", "Vitamin E", "Vitamin K",
    "Calcium", "Copper", "Iron", "Magnesium", "Manganese", "Phosphorus", "Potassium", "Selenium", "Zinc"
]

STOP_WORDS = {
    'fresh', 'dried', 'raw', 'cooked', 'ground', 'powdered', 'chopped', 'sliced', 'peeled', 
    'segar', 'mentah', 'goreng', 'rebus', 'kukus', 'bubuk', 'of', 'and', 'with', 'or', 'for',
    'divided', 'optional', 'taste', 'to', 'sliced', 'diced', 'minced', 'finely', 'coarsely', 
    'teaspoon', 'tablespoon', 'cup', 'ounce', 'pound', 'gram', 'piece', 'clove', 'inch',
    'a', 'an', 'the', 'in', 'c.', 'tsp', 'tbsp', 'pkg', 'pt', 'oz', 'lb', 'g', 'kg'
}

# ──────────────────────────────────────────────
# Helper: String Tokenizer & Cleaner
# ──────────────────────────────────────────────

def clean_tokens(text: str) -> set:
    """Lowercases, splits, and filters non-nutritive stop words."""
    if not isinstance(text, str):
        return set()
    cleaned = text.lower().replace('-', ' ').replace(',', ' ').replace('(', ' ').replace(')', ' ').replace('/', ' ').replace('_', ' ')
    words = cleaned.split()
    return {w for w in words if w not in STOP_WORDS and len(w) > 1}

# ──────────────────────────────────────────────
# Fuzzy Ingredient Matcher with Inverted Index (Dict-Optimized)
# ──────────────────────────────────────────────

def find_best_food_match(item: str, category_means: dict, inverted_index: dict, exact_map: dict) -> tuple:
    """
    4-tiered fuzzy matching utilizing an inverted index and plain dicts for microsecond lookups.
    """
    item_clean = item.lower().strip()
    if not item_clean:
        return None, "empty"
        
    # Tier 1: Exact Case-Insensitive Match (O(1) Dict Lookup)
    if item_clean in exact_map:
        return exact_map[item_clean], "exact"
        
    item_tokens = clean_tokens(item_clean)
    if not item_tokens:
        # Fallback to global average
        global_fallback_row = {col: category_means.get('other', {}).get(col, 0.0) for col in TARGET_COLS}
        global_fallback_row['food'] = "fallback_global"
        return global_fallback_row, "fallback_global"
        
    # Tier 2: Inverted Index Token Lookup (Fast Candidate Scoring)
    candidates = {}
    for token in item_tokens:
        if token in inverted_index:
            for row in inverted_index[token]:
                candidates[id(row)] = row
                
    best_jaccard = 0.0
    best_row = None
    
    for row in candidates.values():
        food_tokens = row['tokens']
        intersection = len(item_tokens & food_tokens)
        union = len(item_tokens | food_tokens)
        jaccard = intersection / union if union > 0 else 0.0
        
        # Tie-breakers
        if jaccard > best_jaccard:
            best_jaccard = jaccard
            best_row = row
        elif jaccard == best_jaccard and best_row is not None:
            if len(row['food']) < len(best_row['food']):
                best_row = row
                
    # Accept token match if Jaccard similarity is reasonably high (>= 0.25)
    if best_jaccard >= 0.25:
        return best_row, f"jaccard_{best_jaccard:.2f}"
        
    # Tier 3: Substring Match over candidates
    for row in candidates.values():
        if item_clean in row['food_clean'] or row['food_clean'] in item_clean:
            return row, "substring"

    # Tier 4: Category-Level Fallbacks
    fallback_maps = [
        (['chicken', 'poultry', 'turkey', 'duck', 'ayam', 'bebek', 'burung'], 'poultry'),
        (['beef', 'lamb', 'pork', 'mutton', 'sapi', 'kambing', 'babi', 'steak', 'daging'], 'red_meat'),
        (['fish', 'tuna', 'salmon', 'cod', 'mackerel', 'ikan', 'teri', 'selar', 'gereh'], 'fish_regular'),
        (['shrimp', 'prawn', 'crab', 'lobster', 'squid', 'cumi', 'udang', 'kepiting', 'kerang'], 'seafood_other'),
        (['egg', 'telur', 'telor'], 'egg'),
        (['milk', 'cheese', 'yogurt', 'butter', 'susu', 'keju', 'yoghurt', 'mentega'], 'dairy'),
        (['spinach', 'kale', 'lettuce', 'cabbage', 'bayam', 'kangkung', 'sawi', 'daun'], 'leafy_greens'),
        (['potato', 'yam', 'tuber', 'cassava', 'singkong', 'ubi', 'talas', 'kentang'], 'tuber'),
        (['apple', 'banana', 'orange', 'grape', 'fruit', 'pisang', 'mangga', 'pepaya', 'jeruk', 'buah'], 'fruit'),
        (['rice', 'bread', 'wheat', 'flour', 'nasi', 'beras', 'tepung', 'kue', 'mie', 'gandum'], 'grains_starches'),
        (['soy', 'tofu', 'bean', 'pea', 'lentil', 'peanut', 'nut', 'tahu', 'tempe', 'kacang'], 'soy_unfermented_legumes_nuts'),
        (['mushroom', 'jamur'], 'mushroom')
    ]
    
    for kw_list, cat in fallback_maps:
        if any(kw in item_clean for kw in kw_list):
            fallback_row = {col: category_means.get(cat, {}).get(col, 0.0) for col in TARGET_COLS}
            fallback_row['food'] = f"fallback_{cat}"
            return fallback_row, f"fallback_{cat}"
            
    # Absolute Fallback: Global Average
    global_fallback_row = {col: category_means.get('other', {}).get(col, 0.0) for col in TARGET_COLS}
    global_fallback_row['food'] = "fallback_global"
    return global_fallback_row, "fallback_global"

# ──────────────────────────────────────────────
# Main Compiler Function
# ──────────────────────────────────────────────

def compile_recipe_nutrition() -> None:
    print("📂 Loading production master nutrition database …")
    if not os.path.exists(NUTRITION_CSV):
        raise FileNotFoundError(f"Missing master nutrition database at: {NUTRITION_CSV}")
        
    nut_df = pd.read_csv(NUTRITION_CSV)
    
    # ── Convert DataFrame to Plain Dict List to bypass Pandas overhead ──
    print("⚡ Converting nutrition database to plain python dicts for speed ...")
    nutrition_list = nut_df.to_dict(orient='records')
    
    # Pre-calculate clean strings and tokens
    for row in nutrition_list:
        row['food_clean'] = row['food'].lower().strip()
        row['tokens'] = clean_tokens(row['food_clean'])
        
    # Pre-build inverted index and exact match map for instant lookups
    print("⚡ Building search indexes (Inverted Index & Exact Maps) ...")
    inverted_index = collections.defaultdict(list)
    exact_map = {}
    
    for row in nutrition_list:
        food_clean = row['food_clean']
        exact_map[food_clean] = row
        for token in row['tokens']:
            inverted_index[token].append(row)
            
    # Pre-classify complete rows to get category fallbacks
    from src.imputation.impute_expert import classify_food
    
    print("🛠️  Calculating category baselines for fallback mappings ...")
    # For baseline calculation, we keep using the dataframe but will convert the category means
    nut_df['category'] = nut_df.apply(
        lambda r: classify_food(r['food'], r['Protein'], r['Fat'], r['Carbohydrates']), axis=1
    )
    category_means = nut_df.groupby('category')[TARGET_COLS].mean().to_dict(orient='index')
    global_mean = nut_df[TARGET_COLS].mean().to_dict()
    category_means['other'] = global_mean

    print(f"📂 Loading production master recipe database …")
    if not os.path.exists(RECIPE_CSV):
        raise FileNotFoundError(f"Missing master recipe database at: {RECIPE_CSV}")
        
    recipe_df = pd.read_csv(RECIPE_CSV)
    total_recipes = len(recipe_df)
    print(f"   Total recipes to compile: {total_recipes:,}")

    # Storage for recipe-level nutrients
    compiled_data = {col: [] for col in TARGET_COLS}
    compiled_data["total_weight_g"] = []
    compiled_data["estimated_servings"] = []
    compiled_data["structured_match_rate"] = []
    
    # Track matching statistics
    match_methods = {}
    
    print("\n🔬 Processing recipes and summing up ingredients ...")
    for idx, row in recipe_df.iterrows():
        raw_struct = row.get('structured_ingredients', '[]')
        
        # Safe JSON parse
        try:
            ingredients = json.loads(raw_struct)
        except:
            ingredients = []
            
        recipe_totals = {col: 0.0 for col in TARGET_COLS}
        total_weight = 0.0
        matched_count = 0
        total_ingredients = len(ingredients)
        
        for ing in ingredients:
            item = ing.get('item', 'unknown')
            grams = float(ing.get('grams', 0.0))
            
            if grams <= 0.0:
                continue
                
            total_weight += grams
            
            # Find best matching food utilizing dict index lookups
            match_row, method = find_best_food_match(item, category_means, inverted_index, exact_map)
            match_methods[method] = match_methods.get(method, 0) + 1
            
            if "fallback" not in method:
                matched_count += 1
                
            # Sum up nutrients based on gram weight
            scale = grams / 100.0
            for col in TARGET_COLS:
                recipe_totals[col] += float(match_row[col]) * scale

        # Calculate estimated servings (assuming average 300g per serving, min 1)
        servings = max(1.0, round(total_weight / 300.0, 1))
        
        # Calculate match rate
        match_rate = round(matched_count / total_ingredients, 2) if total_ingredients > 0 else 1.0
        
        # Calculate nutrient profile PER 100g of the recipe mix
        weight_scale = total_weight / 100.0 if total_weight > 0 else 1.0
        
        for col in TARGET_COLS:
            per_100g_val = recipe_totals[col] / weight_scale
            per_100g_val = max(0.0, round(per_100g_val, 4))
            compiled_data[col].append(per_100g_val)
            
        compiled_data["total_weight_g"].append(round(total_weight, 2))
        compiled_data["estimated_servings"].append(servings)
        compiled_data["structured_match_rate"].append(match_rate)
        
        if (idx + 1) % 4000 == 0 or (idx + 1) == total_recipes:
            print(f"   Processed {idx + 1}/{total_recipes} recipes ...")

    # Add columns to dataframe
    for col in TARGET_COLS:
        recipe_df[f"Recipe {col}"] = compiled_data[col]
        
    recipe_df["total_weight_g"] = compiled_data["total_weight_g"]
    recipe_df["estimated_servings"] = compiled_data["estimated_servings"]
    recipe_df["structured_match_rate"] = compiled_data["structured_match_rate"]

    # 🔢 Recalculate Recipe Nutrition Density
    print("\n🔢 Recalculating Nutrition Density for recipes ...")
    recipe_df["Recipe Nutrition Density"] = round((
        recipe_df["Recipe Protein"] * 4
        + recipe_df["Recipe Dietary Fiber"] * 3
        + recipe_df["Recipe Vitamin C"] * 0.5
        + recipe_df["Recipe Vitamin A"] * 0.01
        + recipe_df["Recipe Iron"] * 5
        + recipe_df["Recipe Calcium"] * 0.1
        + recipe_df["Recipe Potassium"] * 0.05
        + recipe_df["Recipe Magnesium"] * 0.2
        + recipe_df["Recipe Vitamin B12"] * 20
        + recipe_df["Recipe Zinc"] * 3
    ) / recipe_df["Recipe Caloric Value"].clip(lower=1.0), 3)

    # Print matching metrics
    print("\n📊 Ingredient Match Method Breakdown:")
    total_matches = sum(match_methods.values())
    for method, count in sorted(match_methods.items(), key=lambda x: x[1], reverse=True)[:15]:
        print(f"   - {method:<20} : {count:>5} ({count/total_matches*100:6.2f}%)")

    # 💾 Save back to production database
    print(f"\n💾 Saving updated master recipe database → {RECIPE_CSV}")
    recipe_df.to_csv(RECIPE_CSV, index=False)
    print("   ✅ Recipe database saved successfully.")
    
    print("\n🎉 Recipe Nutrition compilation process completed!")

if __name__ == "__main__":
    compile_recipe_nutrition()
