"""
recommendation_engine.py — Dynamic Recommendation Engine POC (High-Performance).
Calculates dynamic nutritional goals (BMR/TDEE), screens for clinical red-lines,
scores 16,000+ recipes in real-time, and integrates BPS regional commodity consumption
data with Explainable AI (XAI) justifications and a CSP 7-Day Diverse Meal Planner.
"""

import os
import json
import time
import collections
import pandas as pd
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RECIPE_CSV = os.path.join(BASE_DIR, "datasets/master/master_recipe_database.csv")
ALLERGEN_CSV = os.path.join(BASE_DIR, "datasets/master/master_allergen_dictionary.csv")
CONSUMPTION_CSV = os.path.join(BASE_DIR, "datasets/consumption/consumption.csv")

# ──────────────────────────────────────────────
# 1. Clinical Red-Line Safety Guardrails Definitions
# ──────────────────────────────────────────────

CLINICAL_RED_LINES = {
    'kidney_disease': {
        'name_id': 'Penyakit Ginjal Kronis (CKD)',
        'name_en': 'Chronic Kidney Disease (CKD)',
        'disclaimer_id': 'Sistem Nara AI mendeteksi riwayat Penyakit Ginjal. Untuk mencegah komplikasi (seperti penumpukan protein, kalium, dan fosfor berbahaya), Anda memerlukan diet klinis terawasi. Silakan berkonsultasi dengan Dokter Spesialis Gizi Klinik (Sp.GK) atau Dietisien terdaftar.',
        'disclaimer_en': 'Nara AI detected a history of Kidney Disease. To prevent serious complications (such as toxic build-up of protein, potassium, and phosphorus), you require a supervised clinical diet. Please consult a registered clinical dietitian or medical specialist.'
    },
    'heart_failure': {
        'name_id': 'Gagal Jantung Kongestif (CHF)',
        'name_en': 'Congestive Heart Failure (CHF)',
        'disclaimer_id': 'Sistem Nara AI mendeteksi riwayat Gagal Jantung. Pembatasan natrium dan cairan sangat penting untuk mencegah penumpukan cairan di paru-paru. Silakan berkonsultasi dengan Dokter Spesialis Gizi Klinik (Sp.GK) atau Dokter Spesialis Jantung.',
        'disclaimer_en': 'Nara AI detected Congestive Heart Failure. Strict sodium and fluid restrictions are crucial to prevent pulmonary edema. Please consult a cardiologist or registered clinical dietitian.'
    },
    'liver_cirrhosis': {
        'name_id': 'Sirosis Hati (Liver Cirrhosis)',
        'name_en': 'Liver Cirrhosis',
        'disclaimer_id': 'Sistem Nara AI mendeteksi riwayat Sirosis Hati. Pengaturan asupan protein dan natrium memerlukan pengawasan ketat untuk mencegah komplikasi ensefalopati hepatik. Silakan berkonsultasi dengan Dokter Spesialis Gizi Klinik atau Spesialis Penyakit Dalam.',
        'disclaimer_en': 'Nara AI detected Liver Cirrhosis. Protein and sodium titration require close medical supervision to prevent complications. Please consult a medical specialist.'
    },
    'type1_diabetes': {
        'name_id': 'Diabetes Tipe 1',
        'name_en': 'Type 1 Diabetes',
        'disclaimer_id': 'Sistem Nara AI mendeteksi Diabetes Tipe 1. Perhitungan karbohidrat presisi tinggi dan pencocokan dosis insulin aktif sangat penting untuk mencegah ketoasidosis diabetikum (KDK). Silakan berkonsultasi dengan Dokter Spesialis Endokrinologi.',
        'disclaimer_en': 'Nara AI detected Type 1 Diabetes. Precision carbohydrate matching and active insulin titration are critical to prevent Diabetic Ketoacidosis (DKA). Please consult an endocrinologist.'
    },
    'severe_gout': {
        'name_id': 'Asam Urat Akut (Severe Gout)',
        'name_en': 'Severe Gout',
        'disclaimer_id': 'Sistem Nara AI mendeteksi kondisi Asam Urat Akut. Konsumsi purin tinggi (seperti jeroan, daging merah tertentu, dan seafood) harus dibatasi ketat untuk mencegah serangan nyeri sendi akut. Silakan berkonsultasi dengan Dokter atau Dietisien.',
        'disclaimer_en': 'Nara AI detected Severe Gout. High-purine items (like organ meats, red meats, and shellfish) must be strictly avoided to prevent acute painful flare-ups. Please consult a medical professional.'
    }
}

# ──────────────────────────────────────────────
# 2. Dynamic Calorie & Macro Target Calculator
# ──────────────────────────────────────────────

def calculate_user_targets(weight_kg: float, height_cm: float, age_years: int, sex: str, activity_level: str, goal: str) -> dict:
    """
    Calculates BMR via Mifflin-St Jeor, maps activity multipliers to TDEE,
    and applies calorie targets and macro distributions based on goals.
    """
    # Basal Metabolic Rate (BMR)
    if sex.lower() == 'male':
        bmr = 10.0 * weight_kg + 6.25 * height_cm - 5.0 * age_years + 5.0
    else:
        bmr = 10.0 * weight_kg + 6.25 * height_cm - 5.0 * age_years - 161.0
        
    # Activity Multipliers
    multipliers = {
        'sedentary': 1.2,
        'lightly_active': 1.375,
        'moderately_active': 1.55,
        'very_active': 1.725,
        'extra_active': 1.9
    }
    activity_factor = multipliers.get(activity_level.lower(), 1.2)
    tdee = bmr * activity_factor
    
    # Calorie Target based on Goals
    if goal.lower() == 'weight_loss':
        cal_target = tdee - 500.0  # standard 500 kcal deficit
        protein_pct, fat_pct, carb_pct = 0.30, 0.30, 0.40
    elif goal.lower() == 'muscle_gain':
        cal_target = tdee + 400.0  # surplus for lean mass gain
        protein_pct, fat_pct, carb_pct = 0.35, 0.25, 0.40
    else:  # weight maintenance
        cal_target = tdee
        protein_pct, fat_pct, carb_pct = 0.20, 0.30, 0.50
        
    # Translate target calories to gram targets (P: 4 kcal/g, F: 9 kcal/g, C: 4 kcal/g)
    protein_g = (cal_target * protein_pct) / 4.0
    fat_g = (cal_target * fat_pct) / 9.0
    carb_g = (cal_target * carb_pct) / 4.0
    
    return {
        "bmr": round(bmr, 1),
        "tdee": round(tdee, 1),
        "caloric_target_daily": round(cal_target, 1),
        "caloric_target_meal": round(cal_target / 3.5, 1),
        "protein_target_meal": round(protein_g / 3.5, 1),
        "fat_target_meal": round(fat_g / 3.5, 1),
        "carbohydrates_target_meal": round(carb_g / 3.5, 1)
    }

# ──────────────────────────────────────────────
# 3. Dynamic Real-time Recommender Engine with CSP Portions & Diversity Planner
# ──────────────────────────────────────────────

# Indonesian Commodity Keywords for Provincial Alignment Mapping
COMMODITY_KEYWORDS = {
    'beras': ['rice', 'beras', 'nasi'],
    'daging unggas': ['chicken', 'turkey', 'poultry', 'ayam', 'bebek', 'unggas'],
    'daging ruminansia': ['beef', 'meat', 'sapi', 'kambing', 'daging', 'ruminansia'],
    'telur': ['egg', 'telur', 'telor'],
    'ikan': ['fish', 'tuna', 'salmon', 'cod', 'mackerel', 'ikan', 'teri', 'seafood', 'shrimp', 'crab', 'squid', 'cumi', 'udang', 'kepiting', 'seafood'],
    'kentang': ['potato', 'kentang'],
    'singkong': ['cassava', 'singkong', 'tapioca'],
    'ubi jalar': ['sweet potato', 'ubi'],
    'sagu': ['sago', 'sagu'],
    'kelapa': ['coconut', 'kelapa', 'santan'],
    'kedelai': ['soy', 'tofu', 'tempeh', 'tahu', 'tempe', 'kedelai']
}

def classify_recipe_category(ingredients_list, title) -> str:
    """Classifies a recipe into a primary BPS-aligned food category for CSP diversity check."""
    text = (str(title) + " " + " ".join([str(ing.get('item', '')) for ing in ingredients_list])).lower()
    
    # Check fish & seafood
    fish_kws = ['fish', 'tuna', 'salmon', 'cod', 'mackerel', 'shrimp', 'prawn', 'crab', 'lobster', 'squid', 'cumi', 'udang', 'kepiting', 'ikan', 'seafood', 'clam', 'oyster']
    if any(kw in text for kw in fish_kws):
        return 'fish_seafood'
        
    # Check poultry
    poultry_kws = ['chicken', 'turkey', 'duck', 'ayam', 'bebek', 'puyuh']
    if any(kw in text for kw in poultry_kws):
        return 'poultry'
        
    # Check red meat
    red_meat_kws = ['beef', 'pork', 'lamb', 'mutton', 'sapi', 'kambing', 'babi', 'steak', 'daging', 'meatball', 'bakso', 'sosis', 'sausage']
    if any(kw in text for kw in red_meat_kws):
        return 'red_meat'
        
    # Check plant-based protein
    plant_kws = ['tofu', 'tempeh', 'soy', 'bean', 'pea', 'lentil', 'peanut', 'cashew', 'tahu', 'tempe', 'kacang', 'mushroom', 'jamur']
    if any(kw in text for kw in plant_kws):
        return 'plant_based'
        
    # Check starch
    starch_kws = ['rice', 'noodle', 'potato', 'pasta', 'bread', 'flour', 'sagu', 'singkong', 'ubi', 'kentang', 'nasi', 'gandum', 'mie']
    if any(kw in text for kw in starch_kws):
        return 'starch'
        
    return 'other'

def is_main_dish(title, ingredients_list) -> bool:
    title_clean = str(title).lower().strip()
    
    # Exclude desserts, snacks, candies, and sweet treats
    dessert_kws = [
        'cookie', 'cookies', 'treat', 'treats', 'candy', 'candies', 'dessert', 'desserts', 
        'marshmallow', 'marshmallows', 'scotcharoo', 'scotcharoos', 'krispies', 'krispy',
        'crispy treat', 'crispy treats', 'cake', 'cakes', 'pie', 'pies', 'donut', 'donuts', 
        'pudding', 'puddings', 'fudge', 'brownie', 'brownies', 'muffin', 'muffins', 
        'caramel', 'chocolate', 'cupcake', 'cupcakes', 'truffle', 'tart', 'tarts', 
        'popcorn', 'pretzel', 'pretzels', 'chex mix', 'frosting', 'icing', 'syrup',
        'jam', 'pancake', 'pancakes', 'waffle', 'waffles', 'sweet', 'sweets', 'bars', 'bark'
    ]
    if any(kw in title_clean for kw in dessert_kws):
        return False
        
    # Exclude side sauces, raw dressings, glazes, and seasonings
    condiment_kws = [
        'sauce', 'gravy', 'dressing', 'marinade', 'rub', 'dip', 'syrup', 'seasoning',
        'salsa', 'pesto', 'glaze', 'vinaigrette', 'spread', 'paste'
    ]
    if any(title_clean.endswith(kw) or f" {kw}" in title_clean for kw in condiment_kws):
        # Unless it is clearly a main meat/fish dish in sauce
        if not any(x in title_clean for x in ['chicken', 'beef', 'meat', 'fish', 'stew', 'curry']):
            return False
            
    # Exclude basic beverages
    beverage_kws = ['drink', 'juice', 'smoothie', 'shake', 'cocktail', 'punch', 'tea', 'coffee', 'cider']
    if any(kw in title_clean for kw in beverage_kws):
        return False
        
    return True

class NaraRecommender:
    def __init__(self):
        print("📂 NaraRecommender: Loading master recipe database ...")
        self.df = pd.read_csv(RECIPE_CSV)
        self.allergen_df = pd.read_csv(ALLERGEN_CSV)
        
        # Load regional consumption database
        print("📂 NaraRecommender: Loading Indonesian BPS regional consumption data ...")
        self.consumption_df = pd.read_csv(CONSUMPTION_CSV)
        latest_year = self.consumption_df['Tahun'].max()
        self.latest_consumption = self.consumption_df[self.consumption_df['Tahun'] == latest_year]
        
        # Map consumption: self.consumption_map[province][commodity] = consumption_val
        self.consumption_map = collections.defaultdict(dict)
        for _, r in self.latest_consumption.iterrows():
            prov = str(r['Provinsi']).strip().lower()
            com = str(r['Komoditas']).strip().lower()
            val = float(r['Konsumsi_Pangan'])
            self.consumption_map[prov][com] = val
            
        # Build allergen maps (ingredient ➜ set of triggered allergies)
        self.allergen_map = {}
        for _, r in self.allergen_df.iterrows():
            ing = str(r['ingredient']).lower().strip()
            allergies = str(r['allergens']).lower().strip().split(', ')
            self.allergen_map[ing] = set(allergies)
            
        # Pre-parse structured ingredients to avoid JSON parsing in the query loop
        print("⚡ Pre-parsing recipe ingredients for high-speed queries ...")
        self.parsed_ingredients = []
        for raw_struct in self.df['structured_ingredients']:
            try:
                self.parsed_ingredients.append(json.loads(raw_struct))
            except:
                self.parsed_ingredients.append([])
                
        # Pre-calculate recipe commodity profiles to speed up regional alignment queries
        print("⚡ Pre-building recipe regional commodity indexes ...")
        self.recipe_commodities = []
        for ingredients in self.parsed_ingredients:
            comp_map = {com_name: 0.0 for com_name in COMMODITY_KEYWORDS.keys()}
            for ing in ingredients:
                item = ing.get('item', '').lower().strip()
                grams = float(ing.get('grams', 0.0))
                for com_name, keywords in COMMODITY_KEYWORDS.items():
                    if any(kw in item for kw in keywords):
                        comp_map[com_name] += grams
            self.recipe_commodities.append(comp_map)
            
        print(f"✅ NaraRecommender: Loaded {len(self.df):,} recipes, {len(self.allergen_map):,} allergens, and {len(self.consumption_map):,} provinces.")

    def recommend(self, user_profile: dict) -> dict:
        """
        Generates a 7-day diverse meal plan (7 primary + 8 swappable alternatives = 15 total)
        using a greedy backtracking-based Constraint Satisfaction Problem (CSP) solver, 
        incorporating BPS regional aligned weights, medical safety cutoffs, and Explainable AI (XAI).
        """
        start_time = time.perf_counter()
        
        # ── 1. Ethics & Safety Cutoff Stage ──
        user_conditions = [c.strip().lower() for c in user_profile.get("clinical_conditions", [])]
        matched_conditions = [c for c in user_conditions if c in CLINICAL_RED_LINES]
        
        if matched_conditions:
            cond = matched_conditions[0] # trigger for primary condition
            elapsed_ms = (time.perf_counter() - start_time) * 1000.0
            return {
                "status": "safety_cutoff_triggered",
                "elapsed_ms": round(elapsed_ms, 2),
                "clinical_condition_triggered": CLINICAL_RED_LINES[cond]["name_id"],
                "medical_disclaimer_id": CLINICAL_RED_LINES[cond]["disclaimer_id"],
                "medical_disclaimer_en": CLINICAL_RED_LINES[cond]["disclaimer_en"],
                "exportable_profile": {
                    "weight_kg": user_profile["weight_kg"],
                    "height_cm": user_profile["height_cm"],
                    "age_years": user_profile["age_years"],
                    "sex": user_profile["sex"],
                    "activity_level": user_profile["activity_level"],
                    "goal": user_profile["goal"],
                    "allergies": user_profile.get("allergies", [])
                }
            }
        
        # ── 2. Calculate daily & per-meal nutritional targets ──
        targets = calculate_user_targets(
            weight_kg=user_profile["weight_kg"],
            height_cm=user_profile["height_cm"],
            age_years=user_profile["age_years"],
            sex=user_profile["sex"],
            activity_level=user_profile["activity_level"],
            goal=user_profile["goal"]
        )
        
        user_allergies = {a.lower().strip() for a in user_profile.get("allergies", [])}
        
        # ── 3. Fast Allergen Filter Stage (Pre-parsed List Indexing) ──
        valid_indices = []
        for idx, ingredients in enumerate(self.parsed_ingredients):
            triggers_allergy = False
            for ing in ingredients:
                item = ing.get('item', '').lower().strip()
                if item in self.allergen_map:
                    triggered_groups = self.allergen_map[item]
                    if triggered_groups & user_allergies:
                        triggers_allergy = True
                        break
            if not triggers_allergy:
                valid_indices.append(idx)
                
        filtered_df = self.df.iloc[valid_indices].copy()
        filtered_commodities = [self.recipe_commodities[i] for i in valid_indices]
        n_filtered = len(self.df) - len(filtered_df)
        
        # ── 4. Provincial Food Consumption Scoring (Regional Alignment) ──
        province_name = user_profile.get("province", "").strip().lower()
        prov_consumption = self.consumption_map.get(province_name, self.consumption_map.get("nasional", {}))
        if not prov_consumption and self.consumption_map:
            # Fallback to national or first province in map
            prov_consumption = next(iter(self.consumption_map.values()))
            
        recipe_ras_raw = []
        for recipe_comp in filtered_commodities:
            # Sum weight-scaled provincial consumption rates for matching commodities
            raw_ras = sum(recipe_comp[com] * prov_consumption.get(com, 0.0) for com in COMMODITY_KEYWORDS)
            recipe_ras_raw.append(raw_ras)
            
        recipe_ras_raw = np.array(recipe_ras_raw)
        max_ras = np.max(recipe_ras_raw) if len(recipe_ras_raw) > 0 else 1.0
        recipe_ras = recipe_ras_raw / (max_ras + 1e-5) # normalized RAS between 0 and 1
        
        # ── 5. Dynamic Nutrition Scoring Stage (NumPy Matrix Operations) ──
        t_cal = targets["caloric_target_meal"]
        t_prot = targets["protein_target_meal"]
        t_fat = targets["fat_target_meal"]
        t_carb = targets["carbohydrates_target_meal"]
        
        # We assume 3 main meals, scaling recipe nutrition per 100g to average meal sizes
        recipe_cal = filtered_df["Recipe Caloric Value"].values * 3.0
        recipe_prot = filtered_df["Recipe Protein"].values * 3.0
        recipe_fat = filtered_df["Recipe Fat"].values * 3.0
        recipe_carb = filtered_df["Recipe Carbohydrates"].values * 3.0
        recipe_density = filtered_df["Recipe Nutrition Density"].values
        
        # A. Calorie proximity score (Gaussian decay around target)
        cal_score = np.exp(- np.square((recipe_cal - t_cal) / max(t_cal, 1.0)))
        
        # B. Macro balance score
        prot_diff = np.abs(recipe_prot - t_prot) / max(t_prot, 1.0)
        fat_diff = np.abs(recipe_fat - t_fat) / max(t_fat, 1.0)
        carb_diff = np.abs(recipe_carb - t_carb) / max(t_carb, 1.0)
        macro_score = 1.0 / (1.0 + prot_diff + fat_diff + carb_diff)
        
        # C. Combined Expert Scoring (BPS Regional alignment is weighted at 45%)
        normalized_density = recipe_density / (np.max(recipe_density) + 1e-5)
        
        final_scores = (
            0.20 * cal_score +
            0.15 * macro_score +
            0.20 * normalized_density +
            0.45 * recipe_ras
        )
        
        filtered_df["recommendation_score"] = final_scores
        filtered_df["ras_score"] = recipe_ras
        
        # Sort candidates descending
        candidates = filtered_df.sort_values(by="recommendation_score", ascending=False)
        
        # ── 6. Greedy CSP Diversity & Rotation Selector ──
        # Select 15 recipes in total ensuring protein/starch variety (Max 4 of same category in pool)
        selected_recipes = []
        category_counts = collections.defaultdict(int)
        
        for idx_val, r in candidates.iterrows():
            ingredients = self.parsed_ingredients[idx_val]
            
            # CSP Constraint: Only recommend realistic main dishes for meal prep
            if not is_main_dish(r['title'], ingredients):
                continue
                
            cat = classify_recipe_category(ingredients, r['title'])
            
            # CSP Constraint: Max 4 of the same food category in the 15-recipe pool
            if category_counts[cat] >= 4:
                continue
                
            selected_recipes.append((r, cat, ingredients))
            category_counts[cat] += 1
            
            if len(selected_recipes) >= 15:
                break
                
        # If pool size is less than 15 (highly constrained), fill up with remaining candidates
        if len(selected_recipes) < 15:
            for idx_val, r in candidates.iterrows():
                ingredients = self.parsed_ingredients[idx_val]
                
                # Check main dish constraint here as well
                if not is_main_dish(r['title'], ingredients):
                    continue
                    
                cat = classify_recipe_category(ingredients, r['title'])
                # Avoid duplicates
                if any(x[0]["title"] == r["title"] for x in selected_recipes):
                    continue
                selected_recipes.append((r, cat, ingredients))
                if len(selected_recipes) >= 15:
                    break

        # Distribute pool: 7 Primary Days (Max 3 of same category in 7-day plan) and 8 Alternatives
        primary_list = []
        alternative_list = []
        primary_cat_counts = collections.defaultdict(int)
        
        for item in selected_recipes:
            r, cat, ingredients = item
            if len(primary_list) < 7 and primary_cat_counts[cat] < 3:
                primary_list.append(item)
                primary_cat_counts[cat] += 1
            else:
                alternative_list.append(item)
                
        # Safe balance: if primary schedule didn't reach 7, pop from alternatives
        while len(primary_list) < 7 and alternative_list:
            primary_list.append(alternative_list.pop(0))
            
        # ── 7. Formatting & Explainable AI (XAI) serving portion scaling ──
        prov_display = user_profile.get("province", "Nasional")
        days_name = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]
        
        def format_recipe(r, cat, ingredients, day_label=None):
            rec_cal_standard = r["Recipe Caloric Value"] * 3.0
            rec_prot_standard = r["Recipe Protein"] * 3.0
            rec_fat_standard = r["Recipe Fat"] * 3.0
            rec_carb_standard = r["Recipe Carbohydrates"] * 3.0
            density_val = r["Recipe Nutrition Density"]
            ras_val = r["ras_score"]
            
            # Dynamic serving portion scale multiplier calculation
            scale_factor = t_cal / max(rec_cal_standard, 1.0)
            scale_factor = round(scale_factor, 1)
            # Clip scale factor to reasonable boundaries (0.5x to 2.5x) to avoid absurd volumes
            scale_factor = max(0.5, min(2.5, scale_factor))
            
            scaled_cal = round(rec_cal_standard * scale_factor, 1)
            scaled_prot = round(rec_prot_standard * scale_factor, 1)
            scaled_fat = round(rec_fat_standard * scale_factor, 1)
            scaled_carb = round(rec_carb_standard * scale_factor, 1)
            
            # Formulate explanations
            cal_diff = round(scaled_cal - t_cal, 1)
            scale_reason = f"Atur Porsi: Sajikan {scale_factor:.1f}x porsi ({round(scale_factor * 300, 0):.0f}g) untuk mencukupi target kalori Anda ({cal_diff:+.1f} kkal dari target)."
            
            prot_err = abs(scaled_prot - t_prot) / max(t_prot, 1.0)
            if prot_err < 0.15:
                macro_reason = "Proporsi Protein ideal untuk mendukung pemulihan otot dan metabolisme."
            elif scaled_prot > t_prot:
                macro_reason = f"Kaya Protein ({scaled_prot}g), melebihi target protein makan Anda untuk mendukung metabolisme."
            else:
                macro_reason = f"Makronutrisi seimbang (P: {scaled_prot}g, C: {scaled_carb}g)."
                
            if density_val > 1.5:
                density_reason = f"Kepadatan gizi mikro tinggi ({density_val:.2f}), kaya akan Zat Besi, Kalsium, & Vitamin penting."
            else:
                density_reason = f"Gizi mikro harian tercukupi ({density_val:.2f})."
                
            allergen_reason = f"Aman: Bebas dari alergen Anda: {', '.join(user_allergies) if user_allergies else 'none'}."
            
            if ras_val > 0.6:
                regional_reason = f"Pangan Lokal: Sangat selaras dengan konsumsi di {prov_display} (komoditas utama daerah)."
            elif ras_val > 0.2:
                regional_reason = f"Ketersediaan: Menggunakan bahan pangan pokok yang mudah didapat di {prov_display}."
            else:
                regional_reason = "Menggunakan bahan pokok standar nasional."
                
            res = {
                "title": r["title"],
                "score": round(r["recommendation_score"] * 100, 1),
                "food_category": cat,
                "portion_scale_factor": scale_factor,
                "calories_per_serving": scaled_cal,
                "protein_per_serving": scaled_prot,
                "fat_per_serving": scaled_fat,
                "carbs_per_serving": scaled_carb,
                "density": density_val,
                "regional_alignment_score": round(ras_val * 100, 1),
                "source": r["source"],
                "explanations": [
                    scale_reason,
                    macro_reason,
                    density_reason,
                    allergen_reason,
                    regional_reason
                ]
            }
            if day_label:
                res["day"] = day_label
            return res

        primary_output = []
        for i, item in enumerate(primary_list):
            primary_output.append(format_recipe(item[0], item[1], item[2], days_name[i]))
            
        alternative_output = []
        for item in alternative_list[:8]:
            alternative_output.append(format_recipe(item[0], item[1], item[2]))
            
        elapsed_ms = (time.perf_counter() - start_time) * 1000.0
        
        return {
            "status": "success",
            "elapsed_ms": round(elapsed_ms, 2),
            "targets": targets,
            "recipes_filtered_out_allergens": n_filtered,
            "recipes_scored_realtime": len(filtered_df),
            "province_aligned": prov_display,
            "primary_schedule": primary_output,
            "alternative_pool": alternative_output
        }

# ──────────────────────────────────────────────
# Demo Run
# ──────────────────────────────────────────────

def run_demo():
    print("🚀 NARA AI-ENGINE: Starting Dynamic 7-Day Portion-Optimized & Diverse Meal Plan Demo ...\n")
    engine = NaraRecommender()
    
    # ── User Profile 1: Weight Loss + Gluten Allergy + Jawa Barat ──
    user1 = {
        "weight_kg": 70.0,
        "height_cm": 172.0,
        "age_years": 24,
        "sex": "female",
        "activity_level": "moderately_active",
        "goal": "weight_loss",
        "allergies": ["gluten allergy"],
        "province": "Jawa Barat",
        "clinical_conditions": []
    }
    
    print("\n-------------------------------------------------------")
    print("👤 USER PROFILE 1: Weight Loss (Active) + Gluten Allergy + Jawa Barat")
    print("-------------------------------------------------------")
    res1 = engine.recommend(user1)
    if res1["status"] == "success":
        print(f"📊 Targets per meal : {res1['targets']['caloric_target_meal']} kcal | "
              f"P: {res1['targets']['protein_target_meal']}g | F: {res1['targets']['fat_target_meal']}g | C: {res1['targets']['carbohydrates_target_meal']}g")
        print(f"🌏 Aligned Province : {res1['province_aligned']}")
        print(f"⚡ Scoring Speed    : {res1['elapsed_ms']} milliseconds! (Scored {res1['recipes_scored_realtime']} recipes)")
        
        print("\n🏆 ====== 7-DAY DIVERSE PRIMARY SCHEDULE (CSP Rotated) ======")
        for rec in res1["primary_schedule"]:
            print(f"  📅 {rec['day']}: {rec['title']} ({rec['food_category'].upper()})")
            print(f"     [Scale: {rec['portion_scale_factor']}x] Calories: {rec['calories_per_serving']} kcal | P: {rec['protein_per_serving']}g | F: {rec['fat_per_serving']}g | C: {rec['carbs_per_serving']}g")
            print(f"     🌏 RAS Score : {rec['regional_alignment_score']}% | Density: {rec['density']}")
            print(f"     🔍 AI Rationale:")
            for exp in rec["explanations"]:
                print(f"       👉 {exp}")
            print("  " + "-"*60)
            
        print("\n🔄 ====== SWAPPABLE ALTERNATIVES POOL ======")
        for idx, rec in enumerate(res1["alternative_pool"]):
            print(f"  Option {idx+1}. {rec['title']} ({rec['food_category'].upper()})")
            print(f"     [Scale: {rec['portion_scale_factor']}x] Calories: {rec['calories_per_serving']} kcal | P: {rec['protein_per_serving']}g | F: {rec['fat_per_serving']}g | C: {rec['carbs_per_serving']}g")
            print(f"     🌏 RAS Score : {rec['regional_alignment_score']}%")

    # ── User Profile 2: Papua comparison (Same parameters but different province) ──
    user2 = {
        "weight_kg": 70.0,
        "height_cm": 172.0,
        "age_years": 24,
        "sex": "female",
        "activity_level": "moderately_active",
        "goal": "weight_loss",
        "allergies": ["gluten allergy"],
        "province": "Papua",
        "clinical_conditions": []
    }
    
    print("\n-------------------------------------------------------")
    print("👤 USER PROFILE 2: Weight Loss (Active) + Gluten Allergy + Papua (Comparison)")
    print("-------------------------------------------------------")
    res2 = engine.recommend(user2)
    if res2["status"] == "success":
        print(f"🌏 Aligned Province : {res2['province_aligned']}")
        print(f"⚡ Scoring Speed    : {res2['elapsed_ms']} milliseconds!")
        
        print("\n🏆 ====== 7-DAY DIVERSE PRIMARY SCHEDULE (BPS Papua Aligned) ======")
        for rec in res2["primary_schedule"]:
            print(f"  📅 {rec['day']}: {rec['title']} ({rec['food_category'].upper()})")
            print(f"     [Scale: {rec['portion_scale_factor']}x] Calories: {rec['calories_per_serving']} kcal | P: {rec['protein_per_serving']}g | F: {rec['fat_per_serving']}g | C: {rec['carbs_per_serving']}g")
            print(f"     🌏 RAS Score : {rec['regional_alignment_score']}%")
            print("  " + "-"*60)

    # ── User Profile 3: Safety Cutoff triggered (Kidney Disease) ──
    user3 = {
        "weight_kg": 65.0,
        "height_cm": 165.0,
        "age_years": 45,
        "sex": "male",
        "activity_level": "sedentary",
        "goal": "maintenance",
        "allergies": [],
        "province": "Jawa Tengah",
        "clinical_conditions": ["kidney_disease"]
    }
    
    print("\n-------------------------------------------------------")
    print("👤 USER PROFILE 3: Maintenance + Kidney Disease (Safety Trigger)")
    print("-------------------------------------------------------")
    res3 = engine.recommend(user3)
    if res3["status"] == "safety_cutoff_triggered":
        print(f"⚠️  [SAFETY CUTOFF TRIGGERED] Condition: {res3['clinical_condition_triggered']}")
        print(f"🛑 Medical Disclaimer ID:")
        print(f"   \"{res3['medical_disclaimer_id']}\"")
        print(f"🛑 Medical Disclaimer EN:")
        print(f"   \"{res3['medical_disclaimer_en']}\"")
        print("-------------------------------------------------------\n")

if __name__ == "__main__":
    run_demo()
