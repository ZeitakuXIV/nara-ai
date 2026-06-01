"""
impute_expert.py — Expert-rules based micronutrient imputation for Indonesian foods.
"""

import os
import pandas as pd
import numpy as np

# ──────────────────────────────────────────────
# Column definitions
# ──────────────────────────────────────────────

FEATURE_COLS = ["Caloric Value", "Protein", "Fat", "Carbohydrates"]

TARGET_COLS = [
    # Fat breakdown
    "Saturated Fats",
    "Monounsaturated Fats",
    "Polyunsaturated Fats",
    # Other proximate
    "Sugars",
    "Dietary Fiber",
    "Cholesterol",
    "Sodium",
    "Water",
    # Vitamins
    "Vitamin A",
    "Vitamin B1",
    "Vitamin B11",
    "Vitamin B12",
    "Vitamin B2",
    "Vitamin B3",
    "Vitamin B5",
    "Vitamin B6",
    "Vitamin C",
    "Vitamin D",
    "Vitamin E",
    "Vitamin K",
    # Minerals
    "Calcium",
    "Copper",
    "Iron",
    "Magnesium",
    "Manganese",
    "Phosphorus",
    "Potassium",
    "Selenium",
    "Zinc",
]

CSV_PATH = "datasets/master/master_nutrition_database.csv"
OUTPUT_CSV_PATH = "datasets/master/master_nutrition_database_imputed.csv"
REPORT_PATH = "datasets/master/gemini_imputation_report.txt"

# ──────────────────────────────────────────────
# Joint English-Indonesian food categorizer
# ──────────────────────────────────────────────

def has_word(name: str, keywords: list) -> bool:
    # Convert name to lowercase and replace punctuation/hyphens with spaces
    cleaned = name.lower().replace('-', ' ').replace(',', ' ').replace('(', ' ').replace(')', ' ').replace('/', ' ').replace('_', ' ')
    words = cleaned.split()
    for k in keywords:
        k_clean = k.lower().replace('-', ' ').replace(',', ' ').replace('(', ' ').replace(')', ' ').replace('/', ' ').replace('_', ' ')
        k_words = k_clean.split()
        n_k = len(k_words)
        if n_k == 1:
            if k_words[0] in words:
                return True
        else:
            # Check consecutive sub-sequence of words
            for i in range(len(words) - n_k + 1):
                if words[i:i+n_k] == k_words:
                    return True
    return False

def classify_food(name: str, protein: float, fat: float, carbs: float) -> str:
    name = name.lower()
    
    # 1. Organ meat
    if has_word(name, ['hati', 'ginjal', 'limpa', 'jantung', 'paru', 'babat', 'otak', 'ampela', 'usus', 'rempelo', 'ceker', 'tetelan', 'buntut', 'tulang', 'gajih', 'kikil', 'kulit', 'jerohan', 'paru-paru', 'rempela', 'marus', 'liver', 'kidney', 'heart', 'gizzard', 'tongue', 'organ', 'sweetbread', 'tripe', 'brain']):
        return 'organ_meat'
    
    # 2. Bony / dried fish (high calcium, iron, sodium)
    if has_word(name, ['teri', 'asin', 'kering', 'pindang', 'gereh', 'pedak', 'selar kuning cue', 'bekasang', 'bekasam', 'wader', 'rebon', 'terasi', 'petis', 'peda', 'rusip', 'anchovy', 'sardine', 'dried fish', 'salted fish']):
        return 'fish_bony_dried'
        
    # 3. Regular fish
    if 'ikan' in name or has_word(name, ['tongkol', 'tuna', 'mujair', 'bandeng', 'kembung', 'lele', 'gabus', 'belut', 'kakap', 'bawal', 'gurame', 'patin', 'sidat', 'arwan', 'gembung', 'nila', 'mas', 'gurami', 'betok', 'cakalang', 'tenggiri', 'layang', 'sardin', 'salem', 'terubuk', 'kerapu', 'semilang', 'sungsang', 'lompok', 'lencam', 'kuwe', 'baronang', 'biji nangka', 'baung', 'belida', 'sidat', 'jambal', 'katembe', 'belanak', 'selar', 'haruan', 'haruwan', 'gabus', 'sepak', 'sepat', 'seluang', 'gulamah', 'kurau', 'pempek', 'tekwan', 'fillet o-fish', 'fish', 'salmon', 'cod', 'eel', 'trout', 'halibut', 'mackerel', 'haddock', 'herring', 'tilapia', 'catfish', 'carp', 'snapper', 'sea bass']):
        return 'fish_regular'
        
    # 4. Other seafood
    if has_word(name, ['udang', 'cumi', 'kepiting', 'kerang', 'siput', 'tiram', 'sotong', 'kepah', 'rajungan', 'keong', 'lokan', 'remis', 'shrimp', 'prawn', 'crab', 'lobster', 'squid', 'octopus', 'clam', 'oyster', 'scallop', 'mussel', 'seafood']):
        return 'seafood_other'
        
    # 5. Red meat
    if has_word(name, ['sapi', 'kambing', 'domba', 'babi', 'kerbau', 'daging', 'dendeng', 'abon', 'sosis', 'worst', 'beef', 'kornet', 'ham', 'bacon', 'bakso', 'rendang', 'empal', 'kodok', 'rusa', 'kancil', 'cingur', 'yakiniku', 'steak', 'lamb', 'pork', 'mutton', 'veal', 'venison', 'sausage', 'meatball', 'burger', 'hot dog', 'salami', 'pepperoni']):
        return 'red_meat'
        
    # 6. Poultry
    if has_word(name, ['ayam', 'bebek', 'burung', 'puyuh', 'angsa', 'kalkun', 'entog', 'merpati', 'dara', 'chicken', 'turkey', 'duck', 'goose', 'poultry', 'pheasant', 'quail']):
        return 'poultry'
        
    # 7. Eggs
    if has_word(name, ['telur', 'yolk', 'egg', 'telor', 'meringue']):
        return 'egg'
        
    # 8. Dairy & Fats
    if has_word(name, ['susu', 'keju', 'yoghurt', 'mentega', 'margarin', 'cream', 'butter', 'mayones', 'es krim', 'es mambo', 'ice cream', 'dadih', 'hangop', 'cheese', 'yogurt', 'milk', 'whey', 'casein', 'ghee', 'dairy', 'margarine', 'shortening', 'mayonnaise', 'salad dressing']):
        return 'dairy'
        
    # 9. Mushrooms
    if has_word(name, ['jamur', 'mushroom', 'fungus', 'truffle', 'shiitake', 'portobello', 'crimini', 'oyster mushroom', 'chanterelle']):
        return 'mushroom'
        
    # 10. Soy fermented
    if has_word(name, ['tempe', 'oncom', 'taoco', 'tauji', 'tempoyak', 'tempuya', 'tempeh', 'miso', 'natto']):
        return 'soy_fermented'
        
    # 11. Leafy greens
    if has_word(name, ['bayam', 'kangkung', 'sawi', 'daun', 'katuk', 'kelor', 'kemangi', 'sayur', 'selada', 'seledri', 'katu', 'kobis', 'kubis', 'kol', 'caisim', 'caisin', 'kailan', 'genjer', 'krokot', 'andewi', 'lembayung', 'pakis', 'reundeu', 'selada air', 'pucuk', 'bulung', 'jotang', 'kalakai', 'eceng gondok', 'kangkong', 'sawi-sawi', 'daun-daunan', 'kucai', 'pe-cay', 'lokio', 'taoge segar', 'toge segar', 'lilin bungkus gedi', 'putri malu segar', 'kerokot', 'spinach', 'kale', 'lettuce', 'swiss chard', 'collard', 'mustard greens', 'cabbage', 'greens']):
        return 'leafy_greens'
        
    # 12. Tubers & Starchy roots
    if has_word(name, ['ubi', 'singkong', 'kentang', 'talas', 'ganyong', 'garut', 'gadung', 'uwi', 'ketela', 'gembili', 'arrowroot', 'sentul', 'bengkuang', 'bengkowang', 'tapioka', 'pati', 'sagu', 'gaplek', 'gatot', 'geblek', 'kabuto', 'cassava', 'kemili', 'irut', 'suweg', 'sente', 'akar tonjong', 'potato', 'sweet potato', 'yam', 'tuber', 'taro', 'cassava', 'tapioca', 'sago', 'arrowroot']):
        return 'tuber'
        
    # 13. Fruits
    if 'buah' in name or has_word(name, ['pisang', 'mangga', 'pepaya', 'jeruk', 'alpukat', 'apel', 'nanas', 'jambu', 'durian', 'rambutan', 'kelengkeng', 'semangka', 'melon', 'salak', 'sawo', 'manggis', 'belimbing', 'nangka', 'advokat', 'duku', 'kesemek', 'kueni', 'kuwini', 'lontar', 'sirsak', 'srikaya', 'arbei', 'anggur', 'kurma', 'kismis', 'cherry', 'ceri', 'delima', 'duwet', 'flamboyan', 'gowok', 'kokosan', 'limau', 'markisa', 'menteng', 'namnam', 'peaches', 'pear', 'persik', 'plum', 'prunes', 'rukem', 'sentul', 'carica', 'erbis', 'gandaria', 'gatep', 'kemang', 'kawista', 'kedondong', 'klengkeng', 'rambutan', 'papaya', 'avocado', 'coconut', 'kelapa', 'strawberi', 'stroberi', 'srikaya', 'selai', 'jam', 'buni', 'kokosan', 'duku', 'kepel', 'mundu', 'gowok', 'matoa', 'purut', 'sukun', 'asam payak', 'asam kandis', 'lemon', 'santan', 'biwah', 'tempoya', 'apple', 'banana', 'orange', 'grape', 'strawberry', 'blueberry', 'raspberry', 'blackberry', 'peach', 'pear', 'plum', 'cherry', 'apricot', 'mango', 'pineapple', 'papaya', 'watermelon', 'cantaloupe', 'honeydew', 'fig', 'date', 'raisin', 'fruit', 'lemon', 'lime', 'grapefruit', 'coconut', 'avocado']):
        return 'fruit'
        
    # 14. Other vegetables & Spices
    if has_word(name, ['wortel', 'tomat', 'terong', 'buncis', 'oyong', 'gambas', 'labu', 'mentimun', 'ketimun', 'lobak', 'rebung', 'jantung pisang', 'jengkol', 'petai', 'pete', 'cabai', 'cabe', 'bawang', 'andaliman', 'kunci', 'lengkuas', 'laja', 'jahe', 'kunyit', 'kencur', 'sereh', 'serai', 'kemiri', 'ketumbar', 'pala', 'lada', 'merica', 'selasih', 'kemangi', 'baligo', 'waluh', 'kecipir', 'katak', 'kacang panjang', 'paprika', 'seledri', 'lettuce', 'paria', 'pare', 'oyong', 'tekokak', 'takokak', 'melinjo', 'rebon', 'kluwih', 'turi', 'roway', 'gamal', 'loba', 'kacang gude', 'kacang tolo', 'kacang merah', 'kacang tanah', 'kacang hijau', 'kedelai', 'kemiri', 'ketapang', 'kluwek', 'kabau', 'kecombrang', 'tigarun', 'kool', 'cengkeh', 'asaman', 'rempah', 'peria', 'kecipir', 'kapri', 'buncis', 'lobak', 'waluh', 'labu siam', 'jipang', 'bligo', 'kundur', 'pare', 'paria', 'terung', 'lenca', 'leunca', 'kenikir', 'turi', 'ontong', 'kecombrang', 'honje', 'kecombrang', 'bunga pepaya', 'bunga kol', 'brokoli', 'kembang kol', 'kembang turi', 'asaman', 'letus', 'bit', 'radish', 'garlic', 'onion', 'shallot', 'chili', 'chilli', 'ginger', 'turmeric', 'galangal', 'lemongrass', 'scallion', 'leek', 'seledri', 'celery', 'taoge', 'toge', 'batang tading', 'bakung segar', 'beberuk', 'buntil', 'komak polong', 'kotiu hinela', 'purundawa', 'rimbang', 'singkah', 'umbut rotan', 'encung', 'cammetutu', 'gado-gado', 'karedok', 'ketoprak', 'olah-olah', 'shabu-shabu', 'kelewih', 'carrot', 'tomato', 'cucumber', 'eggplant', 'aubergine', 'squash', 'pumpkin', 'zucchini', 'pepper', 'bell pepper', 'chili', 'onion', 'garlic', 'shallot', 'leek', 'celery', 'asparagus', 'brussels sprouts', 'broccoli', 'cauliflower', 'artichoke', 'bamboo shoots', 'okra', 'radish', 'beet', 'turnip', 'parsnip', 'horseradish', 'ginger', 'turmeric']):
        return 'other_vegetables'
        
    # 15. Soy unfermented / Legumes / Nuts
    if has_word(name, ['tahu', 'kedelai', 'kacang', 'tahu sutra', 'ampas tahu', 'ampas kacang', 'buncis', 'arcis', 'kapri', 'tolo', 'wijen', 'kemiri', 'melinjo', 'emping', 'kenari', 'mete', 'cashew', 'almond', 'pistachio', 'chia', 'kuaci', 'biji', 'koro', 'lamtoro', 'koro', 'kara', 'gude', 'kecipir', 'wijen', 'bunga matahari', 'labu biji', 'semangka biji', 'hazelnut', 'pecan', 'walnut', 'macadamia', 'enting-enting', 'kwaci', 'takwa', 'taokoa', 'bean', 'pea', 'lentil', 'chickpea', 'soy', 'tofu', 'peanut', 'almond', 'walnut', 'pecan', 'cashew', 'hazelnut', 'pistachio', 'macadamia', 'chestnut', 'coconut', 'seed', 'sesame', 'sunflower seed', 'pumpkin seed', 'chia seed', 'flax seed']):
        return 'soy_unfermented_legumes_nuts'

    # 16. Grains & Starches (Grains, cakes, traditional sweets)
    if has_word(name, ['nasi', 'beras', 'ketan', 'jagung', 'terigu', 'gandum', 'mi', 'mie', 'soun', 'bihun', 'tepung', 'kue', 'roti', 'kerupuk', 'opak', 'rengginang', 'widaran', 'yangko', 'dodol', 'tape', 'getuk', 'lapis', 'talam', 'biskuit', 'bubur', 'soto', 'sup', 'opor', 'gulai', 'lodeh', 'semprit', 'putri salju', 'kastengel', 'nastar', 'wajik', 'gemblong', 'cenil', 'klepon', 'putu', 'lumpia', 'pastel', 'risoles', 'croquette', 'bakpao', 'donat', 'martabak', 'terang bulan', 'pukis', 'cubit', 'ape', 'pancong', 'talam', 'wingko', 'wajik', 'madu', 'gula', 'sirup', 'brem', 'brondong', 'macaroni', 'makaroni', 'havermut', 'oat', 'barley', 'cantel', 'sorgum', 'bihun', 'misua', 'kwetiau', 'ramak', 'geplak', 'wajik', 'jenang', 'madumongso', 'intip', 'opak', 'emping', 'krupuk', 'pilus', 'sukro', 'baje', 'bacang', 'barongko', 'bantal', 'bagea', 'brem', 'bakwan', 'batar daan', 'bika ambon', 'coklat', 'chocolate', 'cocoa', 'kakao', 'combro', 'deblo', 'gaplek', 'gatot', 'geblek', 'gurandil', 'havermout', 'jali', 'jawawut', 'kambose', 'kapurung', 'kapusa', 'karoket', 'kelepon', 'keremes', 'kopi', 'tea', 'teh', 'cuka', 'saus', 'sambal', 'bumbu', 'kecap', 'emping', 'opak', 'rengginang', 'krupuk', 'kerupuk', 'makaroni', 'pasta', 'vermicelli', 'sago', 'sagu', 'tapioca', 'tapioka', 'pati', 'maizena', 'cornstarch', 'bread', 'rice', 'wheat', 'corn', 'oat', 'barley', 'rye', 'millet', 'sorghum', 'quinoa', 'buckwheat', 'amaranth', 'flour', 'noodle', 'pasta', 'macaroni', 'spaghetti', 'cereal', 'porridge', 'oatmeal', 'popcorn', 'cracker', 'cookie', 'cake', 'pie', 'pastry', 'donut', 'doughnut', 'waffle', 'pancake', 'muffin', 'biscuit', 'scone', 'croissant', 'tortilla', 'chip', 'potato chip', 'pretzel', 'syrup', 'honey', 'sugar', 'molasses', 'maple syrup', 'agave', 'sweet', 'candy', 'chocolate', 'fudge', 'marshmallow', 'pudding', 'custard', 'gelatin', 'beer', 'ale', 'wine', 'cider', 'kombucha', 'soda', 'soft drink', 'pulut', 'rarawuan', 'spaghetti', 'tipa-tipa']):
        return 'grains_starches'

    # 17. Agar / Gelatin
    if has_word(name, ['agar', 'jeli', 'cincau', 'kolang', 'cendol', 'cincau', 'gelatin', 'carrageenan', 'pectin']):
        return 'agar_gelatin'

    # 18. Oils
    if has_word(name, ['minyak', 'lemak', 'gajih', 'lard', 'tallow', 'oil', 'fat', 'shortening', 'margarine']):
        return 'oils_fats'
        
    # FALLBACK USING MACROS
    if fat >= 90 and protein == 0 and carbs == 0:
        return 'oils_fats'
    if protein > 15 and carbs <= 2:
        return 'fish_regular' if 'ikan' in name or 'seafood' in name else 'red_meat'
    if carbs > 60 and protein < 5:
        return 'grains_starches'
        
    return 'other'

# Helper: Plant-based check for safety clips
def is_plant_based(name: str, category: str) -> bool:
    # List of animal keywords
    animal_keywords = [
        'sapi', 'kambing', 'domba', 'babi', 'kerbau', 'daging', 'ayam', 'bebek', 'burung', 'puyuh', 
        'angsa', 'kalkun', 'entog', 'merpati', 'dara', 'ikan', 'teri', 'udang', 'cumi', 'kepiting', 
        'kerang', 'siput', 'tiram', 'sotong', 'kepah', 'rajungan', 'keong', 'lokan', 'remis', 
        'telur', 'telor', 'egg', 'beef', 'pork', 'lamb', 'chicken', 'fish', 'seafood', 'shrimp', 
        'crab', 'yolk', 'kodok', 'rusa', 'babi', 'gajih', 'lemak', 'dendeng', 'abon', 'sosis', 
        'worst', 'hati', 'ginjal', 'limpa', 'jantung', 'paru', 'babat', 'otak', 'ampela', 
        'usus', 'rempelo', 'kikil', 'kulit', 'jerohan', 'marus', 'pempek', 'tekwan', 'cingur',
        'yakiniku', 'fillet o-fish', 'meat', 'poultry', 'egg', 'cheese', 'milk', 'dairy', 'yoghurt',
        'butter', 'cream', 'lard', 'tallow', 'ham', 'bacon', 'sausage', 'meatball', 'gelatin', 'dadih'
    ]
    if has_word(name, animal_keywords):
        return False
    # If the category is strictly plant-based
    plant_categories = ['leafy_greens', 'other_vegetables', 'fruit', 'tuber', 'mushroom', 
                        'soy_fermented', 'soy_unfermented_legumes_nuts', 'grains_starches', 
                        'agar_gelatin']
    return category in plant_categories

# ──────────────────────────────────────────────
# Imputation Logic
# ──────────────────────────────────────────────

def impute_expert_micronutrients() -> None:
    print("📂 Loading master nutrition database …")
    df = pd.read_csv(CSV_PATH)
    print(f"   Total rows loaded : {len(df):,}")

    for col in TARGET_COLS + FEATURE_COLS:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    # Incomplete check
    incomplete_mask = (df[TARGET_COLS] == -1).any(axis=1)
    complete_mask = ~incomplete_mask

    n_complete = complete_mask.sum()
    n_incomplete = incomplete_mask.sum()

    print(f"✅ Complete rows    : {n_complete:,}")
    print(f"⚠️  Incomplete rows  : {n_incomplete:,}  (will be imputed)")

    df_complete = df[complete_mask].copy()
    
    # Pre-classify complete rows to get baseline profiles
    df_complete['category'] = df_complete.apply(
        lambda r: classify_food(r['food'], r['Protein'], r['Fat'], r['Carbohydrates']), axis=1
    )
    
    # Calculate category means
    category_means = df_complete.groupby('category')[TARGET_COLS].mean().to_dict(orient='index')
    
    # Global fallback for any missing category
    global_mean = df_complete[TARGET_COLS].mean().to_dict()

    print("\n🔮 Performing rules-based expert imputation …")
    
    imputed_rows = []
    incomplete_indices = df[incomplete_mask].index.tolist()
    
    # Keep track of flagged uncertain rows
    uncertain_rows = []
    
    for idx in incomplete_indices:
        row = df.loc[idx].copy()
        food_name = row['food']
        protein = float(row['Protein'])
        fat = float(row['Fat'])
        carbs = float(row['Carbohydrates'])
        caloric_value = float(row['Caloric Value'])
        
        # Categorize
        cat = classify_food(food_name, protein, fat, carbs)
        
        # Get baseline profile
        profile = category_means.get(cat, global_mean).copy()
        
        # Adjust/Override based on expert nutritional knowledge
        # 1. Dried/salted/bony fish (high salt/calcium/iron)
        if cat == 'fish_bony_dried':
            profile['Calcium'] = 850.0  # high calcium in bones
            profile['Iron'] = 4.5       # high iron in small fish
            profile['Sodium'] = 1.5     # high sodium preservation (1.5g per 100g)
            profile['Potassium'] = 450.0
            profile['Phosphorus'] = 600.0
            profile['Cholesterol'] = 85.0
            profile['Vitamin B12'] = 2.5
            profile['Vitamin C'] = 0.0
            profile['Vitamin A'] = 0.05
            
        # 2. Fermented soy (tempeh, oncom, etc.)
        elif cat == 'soy_fermented':
            profile['Vitamin B12'] = 1.2  # Active B12 from bacterial fermentation!
            profile['Calcium'] = 120.0
            profile['Iron'] = 2.7
            profile['Potassium'] = 360.0
            profile['Dietary Fiber'] = 3.5
            profile['Sugars'] = 0.5
            profile['Cholesterol'] = 0.0
            profile['Vitamin C'] = 0.0
            
        # 3. Organ meats (liver, kidney, etc.)
        elif cat == 'organ_meat':
            if has_word(food_name, ['hati', 'liver']):
                profile['Vitamin A'] = 18.0   # Extremely high Vitamin A
                profile['Vitamin B12'] = 28.0 # Extremely high B12
                profile['Iron'] = 8.5        # Very high iron
                profile['Potassium'] = 320.0
                profile['Vitamin C'] = 4.0   # small amount of Vitamin C in liver
                profile['Copper'] = 8.0
                profile['Cholesterol'] = 380.0
            elif has_word(food_name, ['ginjal', 'kidney']):
                profile['Iron'] = 5.5        # high iron
                profile['Vitamin C'] = 9.0   # high Vitamin C
                profile['Vitamin B12'] = 16.0
                profile['Potassium'] = 260.0
                profile['Cholesterol'] = 310.0
            else:
                profile['Iron'] = 3.8
                profile['Vitamin B12'] = 7.0
                profile['Potassium'] = 240.0
                profile['Cholesterol'] = 250.0
                
        # 4. Leafy greens (bayam, kangkung, sawi, etc.)
        elif cat == 'leafy_greens':
            profile['Vitamin C'] = 35.0
            profile['Calcium'] = 190.0
            profile['Iron'] = 2.8
            profile['Potassium'] = 390.0
            profile['Vitamin A'] = 2.8   # High beta-carotene
            profile['Vitamin K'] = 0.28
            profile['Dietary Fiber'] = 2.8
            profile['Sugars'] = 0.8
            profile['Cholesterol'] = 0.0
            profile['Vitamin B12'] = 0.0
            
        # 5. Mushrooms
        elif cat == 'mushroom':
            profile['Calcium'] = 12.0
            profile['Iron'] = 1.4
            profile['Potassium'] = 330.0
            profile['Vitamin C'] = 1.0
            profile['Dietary Fiber'] = 2.2
            profile['Sugars'] = 1.2
            profile['Cholesterol'] = 0.0
            profile['Vitamin B12'] = 0.0
            
        # 6. Tubers
        elif cat == 'tuber':
            profile['Vitamin C'] = 15.0
            profile['Calcium'] = 28.0
            profile['Iron'] = 0.8
            profile['Potassium'] = 360.0
            profile['Dietary Fiber'] = 2.5
            profile['Sugars'] = 2.0
            profile['Cholesterol'] = 0.0
            profile['Vitamin B12'] = 0.0
            
        # 7. Unfermented soy and legumes (tofu vs bean/nut)
        elif cat == 'soy_unfermented_legumes_nuts':
            if has_word(food_name, ['tahu', 'tofu', 'takwa', 'taokoa']):
                profile['Calcium'] = 220.0  # Tofu has high calcium from calcium sulfate coagulant!
                profile['Iron'] = 3.2
                profile['Potassium'] = 160.0
                profile['Vitamin C'] = 0.0
                profile['Dietary Fiber'] = 0.8
                profile['Sugars'] = 0.4
                profile['Cholesterol'] = 0.0
                profile['Vitamin B12'] = 0.0
            else:
                profile['Calcium'] = 70.0
                profile['Iron'] = 2.2
                profile['Potassium'] = 290.0
                profile['Vitamin C'] = 0.0
                profile['Cholesterol'] = 0.0
                profile['Vitamin B12'] = 0.0
                
        # 8. Agar-agar / Gelatin
        elif cat == 'agar_gelatin':
            for col in TARGET_COLS:
                profile[col] = 0.0
            # Keep only a tiny calcium / sodium / potassium trace if any
            profile['Calcium'] = 8.0
            profile['Sodium'] = 0.02
            profile['Potassium'] = 5.0
            profile['Dietary Fiber'] = 1.0  # soluble fiber

        # 9. Grains & Starches (low micronutrient baseline, high starch)
        elif cat == 'grains_starches':
            profile['Cholesterol'] = 0.0
            profile['Vitamin B12'] = 0.0
            # Traditional sweets/dishes might contain sugar
            if has_word(food_name, ['manis', 'kue', 'dodol', 'yangko', 'sirup', 'gula', 'madu', 'lapis', 'talam', 'onde-onde', 'ongol-ongol', 'lopis', 'nopia']):
                profile['Sugars'] = max(profile.get('Sugars', 4.0), 15.0)
            
        # Identify uncertain or highly ambiguous cases to flag
        uncertain_keywords = ['cammetutu', 'kotiu hinela', 'purundawa', 'tinira ninahu', 'olah-olah', 'hangop', 'lilin bungkus gedi', 'putri malu segar', 'tipa-tipa']
        if any(k in food_name.lower() for k in uncertain_keywords):
            uncertain_rows.append(food_name)

        # Apply values to row
        for col in TARGET_COLS:
            row[col] = float(profile[col])
            
        # ──────────────────────────────────────────────
        # Proximate Adjustments & Scaling
        # ──────────────────────────────────────────────
        
        # A. Fat breakdown components
        if fat == 0.0:
            row['Saturated Fats'] = 0.0
            row['Monounsaturated Fats'] = 0.0
            row['Polyunsaturated Fats'] = 0.0
        else:
            sat = row['Saturated Fats']
            mon = row['Monounsaturated Fats']
            pol = row['Polyunsaturated Fats']
            tot_fat_acids = sat + mon + pol
            
            # If the baseline components exceed total fat, scale them
            if tot_fat_acids > fat * 0.95:
                scale = (fat * 0.95) / max(tot_fat_acids, 1e-5)
                row['Saturated Fats'] = sat * scale
                row['Monounsaturated Fats'] = mon * scale
                row['Polyunsaturated Fats'] = pol * scale
            elif tot_fat_acids == 0.0:
                # If all are 0 but fat is positive, distribute realistically based on category
                if cat in ['dairy', 'red_meat', 'poultry', 'egg']:
                    row['Saturated Fats'] = fat * 0.5
                    row['Monounsaturated Fats'] = fat * 0.4
                    row['Polyunsaturated Fats'] = fat * 0.05
                else:  # plant fats are mostly unsaturated
                    row['Saturated Fats'] = fat * 0.15
                    row['Monounsaturated Fats'] = fat * 0.4
                    row['Polyunsaturated Fats'] = fat * 0.4
            # Keep within fat breakdown
            row['Saturated Fats'] = min(row['Saturated Fats'], fat)
            row['Monounsaturated Fats'] = min(row['Monounsaturated Fats'], fat)
            row['Polyunsaturated Fats'] = min(row['Polyunsaturated Fats'], fat)

        # B. Sugars & Dietary Fiber scaling with Carbs
        if carbs == 0.0:
            row['Sugars'] = 0.0
            row['Dietary Fiber'] = 0.0
        else:
            sug = row['Sugars']
            fib = row['Dietary Fiber']
            
            # If the category means for sugars/fiber were high or low, scale them to carbs
            # In general, Sugars + Fiber should not exceed Carbs
            if sug + fib > carbs * 0.95:
                scale = (carbs * 0.95) / max(sug + fib, 1e-5)
                row['Sugars'] = sug * scale
                row['Dietary Fiber'] = fib * scale
            
            # Keep within carbs
            row['Sugars'] = min(row['Sugars'], carbs)
            row['Dietary Fiber'] = min(row['Dietary Fiber'], carbs)

        # ──────────────────────────────────────────────
        # Safety Clips & Validation
        # ──────────────────────────────────────────────
        
        # 1. All values >= 0
        for col in TARGET_COLS:
            row[col] = max(0.0, float(row[col]))
            
        # 2. Cholesterol must be 0 for plant-based foods
        if is_plant_based(food_name, cat):
            row['Cholesterol'] = 0.0
            
        # 3. Vitamin B12 must be 0 for plant-based foods unless fermented (tempe is ok)
        if is_plant_based(food_name, cat):
            # Soy fermented is ok, others must be 0
            if cat != 'soy_fermented':
                row['Vitamin B12'] = 0.0

        # 4. Water content should roughly satisfy: Water ≈ 100 - (Protein + Fat + Carbohydrates + Ash)
        # We assume Ash is 1.5g on average
        water_val = 100.0 - (protein + fat + carbs) - 1.5
        row['Water'] = max(0.0, min(95.0, water_val))

        # ──────────────────────────────────────────────
        # Nutrition Density calculation
        # ──────────────────────────────────────────────
        beneficial_score = (
            row["Protein"] * 4
            + row["Dietary Fiber"] * 3
            + row["Vitamin C"] * 0.5
            + row["Vitamin A"] * 0.01
            + row["Iron"] * 5
            + row["Calcium"] * 0.1
            + row["Potassium"] * 0.05
            + row["Magnesium"] * 0.2
            + row["Vitamin B12"] * 20
            + row["Zinc"] * 3
        )
        row["Nutrition Density"] = round(beneficial_score / max(caloric_value, 1.0), 3)

        imputed_rows.append(row)

    # 📝 Reconstruct complete dataset
    df_imputed = pd.DataFrame(imputed_rows)
    
    # Merge back into original dataframe
    df.loc[incomplete_mask, TARGET_COLS + ["Nutrition Density"]] = df_imputed[TARGET_COLS + ["Nutrition Density"]].values

    # 🔍 Verification
    print("🔍 Running post-imputation validation checks …")
    for col in TARGET_COLS + ["Nutrition Density"]:
        bad = (df[col] == -1).sum()
        assert bad == 0, f"ASSERTION FAILED: '{col}' still has {bad} rows with -1."
    
    # Check that complete rows were NOT modified
    original_df = pd.read_csv(CSV_PATH)
    orig_complete = original_df[~incomplete_mask]
    new_complete = df[~incomplete_mask]
    pd.testing.assert_frame_equal(orig_complete, new_complete, check_dtype=False)
    print("   ✅ Complete rows are untouched and match perfectly.")
    
    # Check safety clips on imputed subset
    imputed_subset = df[incomplete_mask]
    assert (imputed_subset[TARGET_COLS] >= 0).all().all(), "ASSERTION FAILED: Some imputed values are negative."
    print("   ✅ All values are >= 0.")
    
    # Check cholesterol for plant-based foods
    for _, r in imputed_subset.iterrows():
        cat = classify_food(r['food'], r['Protein'], r['Fat'], r['Carbohydrates'])
        if is_plant_based(r['food'], cat):
            assert r['Cholesterol'] == 0.0, f"Cholesterol for plant-based food '{r['food']}' is not 0: {r['Cholesterol']}"
            if cat != 'soy_fermented':
                assert r['Vitamin B12'] == 0.0, f"B12 for plant-based non-fermented food '{r['food']}' is not 0: {r['Vitamin B12']}"
                
    print("   ✅ Cholesterol and B12 plant-based restrictions are fully satisfied.")
    
    # Check fat breakdown
    for _, r in imputed_subset.iterrows():
        fat_sum = r['Saturated Fats'] + r['Monounsaturated Fats'] + r['Polyunsaturated Fats']
        assert fat_sum <= r['Fat'] + 1e-4, f"Fat components sum {fat_sum} exceeds total fat {r['Fat']} for '{r['food']}'"
    print("   ✅ Fat breakdown components sum <= total Fat.")
    
    # Check water content
    assert (imputed_subset['Water'] >= 0.0).all() and (imputed_subset['Water'] <= 95.0).all(), "Water content is out of bounds."
    print("   ✅ Water content is strictly between 0 and 95g.")

    # 💾 Save imputed CSV
    print(f"\n💾 Saving updated imputed CSV → {OUTPUT_CSV_PATH}")
    os.makedirs(os.path.dirname(OUTPUT_CSV_PATH), exist_ok=True)
    df.to_csv(OUTPUT_CSV_PATH, index=False)
    print("   ✅ CSV saved successfully.")

    # 📄 Generate Report
    print(f"📄 Generating report → {REPORT_PATH}")
    report_lines = []
    
    report_lines.append("======================================================================")
    report_lines.append("   IMPUTATION REPORT  —  Rules-Based Expert Imputation")
    report_lines.append("======================================================================")
    report_lines.append(f"  Total rows in database  : {len(df):,}")
    report_lines.append(f"  Complete rows (Western) : {n_complete:,}  (Untouched)")
    report_lines.append(f"  Imputed rows (Indonesian): {n_incomplete:,}")
    report_lines.append("")
    report_lines.append("──────────────────────────────────────────────────────────────────────")
    report_lines.append("  SAMPLE OF 5 IMPUTED ROWS")
    report_lines.append("──────────────────────────────────────────────────────────────────────")
    
    # Pick 5 interesting samples
    sample_foods = [
        "daging kambing", 
        "babi ginjal segar", 
        "jamur merang segar", 
        "ikan selar kuning cue mentah", 
        "tahu sutra"
    ]
    
    sample_df = df[df['food'].isin(sample_foods)]
    for _, r in sample_df.iterrows():
        report_lines.append(f"\n  Food : {r['food']}")
        report_lines.append(
            f"  Macros → Cal: {r['Caloric Value']:.1f} kcal | "
            f"P: {r['Protein']:.2f}g | F: {r['Fat']:.2f}g | C: {r['Carbohydrates']:.2f}g"
        )
        report_lines.append("  Imputed ↓")
        report_lines.append(f"    Iron                : {r['Iron']:.4f} mg")
        report_lines.append(f"    Vitamin C           : {r['Vitamin C']:.4f} mg")
        report_lines.append(f"    Calcium             : {r['Calcium']:.4f} mg")
        report_lines.append(f"    Potassium           : {r['Potassium']:.4f} mg")
        report_lines.append(f"    Saturated Fats      : {r['Saturated Fats']:.4f} g")
        report_lines.append(f"    Cholesterol         : {r['Cholesterol']:.4f} mg")
        report_lines.append(f"    Vitamin B12         : {r['Vitamin B12']:.4f} mcg")
        report_lines.append(f"    Water               : {r['Water']:.4f} g")
        report_lines.append(f"    Nutrition Density   : {r['Nutrition Density']:.3f}")
        
    report_lines.append("")
    report_lines.append("──────────────────────────────────────────────────────────────────────")
    report_lines.append("  UNCERTAIN / AMBIGUOUS FOOD TYPE FLAGS")
    report_lines.append("──────────────────────────────────────────────────────────────────────")
    report_lines.append("  The following foods have unique traditional names and were flagged")
    report_lines.append("  as uncertain for simple text keyword matching. We used their")
    report_lines.append("  macronutrient profile ratios as secondary signals to classify them:")
    for uf in sorted(list(set(uncertain_rows))):
        r_uf = df[df['food'] == uf].iloc[0]
        cat = classify_food(r_uf['food'], r_uf['Protein'], r_uf['Fat'], r_uf['Carbohydrates'])
        report_lines.append(f"  - {uf:<30} → Classified as: {cat:<25} (P: {r_uf['Protein']:.1f}g, F: {r_uf['Fat']:.1f}g, C: {r_uf['Carbohydrates']:.1f}g)")
        
    report_lines.append("")
    report_lines.append("──────────────────────────────────────────────────────────────────────")
    report_lines.append("  POST-IMPUTATION STATS (imputed rows only)")
    report_lines.append("──────────────────────────────────────────────────────────────────────")
    report_lines.append(f"  {'Column':<25}  {'Min':>10}  {'Mean':>10}  {'Max':>10}")
    report_lines.append(f"  {'-' * 25}  {'-' * 10}  {'-' * 10}  {'-' * 10}")
    imputed_subset_stats = df.loc[incomplete_indices, TARGET_COLS + ["Nutrition Density"]]
    for col in TARGET_COLS + ["Nutrition Density"]:
        s = imputed_subset_stats[col]
        report_lines.append(f"  {col:<25}  {s.min():>10.4f}  {s.mean():>10.4f}  {s.max():>10.4f}")

    report_lines.append("")
    report_lines.append("======================================================================")
    report_lines.append("  All safety clips, scale limits, and biological validations passed.")
    report_lines.append("======================================================================")
    
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(report_lines) + "\n")
        
    print("   ✅ Report saved successfully.")
    print("\n🎉 Imputation process complete!")

if __name__ == "__main__":
    impute_expert_micronutrients()
