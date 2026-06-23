"""
recommendation_engine.py — Dynamic Recommendation Engine POC (High-Performance).
Calculates dynamic nutritional goals (BMR/TDEE), screens for clinical red-lines,
scores 16,000+ recipes in real-time, and integrates BPS regional commodity consumption
data with Explainable AI (XAI) justifications and a CSP 7-Day Diverse Meal Planner.
"""

import os
import re
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
    Calculates BMR via Mifflin-St Jeor using actual body weight, maps activity multipliers
    to TDEE, and applies BMI-tiered stepped deficit/surplus with weight-based protein targets.
    """
    height_m = height_cm / 100.0
    bmi = weight_kg / (height_m * height_m) if height_m > 0 else 0

    # Basal Metabolic Rate (BMR) using actual body weight
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
    # Normalize activity level keys from frontend
    activity_key = activity_level.lower().strip()
    activity_map = {
        'light': 'lightly_active',
        'moderate': 'moderately_active',
        'extra': 'extra_active',
        'very': 'very_active'
    }
    activity_key = activity_map.get(activity_key, activity_key)
    activity_factor = multipliers.get(activity_key, 1.2)
    tdee = bmr * activity_factor

    # BMI-tiered stepped deficit/surplus + weight-based protein (g/kg)
    if goal.lower() in ('weight_loss', 'cutting'):
        if bmi < 25.0:
            cal_target = tdee - 375.0          # gentle deficit for normal BMI
        elif bmi <= 35.0:
            cal_target = tdee * 0.85           # 15% deficit for overweight
        else:
            cal_target = tdee * 0.80           # 20% deficit for obese
        protein_g = weight_kg * 1.2
        fat_pct = 0.25
    elif goal.lower() in ('muscle_gain', 'bulking'):
        cal_target = tdee + 400.0
        protein_g = weight_kg * 1.8
        fat_pct = 0.25
    else:  # maintenance
        cal_target = tdee
        protein_g = weight_kg * 1.0
        fat_pct = 0.30

    # Sex-based clinical calorie floor (applied to all goals)
    min_calories = 1600.0 if sex.lower() == 'male' else 1400.0
    cal_target = max(cal_target, min_calories)

    # Protein safety cap: never exceed 45% of total calories from protein
    if protein_g * 4.0 > cal_target * 0.45:
        protein_g = (cal_target * 0.45) / 4.0

    fat_g = (cal_target * fat_pct) / 9.0
    carb_g = (cal_target - (protein_g * 4.0) - (fat_g * 9.0)) / 4.0

    return {
        "bmr": round(bmr, 1),
        "tdee": round(tdee, 1),
        "caloric_target_daily": round(cal_target, 1),
        "caloric_target_meal": round(cal_target / 3.0, 1),
        "protein_target_meal": round(protein_g / 3.0, 1),
        "fat_target_meal": round(fat_g / 3.0, 1),
        "carbohydrates_target_meal": round(carb_g / 3.0, 1),
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

def is_main_dish(title, ingredients_list, protein_per_100g=0) -> bool:
    title_clean = str(title).lower().strip()

    # Desserts, snacks, and sweet treats (English + Indonesian superset)
    snack_kws = [
        # English
        'cookie', 'cookies', 'treat', 'treats', 'candy', 'candies', 'dessert', 'desserts',
        'marshmallow', 'marshmallows', 'scotcharoo', 'scotcharoos', 'krispies', 'krispy',
        'crispy treat', 'crispy treats', 'cake', 'cakes', 'pie', 'pies', 'donut', 'donuts',
        'pudding', 'puddings', 'fudge', 'brownie', 'brownies', 'muffin', 'muffins',
        'caramel', 'chocolate', 'cupcake', 'cupcakes', 'truffle', 'tart', 'tarts',
        'popcorn', 'pretzel', 'pretzels', 'chex mix', 'frosting', 'icing', 'syrup',
        'jam', 'pancake', 'pancakes', 'waffle', 'waffles', 'sweet', 'sweets', 'bars', 'bark',
        'cut-out', 'cut-outs', 'cutout', 'cutouts', 'biscuit', 'biscuits', 'pastry', 'pastries',
        'scone', 'scones', 'shortbread', 'gingerbread', 'snickerdoodle',
        'ice cream', 'sorbet', 'wafer', 'snack',
        # Indonesian traditional sweets & kue
        'klepon', 'onde', 'serabi', 'kolak', 'wedang', 'cincau',
        'es krim', 'lapis legit', 'kue kering', 'kue basah',
        'lupis', 'wajik', 'nagasari', 'getuk', 'cenil', 'cucur', 'apem', 'putu', 'donat', 'bolu',
        # Chips & crackers
        'keripik', 'kripik', 'kerupuk', 'rempeyek', 'peyek',
        # Fritters & snacks
        'mendoan', 'bakwan', 'gorengan',
        # Street food snacks — only unambiguous ones ('bubur'/'roti' omitted: Bubur Ayam, Roti Jala are main dishes)
        'sempol', 'cilok', 'cireng', 'cimol', 'batagor', 'siomay', 'risoles', 'pastel',
        'lemper', 'tahu bulat', 'tahu jeletot',
        # Generic labels
        'jajanan', 'camilan', 'cemilan', 'minuman', 'makanan ringan',
        # Sweets & confectionery
        'cokelat', 'manisan',
    ]
    if any(kw in title_clean for kw in snack_kws):
        return False

    # Minimum protein content — low-protein recipes without a protein keyword in title are likely sides/garnishes
    protein_keywords = ['ayam', 'daging', 'sapi', 'ikan', 'telur', 'tempe', 'tahu', 'seafood',
                        'chicken', 'beef', 'meat', 'fish', 'egg', 'udang', 'cumi', 'kambing']
    if protein_per_100g < 2.0:
        if not any(x in title_clean for x in protein_keywords):
            return False

    # Side sauces, condiments, and seasonings
    condiment_kws = [
        'sauce', 'gravy', 'dressing', 'marinade', 'rub', 'dip', 'syrup', 'seasoning',
        'salsa', 'pesto', 'glaze', 'vinaigrette', 'spread', 'paste', 'sambal', 'bumbu'
    ]
    if any(title_clean.endswith(kw) or f" {kw}" in title_clean for kw in condiment_kws):
        if not any(x in title_clean for x in ['chicken', 'beef', 'meat', 'fish', 'stew', 'curry',
                                               'ayam', 'daging', 'ikan']):
            return False

    # Beverages
    beverage_kws = ['drink', 'juice', 'smoothie', 'shake', 'cocktail', 'punch', 'tea', 'coffee',
                    'cider', 'es ', 'jus ', 'teh ', 'kopi ']
    if any(kw in title_clean for kw in beverage_kws):
        return False

    return True



def _norm_prov(s: str) -> str:
    """Normalize province name: collapse internal whitespace, strip, lowercase."""
    return re.sub(r'\s+', ' ', str(s)).strip().lower()


class NaraRecommender:
    def __init__(self):
        print("📂 NaraRecommender: Loading master recipe database ...")
        self.df = pd.read_csv(RECIPE_CSV)
        # Bug #2 Fix: Filter servings outliers (>100) and low structured match rate (<0.3)
        initial_len = len(self.df)
        self.df = self.df[
            (self.df['estimated_servings'] <= 100) & 
            (self.df['structured_match_rate'] >= 0.3)
        ].reset_index(drop=True)
        print(f"🧹 Filtered recipe database: {initial_len} -> {len(self.df)} (removed {initial_len - len(self.df)} recipes with estimated_servings > 100 or structured_match_rate < 0.3)")
        self.allergen_df = pd.read_csv(ALLERGEN_CSV)
        
        # Load regional consumption database
        print("📂 NaraRecommender: Loading Indonesian BPS regional consumption data ...")
        self.consumption_df = pd.read_csv(CONSUMPTION_CSV)
        latest_year = self.consumption_df['Tahun'].max()
        self.latest_consumption = self.consumption_df[self.consumption_df['Tahun'] == latest_year]
        
        # Map consumption: self.consumption_map[province][commodity] = consumption_val
        self.consumption_map = collections.defaultdict(dict)
        for _, r in self.latest_consumption.iterrows():
            prov = _norm_prov(r['Provinsi'])
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
        # Ingredients that are processed/flour derivatives of a staple — should NOT
        # be counted as the staple grain itself (e.g. tepung beras ≠ beras konsumsi).
        _FLOUR_EXCLUSIONS = {'beras', 'singkong', 'ubi jalar'}

        self.recipe_commodities = []
        for ingredients in self.parsed_ingredients:
            comp_map = {com_name: 0.0 for com_name in COMMODITY_KEYWORDS.keys()}
            for ing in ingredients:
                item = ing.get('item', '').lower().strip()
                grams = float(ing.get('grams', 0.0))
                for com_name, keywords in COMMODITY_KEYWORDS.items():
                    if any(kw in item for kw in keywords):
                        # Skip flour/starch forms of staple grains (tepung beras, tepung singkong, etc.)
                        if com_name in _FLOUR_EXCLUSIONS and 'tepung' in item:
                            continue
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
        # Check severe thinness (BMI < 17) with cutting/weight loss goals
        height_m = user_profile.get("height_cm", 170.0) / 100.0
        weight_kg = user_profile.get("weight_kg", 65.0)
        bmi = weight_kg / (height_m * height_m) if height_m > 0 else 0
        if bmi < 17.0 and user_profile.get("goal", "").lower() in ["weight_loss", "cutting"]:
            elapsed_ms = (time.perf_counter() - start_time) * 1000.0
            return {
                "status": "safety_cutoff_triggered",
                "elapsed_ms": round(elapsed_ms, 2),
                "clinical_condition_triggered": "Severe Thinness (BMI < 17)",
                "medical_disclaimer_id": "Sistem NARA AI mendeteksi status BMI Anda adalah Severe Thinness (Sangat Kurus). Mengikuti target penurunan berat badan (Cutting) dalam kondisi ini sangat berbahaya bagi kesehatan. Sistem kami mengunci pendaftaran menu ini demi keselamatan Anda. Silakan ubah target Anda ke Maintenance atau Bulking.",
                "medical_disclaimer_en": "NARA AI detected Severe Thinness (BMI < 17). Attempting a calorie deficit (Cutting) in this state is clinically unsafe. System recommendations have been locked. Please update your profile goal to Maintenance or Bulking.",
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
        global_indonesian_only = os.environ.get('INDONESIAN_ONLY', 'false').lower() in ['true', '1', 'yes']
        indonesian_only = user_profile.get("indonesian_only", global_indonesian_only)
        
        # ── 3. Fast Allergen Filter Stage (Pre-parsed List Indexing) ──
        valid_indices = []
        for idx, ingredients in enumerate(self.parsed_ingredients):
            # Check source if indonesian_only is enabled
            if indonesian_only and self.df.iloc[idx]['source'] != 'indonesian_local':
                continue
                
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
        province_name = _norm_prov(user_profile.get("province", ""))
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
        
        # C. Combined Expert Scoring (nutrition-first, RAS as regional tiebreaker)
        normalized_density = recipe_density / (np.max(recipe_density) + 1e-5)

        final_scores = (
            0.25 * cal_score +
            0.30 * macro_score +
            0.20 * normalized_density +
            0.25 * recipe_ras
        )

        filtered_df["recommendation_score"] = final_scores
        filtered_df["ras_score"] = recipe_ras

        # Fat cap pre-filter: disqualify recipes where base fat already exceeds 125% of meal fat target
        fat_mask = filtered_df["Recipe Fat"] * 3.0 <= (t_fat * 1.25)
        filtered_df = filtered_df[fat_mask]

        # Sort candidates descending
        candidates = filtered_df.sort_values(by="recommendation_score", ascending=False)
        
        # ── 6. Greedy CSP Diversity & Rotation Selector ──
        # Select 15 recipes in total ensuring protein/starch variety (Max 4 of same category in pool)
        selected_recipes = []
        category_counts = collections.defaultdict(int)
        
        for idx_val, r in candidates.iterrows():
            ingredients = self.parsed_ingredients[idx_val]
            
            # CSP Constraint: Only recommend realistic main dishes for meal prep
            if not is_main_dish(r['title'], ingredients, r['Recipe Protein']):
                continue
                
            cat = classify_recipe_category(ingredients, r['title'])

            # Caloric feasibility pre-screen: skip recipes whose max achievable
            # calories fall below 75% of t_cal even at maximum scaling bounds.
            _bw = 120.0 if cat == 'plant_based' else (300.0 if cat in ('starch', 'other') else 100.0)
            _rec_cal = r['Recipe Caloric Value'] * (_bw / 100.0)
            _rec_carb = r['Recipe Carbohydrates'] * (_bw / 100.0)
            if _rec_carb >= 20.0:
                _max_achievable = _rec_cal * 1.5
            else:
                _max_achievable = min(_rec_cal * 2.0, t_cal) + 455
            if _max_achievable < t_cal * 0.75:
                continue

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
                if not is_main_dish(r['title'], ingredients, r['Recipe Protein']):
                    continue
                    
                cat = classify_recipe_category(ingredients, r['title'])

                # Caloric feasibility pre-screen (same as primary loop)
                _bw = 120.0 if cat == 'plant_based' else (300.0 if cat in ('starch', 'other') else 100.0)
                _rec_cal = r['Recipe Caloric Value'] * (_bw / 100.0)
                _rec_carb = r['Recipe Carbohydrates'] * (_bw / 100.0)
                if _rec_carb >= 20.0:
                    _max_achievable = _rec_cal * 1.5
                else:
                    _max_achievable = min(_rec_cal * 2.0, t_cal) + 455
                if _max_achievable < t_cal * 0.75:
                    continue

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
        if not prov_display:
            prov_display = "Nasional"
        prov_display = prov_display.title()

        days_name = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]

        def format_recipe(r, cat, ingredients, day_label=None):
            # 1. Base serving weight by category
            if cat in ['red_meat', 'poultry', 'fish_seafood']:
                base_weight_g = 100.0
            elif cat == 'plant_based':
                base_weight_g = 120.0
            elif cat == 'vegetable':
                base_weight_g = 100.0
            else:
                base_weight_g = 300.0

            # 2. Scale per-100g values to base serving
            rec_cal_standard = r["Recipe Caloric Value"] * (base_weight_g / 100.0)
            rec_prot_standard = r["Recipe Protein"] * (base_weight_g / 100.0)
            rec_fat_standard = r["Recipe Fat"] * (base_weight_g / 100.0)
            rec_carb_standard = r["Recipe Carbohydrates"] * (base_weight_g / 100.0)

            density_val = r["Recipe Nutrition Density"]
            ras_val = r["ras_score"]

            has_carb = rec_carb_standard >= 20.0

            # 3. Portion scaling: category-specific caps + fat cap
            is_protein_dish = cat in ['red_meat', 'poultry', 'fish_seafood', 'plant_based']

            if cat == 'red_meat':
                abs_max_scale = 1.5   # max ~150g per meal
            elif cat in ('poultry', 'fish_seafood'):
                abs_max_scale = 2.0   # max ~200g per meal
            elif cat == 'plant_based':
                abs_max_scale = 2.5   # max ~300g per meal
            else:
                abs_max_scale = 1.5

            if is_protein_dish:
                sf_prot = t_prot / max(rec_prot_standard, 1.0)
                sf_fat_cap = t_fat / max(rec_fat_standard, 0.1)
                scale_factor = max(0.5, round(min(sf_prot, sf_fat_cap, abs_max_scale), 1))
            else:
                scale_factor = t_cal / max(rec_cal_standard, 1.0)
                scale_factor = max(0.5, min(1.5, round(scale_factor, 1)))

            scaled_cal = rec_cal_standard * scale_factor
            scaled_prot = rec_prot_standard * scale_factor
            scaled_fat = rec_fat_standard * scale_factor
            scaled_carb = rec_carb_standard * scale_factor

            # 4. Mandatory vegetables (100g sayuran hijau) — skip only if recipe is already a vegetable dish
            if cat != 'vegetable':
                veg_name = "Sayuran Hijau Rebus (Bayam/Sawi/Kangkung)"
                v_cal, v_prot, v_fat, v_carb = 25.0, 2.0, 0.2, 4.0
            else:
                veg_name = None
                v_cal, v_prot, v_fat, v_carb = 0.0, 0.0, 0.0, 0.0

            # 5. Carb anchor (BPS ratio-based staple selection) — only when recipe lacks carbs
            curr_bmi = bmi  # reuse from recommend() closure
            max_carb_weight = 150.0 if curr_bmi < 18.5 else 300.0

            carb_name = None
            carb_cal = 0.0
            carb_prot = 0.0
            carb_fat = 0.0
            carb_carbs = 0.0
            carb_weight_g = 0.0

            if not has_carb:
                prov_key = _norm_prov(prov_display)
                prov_consumption = self.consumption_map.get(prov_key, {})
                if not prov_consumption and self.consumption_map:
                    prov_consumption = self.consumption_map.get("nasional", {})

                beras_rate = max(1.0, prov_consumption.get("beras", 80.0))
                ubi_rate = prov_consumption.get("ubi jalar", 0.0)
                singkong_rate = prov_consumption.get("singkong", 0.0)
                sagu_rate = prov_consumption.get("sagu", 0.0)

                ubi_ratio = ubi_rate / beras_rate
                singkong_ratio = singkong_rate / beras_rate
                sagu_ratio = sagu_rate / beras_rate

                if ubi_ratio >= 0.20:
                    carb_name = "Ubi Jalar Rebus"
                    base_carb_cal, base_carb_prot, base_carb_fat, base_carb_carbs = 76.0, 1.3, 0.1, 17.7
                elif singkong_ratio >= 0.15 or sagu_ratio >= 0.10:
                    carb_name = "Singkong Rebus"
                    base_carb_cal, base_carb_prot, base_carb_fat, base_carb_carbs = 120.0, 1.2, 0.2, 28.0
                else:
                    carb_name = "Nasi Putih"
                    base_carb_cal, base_carb_prot, base_carb_fat, base_carb_carbs = 130.0, 2.7, 0.3, 28.0

                cal_deficit = t_cal - scaled_cal - v_cal
                raw_carb_g = cal_deficit / (base_carb_cal / 100.0)
                # Enforce [100g, max_carb_weight] — minimum 100g is culturally mandatory
                carb_weight_g = round(max(100.0, min(max_carb_weight, raw_carb_g)), 0)
                carb_cal = base_carb_cal * (carb_weight_g / 100.0)
                carb_prot = base_carb_prot * (carb_weight_g / 100.0)
                carb_fat = base_carb_fat * (carb_weight_g / 100.0)
                carb_carbs = base_carb_carbs * (carb_weight_g / 100.0)

            # Final totals (per meal)
            total_cal = round(scaled_cal + v_cal + carb_cal, 1)
            total_prot = round(scaled_prot + v_prot + carb_prot, 1)
            total_fat = round(scaled_fat + v_fat + carb_fat, 1)
            total_carb = round(scaled_carb + v_carb + carb_carbs, 1)

            # Daily projections (3 meals)
            daily_cal = round(total_cal * 3, 0)
            daily_prot = round(total_prot * 3, 1)
            daily_fat = round(total_fat * 3, 1)
            daily_carb = round(total_carb * 3, 1)

            daily_target_cal = round(targets["caloric_target_daily"], 0)
            moe_pct = abs(daily_target_cal - daily_cal) / max(daily_target_cal, 1.0)

            # Explanations
            piring_msg = "🍽️ ISI PIRING SEKALI MAKAN:"
            lauk_msg = f"• {int(scale_factor * base_weight_g)}g {r['title']} (sebagai lauk utama)."
            sayur_msg = (f"• 100g {veg_name} (untuk asupan serat)." if veg_name
                         else "• (Menu ini sudah kaya akan sayuran).")

            if not has_carb:
                carb_note = (" (Porsi dibatasi agar tidak mual/kekenyangan)."
                             if curr_bmi < 18.5 and carb_weight_g >= 150.0 else "")
                karbo_msg = f"• {int(carb_weight_g)}g {carb_name} (sebagai sumber energi).{carb_note}"
            else:
                karbo_msg = "• (Resep ini sudah mengandung karbohidrat.)"

            total_harian_msg = "📈 JIKA DIMAKAN 3X SEHARI (Pagi, Siang, Malam):"
            kalkulasi_msg = (f"Anda akan mendapatkan {daily_cal} kkal "
                             f"(Protein: {daily_prot}g, Karbo: {daily_carb}g, Lemak: {daily_fat}g).")

            if curr_bmi < 18.5:
                freq_msg = ("💡 TIPS KLINIS: Karena porsi per piring cukup padat, disarankan membagi "
                            "total menu ini menjadi 5-6 kali makan kecil sepanjang hari agar lebih mudah dicerna.")
            elif moe_pct <= 0.05:
                freq_msg = (f"🎯 TARGET SANGAT AKURAT: Menu ini menutupi target {daily_target_cal} kkal "
                            f"Anda dengan akurasi tinggi (MoE < 5%).")
            else:
                freq_msg = (f"⚖️ STATUS KALORI: Menu ini mencakup {daily_cal} kkal dari "
                            f"target harian Anda ({daily_target_cal} kkal).")

            res = {
                "title": r["title"],
                "ingredients": r["ingredients"] if "ingredients" in r and pd.notna(r["ingredients"]) else "",
                "instructions": r["instructions"] if "instructions" in r and pd.notna(r["instructions"]) else "",
                "score": round(r["recommendation_score"] * 100, 1),
                "food_category": cat,
                "portion_scale_factor": scale_factor,
                "calories_per_serving": total_cal,
                "protein_per_serving": total_prot,
                "fat_per_serving": total_fat,
                "carbs_per_serving": total_carb,
                "density": density_val,
                "regional_alignment_score": round(ras_val * 100, 1),
                "source": r["source"],
                "explanations": [
                    piring_msg,
                    lauk_msg,
                    sayur_msg,
                    karbo_msg,
                    total_harian_msg,
                    kalkulasi_msg,
                    freq_msg
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


